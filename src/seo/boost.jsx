// Extra sections shown just above the closing call-to-action on the pages listed in data/pageBoost.js:
// why customers book, photos, offers, what to tell us, more FAQs, related pages and #tags.
import { Link, useLocation } from "react-router-dom";
import { SITE, telHref, waHref } from "../config";
import { BOOST, OFFERS } from "./data/pageBoost";
import { Pic } from "./media";
import { imagesOf, norm, boostFaqs, thumbOf, GUIDE_LINK } from "./data/pageMeta";

const Sec = ({ id, title, tone, children }) => (<section className={`sx-sec${tone ? ` sx-sec--${tone}` : ""}`} aria-labelledby={id}><div className="sx-in"><h2 id={id}>{title}</h2>{children}</div></section>);

export function PageBoost() {
  const path = norm(useLocation().pathname); const b = BOOST[path]; const gl = GUIDE_LINK[path];
  const card = (l) => { const th = thumbOf(l.to); return <li key={l.to}><Link to={l.to}>{th && <img className="px-thumb" src={th} alt="" width="480" height="252" loading="lazy" decoding="async" />}<b>{l.title}</b><span>{l.text}</span><em aria-hidden="true">→</em></Link></li>; };
  if (!b) return gl ? <div className="px-boost"><Sec id="px-guide" title="Read the full trip guide" tone="grey"><ul className="sx-cards">{card(gl)}</ul></Sec></div> : null;
  const vehicle = path.startsWith("/cars/"); const imgs = imagesOf(path); const gallery = vehicle ? imgs : imgs.slice(1);
  const offers = [...(b.offer ? [b.offer] : []), ...OFFERS];
  const msg = `Hello ${SITE.name}, I would like a quote (${path.replace(/^\//, "").replace(/[/-]/g, " ")}). Pickup: Destination: Date: Passengers:`; const chat = waHref(msg);
  const faqs = boostFaqs(path);
  return (
    <div className="px-boost">
      <Sec id="px-why" title="Why customers choose us for this" tone="grey">
        <ul className="px-why">{b.why.map(([t, x], i) => <li key={t}><span className="px-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span><b>{t}</b><p>{x}</p></li>)}</ul>
      </Sec>
      {gallery.length > 0 && <Sec id="px-photos" title="Photos"><div className={`px-gal px-gal--${Math.min(gallery.length, 3)}`}>{gallery.map((im) => <Pic key={im.key} im={im} sizes="(max-width: 700px) 92vw, 380px" className="px-fig px-fig--gal" />)}</div></Sec>}
      <Sec id="px-offers" title="Offers and extras: just ask" tone={gallery.length ? "grey" : undefined}>
        <ul className="px-offers">{offers.map(([t, x]) => <li key={t}><b>{t}</b><p>{x}</p></li>)}</ul>
        <p className="px-row">{telHref && <a className="sx-btn sx-btn--call" href={telHref}>Call · {SITE.phoneDisplay}</a>}{chat && <a className="sx-btn sx-btn--wa" href={chat} target="_blank" rel="noopener noreferrer">WhatsApp now</a>}<Link className="sx-btn sx-btn--quote" to="/book">Get a quote</Link></p>
        <p className="sx-note">Offers are arranged when you book and depend on your route, dates and vehicle. Nothing is added to your price without your agreement.</p>
      </Sec>
      <Sec id="px-ask" title="Tell us these four things for a fast quote" tone={gallery.length ? undefined : "grey"}>
        <ol className="px-ask">{b.ask.map((x) => <li key={x}>{x}</li>)}</ol>
      </Sec>
      {!vehicle && faqs.length > 0 && <Sec id="px-faq" title="More questions customers ask" tone="grey"><div className="sx-faq">{faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div></Sec>}
      <Sec id="px-links" title="Keep planning" tone={!vehicle && faqs.length ? undefined : "grey"}>
        <ul className="sx-cards">{gl && card(gl)}{b.links.filter((l) => !gl || l.to !== gl.to).slice(0, gl ? 3 : 4).map((l) => { const th = thumbOf(l.to); return <li key={l.to}><Link to={l.to}>{th && <img className="px-thumb" src={th} alt="" width="480" height="252" loading="lazy" decoding="async" />}<b>{l.title}</b><span>{l.text}</span><em aria-hidden="true">→</em></Link></li>; })}</ul>
        <ul className="px-tags" aria-label="Topics">{b.tags.map((t) => <li key={t}>#{t}</li>)}</ul>
      </Sec>
    </div>
  );
}
