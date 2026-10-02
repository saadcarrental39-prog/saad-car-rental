import { useEffect, useState } from "react";
import { SITE, waHref } from "../config";
import { makeReceipt, downloadReceipt } from "../receipt";
import { sendBooking } from "../sendBooking";

export default function ReceiptView({ d, v, onBack, initial, onDone }) {
  const [r, setR] = useState(initial?.receipt || null);
  const [info, setInfo] = useState(initial || null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (r) return;
    let live = true;
    makeReceipt(d, v).then((x) => live && setR(x));
    return () => { live = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => r && URL.revokeObjectURL(r.url), [r]);

  const send = async () => { setBusy(true); const res = await sendBooking(d, v, r); setBusy(false); if (res) setInfo(res); };

  return (
    <div className="rcpt">
      <p className="eyebrow">{SITE.name}</p>
      <h2>Your Booking Receipt</h2>
      {r ? <img className="rcpt__img" src={r.url} alt={`Booking receipt ${r.ref}`} /> : <p className="note" style={{ color: "#62666c" }}>Preparing receipt…</p>}
      {info && (
        <p className="note noprint" style={{ color: "#16181b" }}>
          {info.opened ? "WhatsApp chat khul gayi hai. " : "WhatsApp chat kholne ke liye neeche button dabayen. "}
          {info.copied
            ? "Receipt copy ho chuki hai: message box mein paste (Ctrl+V / long-press > Paste) karke Send karein."
            : "Receipt download ho gayi hai: chat mein attach (📎) karke Send karein."}
        </p>
      )}
      <p className="row noprint">
        {onBack && <button className="btn" onClick={onBack}>Edit Booking</button>}
        <button className="btn" disabled={!r} onClick={() => r && downloadReceipt(r.blob, r.ref)}>Download PNG</button>
        {waHref()
          ? (info
              ? <a className="btn btn--dark" href={waHref()} target="_blank" rel="noopener noreferrer">Open WhatsApp Chat</a>
              : <button className="btn btn--dark" disabled={!r || busy} onClick={send}>Send Receipt on WhatsApp</button>)
          : <span className="note">WhatsApp booking is temporarily unavailable. Please call us.</span>}
        {onDone && info && <button className="btn" onClick={onDone}>Close</button>}
      </p>
    </div>
  );
}
