// Orders index. The Admin app used to ask Cloudflare KV for a full key LIST every ~12 seconds. KV list() is the scarcest KV
// operation (Free plan: 1,000 per day) so after a few hours every list() failed -> HTTP 500 -> saved orders "disappeared".
// Now the newest orders live in ONE small key (ordidx) that is read with get() (100,000 per day on Free), and a real list()
// only runs to rebuild/reconcile it (at most once every 10 minutes). The orders themselves (ord:* / oimg:*) are untouched.
const IDX = "ordidx", TTL = 60 * 60 * 24 * 120, FRESH = 10 * 60e3, MAX = 400;
const keyOf = (m) => `ord:${String(9999999999999 - Number(m.ts)).padStart(13, "0")}:${m.id}`;   // same key orders.js writes

async function readIdx(kv) { try { const r = JSON.parse((await kv.get(IDX)) || "null"); return r && Array.isArray(r.list) ? r : null; } catch { return null; } }
async function writeIdx(kv, list, ts) { const idx = { ts, list: list.slice(0, MAX) }; await kv.put(IDX, JSON.stringify(idx), { expirationTtl: TTL }); return idx; }
async function rebuild(kv) {
  const l = await kv.list({ prefix: "ord:", limit: 1000 });                                  // newest first (key = 9999999999999 - time)
  return writeIdx(kv, l.keys.map((k) => k.metadata).filter((m) => m && m.id), Date.now());
}

/** Newest-first order list (each item = the order's metadata). Never needs list() unless the index is missing or older than 10 min. */
export async function getOrders(kv) {
  const idx = await readIdx(kv);
  if (idx && Date.now() - idx.ts < FRESH) return idx.list;
  try { return (await rebuild(kv)).list; }
  catch (e) { if (idx) return idx.list; throw e; }                                           // list() blocked/limited: show the last known list instead of an error
}
export async function addOrder(kv, meta) {
  const idx = await readIdx(kv); if (!idx) return;                                           // no index yet: the next read builds it
  try { await writeIdx(kv, [meta, ...idx.list.filter((m) => m.id !== meta.id)], idx.ts); } catch { /* reconciled within 10 minutes */ }
}
export async function markSeen(kv, ids) {
  const set = new Set(ids), list = await getOrders(kv), todo = list.filter((m) => set.has(m.id) && !m.seen);
  if (!todo.length) return;
  await Promise.all(todo.map((m) => kv.put(keyOf(m), "1", { expirationTtl: TTL, metadata: { ...m, seen: 1 } })));
  const idx = await readIdx(kv);
  if (idx) { try { await writeIdx(kv, idx.list.map((m) => (set.has(m.id) ? { ...m, seen: 1 } : m)), idx.ts); } catch { /* reconciled within 10 minutes */ } }
}
export async function removeOrder(kv, id) {
  const list = await getOrders(kv).catch(() => []), m = list.find((x) => x.id === id);
  const names = new Set(m ? [keyOf(m)] : []);
  if (!m) { try { (await kv.list({ prefix: "ord:", limit: 1000 })).keys.filter((k) => k.name.endsWith(`:${id}`)).forEach((k) => names.add(k.name)); } catch { /* nothing more to try */ } }
  await Promise.all([kv.delete(`oimg:${id}`), ...[...names].map((n) => kv.delete(n))]);     // oid:<id> stays, so a repeat post cannot bring it back
  const idx = await readIdx(kv);
  if (idx) { try { await writeIdx(kv, idx.list.filter((x) => x.id !== id), idx.ts); } catch { /* reconciled within 10 minutes */ } }
}
