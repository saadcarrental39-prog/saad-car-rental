import { useState } from "react";
import { receiptUrl } from "../booking";
import { shareReceipt } from "../receiptImage";
const MSG = { shared: "Receipt picture shared.", copied: "Receipt picture copied. Open the WhatsApp chat and paste it (Ctrl+V).", opened: "Receipt picture opened in a new tab. Press and hold to share.", cancel: "" };
export default function ReceiptActions({ data, v }) {
  const [m, setM] = useState(""), [busy, setBusy] = useState(false);
  const go = async () => { setBusy(true); try { setM(MSG[await shareReceipt(data, v)]); } catch { setM("Could not create the picture. Use View receipt instead."); } finally { setBusy(false); } };
  return (<div className="rcpa"><button type="button" className="btn btn--dark" onClick={go} disabled={busy}>{busy ? "Preparing…" : "Share receipt picture"}</button>
    <a className="btn" href={receiptUrl(data)} target="_blank" rel="noopener noreferrer">View receipt</a>{m && <p role="status" className="rcpa__m">{m}</p>}</div>);
}
