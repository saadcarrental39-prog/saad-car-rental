import { makeReceipt, sendReceiptWhatsApp } from "./receipt";

/** One click: build the receipt PNG and send it. Returns "shared" | "downloaded" | "cancelled" | "failed". */
export async function sendBooking(d, v) {
  try {
    const r = await makeReceipt(d, v);
    return await sendReceiptWhatsApp(r.blob, r.ref);
  } catch {
    return "failed";
  }
}
