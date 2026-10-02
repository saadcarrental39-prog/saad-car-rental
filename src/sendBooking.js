import { waHref } from "./config";
import { makeReceipt, makeThumb, downloadReceipt, copyImage, isMobile, canShareFiles, shareReceipt } from "./receipt";

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
 *   phone and PC (same): copy PNG + open the owner's chat (download only if copy is impossible;
 *   phone without clipboard-image support: share sheet).
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
      // Phones cannot paste an image into a chat automatically -> send a link whose preview shows the receipt picture. Customer only taps Send.
      const link = await postLink(receipt, d, v);
      if (link) return { receipt, delivered: false, linked: true, link, opened: openChat(link), mobile };
    }
    // PC (and phone if links are not set up): copy the PNG, then open the owner's chat (number already filled in).
    const copied = await copyImage(receipt.blob);
    if (!copied && mobile && canShareFiles(receipt.blob, receipt.ref)) {
      // Clipboard image not supported on this phone browser -> share sheet is the only way to attach the PNG.
      const s = await shareReceipt(receipt.blob, receipt.ref);
      if (s !== "failed") return { receipt, delivered: false, shared: true, mobile };
      return { receipt, delivered: false, needsTap: true, mobile };
    }
    if (!copied) downloadReceipt(receipt.blob, receipt.ref);
    const opened = openChat();
    return { receipt, delivered: false, copied, opened, mobile };
  } catch {
    return null;
  }
}
