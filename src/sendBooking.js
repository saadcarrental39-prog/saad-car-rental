import { waHref } from "./config";
import { makeReceipt, makeThumb, downloadReceipt, copyImage, isMobile, canShareFiles, shareReceipt } from "./receipt";

const prettyDate = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); if (!m) return s || ""; return `${+m[3]} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m[2] - 1]} ${m[1]}`; };
const prettyTime = (s) => { const m = /^(\d{1,2}):(\d{2})/.exec(s || ""); if (!m) return s || ""; const h = +m[1]; return `${h % 12 || 12}:${m[2]} ${h >= 12 ? "PM" : "AM"}`; };
/** Premium WhatsApp caption/message (WhatsApp *bold* and _italic_). Exported so the receipt screen can reuse it. */
export function buildMessage(d, v, ref) {
  const car = `${v.name} ${v.trim || ""} ${v.color || ""}`.replace(/\s+/g, " ").trim();
  const L = ["🚘 *SAAD CAR RENTAL SERVICES*", "✨ _Premium Car Rental With Professional Driver_", "━━━━━━━━━━━━━━━", `🧾 *New Booking Request*  #${ref}`, "",
    `🚗 *Vehicle:* ${car}`, `👤 *Name:* ${d.name || ""}`, `📞 *Phone:* ${d.phone || ""}`, `📍 *Pickup:* ${d.pickup || ""}`, `🏁 *Drop-off:* ${d.drop || ""}`,
    `📅 *Date:* ${prettyDate(d.date)}`, `⏰ *Time:* ${prettyTime(d.time)}`];
  if (d.pax) L.push(`👥 *Passengers:* ${d.pax}`);
  if (d.extra && String(d.extra).trim()) L.push(`📝 *Notes:* ${String(d.extra).trim()}`);
  L.push("━━━━━━━━━━━━━━━", "✅ Please confirm my booking. Thank you! 🙏");
  return L.join("\n");
}

export function openChat(text = "") {
  const url = waHref(text);
  if (!url) return false;
  let w = null;
  try { w = window.open(url, "_blank"); } catch { /* blocked */ }
  if (w) { w.opener = null; return true; }
  // Phone browsers may block a popup opened after the network call -> open the chat in this tab instead.
  try { window.location.assign(url); return true; } catch { return false; }
}

async function postToServer(receipt, d, v) {
  const f = new FormData();
  f.append("file", receipt.blob, `${receipt.ref}.png`);
  f.append("ref", receipt.ref);
  f.append("car", `${v.name} ${v.trim || ""} ${v.color || ""}`.replace(/\s+/g, " ").trim());
  for (const k of ["name", "phone", "pickup", "drop", "date", "time"]) f.append(k, d[k] || "");
  const r = await fetch("/api/booking", { method: "POST", body: f });
  let j = null;
  try { j = await r.json(); } catch { /* not json */ }
  if (!(r.ok && j?.ok === true)) console.warn("[booking] server delivery failed:", r.status, j?.error || "", j?.detail || "");
  return r.ok && j?.ok === true;
}

// Phone fallback: store the receipt on our server, get a private link, and open the owner's chat with that link typed in.
async function postLink(receipt, d, v) {
  try {
    const thumb = await makeThumb(receipt.blob);
    if (!thumb) return null;
    const f = new FormData();
    f.append("file", receipt.blob, `${receipt.ref}.png`);
    f.append("thumb", thumb, `${receipt.ref}.jpg`);
    f.append("ref", receipt.ref);
    f.append("car", `${v.name} ${v.trim || ""} ${v.color || ""}`.replace(/\s+/g, " ").trim());
    for (const k of ["name", "phone", "pickup", "drop", "date", "time"]) f.append(k, d[k] || "");
    const r = await fetch("/api/receipt-link", { method: "POST", body: f });
    const j = await r.json();
    return r.ok && j?.ok === true && /^https:\/\//.test(j.url || "") ? j.url : null;
  } catch (e) { console.warn("[booking] receipt link failed", e); return null; }
}

/**
 * One click -> receipt PNG -> delivered straight to the owner's WhatsApp by our server (same on phone and PC).
 * Fallback only if the server is not set up / fails:
 *   phone: share sheet with the PNG (WhatsApp image preview + Send); if the browser cannot share files: receipt link in the owner's chat;
 *   PC: copy PNG + open the owner's chat (download only if copy is impossible).
 * Must be called from a click handler.
 */
export async function sendBooking(d, v, ready) {
  try {
    const receipt = ready || (await makeReceipt(d, v));
    let delivered = false;
    try { delivered = await postToServer(receipt, d, v); } catch (e) { console.warn("[booking] server unreachable", e); }
    if (delivered) return { receipt, delivered: true };

    const mobile = isMobile();
    if (mobile) {
      const text = buildMessage(d, v, receipt.ref);
      // Phone, best case: share sheet with the receipt IMAGE + the premium text as caption. In WhatsApp the customer picks
      // the Saad Car Rental chat once, sees the image preview with the caption and taps Send. (A website cannot pre-select the chat.)
      if (canShareFiles(receipt.blob, receipt.ref)) {
        const s = await shareReceipt(receipt.blob, receipt.ref, text);
        if (s === "shared" || s === "cancelled") return { receipt, delivered: false, shared: true, text, mobile };
        return { receipt, delivered: false, needsTap: true, text, mobile }; // browser wants a fresh tap -> on-screen Share button
      }
      // Browser cannot share files: owner's chat opens directly with the text (+ private receipt link whose preview shows the image).
      const link = await postLink(receipt, d, v);
      if (link) {
        const t = `${text}\n\n🧾 *Receipt:* ${link}`;
        return { receipt, delivered: false, linked: true, link, text: t, opened: openChat(t), mobile };
      }
      return { receipt, delivered: false, textOnly: true, text, opened: openChat(text), mobile };
    }
    // PC (and phone if links are not set up): copy the PNG, then open the owner's chat (number already filled in).
    const copied = await copyImage(receipt.blob);
    if (!copied) downloadReceipt(receipt.blob, receipt.ref);
    const opened = openChat();
    return { receipt, delivered: false, copied, opened, mobile };
  } catch {
    return null;
  }
}
