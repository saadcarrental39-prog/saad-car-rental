// Murree tourist-spot pages (hub + one page per spot). Built from src/seo/data/tourSpots.js; rendered to static HTML at build time.
import { Link } from "react-router-dom";
import { pageByPath } from "./registry";
import { placePath, place } from "./data/places";
import { TOUR_HUB, TOUR_SPOTS, tourSpot, tourPath } from "./data/tourSpots";
import { Hero, Cta, Answer, Sec, Faq, Bullets, LinkCards, Updated } from "./blocks";
import { SpotGallery } from "./spotGallery";
import SocialLinks from "../components/SocialLinks";

const live = () => TOUR_SPOTS.filter((s) => s.status === "live");
const card = (s) => ({ to: tourPath(s), title: s.name, text: s.intro.split(". ")[0] + "." });
const murreeLinks = () => [[placePath(place("murree")), "Car rental with driver to Murree"], ["/routes/islamabad-to-murree", "Islamabad to Murree route"], ["/destinations/nathia-gali", "Nathia Gali"], ["/cars", "Our fleet"], ["/out-of-station-car-rental", "Out of Station service"]].filter(([to]) => pageByPath(to));

export function TourHubPage() {
  const p = pageByPath(TOUR_HUB.path);
  return (<>
    <Hero eyebrow="Murree & Galiyat" h1={TOUR_HUB.h1} lead={TOUR_HUB.lead} crumbs={p.breadcrumbs}><Updated date={TOUR_HUB.updated} /></Hero>
    <Sec id="answer" title="The short answer"><Answer q={TOUR_HUB.answerQ}>{TOUR_HUB.answer}</Answer></Sec>
    <Sec id="spots" title="Spots you can visit" tone="grey"><LinkCards items={live().map(card)} /></Sec>
    <Sec id="how" title="How a Murree trip with a driver works">
      <Bullets items={["Tell us your pickup point in Islamabad or Rawalpindi, the date and the spots you want.", "We confirm the vehicle and send the quote before you travel.", "Your driver handles the hill road, parking and waiting while you ride lifts and walk.", "Weather, snow and holiday traffic can change the day: we advise on the order of stops and the start time."]} />
      <p>{murreeLinks().map(([to, t], i) => <span key={to}>{i ? " · " : ""}<Link to={to}>{t} →</Link></span>)}</p>
    </Sec>
    <Faq items={TOUR_HUB.faqs} />
    <Sec id="follow" title="Follow our trips"><SocialLinks /></Sec>
    <Cta ctx="Murree tourist spots" from="Islamabad" to="Murree" title="Plan your Murree trip" text="Call, WhatsApp or send the booking form with your pickup, date and the spots you want to visit." />
  </>);
}

export function TourSpotPage({ slug }) {
  const s = tourSpot(slug); const p = pageByPath(`${TOUR_HUB.path}/${slug}`);
  const near = s.nearby.map(tourSpot).filter((x) => x && x.status === "live");
  return (<>
    <Hero eyebrow="Murree & Galiyat" h1={s.h1} lead={s.intro} crumbs={p.breadcrumbs}><Updated date={TOUR_HUB.updated} /></Hero>
    <Sec id="answer" title="The short answer"><Answer q={`How do I visit ${s.short} from Islamabad?`}>{`Book a car with a professional driver from Islamabad or Rawalpindi. Tell us your date, pickup point and the spots you want, and we confirm the vehicle and quote the trip before you travel. ${s.best}`}</Answer></Sec>
    <Sec id="see" title={`What to see at ${s.short}`} tone="grey"><Bullets items={s.see} /></Sec>
    <Sec id="photos" title={`${s.short} photos`}><SpotGallery slug={s.slug} name={s.name} labels={s.images} /></Sec>
    <Sec id="plan" title="How to plan the visit with a driver"><Bullets items={s.plan} /><p><b>Best time:</b> {s.best}</p></Sec>
    <Faq items={s.faqs} />
    <Sec id="near" title="Nearby spots" tone="grey"><LinkCards items={near.map(card).concat([{ to: TOUR_HUB.path, title: "All Murree tourist spots", text: TOUR_HUB.lead.split(". ")[0] + "." }])} /></Sec>
    <Cta ctx={s.name} from="Islamabad" to={s.short} title={`Book a car with driver to ${s.short}`} text="Call, WhatsApp or send the booking form with your pickup, date and passengers." />
  </>);
}
