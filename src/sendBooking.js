import { waHref } from "./config";
import { makeReceipt, downloadReceipt, copyImage } from "./receipt";

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
  return r.ok && (await r.json()).ok === true;
}

/**
 * One click: build the receipt PNG and deliver it straight to the owner's WhatsApp through our server.
 * If the server is not set up / fails, fall back to: save PNG + copy it + open the WhatsApp chat.
 * Must be called from a click handler.
 */
export async function sendBooking(d, v, ready) {
  try {
    const receipt = ready || (await makeReceipt(d, v));
    let delivered = false;
    try { delivered = await postToServer(receipt, d, v); } catch { /* fall back below */ }
    if (delivered) return { receipt, delivered: true };
    const copied = await copyImage(receipt.blob);
    downloadReceipt(receipt.blob, receipt.ref);
    const opened = openChat();
    return { receipt, delivered: false, copied, opened };
  } catch {
    return null;
  }
}
