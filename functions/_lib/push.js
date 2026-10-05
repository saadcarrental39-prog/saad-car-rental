// Web Push helper (VAPID + RFC 8291 payload encryption) using only WebCrypto, so it runs in Cloudflare Pages Functions.
// VAPID keys are created automatically on first use and kept in KV (key "push:vapid"). Nothing to configure by hand.
// Subscriptions (the owner's phones) live in KV under "push:sub:<id>".
const enc = new TextEncoder();
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64u = (s) => Uint8Array.from(atob(String(s).replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(String(s).length / 4) * 4, "=")), (c) => c.charCodeAt(0));
const cat = (...a) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let i = 0; for (const x of a) { o.set(x, i); i += x.length; } return o; };

export async function getVapid(kv) {
  const raw = await kv.get("push:vapid");
  if (raw) { try { const v = JSON.parse(raw); if (v.pub && v.priv) return v; } catch { /* regenerate */ } }
  const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign"]);
  const v = { pub: b64u(await crypto.subtle.exportKey("raw", kp.publicKey)), priv: await crypto.subtle.exportKey("jwk", kp.privateKey) };
  await kv.put("push:vapid", JSON.stringify(v));
  return v;
}

async function vapidHeader(kv, endpoint, subject) {
  const v = await getVapid(kv);
  const head = b64u(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const body = b64u(enc.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subject })));
  const key = await crypto.subtle.importKey("jwk", v.priv, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(`${head}.${body}`)); // WebCrypto returns raw r||s = JOSE format
  return `vapid t=${head}.${body}.${b64u(sig)}, k=${v.pub}`;
}

// RFC 8291 aes128gcm, single record
export async function encryptPayload(sub, text) {
  const ua = unb64u(sub.keys.p256dh), auth = unb64u(sub.keys.auth);
  const eph = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPub = new Uint8Array(await crypto.subtle.exportKey("raw", eph.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", ua, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const ecdh = await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, eph.privateKey, 256);
  const hk = async (salt, ikm, info, bits) => crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]), bits);
  const ikm = new Uint8Array(await hk(auth, new Uint8Array(ecdh), cat(enc.encode("WebPush: info\0"), ua, asPub), 256));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hk(salt, ikm, enc.encode("Content-Encoding: aes128gcm\0"), 128);
  const nonce = await hk(salt, ikm, enc.encode("Content-Encoding: nonce\0"), 96);
  const aes = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aes, cat(enc.encode(text), new Uint8Array([2]))));
  return cat(salt, new Uint8Array([0, 0, 0x10, 0]), new Uint8Array([asPub.length]), asPub, ct);
}

/** Send one JSON payload to every saved phone. Dead subscriptions (404/410) are removed. Never throws. */
export async function pushAll(kv, payload, subject) {
  try {
    const list = await kv.list({ prefix: "push:sub:" });
    await Promise.all(list.keys.map(async ({ name }) => {
      try {
        const sub = JSON.parse((await kv.get(name)) || "null");
        if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) return kv.delete(name);
        const r = await fetch(sub.endpoint, { method: "POST", headers: { Authorization: await vapidHeader(kv, sub.endpoint, subject), TTL: "86400", Urgency: "high", "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream" }, body: await encryptPayload(sub, JSON.stringify(payload)) });
        if (r.status === 404 || r.status === 410) await kv.delete(name);
      } catch { /* one bad phone must not stop the others */ }
    }));
  } catch { /* push is a bonus: never break the booking */ }
}

export async function subId(endpoint) { return b64u(await crypto.subtle.digest("SHA-256", enc.encode(endpoint))).slice(0, 24); }
