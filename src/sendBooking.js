import { waHref } from "./config";
import { makeReceipt, downloadReceipt, copyImage, isMobile, canShareFiles, shareReceipt } from "./receipt";

export function openChat() {
  const w = window.open(waHref(), "_blank");
  if (w) w.opener = null;
  return !!w;
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

/**
 * One click -> receipt PNG -> delivered straight to the owner's WhatsApp by our server (same on phone and PC).
 * Fallback only if the server is not set up / fails:
 *   phone: share sheet with the PNG attached; PC: copy PNG + open chat (download only if copy is impossible).
 * Must be called from a click handler.
 */
export async function sendBooking(d, v, ready) {
  try {
    const receipt = ready || (await makeReceipt(d, v));
    let delivered = false;
    try { delivered = await postToServer(receipt, d, v); } catch (e) { console.warn("[booking] server unreachable", e); }
    if (delivered) return { receipt, delivered: true };

    if (isMobile() && canShareFiles(receipt.blob, receipt.ref)) {
      const s = await shareReceipt(receipt.blob, receipt.ref);
      if (s !== "failed") return { receipt, delivered: false, shared: true };
      return { receipt, delivered: false, needsTap: true }; // browser wants a fresh tap -> button on screen
    }
    const copied = await copyImage(receipt.blob);
    if (!copied) downloadReceipt(receipt.blob, receipt.ref);
    const opened = openChat();
    return { receipt, delivered: false, copied, opened };
  } catch {
    return null;
  }
}
