// SEO page components. Every page is built from the data files in src/seo/data, so no page is hand-copied from another.
// They contain no browser-only code: the build renders them to plain HTML for crawlers (see scripts/prerender.mjs).
import { Link } from "react-router-dom";
import { SITE } from "../config";
import { pageByPath } from "./registry";
import { PLACES, PROVINCES, place, placePath, PUNJAB_DISTRICTS } from "./data/places";
import { ROUTES } from "./data/routes";
import { SERVICE_PAGES } from "./data/services";
import { FAQS } from "./data/faq";
import { audience } from "./data/audiences";
import { TERRAIN, VEHICLE_FIT, USE } from "./data/vehicles";
import { categories, category, vehiclesForPlace, servicesForPlace, servicesForVehicle, placesForVehicle, nearby, routeFor, routePath, tripPath, tripLabel, northernPlaces, placesIn, livePlacesList, photoOf } from "./links";
import { Hero, Cta, Answer, Sec, Faq, Chips, Bullets, LinkCards, VehicleStrip, Steps, BOOKING_STEPS } from "./blocks";

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
    <Hero eyebrow={p.area ? `${p.area} · ${PROVINCES[p.province].name}` : PROVINCES[p.province].name} h1={pageByPath(path).h1} lead={p.intro} crumbs={crumbsOf(path)} />
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
  const faqs = [
    { q: `Can I hire a car with driver from Islamabad to ${p.name}?`, a: `Yes. We provide a car with professional driver from Islamabad or Rawalpindi to ${p.name}, one-way, as a round trip or as part of a multi-day booking.` },
    { q: `How much does the Islamabad to ${p.name} trip cost?`, a: `The price depends on the vehicle, the number of days and your requirements, so we quote each trip. Call ${SITE.phoneDisplay} or WhatsApp us for today's quote.` },
    { q: `Can you pick me up from Rawalpindi for the ${p.name} trip?`, a: `Yes. Pickup is arranged from Islamabad or Rawalpindi. Tell us the address when you book.` },
    { q: `Can the driver wait for me in ${p.name}?`, a: `Yes. Tell us how long you need the driver in ${p.name} and we plan the booking around it.` },
    { q: `Which vehicle should I choose for ${p.name}?`, a: `${T.advice} Tell us your group size and luggage and we will confirm the best choice for your date.` },
  ];
  return (<>
    <Hero eyebrow={`Route · ${T.label.replace(/-/g, " ")}`} h1={pageByPath(path).h1} lead={`Islamabad to ${p.name} with a professional driver. ${p.plan}`} crumbs={crumbsOf(path)} />
    <Sec id="answer" title={`Islamabad to ${p.name}: the short answer`}><Answer q={`Do you provide a car with driver from Islamabad to ${p.name}?`}>{`Yes. SAAD CAR RENTAL SERVICES provides a car with professional driver from Islamabad or Rawalpindi to ${p.name}. Tell us your date, pickup address and passengers by WhatsApp or phone and we confirm the vehicle and quote.`}</Answer></Sec>
    <Sec id="journey" title="About the journey" tone="grey"><p>{r.note}</p><p>{p.road}</p><p>{p.season}</p></Sec>
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
    <Sec id="vehicles" title="Vehicles for this service"><VehicleStrip cats={veh} /></Sec>
    <Sec id="where" title="Where we provide it" tone="grey"><LinkCards items={s.places.map(place).filter(Boolean).map((p) => ({ to: p.basis === "base" || p.slug === "rawalpindi" ? placePath(p) : tripPath(p), title: p.name, text: p.highlights[0] }))} /></Sec>
    <Sec id="how" title="How to book"><Steps items={BOOKING_STEPS} /></Sec>
    <Faq items={s.faqs} />
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
    <Hero eyebrow="FAQ" h1={p.h1} lead="Straight answers about hiring a car with a professional driver from SAAD CAR RENTAL SERVICES. No prices are published because every trip is quoted individually." crumbs={p.breadcrumbs} />
    <Faq items={FAQS} title="Questions and answers" />
    <Sec id="more" title="Still have a question?" tone="grey"><LinkCards items={[{ to: "/contact", title: "Contact us" }, { to: "/services", title: "Our services" }, { to: "/routes", title: "Routes from Islamabad" }, { to: "/cars", title: "Our fleet" }]} /></Sec>
    <Cta ctx="General enquiry" />
  </>);
}

// ------------------------------------------------------------------ extra SEO content appended to the existing vehicle page
export function VehicleExtras({ slug }) {
  const c = category(slug); if (!c) return null; const path = `/cars/${slug}`; const pg = pageByPath(path);
  const fit = (VEHICLE_FIT[slug] || []).map((u) => USE[u]); const places = placesForVehicle(slug); const svc = servicesForVehicle(slug);
  return (<div className="sx-extra">
    <Sec id="best" title={`What the ${c.title} is best for`}><p>{VEHICLE_PITCH_SENTENCE(c)}</p><Chips items={fit} />{!photoOf(c) && <p className="sx-note">Photos coming soon. This vehicle is available on request, so please call or WhatsApp to confirm your date.</p>}</Sec>
    <Sec id="trips" title={`Popular trips in the ${c.title}`} tone="grey"><LinkCards items={places.map((p) => ({ to: tripPath(p), title: tripLabel(p), text: p.highlights[0] }))} /></Sec>
    <Sec id="svc" title="Related services"><LinkCards items={svc.map(svcCard)} /></Sec>
    <Faq items={pg.faqs} />
    <Cta ctx={c.title} car={(photoOf(c) || c.vehicles[0]).id} />
  </div>);
}
import { VEHICLE_PITCH } from "./data/vehicles";
const VEHICLE_PITCH_SENTENCE = (c) => `The ${c.title} is ${VEHICLE_PITCH[c.slug] || "available with a professional driver"}. Every vehicle comes with an experienced professional driver, and we are based in Islamabad (G-11 Markaz).`;

// ------------------------------------------------------------------ home page sections (below the existing fleet carousels)
export function HomeSeoSections() {
  const feat = ["murree", "naran", "hunza", "skardu", "lahore", "peshawar"].map(place);
  return (<div className="sx-home">
    <Sec id="intro" title="Car rental with a professional driver in Islamabad"><p className="sx-lead">{SITE.name} has served Islamabad for {SITE.years} years. Every car comes with an experienced professional driver for airport transfers, business and family travel, weddings, events and journeys to the northern areas of Pakistan. Call or WhatsApp us for today's availability and quote.</p></Sec>
    <Sec id="svc" title="Our services" tone="grey"><LinkCards items={SERVICE_PAGES.slice(0, 6).map(svcCard)} /><p><Link to="/services">All services →</Link></p></Sec>
    <Sec id="routes" title="Popular routes from Islamabad"><LinkCards items={feat.map((x) => ({ to: tripPath(x), title: tripLabel(x), text: x.plan }))} /><p><Link to="/routes">All routes →</Link> · <Link to="/northern-areas">Northern areas →</Link> · <Link to="/car-rental-pakistan">Across Pakistan →</Link></p></Sec>
    <Sec id="air" title="Airport transfers" tone="grey"><p>Arrive at Islamabad International Airport and find a professional driver ready. <Link to="/airport-transfer/islamabad">See how airport pickup works →</Link></p></Sec>
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
    <Sec id="also" title="You may also need" tone="grey"><LinkCards items={[other, { to: "/services/private-tours", title: "Private tours with a driver", text: "Plan multi-day trips with your own vehicle and driver." }, { to: "/services/family-travel", title: "Family travel", text: "Comfortable vehicles for families with luggage." }, { to: "/faq", title: "Frequently asked questions", text: "Vehicles, airport pickup, quotes and more." }]} /></Sec>
    <Faq items={a.faqs} />
    <Cta ctx={a.h1} title="Book your car in advance" text="Send your dates, flight and plan. We reply with a quote, never a fake instant price." />
  </>);
}

// ------------------------------------------------------------------ router glue
export function SeoPage({ page }) {
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
  return null;
}
export const NotFoundPage = () => (
  <div className="pad narrow"><h1>Page not found</h1><p className="lead">That page does not exist. Browse our fleet, services or routes, or contact us.</p>
    <p className="row"><Link className="btn btn--dark" to="/cars">Our fleet</Link><Link className="btn" to="/services">Services</Link><Link className="btn" to="/contact">Contact</Link></p></div>
);
