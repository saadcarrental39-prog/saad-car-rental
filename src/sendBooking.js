import { waHref } from "./config";
import { makeReceipt, isMobile } from "./receipt";

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

// Save the order (+ receipt picture) for the owner's Admin app. Never throws; duplicates are ignored by the server.
async function saveOrder(receipt, d, v) {
  try {
    const f = new FormData();
    f.append("file", receipt.blob, `${receipt.ref}.png`);
    f.append("ref", receipt.ref);
    f.append("car", `${v.name} ${v.trim || ""} ${v.color || ""}`.replace(/\s+/g, " ").trim());
    for (const k of ["name", "phone", "pickup", "drop", "date", "time", "pax", "extra"]) f.append(k, d[k] || "");
    const r = await fetch("/api/orders", { method: "POST", body: f });
    return r.ok;
  } catch { return false; }
}

/**
 * One click -> receipt PNG is saved in the owner's Admin app (Orders tab, with push notification + tone)
 *            -> the owner's WhatsApp chat opens with the premium text typed in -> customer only taps Send.
 * The receipt picture is NOT sent through WhatsApp any more (a website cannot attach files to a chat anyway).
 * Must be called from a click handler.
 */
export async function sendBooking(d, v, ready) {
  try {
    const receipt = ready || (await makeReceipt(d, v));
    const orderP = saveOrder(receipt, d, v);
    // wait (max 6 s) so the order is saved before the page is left for WhatsApp
    const saved = await Promise.race([orderP, new Promise((r) => setTimeout(() => r(false), 6000))]);
    const text = buildMessage(d, v, receipt.ref);
    return { receipt, delivered: false, textOnly: true, saved: !!saved, text, opened: openChat(text), mobile: isMobile() };
  } catch {
    return null;
  }
}
