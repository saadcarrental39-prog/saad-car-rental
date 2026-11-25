import { routeFaqs } from "./data/routeFaqs";
import { GallerySection, galleryOf } from "../components/CarGallery";
import { ReviewCards } from "../components/reviews/CarReviews";
// SEO page components. Every page is built from the data files in src/seo/data, so no page is hand-copied from another.
// They contain no browser-only code: the build renders them to plain HTML for crawlers (see scripts/prerender.mjs).
import { Link } from "react-router-dom";
import { SITE, telHref, waHref } from "../config";
import { BUSINESS } from "../business.config";
import { pageByPath } from "./registry";
import { PLACES, PROVINCES, place, placePath, PUNJAB_DISTRICTS } from "./data/places";
import { ROUTES } from "./data/routes";
import { SERVICE_PAGES } from "./data/services";
import { FAQS } from "./data/faq";
import { audience } from "./data/audiences";
import { LEGAL, LEGAL_UPDATED, REFUND_STAGES, legalPage } from "./data/legal";
import { GUIDE } from "./data/guide";
import { AI_INFO } from "./data/aiinfo";
import { SPOTS, LOCAL_GROUPS, AREAS, spot } from "./data/islamabad";
import { LOCAL_PILLAR, OUT_PILLAR, PLACES_HUB } from "./data/pillars";
import { TERRAIN, VEHICLE_FIT, USE } from "./data/vehicles";
import { baseFleet } from "../data/fleet";
import { categories, category, vehiclesForPlace, servicesForPlace, servicesForVehicle, placesForVehicle, nearby, routeFor, routePath, tripPath, tripLabel, northernPlaces, placesIn, livePlacesList, photoOf } from "./links";
import { Hero, Cta, Answer, Sec, Faq, Chips, Bullets, LinkCards, VehicleStrip, Steps, BOOKING_STEPS, Updated, DataTable, PriceGuide, Crumbs } from "./blocks";
import { factRows, ratesOf, seatsOf, similarCars, rs } from "./data/vehicleFacts";
import { GUIDES, GUIDES_HUB, guide, TERMS_ROWS } from "./data/articles";
import { LANDINGS, PACKAGES_HUB, landing, GROUPS } from "./data/landing";
import { OfferBox } from "./blocks";
import { OFFER } from "../offer";
import { TourHubPage, TourSpotPage } from "./tourPages";
import { WEDDING } from "./data/wedding";
import { CO_HUB, CO_GROUPS, COMPANIES, coFor, coPath, coInGroup, groupOf } from "./data/companies";
import { imagesOf, Pic } from "./media";
import { imgSet } from "../imgset";

const crumbsOf = (path) => (pageByPath(path) || { breadcrumbs: [] }).breadcrumbs;
const placeCard = (p) => ({ to: placePath(p), title: p.name, text: p.highlights[0] });
const svcCard = (s) => ({ to: `/services/${s.slug}`, title: s.name, text: s.intro.split(". ")[0] + "." });
const nm = (p) => p.short || p.name;
const bookingFor = (p) => ({ from: "Islamabad", to: p.name });

// ------------------------------------------------------------------ location page (/locations/<slug>)
export function LocationPage({ slug }) {
  const p = place(slug); const path = placePath(p); const base = p.basis === "base";
  const veh = vehiclesForPlace(p); const svc = servicesForPlace(p); const near = nearby(p); const r = routeFor(p.slug);
  const rel = base
    ? "Yes, this is our home city. Our office is in G-11 Markaz, and pickups are arranged across Islamabad and Rawalpindi."
    : p.slug === "rawalpindi"
      ? "Yes. Rawalpindi is covered daily from our Islamabad base, so you can be picked up in Rawalpindi or Islamabad for any trip."
      : `Yes. SAAD CAR RENTAL SERVICES is based in Islamabad and provides a car with professional driver for travel to and from ${p.name}. We do not claim an office in ${p.name}: most trips start in Islamabad or Rawalpindi, and if you need a pickup in ${p.name} itself, tell us and we will confirm it.`;
  return (<>
    <Hero eyebrow={base ? "Based in Islamabad" : `Travel to and from ${p.name}`} h1={pageByPath(path).h1} lead={p.intro} crumbs={crumbsOf(path)} />
    <Sec id="serve" title={`Do you serve ${p.name}?`}><Answer q={`Short answer: yes.`}>{rel}</Answer></Sec>
    <Sec id="highlights" title={base ? "What we do in Islamabad" : `What guests do in and around ${p.name}`}><Bullets items={p.highlights} />
      <h3 className="sx-h3">Who books this</h3><Chips items={p.audience} /></Sec>
    <Sec id="services" title={`Services for ${p.name}`} tone="grey"><LinkCards items={svc.map(svcCard)} /></Sec>
    <Sec id="vehicles" title={`Vehicles for ${base ? "Islamabad" : p.name}`}><p>{TERRAIN[p.terrain].advice} Every vehicle comes with a professional driver.</p><VehicleStrip cats={veh} /></Sec>
    <Sec id="routes" title={base ? "Popular trips from Islamabad" : `Trips and nearby places`} tone="grey">
      <LinkCards items={base ? ["murree", "naran", "hunza", "skardu", "lahore", "peshawar"].map(place).map((x) => ({ to: tripPath(x), title: tripLabel(x), text: x.highlights[0] })) : [...(r ? [{ to: routePath(r), title: `Islamabad to ${p.name} car with driver`, text: "Trip formats, vehicle choice, season and booking" }] : []), ...near.map(placeCard)]} />
    </Sec>
    <Sec id="how" title="How to book"><Steps items={BOOKING_STEPS} /></Sec>
    <Faq items={[...p.faqs, { q: `How do I get a quote for ${p.name}?`, a: `Call ${SITE.phoneDisplay}, WhatsApp us, or use the Book Now form with your pickup, destination, date and number of passengers. We reply with a quote.` }]} />
    <Cta ctx={`${p.name}`} to={base ? "" : p.name} from={base ? "Islamabad" : "Islamabad"} />
  </>);
}

// ------------------------------------------------------------------ destination page (/destinations/<slug>): destination + route in one page
export function DestinationPage({ slug }) {
  const p = place(slug); const path = placePath(p); const veh = vehiclesForPlace(p); const near = nearby(p); const svc = servicesForPlace(p);
  return (<>
    <Hero eyebrow={p.area ? `${p.area} · ${PROVINCES[p.province].name}` : PROVINCES[p.province].name} h1={pageByPath(path).h1} lead={p.intro} crumbs={crumbsOf(path)}><Updated /></Hero>
    <Sec id="answer" title={`Can I hire a car with driver to ${nm(p)}?`}><Answer q="Short answer: yes.">{`SAAD CAR RENTAL SERVICES is based in Islamabad and provides a car with professional driver from Islamabad or Rawalpindi to ${p.name}. ${p.plan}`}</Answer></Sec>
    <Sec id="see" title={`What to expect at ${nm(p)}`}><Bullets items={p.highlights} /><h3 className="sx-h3">Who books this</h3><Chips items={p.audience} /></Sec>
    <Sec id="road" title="Road and journey" tone="grey"><p>{p.road}</p></Sec>
    <Sec id="season" title="Best time and conditions"><p>{p.season}</p></Sec>
    <Sec id="vehicles" title={`Which vehicle for ${nm(p)}?`} tone="grey"><p>{TERRAIN[p.terrain].advice}</p><VehicleStrip cats={veh} /></Sec>
    <Sec id="plan" title="Plan the trip with us"><Steps items={BOOKING_STEPS} />
      {near.length > 0 && <><h3 className="sx-h3">Nearby places to combine</h3><LinkCards items={near.map(placeCard)} /></>}
      <h3 className="sx-h3">Related services</h3><LinkCards items={svc.slice(0, 3).map(svcCard)} /></Sec>
    <Faq items={[...p.faqs, { q: `How do I get a quote for a trip to ${nm(p)}?`, a: `Call ${SITE.phoneDisplay}, WhatsApp us or use the Book Now form with your dates, number of passengers and luggage. We reply with a quote for the whole trip.` }]} />
    <Cta ctx={`Islamabad to ${p.name}`} {...bookingFor(p)} />
  </>);
}

// ------------------------------------------------------------------ route page (/routes/islamabad-to-<slug>)
export function RoutePage({ slug }) {
  const r = ROUTES.find((x) => x.slug === slug); const p = place(r.to); const path = `/routes/${r.slug}`; const veh = vehiclesForPlace(p); const near = nearby(p);
  const T = TERRAIN[p.terrain];
  const faqs = routeFaqs(p);
  return (<>
    <Hero eyebrow={`Route · ${T.label.replace(/-/g, " ")}`} h1={pageByPath(path).h1} lead={`Islamabad to ${p.name} with a professional driver. ${p.plan}`} crumbs={crumbsOf(path)}><Updated /></Hero>
    <Sec id="answer" title={`Islamabad to ${p.name}: the short answer`}><Answer q={`Do you provide a car with driver from Islamabad to ${p.name}?`}>{`Yes. SAAD CAR RENTAL SERVICES provides a car with professional driver from Islamabad or Rawalpindi to ${p.name}. Tell us your date, pickup address and passengers by WhatsApp or phone and we confirm the vehicle and quote.`}</Answer></Sec>
    <Sec id="journey" title="About the journey" tone="grey"><p>{r.note}</p>{(r.extra || []).map((t, i) => <p key={i}>{t}</p>)}<p>{p.road}</p><p>{p.season}</p></Sec>
    <Sec id="vehicle" title={`Best vehicles for Islamabad to ${p.name}`}><p>{T.advice}</p><VehicleStrip cats={veh} /></Sec>
    <Sec id="formats" title="One-way, round trip or multi-day" tone="grey">
      <ul className="sx-list">
        <li><b>One-way:</b> a driver takes you from Islamabad or Rawalpindi to {p.name} and the vehicle returns.</li>
        <li><b>Round trip:</b> the same vehicle takes you there and brings you back on the date you choose.</li>
        <li><b>Multi-day:</b> the driver stays with you for several days, including local sightseeing around {p.name}.</li>
      </ul></Sec>
    <Sec id="send" title="What to send us when you enquire"><Bullets items={["Pickup address and whether it is Islamabad or Rawalpindi", `Date, pickup time and whether you return from ${p.name}`, "Number of passengers and amount of luggage", "Preferred vehicle, if you have one", "Any stops you want on the way"]} /></Sec>
    <Sec id="related" title="Related pages" tone="grey">
      <LinkCards items={[{ to: placePath(p), title: `Car rental in ${p.name}`, text: "About the destination and how we serve it" }, ...near.slice(0, 3).map((x) => ({ to: tripPath(x), title: tripLabel(x) })), ...servicesForPlace(p).slice(0, 2).map(svcCard)]} />
    </Sec>
    <Sec id="guides" title="Guides for this trip"><LinkCards items={[{ to: "/guides/northern-pakistan-road-trip-itineraries", title: "Northern Pakistan road trip itineraries", text: "Day-by-day plans with typical driving times" }, { to: "/guides/car-rental-with-driver-islamabad-rates", title: "Rates guide: what decides the price", text: "How a quote is built and what to ask" }, { to: "/guides/murree-galiyat-winter-road-guide", title: "Winter road guide: Murree and Galiyat", text: "Vehicle, timing and what to carry in snow" }]} /></Sec>
    <Faq items={faqs} />
    <Cta ctx={`Islamabad to ${p.name}`} {...bookingFor(p)} />
  </>);
}

// ------------------------------------------------------------------ service page (/services/<slug>)
export function ServicePage({ slug }) {
  const s = SERVICE_PAGES.find((x) => x.slug === slug); const path = `/services/${slug}`;
  const veh = s.vehicles.map(category).filter(Boolean); const rel = SERVICE_PAGES.filter((x) => x.slug !== slug && (x.vehicles.some((v) => s.vehicles.includes(v)))).slice(0, 4);
  return (<>
    <Hero eyebrow="Service" h1={s.h1} lead={s.intro} crumbs={crumbsOf(path)} />
    <Sec id="answer" title={`What is the ${s.name.toLowerCase()} service?`}><Answer q="In short:">{`${s.name} with SAAD CAR RENTAL SERVICES means a premium vehicle with an experienced professional driver, arranged around your plan. We are based in Islamabad (G-11 Markaz). Call, WhatsApp or use Book Now for a quote.`}</Answer></Sec>
    <Sec id="incl" title="What you can expect" tone="grey"><Bullets items={s.points} /></Sec>
    {s.more && <Sec id="detail" title={s.moreTitle || "Good to know"}>{s.more.map((t, i) => <p key={i}>{t}</p>)}</Sec>}
    <Sec id="vehicles" title="Vehicles for this service"><VehicleStrip cats={veh} /></Sec>
    <Sec id="where" title="Where we provide it" tone="grey"><LinkCards items={s.places.map(place).filter(Boolean).map((p) => ({ to: p.basis === "base" || p.slug === "rawalpindi" ? placePath(p) : tripPath(p), title: p.name, text: p.highlights[0] }))} /></Sec>
    <Sec id="how" title="How to book"><Steps items={BOOKING_STEPS} /></Sec>
    <Faq items={s.faqs} />
    {["wedding-event-transportation", "group-transportation", "vip-executive-transportation", "premium-car-rental", "chauffeur-service", "family-travel"].includes(slug) && <WeddingTeaser title="Wedding car booking with driver" />}
    {["corporate-transportation", "business-travel", "group-transportation", "vip-executive-transportation", "long-distance-travel", "chauffeur-service", "customized-travel"].includes(slug) && <CompanyTeaser title="Monthly contracts for companies, UN agencies and NGOs" />}
    <Sec id="more" title="Other services" tone="grey"><LinkCards items={rel.map(svcCard)} /></Sec>
    <Cta ctx={s.name} />
  </>);
}

// ------------------------------------------------------------------ Islamabad airport page
export function AirportPage() {
  const path = "/airport-transfer/islamabad"; const p = pageByPath(path);
  const veh = ["honda-civic", "toyota-grande", "prado", "land-cruiser-v8", "coaster"].map(category).filter(Boolean);
  return (<>
    <Hero eyebrow="Islamabad International Airport" h1={p.h1} lead="Arrive and leave without searching for a taxi. A professional driver collects you at the airport or takes you there, in a vehicle that suits your group and luggage." crumbs={p.breadcrumbs} />
    <Sec id="answer" title="Do you provide airport pickup and drop in Islamabad?"><Answer q="Short answer: yes.">Yes. SAAD CAR RENTAL SERVICES provides airport pickups and drop-offs at Islamabad International Airport with a professional driver. Share your flight, passenger and luggage details and we confirm the arrangement with you before you travel.</Answer></Sec>
    <Sec id="who" title="Who uses our airport transfer" tone="grey"><LinkCards items={[
      { to: "/services/family-travel", title: "Families", text: "An SUV or Coaster with room for luggage and children" },
      { to: "/services/business-travel", title: "Business guests", text: "A sedan or executive SUV straight to meetings or hotels" },
      { to: "/services/corporate-transportation", title: "Companies and delegations", text: "Guest pickups planned for you" },
      { to: "/services/hotel-transfers", title: "Hotel transfers", text: "Hotel to airport and back" }]} /></Sec>
    <Sec id="process" title="How an airport pickup works"><Steps items={[
      ["1. Send your details", "Flight number, arrival or departure time, number of passengers, luggage and your destination or pickup address."],
      ["2. Choose the vehicle", "We recommend a sedan for one to three guests, an SUV for families with luggage, or a Coaster for groups, and confirm availability."],
      ["3. We confirm", "We confirm the driver, the vehicle and how you will meet your driver before you travel."],
      ["4. Travel", "Your driver takes you to your hotel, home or meeting, or to the terminal for a departure."]]} /></Sec>
    <Sec id="veh" title="Vehicles for airport transfers" tone="grey"><VehicleStrip cats={veh} /></Sec>
    <Sec id="areas" title="Where we take you from the airport"><p>Islamabad sectors, Rawalpindi, DHA, Bahria and Park View City, plus onward trips to Murree, Lahore, Peshawar and the northern areas.</p>
      <LinkCards items={[{ to: "/locations/islamabad", title: "Car rental in Islamabad" }, { to: "/locations/rawalpindi", title: "Car rental in Rawalpindi" }, { to: "/routes/islamabad-to-murree", title: "Islamabad to Murree" }, { to: "/routes/islamabad-to-lahore", title: "Islamabad to Lahore" }]} /></Sec>
    <Faq items={p.faqs} />
    <Cta ctx="Islamabad airport transfer" to="Islamabad International Airport" />
  </>);
}

// ------------------------------------------------------------------ province hub (/locations/punjab ...)
export function ProvincePage({ slug: key }) {
  const pv = PROVINCES[key]; const path = `/locations/${pv.slug}`; const list = placesIn(key);
  return (<>
    <Hero eyebrow="Region" h1={pageByPath(path).h1} lead={pv.intro} crumbs={crumbsOf(path)} />
    <Sec id="answer" title={`Do you serve ${pv.name}?`}><Answer q="Short answer: yes, from Islamabad.">{`SAAD CAR RENTAL SERVICES is based in Islamabad and provides chauffeur-driven travel to and from the places below in ${pv.name}. We list only the places we serve and we do not claim offices outside Islamabad.`}</Answer></Sec>
    <Sec id="places" title={`Places in ${pv.name}`} tone="grey"><LinkCards items={list.map((p) => ({ to: placePath(p), title: p.name, text: p.highlights[0] }))} /></Sec>
    <Sec id="routes" title="Routes from Islamabad"><LinkCards items={list.map((p) => ({ to: tripPath(p), title: tripLabel(p) }))} /></Sec>
    <Sec id="notes" title="Travel notes" tone="grey"><Bullets items={pv.notes} /></Sec>
    {key === "punjab" && <Sec id="districts" title="Punjab districts we plan to cover"><p>District pages are only created where there is real demand and a confirmed service. Until then, these districts are covered by the city pages above: {PUNJAB_DISTRICTS.slice(0, 12).join(", ")} and others. Ask us about a pickup or drop in your district.</p></Sec>}
    <Sec id="veh" title="Choosing a vehicle"><VehicleStrip cats={["prado", "land-cruiser-v8", "toyota-grande", "coaster"].map(category).filter(Boolean)} /></Sec>
    <Faq items={FAQS.slice(8, 12)} />
    <Cta ctx={pv.name} />
  </>);
}

// ------------------------------------------------------------------ national / northern / index hubs
const NORTH_GROUPS = [
  ["Hill stations near Islamabad", ["murree", "nathia-gali", "abbottabad"]],
  ["Kaghan Valley and Naran", ["naran", "shogran", "babusar-top"]],
  ["Swat, Kumrat and Chitral", ["swat", "kalam", "malam-jabba", "kumrat-valley", "chitral"]],
  ["Hunza, Gilgit and Skardu", ["hunza", "attabad-lake", "khunjerab-pass", "gilgit", "naltar-valley", "skardu", "shigar-valley", "khaplu", "deosai-national-park"]],
  ["Astore and Fairy Meadows", ["fairy-meadows", "astore-valley"]],
  ["Azad Kashmir", ["muzaffarabad", "neelum-valley"]],
];
const GROUP_BLURB = {
  "Hill stations near Islamabad": "Short getaways from the capital: day trips or a night or two in the pines.",
  "Kaghan Valley and Naran": "The classic family journey north: lakes, meadows and mountain passes in the warm months.",
  "Swat, Kumrat and Chitral": "Green river valleys and forests, from family-friendly Swat to remote Chitral.",
  "Hunza, Gilgit and Skardu": "The Karakoram Highway and Baltistan: long, unforgettable multi-day journeys.",
  "Astore and Fairy Meadows": "Views of Nanga Parbat, reached by the Karakoram Highway and local jeep tracks.",
  "Azad Kashmir": "River valleys and hill roads through Muzaffarabad into Neelum Valley.",
};
export function HubPage({ slug }) {
  const path = { pakistan: "/car-rental-pakistan", northern: "/northern-areas", locations: "/locations", destinations: "/destinations", routes: "/routes" }[slug]; const p = pageByPath(path);
  const live = Object.entries(PROVINCES).filter(([, v]) => v.own && v.status === "live");
  if (slug === "northern") return (<>
    <Hero eyebrow="Northern Pakistan" h1={p.h1} lead="From Murree's pine forests to the Karakoram giants, we provide a car with professional driver from Islamabad for family holidays, tours and group trips in the north." crumbs={p.breadcrumbs} />
    <Sec id="answer" title="Can I hire a car with driver for the northern areas?"><Answer q="Short answer: yes.">Yes. SAAD CAR RENTAL SERVICES is based in Islamabad and provides a car with professional driver for Murree, Galiyat, Naran, Swat, Chitral, Hunza, Skardu, Astore and Neelum Valley. Choose a Prado, Land Cruiser or Revo for mountain roads, or a Coaster for a group, and call or WhatsApp us for a quote.</Answer></Sec>
    {NORTH_GROUPS.map(([g, slugs], i) => <Sec key={g} id={`g${i}`} title={g} tone={i % 2 ? undefined : "grey"}><p>{GROUP_BLURB[g]}</p><LinkCards items={slugs.map(place).map((x) => ({ to: x.type === "destination" ? placePath(x) : tripPath(x), title: tripLabel(x), text: x.highlights[0] }))} /></Sec>)}
    <Sec id="veh" title="Which vehicle for the north?"><p>{TERRAIN.mountain.advice}</p><VehicleStrip cats={TERRAIN.mountain.vehicles.map(category).filter(Boolean)} /></Sec>
    <Sec id="plan" title="Planning your northern trip" tone="grey"><Bullets items={["Share your dates early: access to places such as Babusar Top, Deosai and Khunjerab is seasonal.", "Plan multi-day trips with realistic driving days; mountain roads are slower than they look on a map.", "Keep a flexible day in your plan for weather or road interruptions, especially in monsoon and winter.", "Tell us about luggage and group size so we choose the right vehicle."]} /></Sec>
    <Faq items={p.faqs} />
    <Cta ctx="Northern areas trip" from="Islamabad" />
  </>);
  if (slug === "locations") return (<>
    <Hero eyebrow="Where we serve" h1={p.h1} lead="We are based in Islamabad (G-11 Markaz) and provide a car with professional driver for travel to and from the places below. A page appears here only when we really provide the service." crumbs={p.breadcrumbs} />
    <Sec id="base" title="Our base: Islamabad and Rawalpindi" tone="grey"><LinkCards items={["islamabad", "rawalpindi"].map(place).map(placeCard)} /></Sec>
    {live.map(([k, v], i) => <Sec key={k} id={`r${k}`} title={v.name} tone={i % 2 ? "grey" : undefined}><p><Link to={`/locations/${v.slug}`}>Car rental with driver in {v.name} →</Link></p><LinkCards items={placesIn(k).filter((x) => x.type === "location" && x.basis !== "base" && x.slug !== "rawalpindi").map(placeCard)} /></Sec>)}
    <Cta ctx="Locations" />
  </>);
  if (slug === "destinations") { const dests = livePlacesList().filter((x) => x.type === "destination"); return (<>
    <Hero eyebrow="Plan your trip" h1={p.h1} lead="Scenic places across the north, each with its own page covering the road, the season and the right vehicle. Our drivers take you from Islamabad and stay with you." crumbs={p.breadcrumbs} />
    {NORTH_GROUPS.map(([g, slugs], i) => { const items = slugs.map(place).filter((x) => x.type === "destination"); return items.length ? <Sec key={g} id={`d${i}`} title={g} tone={i % 2 ? undefined : "grey"}><LinkCards items={items.map(placeCard)} /></Sec> : null; })}
    <Sec id="all" title="All destinations"><Chips items={dests.map((d) => d.name)} /></Sec>
    <Cta ctx="Tourist destination trip" from="Islamabad" />
  </>); }
  if (slug === "routes") return (<>
    <Hero eyebrow="Routes" h1={p.h1} lead="One-way, round-trip and multi-day journeys from Islamabad or Rawalpindi, each with a professional driver. Pick a route for vehicle advice, season notes and how to book." crumbs={p.breadcrumbs} />
    <Sec id="city" title="Intercity routes" tone="grey"><LinkCards items={["lahore", "peshawar", "faisalabad", "multan"].map(place).map((x) => ({ to: tripPath(x), title: tripLabel(x), text: x.plan }))} /></Sec>
    <Sec id="hills" title="Hills and valleys"><LinkCards items={["murree", "abbottabad", "nathia-gali", "swat", "kalam", "naran", "muzaffarabad", "neelum-valley"].map(place).map((x) => ({ to: tripPath(x), title: tripLabel(x), text: x.plan }))} /></Sec>
    <Sec id="north" title="Mountain routes" tone="grey"><LinkCards items={["chitral", "gilgit", "hunza", "skardu", "fairy-meadows", "deosai-national-park", "astore-valley", "naltar-valley", "attabad-lake", "khunjerab-pass", "babusar-top", "shogran", "kumrat-valley", "malam-jabba", "shigar-valley", "khaplu"].map(place).map((x) => ({ to: tripPath(x), title: tripLabel(x), text: x.plan }))} /></Sec>
    <Sec id="abroad" title="Travelling from abroad?"><p>Foreign visitors and overseas Pakistanis can book a car with a professional driver in advance and have it waiting at Islamabad airport. <Link to="/visit-pakistan">Visit Pakistan: tourist car with driver →</Link> · <Link to="/overseas-pakistanis">Overseas Pakistanis →</Link></p></Sec>
    <Sec id="note" title="Another route?"><p>If your trip is not listed, call or WhatsApp us with your pickup and destination. We list a route here only when we are sure we can serve it well.</p></Sec>
    <Cta ctx="Route enquiry" from="Islamabad" />
  </>);
  return (<>
    <Hero eyebrow="Pakistan-wide chauffeur service" h1={p.h1} lead="SAAD CAR RENTAL SERVICES is based in Islamabad and provides cars with professional drivers for travel to and from cities, hill stations and mountain valleys across Pakistan." crumbs={p.breadcrumbs} />
    <Sec id="how" title="How our national service works"><Answer q="Where are you based, and where do you travel?">{`Our office is in G-11 Markaz, Islamabad. Most journeys start in Islamabad or Rawalpindi and go to the cities and destinations listed here. We do not claim offices or permanently stationed vehicles in other cities; if you need a pickup elsewhere, tell us and we will confirm what we can arrange.`}</Answer></Sec>
    {live.map(([k, v], i) => <Sec key={k} id={`p${k}`} title={v.name} tone={i % 2 ? undefined : "grey"}><p>{v.intro}</p><LinkCards items={[{ to: `/locations/${v.slug}`, title: `Car rental with driver in ${v.name}` }, ...placesIn(k).slice(0, 4).map((x) => ({ to: tripPath(x), title: tripLabel(x) }))]} /></Sec>)}
    <Sec id="islamabad" title="Islamabad Capital Territory"><LinkCards items={[{ to: "/locations/islamabad", title: "Car rental in Islamabad" }, { to: "/airport-transfer/islamabad", title: "Islamabad airport transfer" }, { to: "/locations/rawalpindi", title: "Car rental in Rawalpindi" }]} /></Sec>
    <Sec id="other" title="Sindh and Balochistan" tone="grey"><p>We do not yet publish pages for Karachi, Quetta, Gwadar and other far-away cities. If you need a long-distance journey, call or WhatsApp us and we will tell you honestly what is possible.</p></Sec>
    <Sec id="services" title="Services"><LinkCards items={SERVICE_PAGES.slice(0, 6).map(svcCard)} /></Sec>
    <Sec id="fleet" title="Fleet" tone="grey"><VehicleStrip cats={["prado", "land-cruiser-v8", "revo", "toyota-grande", "honda-civic", "coaster"].map(category).filter(Boolean)} /></Sec>
    <Faq items={p.faqs} />
    <Cta ctx="Pakistan-wide trip" />
  </>);
}

export function FaqPage() {
  const p = pageByPath("/faq");
  return (<>
    <Hero eyebrow="FAQ" h1={p.h1} lead="Straight answers about hiring a car with a professional driver from SAAD CAR RENTAL SERVICES. Daily rents are shown on the cars where listed, and every other trip is quoted before you travel." crumbs={p.breadcrumbs} />
    <Faq items={FAQS} title="Questions and answers" />
    <Sec id="more" title="Still have a question?" tone="grey"><LinkCards items={[{ to: "/contact", title: "Contact us" }, { to: "/services", title: "Our services" }, { to: "/routes", title: "Routes from Islamabad" }, { to: "/cars", title: "Our fleet" }]} /></Sec>
    <Cta ctx="General enquiry" />
  </>);
}

// ------------------------------------------------------------------ extra SEO content appended to the existing vehicle page
export function VehicleExtras({ slug }) {
  const c = category(slug); if (!c) return null; const path = `/cars/${slug}`; const pg = pageByPath(path);
  const fit = (VEHICLE_FIT[slug] || []).map((u) => USE[u]); const places = placesForVehicle(slug); const svc = servicesForVehicle(slug);
  const X = vehicleSeo(slug); const nm = (X && X.name) || c.title; const rates = ratesOf(c); const seats = seatsOf(c); const sim = similarCars(slug);
  const short = `The ${nm} suits ${fit.slice(0, 3).join(", ").toLowerCase()} and similar trips. It comes with a professional driver${seats ? ` and typically seats ${seats.replace(/^Up to /i, "up to ")} passengers` : ""}. ${rates.length ? `The Local rent is ${rates.map((n) => `Rs ${Number(n).toLocaleString("en-PK")}`).join(" to ")} per day. ` : "We quote each trip before you travel. "}Call, WhatsApp or use Book Now to confirm your date.`;
  return (<div className="sx-extra">
    <Sec id="short" title={`${nm} on rent in Islamabad: the short answer`}><Answer q={`Can I hire a ${nm} with a driver?`}>{short}</Answer></Sec>
    {galleryOf(slug).length > 0 && <Sec id="photos" title={`${nm}: interior and exterior photos`}><GallerySection slug={slug} /></Sec>}
    <Sec id="reviews" title={`${nm}: what customers say`}><p>Real Google reviews of SAAD CAR RENTAL SERVICES. Press “See translation” on any review to read it in your language.</p><ReviewCards slug={slug} /></Sec>
    <Sec id="facts" title={`${nm}: quick facts`} tone="grey"><dl className="sx-facts">{factRows(c).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      <p className="sx-note">Seating is typical for this model. We confirm the exact vehicle, seats and luggage space for your date when you book.</p></Sec>
    <Sec id="price" title={`${nm} price guide`}><PriceGuide name={nm} rates={rates} />{OFFER.on && <OfferBox cats={[c]} />}</Sec>
    {X && <Sec id="about" title={`About the ${X.name} with driver`} tone="grey">{X.about.map((t, i) => <p key={i}>{t}</p>)}<p className="sx-note">People also search for: {X.alias.join(", ")}.</p></Sec>}
    <Sec id="best" title={`What the ${c.title} is best for`} tone={X ? undefined : "grey"}><p>{VEHICLE_PITCH_SENTENCE(c)}</p><Chips items={fit} />{!photoOf(c) && <p className="sx-note">Real photos of this vehicle are sent on request. It is available on request, so please call or WhatsApp to confirm your date and ask for photos.</p>}</Sec>
    <Sec id="trips" title={`Best trips in the ${c.title}`} tone={X ? "grey" : undefined}><LinkCards items={places.map((p) => ({ to: tripPath(p), title: tripLabel(p), text: p.highlights[0] }))} /></Sec>
    {LANDINGS.some((l) => l.focus.includes(slug)) && <Sec id="pkgs" title={`Packages for the ${nm}`} tone="grey"><LinkCards items={landingCards(LANDINGS.filter((l) => l.focus.includes(slug)).slice(0, 6))} /><p><Link to="/packages">All offers and packages →</Link></p></Sec>}
    <Sec id="similar" title="Similar vehicles you may prefer"><VehicleStrip cats={sim} /></Sec>
    {((VEHICLE_FIT[slug] || []).includes("wedding") || slug === "coaster" || slug === "honda-civic" || slug === "toyota-grande") && <WeddingTeaser title={`${nm} for weddings: wedding car booking with driver`} text={`Book the ${nm} with a professional driver for a barat, nikah, mehndi, walima or party in Islamabad and Rawalpindi. See wedding car photos, the functions we cover and how to book.`} tone="grey" />}
    <Sec id="svc" title="Related services" tone="grey"><LinkCards items={svc.map(svcCard)} /></Sec>
    <Sec id="trust" title="Booking with confidence"><p>{SITE.name} has served Islamabad for {SITE.years} years and is rated {SITE.rating} on Google from {SITE.reviewCount} reviews. <a href={SITE.reviewsUrl} target="_blank" rel="noopener noreferrer">Read our Google reviews</a> · <Link to="/about">About us</Link> · <Link to="/guides/booking-terms-explained">Booking terms explained</Link> · <Link to="/refund-policy">Refund and cancellation policy</Link></p><Updated /></Sec>
    <Faq items={pg.faqs} />
    <Cta ctx={c.title} car={(photoOf(c) || c.vehicles[0]).id} />
  </div>);
}
import { VEHICLE_PITCH } from "./data/vehicles";
import { vehicleSeo } from "./data/vehicleSeo";
import { useT, useI18n } from "../i18n";
const VEHICLE_PITCH_SENTENCE = (c) => `The ${c.title} is ${VEHICLE_PITCH[c.slug] || "available with a professional driver"}. Every vehicle comes with an experienced professional driver, and we are based in Islamabad (G-11 Markaz).`;

// ------------------------------------------------------------------ home page sections (below the existing fleet carousels)
export function HomeSeoSections() {
  const feat = ["murree", "naran", "hunza", "skardu", "lahore", "peshawar"].map(place);
  return (<div className="sx-home">
    <Sec id="intro" title="Car rental with a professional driver in Islamabad"><p className="sx-lead">{SITE.name} has served Islamabad for {SITE.years} years. Every car comes with an experienced professional driver for airport transfers, business and family travel, weddings, events and journeys to the northern areas of Pakistan. Call or WhatsApp us for today's availability and quote.</p></Sec>
    <Sec id="who" title="Who we drive, and what every booking includes" tone="grey">
      <p>Our customers are families planning a day out or a holiday, executives and business travellers, companies hosting guests, tourists and overseas Pakistanis arriving at Islamabad airport, and wedding parties who need cars that arrive on time. Each of them gets the same thing: a well-kept vehicle and an experienced professional driver who knows the roads of Islamabad, Rawalpindi and the routes beyond.</p>
      <p>Every booking includes the vehicle and the driver. Fuel, tolls, parking, driver meals and stay, waiting time and advance payment are agreed for your trip and written in the quote before you travel, so you know what is covered. Our <Link to="/guides/booking-terms-explained">booking terms guide</Link> lists every point worth asking.</p>
      <h3 className="sx-h3">How pricing works</h3>
      <p>The price depends on the vehicle, whether you book the <Link to="/local-car-rental-islamabad">Local service</Link> inside Islamabad and Rawalpindi or an <Link to="/out-of-station-car-rental">Out of Station</Link> trip, the route, the number of days and any extras. Where a daily rent is listed on a car, it is shown on that car's page. For every other trip you send your plan by WhatsApp or phone and receive a clear quote. Read the full <Link to="/guides/car-rental-with-driver-islamabad-rates">rates guide</Link>.</p>
      <h3 className="sx-h3">Choosing the right vehicle</h3>
      <p>A sedan suits one to three guests in the city. A Prado, Fortuner or Land Cruiser suits families with luggage and hill roads. The Lexus LX 570, G Wagon and Premium Luxury Land Cruiser suit VIP arrivals and weddings, the Revo suits rougher routes, and a Coaster suits groups. Not sure? Use the <Link to="/guides/which-car-for-which-trip-pakistan">car comparison guide</Link> or tell us your plan.</p>
      <h3 className="sx-h3">Why customers trust us</h3>
      <p>{SITE.name} has operated from G-11 Markaz, Islamabad for {SITE.years} years and is rated {SITE.rating} on Google from {SITE.reviewCount} reviews. Our address, phone number and WhatsApp are the same on every page, and you can <Link to="/about">read more about us</Link>, <Link to="/contact">visit or contact the office</Link> and <a href={SITE.reviewsUrl} target="_blank" rel="noopener noreferrer">read our Google reviews</a>.</p></Sec>
    <Sec id="svc" title="Our services"><LinkCards items={SERVICE_PAGES.slice(0, 6).map(svcCard)} /><p><Link to="/services">All services →</Link></p></Sec>
    <Sec id="routes" title="Popular routes from Islamabad"><LinkCards items={feat.map((x) => ({ to: tripPath(x), title: tripLabel(x), text: x.plan }))} /><p><Link to="/routes">All routes →</Link> · <Link to="/northern-areas">Northern areas →</Link> · <Link to="/car-rental-pakistan">Across Pakistan →</Link></p></Sec>
    <WeddingTeaser title="Wedding car booking with driver in Islamabad" tone="grey" />
    <CompanyTeaser />
    <Sec id="air" title="Airport transfers"><p>Arrive at Islamabad International Airport and find a professional driver ready. <Link to="/airport-transfer/islamabad">See how airport pickup works →</Link></p></Sec>
    <Sec id="abroad" title="Visiting Pakistan or coming home from abroad?"><LinkCards items={[{ to: "/visit-pakistan", title: "Tourists visiting Pakistan", text: "Airport pickup and a professional driver for Hunza, Skardu, Swat and more. Book in advance." }, { to: "/overseas-pakistanis", title: "Overseas Pakistanis", text: "Book a premium car with a driver before you land. Family trips, weddings and airport pickup." }]} /></Sec>
    <Sec id="how" title="How to book"><Steps items={BOOKING_STEPS} /></Sec>
    <Faq items={FAQS.slice(0, 8)} />
    <Cta ctx="Home" />
  </div>);
}

// ------------------------------------------------------------------ audience pages: visitors from abroad / overseas Pakistanis
export function AudiencePage({ slug }) {
  const a = audience(slug); const p = pageByPath(a.path);
  const trips = a.trips.map(place).filter((x) => x && x.status === "live");
  const other = slug === "visit-pakistan" ? { to: "/overseas-pakistanis", title: "Overseas Pakistanis: car with driver", text: "Coming home to family? Plan your airport pickup and trips in advance." } : { to: "/visit-pakistan", title: "Visiting Pakistan as a tourist", text: "Foreign guests: airport pickup and trips to the north with a professional driver." };
  return (<>
    <Hero eyebrow={a.eyebrow} h1={a.h1} lead={a.lead} crumbs={p.breadcrumbs} />
    <Sec id="answer" title={a.answerQ}><Answer q="Short answer: yes.">{a.answer}</Answer></Sec>
    <Sec id="why" title={a.whyTitle} tone="grey"><Bullets items={a.why} /></Sec>
    <Sec id="arrival" title={a.arrivalTitle}><p>{a.arrival}</p><p><Link to="/airport-transfer/islamabad">How our Islamabad airport transfer works →</Link></p></Sec>
    <Sec id="vehicles" title="Vehicles for your trip" tone="grey"><p>Every vehicle comes with an experienced professional driver. Tell us your group size and luggage and we suggest the right one.</p><VehicleStrip cats={a.vehicles.map(category).filter(Boolean)} /></Sec>
    <Sec id="trips" title={a.tripsTitle}><LinkCards items={trips.map((x) => ({ to: tripPath(x), title: tripLabel(x), text: x.highlights[0] }))} /><p><Link to="/northern-areas">All northern areas →</Link> · <Link to="/routes">All routes →</Link> · <Link to="/car-rental-pakistan">Across Pakistan →</Link></p></Sec>
    <Sec id="advance" title={a.adviceTitle} tone="grey"><Bullets items={a.advice} /></Sec>
    <Sec id="how" title="How advance booking works"><Steps items={[["1. Send your plan", "Arrival date and time, flight number, pickup and drop-off places, number of travellers and luggage, by WhatsApp, phone or the booking form."], ["2. We confirm", "We confirm the vehicle and driver for your dates and send you a quote. Nothing is charged by the website."], ["3. Your driver is ready", "Your professional driver is at the agreed place and time, and stays with you for the booking."]]} /></Sec>
    {slug === "overseas-pakistanis" && <WeddingTeaser title="Coming home for a wedding? Book your wedding cars in advance" />}
    <Sec id="also" title="You may also need" tone="grey"><LinkCards items={[other, { to: "/services/private-tours", title: "Private tours with a driver", text: "Plan multi-day trips with your own vehicle and driver." }, { to: "/services/family-travel", title: "Family travel", text: "Comfortable vehicles for families with luggage." }, { to: "/faq", title: "Frequently asked questions", text: "Vehicles, airport pickup, quotes and more." }]} /></Sec>
    <Faq items={a.faqs} />
    <Cta ctx={a.h1} title="Book your car in advance" text="Send your dates, flight and plan. We reply with a quote, never a fake instant price." />
  </>);
}


// ------------------------------------------------------------------ legal pages (privacy, terms, disclaimer, cancellation): premium black-and-white reading layout
export function LegalPage({ slug }) {
  const a = legalPage(slug); const p = pageByPath(a.path);
  const others = LEGAL.filter((x) => x.slug !== slug).map((x) => ({ to: x.path, title: x.short, text: x.description.split(". ")[0].replace(/\.$/, "") + "." }));
  return (<>
    <Hero eyebrow={a.eyebrow} h1={a.h1} lead={a.lead} crumbs={p.breadcrumbs} />
    <div className="lg"><div className="lg__in">
      <p className="lg__date">Last updated: {LEGAL_UPDATED}</p>
      <aside className="lg__sum" aria-label="Summary"><h2>In short</h2><ul>{a.summary.map((x) => <li key={x}>{x}</li>)}</ul></aside>
      <div className="lg__grid">
        <nav className="lg__toc" aria-label="On this page"><p>On this page</p><ol>{a.sections.map((s, i) => <li key={s.h}><a href={`#s${i + 1}`}>{s.h}</a></li>)}</ol></nav>
        <article className="lg__body">{a.sections.map((s, i) => (<section key={s.h} id={`s${i + 1}`}><h2><span>{String(i + 1).padStart(2, "0")}</span>{s.h}</h2>{s.p.map((t) => <p key={t}>{t}</p>)}{s.list && <ul>{s.list.map((t) => <li key={t}>{t}</li>)}</ul>}{s.stages && <ol className="lg__stages">{REFUND_STAGES.map((x) => <li key={x.when}><b>{x.when}</b><span>{x.share}</span></li>)}</ol>}</section>))}</article>
      </div>
      <aside className="lg__contact" aria-label="Contact for this policy"><b>Questions about this page?</b>
        <span>{telHref && <a href={telHref}>Call {SITE.phone}</a>}{waHref() && <a href={waHref()} target="_blank" rel="noopener noreferrer">WhatsApp</a>}<Link to="/contact">Contact page</Link>{BUSINESS.email && <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>}</span></aside>
    </div></div>
    <Faq items={a.faqs} title="Quick answers" />
    <Sec id="policies" title="Our other policies" tone="grey"><LinkCards items={others} /><p><Link to="/contact">Contact us →</Link> · <Link to="/faq">FAQ →</Link> · <Link to="/services">Our services →</Link> · <Link to="/cars">Our fleet →</Link></p></Sec>
    <Cta ctx={a.h1} title="Questions? Talk to us" text="Call or WhatsApp our team. We reply with clear answers and a quote for your trip." />
  </>);
}

// ------------------------------------------------------------------ search guide: what people search for -> the right page (all text is visible to visitors)
export function GuidePage() {
  const p = pageByPath(GUIDE.path);
  const card = (c) => {
    if (c.to) return { to: c.to, title: c.title, text: c.text };
    if (c.place) { const x = place(c.place); if (!x || x.status !== "live") return null; return ["islamabad", "rawalpindi"].includes(x.slug) ? placeCard(x) : { to: tripPath(x), title: tripLabel(x), text: x.plan }; }
    if (c.service) { const s = SERVICE_PAGES.find((y) => y.slug === c.service); return s ? svcCard(s) : null; }
    if (c.vehicle) { const v = category(c.vehicle); return v ? { to: `/cars/${v.slug}`, title: `${v.title} with driver`, text: (v.description || "").split(". ")[0].replace(/\.$/, "") + "." } : null; }
    return null;
  };
  return (<>
    <Hero eyebrow={GUIDE.eyebrow} h1={GUIDE.h1} lead={GUIDE.lead} crumbs={p.breadcrumbs}><Updated /></Hero>
    <Sec id="answer" title="Quick answer"><Answer q="Can I hire a car with a professional driver in Pakistan?">Yes. SAAD CAR RENTAL SERVICES in Islamabad provides every vehicle with an experienced professional driver, for airport pickup, city travel, family and business trips, weddings, and journeys to other cities and the northern areas. Send your plan and we reply with a quote.</Answer></Sec>
    {GUIDE.groups.map((g, i) => (<Sec key={g.id} id={g.id} title={g.title} tone={i % 2 ? "grey" : undefined}><p>{g.intro}</p><LinkCards items={g.cards.map(card).filter(Boolean)} /></Sec>))}
    <Sec id="urdu" title="اردو میں خلاصہ: ڈرائیور کے ساتھ گاڑی کرائے پر" tone="grey"><div lang="ur" dir="rtl" className="sx-ur"><p>سعد کار رینٹل سروسز اسلام آباد کے جی-11 مرکز میں واقع ہے۔ ہماری ہر گاڑی تجربہ کار پیشہ ور ڈرائیور کے ساتھ دی جاتی ہے۔</p><p>ایئرپورٹ پک اینڈ ڈراپ، شہر کے اندر روزانہ سفر، شادی اور فیملی ٹرپ، یا مری، ناران، سوات، ہنزہ اور سکردو کے سفر کے لیے ہمیں کال یا واٹس ایپ کریں۔ اپنا پک اپ مقام، منزل، تاریخ اور مسافروں کی تعداد بتائیں، ہم سفر سے پہلے واضح قیمت بتا دیتے ہیں۔</p></div>
      <p lang="ur-Latn">Islamabad mein driver ke saath gaari kiraye par chahiye? Pickup, manzil, tareekh aur musafiron ki tadaad bhejein, hum safar se pehle quote bhej dete hain.</p></Sec>
    <Sec id="more" title="Explore more"><p><Link to="/guides">Rates, routes and booking guides →</Link> · <Link to="/car-rental-pakistan">Car rental across Pakistan →</Link> · <Link to="/northern-areas">Northern areas →</Link> · <Link to="/routes">Routes from Islamabad →</Link> · <Link to="/destinations">Destinations →</Link> · <Link to="/services">Services →</Link> · <Link to="/cars">Fleet →</Link> · <Link to="/faq">FAQ →</Link></p></Sec>
    <Faq items={GUIDE.faqs} title="Common questions" />
    <Cta ctx="Search guide" title="Tell us your plan, get a quote" text="Call, WhatsApp or send the booking form with your pickup, destination and dates." />
  </>);
}


// ------------------------------------------------------------------ LOCAL service: a place inside Islamabad (/islamabad/<slug>)
const firstSentence = (t) => t.split(". ")[0].replace(/\.$/, "") + ".";
const spotCard = (x) => ({ to: `/islamabad/${x.slug}`, title: x.name, text: firstSentence(x.intro) });
const carCards = (slugs) => slugs.map((sl) => category(sl)).filter(Boolean).map((v) => ({ to: `/cars/${v.slug}`, title: `${v.title} with driver`, text: (v.description || "").split(". ")[0].replace(/\.$/, "") + "." }));
export function SpotPage({ slug }) {
  const x = spot(slug); const p = pageByPath(`/islamabad/${slug}`); const g = LOCAL_GROUPS.find((y) => y.id === x.group);
  const rel = SPOTS.filter((y) => y.group === x.group && y.slug !== x.slug).slice(0, 4); const other = SPOTS.filter((y) => y.group !== x.group).slice(0, 4);
  return (<>
    <Hero eyebrow={`Local service · ${x.area}`} h1={`Local Car Rental With Driver for ${x.name}`} lead={x.intro} crumbs={p.breadcrumbs} />
    <Sec id="answer" title="Quick answer"><Answer q={`Can I hire a car with a driver to ${x.name}?`}>Yes. Choose the Local service when you book. SAAD CAR RENTAL SERVICES provides a car with an experienced professional driver inside Islamabad, with pickup from your home, office or hotel. The driver can wait or return at the time you agree, and we reply with a quote for your trip.</Answer></Sec>
    <Sec id="about" title={`About ${x.name}`}><p>{x.name} is in {x.area}. {g.title.split(",")[0]} are among the places our Local service customers ask for most.</p><Bullets items={x.highlights} /><Chips items={x.goodFor} /></Sec>
    <Sec id="good-to-know" title="Good to know before you go" tone="grey"><p>{x.tip}</p><p>The Local service is for travel inside Islamabad and is priced differently from an Out of Station trip. <Link to="/local-car-rental-islamabad">Read how the Local service works →</Link></p></Sec>
    <Sec id="how" title="How to book"><Steps items={BOOKING_STEPS} /></Sec>
    <Sec id="cars" title="Choose a car for this trip"><LinkCards items={carCards(["honda-civic", "toyota-grande", "prado", "land-cruiser-v8", "coaster"])} /></Sec>
    <Sec id="more" title={`More ${g.title.toLowerCase()}`} tone="grey"><LinkCards items={rel.map(spotCard)} /><p><Link to="/islamabad-places">All places in Islamabad →</Link> · <Link to="/out-of-station-car-rental">Out of Station trips →</Link> · <Link to="/airport-transfer/islamabad">Airport transfer →</Link></p></Sec>
    <Faq items={x.faqs} title={`Questions about ${x.name}`} />
    <Sec id="also" title="Other places in Islamabad"><LinkCards items={other.map(spotCard)} /></Sec>
    <Cta ctx={`Local service: ${x.name}`} from="" to={x.name} svc="local" title={`Book a local car to ${x.name}`} text="Tell us your pickup place, date and time. We confirm the vehicle and reply with a quote for your day." />
  </>);
}

// ------------------------------------------------------------------ pillar pages: Local service, Out of Station service, Islamabad places
export function PillarPage({ slug }) {
  const D = slug === "local" ? LOCAL_PILLAR : slug === "out" ? OUT_PILLAR : PLACES_HUB; const p = pageByPath(D.path);
  const placeCards = (ids) => ids.map((id) => place(id)).filter((x) => x && x.status === "live").map((x) => ({ to: tripPath(x), title: tripLabel(x), text: x.plan }));
  return (<>
    <Hero eyebrow={D.eyebrow} h1={D.h1} lead={D.lead} crumbs={p.breadcrumbs} />
    {D.answer && <Sec id="answer" title="Quick answer"><Answer q={D.answerQ}>{D.answer}</Answer></Sec>}
    {D.uses && <Sec id="uses" title={D.usesTitle} tone="grey"><Bullets items={D.uses} /></Sec>}
    {slug === "local" && LOCAL_GROUPS.map((g) => (<Sec key={g.id} id={g.id} title={g.title}><p>{g.intro}</p><LinkCards items={SPOTS.filter((y) => y.group === g.id).map(spotCard)} /></Sec>))}
    {slug === "out" && OUT_PILLAR.groups.map((g, i) => (<Sec key={g.id} id={g.id} title={g.title} tone={i % 2 ? "grey" : undefined}><p>{g.intro}</p><LinkCards items={placeCards(g.places)} /></Sec>))}
    {slug === "places" && (<>
      {LOCAL_GROUPS.map((g, i) => (<Sec key={g.id} id={g.id} title={g.title} tone={i % 2 ? "grey" : undefined}><p>{g.intro}</p><LinkCards items={SPOTS.filter((y) => y.group === g.id).map(spotCard)} /></Sec>))}
      <Sec id="areas" title="Pickup areas in Islamabad"><p>We pick up from every sector of Islamabad. Some of the areas our customers book from:</p><ul className="sx-list">{AREAS.map(([a, t]) => <li key={a}><b>{a}.</b> {t}</li>)}</ul></Sec>
    </>)}
    {slug === "local" && <WeddingTeaser title="Weddings and events inside Islamabad" tone="grey" text="Choose the Local service for wedding cars inside Islamabad and Rawalpindi: a decorated Land Cruiser V8, Prado, Honda Civic or Corolla with a professional driver, and a Coaster for mehndi and guests." />}
    {D.how && <Sec id="how" title={D.howTitle}><Steps items={D.how} /></Sec>}
    {D.vs && <Sec id="compare" title={D.vsTitle} tone="grey"><p>{D.vs}</p><p>{slug === "out" ? <Link to="/local-car-rental-islamabad">Local service in Islamabad →</Link> : <Link to="/out-of-station-car-rental">Out of Station trips →</Link>}{" · "}<Link to="/car-rental-guide">Search guide →</Link>{" · "}<Link to="/cars">Our fleet →</Link></p></Sec>}
    {slug === "out" && <Sec id="more" title="Explore more routes"><p><Link to="/routes">Routes from Islamabad →</Link> · <Link to="/destinations">Destinations →</Link> · <Link to="/northern-areas">Northern areas →</Link> · <Link to="/car-rental-pakistan">Across Pakistan →</Link> · <Link to="/airport-transfer/islamabad">Airport transfer →</Link></p></Sec>}
    {slug === "places" && <Sec id="more" title="Related" tone="grey"><p><Link to="/local-car-rental-islamabad">How the Local service works →</Link> · <Link to="/out-of-station-car-rental">Out of Station trips →</Link> · <Link to="/services/hotel-transfers">Hotel transfers →</Link> · <Link to="/airport-transfer/islamabad">Airport transfer →</Link></p></Sec>}
    <Faq items={D.faqs} title="Common questions" />
    <Cta ctx={D.h1} svc={slug === "out" ? "out" : "local"} title={slug === "out" ? "Plan your out of station trip" : "Book your local car with driver"} text="Choose your service on the booking form, tell us your plan and we reply with a quote." />
  </>);
}


// ------------------------------------------------------------------ WEDDING CAR BOOKING page (/wedding-car-booking-with-driver) + the teaser shown on other pages
const wedImgs = () => imagesOf(WEDDING.path);
const wedImg = (key) => wedImgs().find((i) => i.key === key);
function WedCar({ c }) {
  const cat = category(c.slug); if (!cat) return null; const ph = photoOf(cat); const wi = c.img && wedImg(c.img);
  return (<li><Link to={`/cars/${c.slug}`}>
    {wi ? <img src={wi.url} srcSet={wi.srcSet} sizes="(max-width: 700px) 90vw, 360px" alt={wi.alt} width={wi.w} height={wi.h} loading="lazy" decoding="async" className="wd-photo" />
      : ph ? <img src={ph.image} {...imgSet(ph.image, "(max-width: 700px) 90vw, 360px")} alt={`${ph.color} ${ph.name} ${ph.trim} wedding car with professional driver`.replace(/\s+/g, " ")} width="805" height="510" loading="lazy" decoding="async" /> : <span className="sx-veh__ph">Real photos on request<br />Ask us on WhatsApp</span>}
    <b>{c.name}</b><span>{c.text}</span><em>Wedding car with driver →</em></Link></li>);
}
// Small block with three wedding photos and a link: used on the home page, services page, vehicle pages and other pages that should send visitors to the wedding page.
export function WeddingTeaser({ title = "Wedding car booking with driver", tone, n = 3, text }) {
  const im = wedImgs().slice(0, n); const d = text || "Book a decorated Land Cruiser V8, Prado, Honda Civic or Toyota Corolla with a professional driver for your barat, nikah, mehndi and walima in Islamabad and Rawalpindi, plus a Coaster for family and guests.";
  return (<Sec id="wedding-cars" title={title} tone={tone}>
    <p>{d}</p>
    {im.length > 0 && <div className={`px-gal px-gal--${Math.min(im.length, 3)} wd-teaser`}>{im.map((x) => <Pic key={x.key} im={x} sizes="(max-width: 700px) 92vw, 380px" className="px-fig px-fig--gal" />)}</div>}
    <p className="wd-links"><Link className="sx-btn sx-btn--quote" to={WEDDING.path}>Wedding car booking with driver →</Link> <Link to="/cars/land-cruiser-v8">Land Cruiser V8 for weddings</Link> · <Link to="/cars/prado">Prado</Link> · <Link to="/cars/honda-civic">Honda Civic</Link> · <Link to="/cars/toyota-grande">Toyota Corolla</Link> · <Link to="/cars/coaster">Coaster for mehndi and parties</Link></p>
  </Sec>);
}
export function WeddingPage() {
  const W = WEDDING; const p = pageByPath(W.path); const imgs = wedImgs();
  const rel = [
    { to: "/services/wedding-event-transportation", title: "Wedding and event transportation", text: "The full service: couple, family and guest vehicles." },
    { to: "/guides/wedding-car-with-driver-guide", title: "Wedding car planning guide", text: "How to choose, when to book and what to tell us." },
    { to: "/cars/coaster", title: "Coaster for groups and parties", text: "Mehndi, barat guests and group events." },
    { to: "/local-car-rental-islamabad", title: "Local service in Islamabad", text: "Daily and event cars inside the city." },
    { to: "/out-of-station-car-rental", title: "Out of Station trips", text: "Barat and family travel to other cities." },
    { to: "/airport-transfer/islamabad", title: "Airport transfer", text: "Pickup for wedding guests from abroad." },
    { to: "/overseas-pakistanis", title: "Overseas Pakistanis", text: "Book cars for a family wedding before you land." },
    { to: "/guides/booking-terms-explained", title: "Booking terms explained", text: "What is included and what to ask." },
  ];
  return (<>
    <Hero eyebrow={W.eyebrow} h1={W.h1} lead={W.lead} crumbs={p.breadcrumbs}><Updated /><p className="wd-trust">{SITE.years} years in Islamabad · Rated {SITE.rating} on Google from {SITE.reviewCount} reviews</p></Hero>
    <Sec id="answer" title="Quick answer"><Answer q={W.answerQ}>{W.answer}</Answer></Sec>
    <Sec id="facts" title="Wedding car booking: key facts" tone="grey"><dl className="sx-facts">{W.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></Sec>
    <Sec id="cars" title={W.carsTitle}><p>{W.carsIntro}</p><ul className="sx-veh wd-cars">{W.cars.map((c) => <WedCar key={c.slug} c={c} />)}</ul></Sec>
    {imgs.length > 0 && <Sec id="photos" title={W.galleryTitle} tone="grey"><p>{W.galleryIntro}</p><div className="px-gal px-gal--3">{imgs.map((im) => <Pic key={im.key} im={im} sizes="(max-width: 700px) 92vw, 380px" className="px-fig px-fig--gal" />)}</div></Sec>}
    <Sec id="events" title={W.eventsTitle}><p>{W.eventsIntro}</p><ul className="wd-ev">{W.events.map(([t, x]) => <li key={t}><b>{t}</b><span>{x}</span></li>)}</ul></Sec>
    <Sec id="coaster" title={W.partiesTitle} tone="grey"><p>{W.partiesIntro}</p><Chips items={W.parties} /><p><Link to="/cars/coaster">Toyota Coaster with driver →</Link> · <Link to="/services/group-transportation">Group transportation →</Link> · <Link to="/services/corporate-transportation">Corporate events →</Link> · <Link to="/services/family-travel">Family travel →</Link></p></Sec>
    <Sec id="where" title={W.whereTitle}><p>{W.whereIntro}</p><ul className="sx-list">{W.areas.map(([a, t]) => <li key={a}><b>{a}.</b> {t}</li>)}</ul>
      <LinkCards items={[{ to: "/locations/islamabad", title: "Car rental in Islamabad", text: "Pickups across the city and sectors" }, { to: "/locations/rawalpindi", title: "Car rental in Rawalpindi", text: "Covered daily from our Islamabad base" }, { to: "/islamabad-places", title: "Islamabad places", text: "Hotels, markets and landmarks we cover" }, { to: "/routes/islamabad-to-lahore", title: "Islamabad to Lahore", text: "Barat and family travel by motorway" }]} /></Sec>
    <Sec id="how" title="How to book your wedding car" tone="grey"><Steps items={W.how} /></Sec>
    <Sec id="tell" title={W.tellTitle}><Bullets items={W.tell} /></Sec>
    <Sec id="tips" title={W.tipsTitle} tone="grey"><Bullets items={W.tips} /></Sec>
    <Sec id="trust" title="Why families book their wedding cars with us"><p>{SITE.name} has served Islamabad for {SITE.years} years and is rated {SITE.rating} on Google from {SITE.reviewCount} reviews. Every wedding car comes with an experienced professional driver, the same address and phone number appear on every page, and the quote is always sent before you travel. <a href={SITE.reviewsUrl} target="_blank" rel="noopener noreferrer">Read our Google reviews</a> · <Link to="/about">About us</Link> · <Link to="/refund-policy">Refund and cancellation policy</Link></p></Sec>
    <Sec id="urdu" title="اردو میں خلاصہ: شادی کے لیے گاڑی ڈرائیور کے ساتھ" tone="grey"><div lang="ur" dir="rtl" className="sx-ur">{W.ur.map((t) => <p key={t}>{t}</p>)}</div><p lang="ur-Latn">{W.roman}</p></Sec>
    <Faq items={p.faqs} title="Wedding car booking: questions and answers" />
    <Sec id="related" title="Related pages"><LinkCards items={rel} /><p><Link to="/cars">Our full fleet →</Link> · <Link to="/services">All services →</Link> · <Link to="/faq">FAQ →</Link> · <Link to="/contact">Contact →</Link></p></Sec>
    <Cta ctx="Wedding car booking" title="Book your wedding car with a driver" text="Send the date, the venue, the pickup time and the number of cars. We confirm the vehicles and reply with a quote before the wedding." />
  </>);
}


// ------------------------------------------------------------------ CORPORATE CONTRACT RENTAL: hub, category hubs and one page per organisation
const CoDisclaimer = ({ name }) => <p className="co-note"><strong>Independent company.</strong> {name ? `SAAD CAR RENTAL SERVICES is not part of, endorsed by, affiliated with or an approved vendor of ${name}. The name is used only to describe which teams this page is written for, and ${name} is not claimed as a client.` : CO_HUB.disclaimer} All names and trademarks belong to their owners.</p>;
function CoCar({ slug, reason }) {
  const cat = category(slug); if (!cat) return null; const ph = photoOf(cat);
  return (<li><Link to={`/cars/${slug}`}>
    {ph ? <img src={ph.image} {...imgSet(ph.image, "(max-width: 700px) 90vw, 360px")} alt={`${ph.color} ${ph.name} ${ph.trim} for corporate monthly rental with driver`.replace(/\s+/g, " ")} width="805" height="510" loading="lazy" decoding="async" /> : <span className="sx-veh__ph">Photos on request</span>}
    <b>{cat.title}</b><span>{reason}</span><em>Rent with driver →</em></Link></li>);
}
export function CompanyTeaser({ title = "Corporate car rental with driver: monthly contracts for companies, UN agencies and NGOs", tone, text }) {
  const d = text || "Companies, oil and gas teams, telecom and multinational offices, UN agencies and NGOs rent our cars with professional drivers on monthly, long-term and daily contracts in Islamabad and across Pakistan. Choose your organisation below.";
  return (<Sec id="corporate-contracts" title={title} tone={tone}><p>{d}</p>
    <ul className="sx-chips co-chips">{COMPANIES.map((c) => <li key={c.slug}><Link to={coPath(c)}>{c.short}</Link></li>)}</ul>
    <p className="wd-links"><Link className="sx-btn sx-btn--quote" to={CO_HUB.path}>Corporate car rental with driver →</Link> <Link to="/corporate-car-rental/oil-and-gas-companies">Oil and gas companies</Link> · <Link to="/corporate-car-rental/ngos-and-un-agencies">NGOs and UN agencies</Link> · <Link to="/corporate-car-rental/telecom-and-multinational-companies">Telecom and multinationals</Link></p></Sec>);
}
export function CompanyPage({ slug }) {
  const c = coFor(slug); const g = groupOf(c); const p = pageByPath(coPath(c)); const sibs = coInGroup(c.group).filter((x) => x.slug !== c.slug);
  return (<>
    <Hero eyebrow={c.segment} h1={p.h1} lead={`Monthly, long-term and daily car rental with a professional driver for ${c.name} teams, staff, consultants and contractors in Islamabad and across Pakistan. The full fleet, one written quote, and a driver who arrives on time.`} crumbs={p.breadcrumbs}><Updated /></Hero>
    <Sec id="answer" title="Quick answer"><Answer q={`Can ${c.short} teams rent cars with drivers on a monthly contract?`}>{`Yes. SAAD CAR RENTAL SERVICES, based in G-11 Markaz, Islamabad, provides cars with professional drivers on monthly, long-term and daily contracts for teams, consultants and contractors working with ${c.name}. Choose the vehicles, tell us the duration, the working hours and the routes, and we send a written quote that states what is included. We are an independent company and not an approved vendor of ${c.name}.`}</Answer></Sec>
    <Sec id="about" title={`${c.short}: who this page is for`} tone="grey"><p>{c.about}</p><p>This page is for staff, consultants, contractors, auditors and visiting teams who work with {c.name} and need a car with a driver in Islamabad, Rawalpindi or across Pakistan.</p><CoDisclaimer name={c.name} /></Sec>
    <Sec id="needs" title={`What ${c.short} teams usually need`}><ul className="wd-ev">{c.needs.map(([t, x]) => <li key={t}><b>{t}</b><span>{x}</span></li>)}</ul></Sec>
    <Sec id="cars" title={`Vehicles suggested for ${c.short} teams`} tone="grey"><p>Every vehicle comes with an experienced professional driver. These are the vehicles teams in this sector usually ask for, and you can mix them on one contract.</p><ul className="sx-veh">{c.cars.map(([s, r]) => <CoCar key={s} slug={s} reason={r} />)}</ul></Sec>
    <Sec id="fleet" title="Our full fleet for corporate contracts"><p>All vehicles are available with a driver, depending on availability for your dates. Tap any vehicle for details and photos.</p><VehicleStrip cats={categories()} /></Sec>
    <Sec id="types" title="Contract types we quote" tone="grey"><ul className="wd-ev">{CO_HUB.types.map(([t, x]) => <li key={t}><b>{t}</b><span>{x}</span></li>)}</ul></Sec>
    <Sec id="how" title="How a contract works"><Steps items={CO_HUB.how} /></Sec>
    <Sec id="send" title={`What to send for a ${c.short} contract quote`} tone="grey"><Bullets items={CO_HUB.what} /></Sec>
    <Sec id="trust" title="What procurement and admin teams look for"><Bullets items={CO_HUB.trust} /><p>Read what customers say in our <a href={SITE.reviewsUrl} target="_blank" rel="noopener noreferrer">Google reviews</a> · <Link to="/about">About us</Link> · <Link to="/guides/booking-terms-explained">Booking terms explained</Link> · <Link to="/refund-policy">Refund and cancellation policy</Link></p></Sec>
    <Faq items={p.faqs} title={`${c.short}: questions and answers`} />
    <Sec id="related" title="Related pages" tone="grey"><LinkCards items={[...sibs.slice(0, 5).map((x) => ({ to: coPath(x), title: `Car rental for ${x.short}`, text: x.segment })), { to: g.path, title: g.name, text: "All organisations in this group" }, { to: CO_HUB.path, title: "Corporate car rental with driver", text: "Monthly contracts for every organisation" }, { to: "/services/corporate-transportation", title: "Corporate transportation", text: "The full corporate service" }, { to: "/services/business-travel", title: "Business travel", text: "Cars for meetings and visits" }, { to: "/airport-transfer/islamabad", title: "Airport transfer", text: "Pickup for visiting staff and delegations" }]} /><p><Link to="/cars">Our full fleet →</Link> · <Link to="/services">All services →</Link> · <Link to="/contact">Contact →</Link></p></Sec>
    <Cta ctx={`Corporate contract: ${c.name}`} title={`Get a contract quote for ${c.short} teams`} text="Send the vehicles, the start date, the duration, the working hours and the routes. We reply with a written quote that states what is included." />
  </>);
}
export function CoHubPage({ groupKey }) {
  const g = groupKey ? CO_GROUPS[groupKey] : null; const D = g || CO_HUB; const p = pageByPath(D.path);
  const sections = g ? [g] : Object.values(CO_GROUPS);
  return (<>
    <Hero eyebrow={D.eyebrow} h1={D.h1} lead={D.lead} crumbs={p.breadcrumbs}><Updated /></Hero>
    <Sec id="answer" title="Quick answer"><Answer q={D.answerQ}>{D.answer}</Answer></Sec>
    <Sec id="points" title={g ? g.pointsTitle : CO_HUB.typesTitle} tone="grey">{g ? <Bullets items={g.points} /> : <ul className="wd-ev">{CO_HUB.types.map(([t, x]) => <li key={t}><b>{t}</b><span>{x}</span></li>)}</ul>}</Sec>
    {sections.map((s) => <Sec key={s.key} id={`orgs-${s.key}`} title={g ? `${s.name}: choose your organisation` : s.name}><LinkCards items={coInGroup(s.key).map((x) => ({ to: coPath(x), title: `Car rental for ${x.short}`, text: x.segment }))} /></Sec>)}
    <Sec id="fleet" title="Fleet for corporate contracts" tone="grey"><p>Every vehicle comes with an experienced professional driver. Mix vehicles on one contract: for example two Fortuners for field teams, a Corolla for the manager and a Coaster for staff.</p><VehicleStrip cats={categories()} /></Sec>
    <Sec id="how" title={CO_HUB.howTitle}><Steps items={CO_HUB.how} /></Sec>
    <Sec id="send" title={CO_HUB.whatTitle} tone="grey"><Bullets items={CO_HUB.what} /></Sec>
    <Sec id="trust" title={CO_HUB.trustTitle}><Bullets items={CO_HUB.trust} /><CoDisclaimer /></Sec>
    <Faq items={p.faqs} title="Corporate car rental: questions and answers" />
    <Sec id="related" title="Related pages" tone="grey"><LinkCards items={[...(g ? [{ to: CO_HUB.path, title: "All corporate car rental pages", text: "Every organisation and group" }] : Object.values(CO_GROUPS).map((x) => ({ to: x.path, title: x.name, text: `${coInGroup(x.key).length} organisation pages` }))), { to: "/services/corporate-transportation", title: "Corporate transportation", text: "The full corporate service" }, { to: "/services/business-travel", title: "Business travel", text: "Cars for meetings and visits" }, { to: "/services/group-transportation", title: "Group transportation", text: "Coaster for staff and events" }, { to: "/out-of-station-car-rental", title: "Out of Station trips", text: "Travel between cities and provinces" }]} /></Sec>
    <Cta ctx={D.h1} title="Request a corporate contract quote" text="Send the organisation, the vehicles, the start date, the duration and the routes. We reply with a written quote." />
  </>);
}

// ------------------------------------------------------------------ /ai-info : plain facts for people and AI assistants
export function AiInfoPage() {
  const p = pageByPath(AI_INFO.path), site = BUSINESS.website;
  return (<>
    <Hero eyebrow={AI_INFO.eyebrow} h1={AI_INFO.h1} lead={AI_INFO.lead} crumbs={p.breadcrumbs} />
    <Sec id="answer" title="Quick answer"><Answer q={AI_INFO.answerQ}>{AI_INFO.answer}</Answer></Sec>
    <Sec id="facts" title="Key facts" tone="grey"><dl className="sx-facts">{AI_INFO.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></Sec>
    <Sec id="what" title={AI_INFO.whatTitle}><Bullets items={AI_INFO.what} /><p><Link to="/local-car-rental-islamabad">Local service →</Link> · <Link to="/out-of-station-car-rental">Out of Station trips →</Link> · <Link to="/airport-transfer/islamabad">Airport transfer →</Link> · <Link to="/cars">Our fleet →</Link> · <Link to="/services">Services →</Link></p></Sec>
    <Sec id="how" title={AI_INFO.howTitle} tone="grey"><Steps items={AI_INFO.how} /></Sec>
    <Sec id="files" title={AI_INFO.machineTitle}><ul className="sx-list">{AI_INFO.machine.map(([u, t]) => <li key={u}><a href={`${site}${u}`}>{`${site}${u}`}</a>: {t}</li>)}</ul></Sec>
    <Sec id="more" title="More about the business" tone="grey"><p><Link to="/about">About us →</Link> · <Link to="/faq">FAQ →</Link> · <Link to="/contact">Contact →</Link> · <Link to="/car-rental-guide">Search guide →</Link> · <Link to="/privacy-policy">Privacy policy →</Link> · <Link to="/terms-of-service">Terms of service →</Link></p></Sec>
    <Faq items={AI_INFO.faqs} title="Common questions" />
    <Cta ctx="AI info" title="Tell us your plan, get a quote" text="Call, WhatsApp or send the booking form with your pickup, destination and dates." />
  </>);
}


// ------------------------------------------------------------------ guides (/guides, /guides/<slug>)
export function GuidesHubPage() {
  const p = pageByPath(GUIDES_HUB.path);
  return (<>
    <Hero eyebrow="Guides" h1={GUIDES_HUB.h1} lead={GUIDES_HUB.lead} crumbs={p.breadcrumbs}><Updated /></Hero>
    <Sec id="all" title="All guides"><LinkCards items={GUIDES.map((g) => ({ to: `/guides/${g.slug}`, title: g.h1.split(":")[0], text: g.description }))} /></Sec>
    <Sec id="more" title="Plan your trip" tone="grey"><p><Link to="/cars">Our fleet →</Link> · <Link to="/routes">Routes →</Link> · <Link to="/northern-areas">Northern areas →</Link> · <Link to="/faq">FAQ →</Link> · <Link to="/contact">Contact →</Link></p></Sec>
    <Cta ctx="Guides" title="Tell us your plan, get a quote" text="Call, WhatsApp or send the booking form with your pickup, destination and dates." />
  </>);
}
export function ArticlePage({ slug }) {
  const a = guide(slug); const p = pageByPath(`/guides/${slug}`);
  const priced = baseFleet.flatMap((c) => c.vehicles.map((v) => [c.slug, v])).filter(([, v]) => v.price);
  const seen = new Set(); const listed = priced.filter(([, v]) => { const k = `${v.name}${v.trim}`; if (seen.has(k)) return false; seen.add(k); return true; });
  const rel = a.related.map((path) => pageByPath(path)).filter(Boolean).map((x) => ({ to: x.path, title: x.h1, text: (x.description || "").split(". ")[0] }));
  return (<>
    <Hero eyebrow="Guide" h1={a.h1} lead={a.lead} crumbs={p.breadcrumbs}><Updated date={a.updated} /></Hero>
    <Sec id="answer" title="The short answer"><Answer q={a.answerQ}>{a.answer}</Answer></Sec>
    {a.sections.map((sec, i) => (<Sec key={sec.id} id={sec.id} title={sec.title} tone={i % 2 === 0 ? "grey" : undefined}>
      {sec.p && sec.p.map((t, j) => <p key={j}>{t}</p>)}
      {sec.list && <Bullets items={sec.list} />}
      {sec.fleetTable && <DataTable head={["Vehicle", "Seats (typical)", "Best for", "Roads"]} rows={categories().map((c) => [c.title, (seatsOf(c) || "Confirmed when you book").replace(/^Up to /i, "Up to "), (VEHICLE_FIT[c.slug] || []).slice(0, 3).map((u) => USE[u]).join(", "), factRows(c).find((r) => r[0] === "Roads")[1].replace(/ \(best kept to paved roads\)/, "")])} />}
      {sec.rates && <>{listed.length > 0 ? <ul className="sx-list">{listed.map(([sl, v]) => <li key={v.id}><Link to={`/cars/${sl}`}>{`${v.name} ${v.trim}`.trim()}</Link>: <b>{rs(v.price)} per day (Local)</b> with a professional driver</li>)}</ul> : <p>Daily rents appear on a car page when they are listed.</p>}
        {(BUSINESS.pricing || {}).localFromPerDay && <p>Local service: from {rs(BUSINESS.pricing.localFromPerDay)} per day.{BUSINESS.pricing.outOfStationFromPerDay ? ` Out of Station: from ${rs(BUSINESS.pricing.outOfStationFromPerDay)} per day.` : ""}</p>}
        <p>Every other vehicle is quoted per trip, and the quote is always sent before you travel.</p></>}
      {sec.terms && <DataTable head={["Point", "How it is handled"]} rows={TERMS_ROWS} />}
      {sec.links && <p>{sec.links.map(([to, t], j) => <span key={to}>{j > 0 ? " · " : ""}<Link to={to}>{t} →</Link></span>)}</p>}
    </Sec>))}
    {a.vehicles && a.vehicles.length > 0 && <Sec id="cars" title={`Choose your car for ${a.bookTo} and book directly`}><p>Every car comes with a professional driver. Press Book to open the booking form with the car and the trip already filled in.</p><VehicleStrip cats={a.vehicles.map((v) => category(v)).filter(Boolean)} book={a.bookTo} /></Sec>}
    <Faq items={a.faqs} />
    <Sec id="related" title="Related pages" tone="grey"><LinkCards items={rel} /></Sec>
    <Cta ctx={a.h1} title="Tell us your plan, get a quote" text="Call, WhatsApp or send the booking form with your pickup, destination and dates." />
  </>);
}


// ------------------------------------------------------------------ offers and packages (/packages and the landing pages)
const landingCards = (list) => list.map((x) => ({ to: x.path, title: x.h1.replace(/ (With|in) .*$/i, ""), text: x.description.split(". ")[0].replace(/\.$/, "") + "." }));
export function PackagesPage() {
  const p = pageByPath(PACKAGES_HUB.path);
  return (<>
    <Hero eyebrow={PACKAGES_HUB.eyebrow} h1={PACKAGES_HUB.h1} lead={PACKAGES_HUB.lead} crumbs={p.breadcrumbs}><Updated /></Hero>
    <Sec id="offer" title="Current offer"><OfferBox /></Sec>
    {GROUPS.map(([g, label], gi) => (<Sec key={g} id={`pk-${g}`} title={label} tone={gi % 2 === 0 ? "grey" : undefined}>
      <div className="sx-pkg">{LANDINGS.filter((x) => x.grp === g).map((x) => (<article key={x.slug}><span className="sx-pkg__tag">{x.tag}</span><h3>{x.pkg}</h3><p>{x.description.split(". ")[0].replace(/\.$/, "")}.</p><Link to={x.path}>See this page →</Link></article>))}</div></Sec>))}
    <Sec id="cars" title="Offer on every vehicle"><p>The offer applies to the whole fleet. Open a car to see its details, colours and the reduced daily rent.</p><VehicleStrip cats={categories().filter((c) => c.vehicles.some((v) => !v.placeholder))} /></Sec>
    <Sec id="how" title="How the offer works" tone="grey"><Bullets items={[`${OFFER.line}, taken off the daily rent for Local and Out of Station bookings.`, "Where a car shows a listed rent, the old rent is crossed out and the new one is shown. Other vehicles are quoted per trip with the same reduction.", "Mention the offer on WhatsApp, by phone or in the booking form. Your written quote shows it.", "Every booking includes a professional driver. Fuel, tolls, driver stay and waiting time are agreed in the quote before you travel."]} /><p><Link to="/guides/booking-terms-explained">Booking terms explained →</Link> · <Link to="/guides/car-rental-with-driver-islamabad-rates">How pricing works →</Link></p></Sec>
    <Faq items={[{ q: "What is the current offer?", a: `${OFFER.line}. It applies to Local and Out of Station bookings with a professional driver${OFFER.endsText ? ` until ${OFFER.endsText}` : ""}.` }, { q: "Do I need a code?", a: "No code is needed. Mention the offer when you book and we confirm it in your written quote." }, { q: "Does the offer apply to every car?", a: "Yes. It applies to every vehicle in the fleet, including the Land Cruiser V8, Prado, Revo, Coaster and sedans." }, { q: "Can I combine the offer with a package?", a: "Yes. A package is a way of planning your trip, and the offer comes off the daily rent of the vehicle you choose." }]} />
    <Cta ctx="Offers and packages" title="Claim the offer and get a quote" text="Send your dates, pickup and destination. We reply with a written quote that shows the offer." />
  </>);
}
export function LandingPage({ slug }) {
  const a = landing(slug); const p = pageByPath(a.path);
  const cats = a.focus.map(category).filter(Boolean); const trips = (a.trips || []).map(place).filter((x) => x && x.status === "live");
  const rel = a.related.map((path) => pageByPath(path)).filter(Boolean).map((x) => ({ to: x.path, title: x.h1, text: (x.description || "").split(". ")[0].replace(/\.$/, "") + "." }));
  return (<>
    <Hero eyebrow={a.eyebrow} h1={a.h1} lead={a.lead} crumbs={p.breadcrumbs}><Updated /></Hero>
    {OFFER.on && !a.noOffer && <Sec id="offer" title="Your offer on this booking"><OfferBox cats={cats} /></Sec>}
    <Sec id="answer" title={a.answerQ}><Answer q="Short answer: yes.">{a.answer}</Answer></Sec>
    {a.sections.map((sec, i) => (<Sec key={sec.id} id={sec.id} title={sec.title} tone={i % 2 === 0 ? "grey" : undefined}>
      {sec.p && sec.p.map((t, j) => <p key={j}>{t}</p>)}
      {sec.list && <Bullets items={sec.list} />}
      {sec.links && <p>{sec.links.map(([to, t], j) => <span key={to}>{j > 0 ? " · " : ""}<Link to={to}>{t} →</Link></span>)}</p>}
    </Sec>))}
    <Sec id="vehicles" title="Vehicles for this booking" tone={a.sections.length % 2 === 0 ? "grey" : undefined}><p>Every vehicle comes with an experienced professional driver. Tell us your group size and luggage and we confirm the right one.</p><VehicleStrip cats={cats} /></Sec>
    {trips.length > 0 && <Sec id="trips" title="Places to plan"><LinkCards items={trips.map((x) => ({ to: tripPath(x), title: tripLabel(x), text: x.highlights[0] }))} /></Sec>}
    <Sec id="how" title="How booking works" tone="grey"><Steps items={BOOKING_STEPS} /></Sec>
    <Faq items={a.faqs} />
    <Sec id="related" title="Related pages" tone="grey"><LinkCards items={rel} /><p><Link to="/packages">All offers and packages →</Link></p></Sec>
    <Cta ctx={a.h1} car={a.focus[0]} title="Book with the special offer" text="Send your date, pickup and destination. We reply with a written quote that shows the offer." />
  </>);
}


// Home page: the special offer and the packages, right under the booking box.
export function HomeOffers() {
  if (!OFFER.on) return null;
  return (<section id="offers" className="sec" aria-labelledby="offers-h"><h2 id="offers-h" className="h2">Special offer and packages</h2>
    <p className="lead">{OFFER.line}{OFFER.endsText ? `, until ${OFFER.endsText}` : ""}. Choose a package for your trip, tell us the date and we send a written quote that shows the offer.</p>
    <div className="sx-pkg">{LANDINGS.filter((x) => x.featured).map((x) => (<article key={x.slug}><span className="sx-pkg__tag">{x.tag}</span><h3>{x.pkg}</h3><p>{x.description.split(". ")[0].replace(/\.$/, "")}.</p><Link to={x.path}>See this package →</Link></article>))}</div>
    <p><Link to="/packages">All offers and packages →</Link></p></section>);
}

// ------------------------------------------------------------------ router glue
function SeoBody({ page }) {
  const k = page.kind;
  if (k === "location") return <LocationPage slug={page.slug} />;
  if (k === "destination") return <DestinationPage slug={page.slug} />;
  if (k === "route") return <RoutePage slug={page.slug} />;
  if (k === "service") return <ServicePage slug={page.slug} />;
  if (k === "airport") return <AirportPage />;
  if (k === "province") return <ProvincePage slug={page.slug} />;
  if (k === "faq") return <FaqPage />;
  if (k === "hub") return <HubPage slug={page.slug} />;
  if (k === "audience") return <AudiencePage slug={page.slug} />;
  if (k === "landing") return page.slug === "packages" ? <PackagesPage /> : <LandingPage slug={page.slug} />;
  if (k === "legal") return <LegalPage slug={page.slug} />;
  if (k === "guide") return <GuidePage />;
  if (k === "info") return <AiInfoPage />;
  if (k === "spot") return <SpotPage slug={page.slug} />;
  if (k === "pillar") return <PillarPage slug={page.slug} />;
  if (k === "wedding") return <WeddingPage />;
  if (k === "company") return <CompanyPage slug={page.slug} />;
  if (k === "cohub") return <CoHubPage groupKey={page.slug === "index" ? null : page.slug} />;
  if (k === "tourspots") return <TourHubPage />;
  if (k === "tourspot") return <TourSpotPage slug={page.slug} />;
  if (k === "article") return page.slug === "index" ? <GuidesHubPage /> : <ArticlePage slug={page.slug} />;
  return null;
}
// Pages with long guide text are written in English. For visitors who chose another language we say so once, in their language
// (the booking, contact, fleet and navigation parts are translated everywhere). Search engines always get the plain English page.
export function SeoPage({ page }) {
  const { lang, t } = useI18n();
  return (<>{lang !== "en-US" && lang !== "en-GB" && <p className="i18n-note" lang={lang}>{t("The detailed guide text on this page is in English. Booking, contact and menus are in your language. Call or WhatsApp us and we will help you.")}</p>}<SeoBody page={page} /></>);
}
export const NotFoundPage = () => { const t = useT(); return (
  <div className="pad narrow nf"><p className="eyebrow">404</p><h1>{t("Page not found")}</h1>
    <p className="lead">{t("That page does not exist or has moved. Use the links below to find what you need, or call or WhatsApp us and we will help you directly.")}</p>
    <p className="row"><Link className="btn btn--dark" to="/">{t("Home")}</Link><Link className="btn" to="/cars">{t("Our fleet")}</Link><Link className="btn" to="/services">{t("Services")}</Link><Link className="btn" to="/contact">{t("Contact")}</Link></p>
    <h2>{t("Popular pages")}</h2>
    <ul className="sx-list nf__list">
      <li><Link to="/wedding-car-booking-with-driver">Wedding car booking with driver</Link></li>
      <li><Link to="/corporate-car-rental">Corporate car rental with driver (monthly contracts)</Link></li>
      <li><Link to="/airport-transfer/islamabad">Islamabad airport transfer</Link></li>
      <li><Link to="/local-car-rental-islamabad">Local car rental in Islamabad</Link></li>
      <li><Link to="/out-of-station-car-rental">Out of station car rental</Link></li>
      <li><Link to="/northern-areas">Northern areas trips</Link></li>
      <li><Link to="/routes">Routes from Islamabad</Link></li>
      <li><Link to="/faq">Frequently asked questions</Link></li>
      <li><Link to="/search">Search the website</Link></li>
    </ul>
    <p>{t("Need a car with a driver now?")} <a href={telHref}>{BUSINESS.phoneDisplay}</a> · <a href={waHref()} target="_blank" rel="noopener noreferrer">WhatsApp</a></p>
  </div>
); };
