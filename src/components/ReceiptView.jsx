import { useEffect, useState } from "react";
import { SITE, waHref } from "../config";
import { makeReceipt, downloadReceipt, canShareFiles, shareReceipt } from "../receipt";
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

  const share = () => r && shareReceipt(r.blob, r.ref);
  const send = async () => { setBusy(true); const res = await sendBooking(d, v, r); setBusy(false); if (res) setInfo(res); };

  return (
    <div className="rcpt">
      <p className="eyebrow">{SITE.name}</p>
      <h2>Your Booking Receipt</h2>
      {r ? <img className="rcpt__img" src={r.url} alt={`Booking receipt ${r.ref}`} /> : <p className="note" style={{ color: "#62666c" }}>Preparing receipt…</p>}
      {info?.delivered && <p className="note noprint" style={{ color: "#1d6b3a", fontWeight: 600 }}>✓ Aap ki booking receipt hamari WhatsApp par bhej di gayi hai. Hamari team jald aap se rabta karegi.</p>}
      {info && !info.delivered && (
        <p className="note noprint" style={{ color: "#16181b" }}>
          {info.textOnly
            ? <>{info.opened ? "WhatsApp chat khul gayi hai. " : "WhatsApp chat kholne ke liye neeche button dabayen. "}Booking ki details message box mein aa gayi hain: bas Send dabayen. Receipt ki picture bhejne ke liye neeche \"Share Receipt on WhatsApp\" bhi use kar sakte hain.</>
            : info.linked
            ? <>{info.opened ? "WhatsApp chat khul gayi hai. " : "WhatsApp chat kholne ke liye neeche button dabayen. "}Receipt ka link message box mein aa gaya hai: bas Send dabayen.</>
            : info.needsTap || info.shared
            ? (info.shared ? "Share screen mein WhatsApp chunen, hamari chat select karen aur Send dabayen. Dobara kholne ke liye neeche \"Share Receipt on WhatsApp\" dabayen." : "Receipt bhejne ke liye neeche \"Share Receipt on WhatsApp\" dabayen, WhatsApp chunen, hamari chat select karen aur Send dabayen.")
            : <>{info.opened ? "WhatsApp chat khul gayi hai. " : "WhatsApp chat kholne ke liye neeche button dabayen. "}
                {info.copied ? (info.mobile ? "Receipt copy ho chuki hai: message box par ungli dabaa kar rakhein, Paste chunen aur Send karein." : "Receipt copy ho chuki hai: message box mein paste (Ctrl+V) karke Send karein.") : "Receipt save ho gayi hai: chat mein attach (📎) karke Send karein."}</>}
        </p>
      )}
      <p className="row noprint">
        {onBack && <button className="btn" onClick={onBack}>Edit Booking</button>}
        <button className="btn" disabled={!r} onClick={() => r && downloadReceipt(r.blob, r.ref)}>Download PNG</button>
        {info && !info.delivered && (!info.linked || false) && r && canShareFiles(r.blob, r.ref) && <button className="btn btn--dark" onClick={share}>Share Receipt on WhatsApp</button>}
        {waHref()
          ? (info
              ? <a className={info.delivered ? "btn" : "btn btn--dark"} href={waHref(info.text || info.link || "")} target="_blank" rel="noopener noreferrer">{info.delivered ? "Chat with us on WhatsApp" : "Open WhatsApp Chat"}</a>
              : <button className="btn btn--dark" disabled={!r || busy} onClick={send}>Send Receipt on WhatsApp</button>)
          : <span className="note">WhatsApp booking is temporarily unavailable. Please call us.</span>}
        {onDone && info && <button className="btn" onClick={onDone}>Close</button>}
      </p>
    </div>
  );
}
