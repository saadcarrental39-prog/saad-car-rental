import { waHref } from "./config";
import { makeReceipt, downloadReceipt, copyImage } from "./receipt";

export function openChat() {
  const w = window.open(waHref(), "_blank");
  if (w) w.opener = null;
  return !!w;
}

/**
 * One click: build receipt PNG -> copy it to clipboard + save it -> open the WhatsApp chat of the business number.
 * (WhatsApp links cannot attach files, so the image is ready to paste/attach in that chat.)
 * Must be called straight from a click handler.
 */
export async function sendBooking(d, v, ready) {
  const p = ready ? Promise.resolve(ready) : makeReceipt(d, v);
  const copied = copyImage(p.then((r) => r.blob)); // started inside the click, so the browser allows it
  try {
    const receipt = await p;
    downloadReceipt(receipt.blob, receipt.ref);
    const opened = openChat();
    return { receipt, copied: await copied, opened };
  } catch {
    return null;
  }
}
