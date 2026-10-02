import { useEffect, useState } from "react";
import { SITE, waHref } from "../config";
import { makeReceipt, downloadReceipt, sendReceiptWhatsApp } from "../receipt";

export default function ReceiptView({ d, v, onBack, onDone }) {
  const [r, setR] = useState(null);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    let url;
    let live = true;
    makeReceipt(d, v).then((x) => { if (live) { url = x.url; setR(x); } });
    return () => { live = false; if (url) URL.revokeObjectURL(url); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const send = async () => {
    const res = await sendReceiptWhatsApp(r.blob, r.ref);
    if (res === "downloaded") setMsg("Receipt saved. WhatsApp chat khul gayi hai — usme receipt attach karke bhej dein.");
    else if (res === "shared") { setMsg(""); onDone && onDone(); }
  };

  return (
    <div className="rcpt">
      <p className="eyebrow">{SITE.name}</p>
      <h2>Your Booking Receipt</h2>
      {r ? <img className="rcpt__img" src={r.url} alt={`Booking receipt ${r.ref}`} /> : <p className="note" style={{ color: "#62666c" }}>Preparing receipt…</p>}
      {msg && <p className="note" style={{ color: "#16181b" }}>{msg}</p>}
      <p className="row noprint">
        {onBack && <button className="btn" onClick={onBack}>Edit Booking</button>}
        <button className="btn" disabled={!r} onClick={() => r && downloadReceipt(r.blob, r.ref)}>Download PNG</button>
        <button className="btn" disabled={!r} onClick={() => window.print()}>Print</button>
        {waHref()
          ? <button className="btn btn--dark" disabled={!r} onClick={send}>Send Receipt on WhatsApp</button>
          : <span className="note">WhatsApp booking is temporarily unavailable. Please call us.</span>}
      </p>
    </div>
  );
}
