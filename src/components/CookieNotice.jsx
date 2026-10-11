import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Simple cookie notice. Accept and Decline look the same and are equally easy to press (no dark patterns).
// Choice is saved on this device as "saad_cookie" = "yes" | "no". Optional analytics (Google Analytics / Cloudflare Web Analytics) start only after "yes".
// The notice appears about a second after the page has loaded, so it never competes with the first paint.
export default function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let v = ""; try { v = localStorage.getItem("saad_cookie") || ""; } catch { v = "no"; }
    if (v) return undefined;
    const t = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => { const h = document.documentElement; if (show) h.dataset.cookie = "open"; else delete h.dataset.cookie; return () => { delete h.dataset.cookie; }; }, [show]);
  const choose = (v) => { try { localStorage.setItem("saad_cookie", v); } catch { /* ignore */ } setShow(false); window.dispatchEvent(new CustomEvent("saad-consent", { detail: v })); };
  if (!show) return null;
  return (
    <aside className="ck" role="dialog" aria-label="Cookie notice">
      <p><b>Cookies</b>This website stores only what it needs to work. With your permission it also uses visit-statistics tools (Google Analytics, Cloudflare). No advertising. <Link to="/cookie-policy">Cookie policy</Link></p>
      <div className="ck__b"><button type="button" onClick={() => choose("no")}>Decline</button><button type="button" onClick={() => choose("yes")}>Accept</button></div>
    </aside>
  );
}
