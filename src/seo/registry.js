// ============================================================================
//  SEO REGISTRY: one record per public page. Title, description, canonical, robots, Open Graph image, breadcrumbs, schema,
//  sitemap membership and the quality gate all come from here, so the browser, the prerendered HTML and sitemap.xml always agree.
//
//  indexable = false  -> robots noindex,follow and NOT in sitemap.xml (any page can be switched off with this one flag).
//  Pages whose entity has status "draft" are not in this registry at all (no page, no link, no sitemap).
// ============================================================================
import { BUSINESS as B } from "../business.config";
import { PLACES, PROVINCES, placePath, place } from "./data/places";
import { ROUTES } from "./data/routes";
import { SERVICE_PAGES } from "./data/services";
import { FAQS } from "./data/faq";
import { VEHICLE_FIT, USE, TERRAIN } from "./data/vehicles";
import { categories, category, photoOf, vehiclesForPlace, northernPlaces, placesIn, livePlacesList } from "./links";
import { graphFor, abs } from "./schema";

const BRAND = B.shortName;
// Keep text inside search-result limits: join sentences until the limit is reached.
const fit = (parts, max = 158) => { let out = ""; for (const p of parts.filter(Boolean)) { const next = out ? `${out} ${p}` : p; if (next.length > max) break; out = next; } return out || parts[0].slice(0, max); };
const keyOf = (path) => (path === "/" ? "saad-car-rental-og" : path.replace(/^\//, "").replace(/\//g, "-"));
const lc = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const CTA = "Call or WhatsApp for today's quote.";

const pages = [];
function add(p) {
  const path = p.path;
  const rec = { indexable: true, changefreq: "monthly", priority: 0.6, links: [], faqs: [], ...p };
  rec.fullTitle = path === "/" ? p.title : `${p.title} | ${BRAND}`;
  rec.ogKey = keyOf(path);
  rec.ogImage = `/images/og/${rec.ogKey}.jpg`;
  rec.ogAlt = `${p.h1} - ${B.businessName}`;
  rec.canonical = abs(path);
  rec.robots = rec.indexable ? "index, follow, max-image-preview:large" : "noindex, follow";
  rec.breadcrumbs = p.breadcrumbs || [{ name: "Home", path: "/" }];
  pages.push(rec);
  return rec;
}
const home = { name: "Home", path: "/" };

// ---------------------------------------------------------------- core pages (rendered by the existing app pages)
add({ path: "/", kind: "app", title: `Car Rental in Islamabad With Driver | ${BRAND}`, h1: "Car Rental in Islamabad With Professional Driver", priority: 1, changefreq: "weekly",
  description: fit(["Premium car rental with professional driver in Islamabad: airport transfers, family and business travel, weddings and trips to Murree, Hunza and Skardu.", CTA]),
  og: { a: "CAR RENTAL WITH DRIVER", b: "Islamabad, Pakistan", vehicle: "land-cruiser-v8" }, faqs: FAQS.slice(0, 8), breadcrumbs: [home],
  service: { type: "Car rental with driver", areas: ["Islamabad", "Rawalpindi", "Pakistan"] }, areaServed: PLACES.filter((p) => p.status === "live" && p.type === "location").map((p) => ({ "@type": "City", name: p.name })).slice(0, 20) });
add({ path: "/cars", kind: "app", title: "Our Fleet: Cars With Professional Driver", h1: "Our Fleet: Cars With Professional Driver", priority: 0.9, breadcrumbs: [home, { name: "Fleet", path: "/cars" }],
  description: fit(["Land Cruiser V8 and TZ, Prado, Hilux Revo, Honda Civic, Toyota Grande, Range Rover and Coaster, every vehicle with a professional driver in Islamabad.", CTA]),
  og: { a: "OUR FLEET", b: "Every car with a professional driver", vehicle: "prado" } });
add({ path: "/services", kind: "app", title: "Chauffeur & Car Rental Services Islamabad", h1: "Our Chauffeur and Car Rental Services", priority: 0.9, breadcrumbs: [home, { name: "Services", path: "/services" }],
  description: fit(["Airport transfers, chauffeur service, business and family travel, weddings, tours and long-distance trips, all with a professional driver in Islamabad.", CTA]),
  og: { a: "OUR SERVICES", b: "Airport · Business · Family · Weddings · Tours", vehicle: "land-cruiser-tz" } });
add({ path: "/about", kind: "about", title: "About Us: Chauffeur Car Rental in Islamabad", h1: "About SAAD CAR RENTAL SERVICES", priority: 0.6, breadcrumbs: [home, { name: "About", path: "/about" }],
  description: fit([`${B.businessName} has provided premium car rental with professional drivers in Islamabad for ${B.years} years. Rated ${B.rating} on Google from ${B.reviewCount} reviews.`]),
  og: { a: "ABOUT US", b: `${B.years} years in Islamabad`, vehicle: "land-cruiser-v8" } });
add({ path: "/contact", kind: "contact", title: "Contact Us: Car Rental With Driver in Islamabad", h1: "Contact SAAD CAR RENTAL SERVICES", priority: 0.8, breadcrumbs: [home, { name: "Contact", path: "/contact" }],
  description: fit([`Contact ${B.businessName} at G-11 Markaz, Islamabad. Call ${B.phoneDisplay}, WhatsApp or send an enquiry and our team will reply quickly.`]),
  og: { a: "CONTACT US", b: `Call / WhatsApp ${B.phoneDisplay}`, vehicle: "prado" } });
add({ path: "/book", kind: "app", title: "Book a Car With Driver", h1: "Book Now", indexable: false, priority: 0.3, breadcrumbs: [home, { name: "Book Now", path: "/book" }],
  description: "Book a premium car with professional driver in Islamabad. No account needed.", og: { a: "BOOK NOW", b: "Car with professional driver", vehicle: "prado" } });

// ---------------------------------------------------------------- vehicles (/cars/<slug>: URLs unchanged, SEO value kept)
const VEH_SEO = { "land-cruiser-v8": "Land Cruiser V8", "land-cruiser-tz": "Land Cruiser TZ", prado: "Prado", revo: "Hilux Revo", "honda-civic": "Honda Civic", "toyota-grande": "Toyota Corolla Grande", "range-rover": "Range Rover", coaster: "Toyota Coaster" };
categories().forEach((c) => {
  const nm = VEH_SEO[c.slug] || c.title;
  const uses = (VEHICLE_FIT[c.slug] || []).slice(0, 3).map((u) => USE[u].toLowerCase());
  const faqs = [
    { q: `Can I hire a ${nm} with a driver in Islamabad?`, a: `Yes. The ${nm} is provided with an experienced professional driver. ${photoOf(c) ? "" : "Photos are coming soon and it is available on request, so please contact us to confirm your date. "}Call or WhatsApp us with your date, pickup and destination for a quote.` },
    { q: `What is the ${nm} best suited for?`, a: `It is well suited to ${uses.join(", ")} and similar trips. See the routes and services listed on this page, or tell us your plan and we will confirm that it is the right vehicle.` },
    { q: `How do I book the ${nm}?`, a: `Use the Book Now form, call ${B.phoneDisplay} or message us on WhatsApp with your pickup, destination, date and number of passengers. Our team confirms availability and your quote.` },
  ];
  add({ path: `/cars/${c.slug}`, kind: "vehicle", slug: c.slug, title: `${nm} Rental in Islamabad With Driver`, h1: `${c.title} – With Professional Driver`, priority: 0.8, faqs,
    breadcrumbs: [home, { name: "Fleet", path: "/cars" }, { name: c.title, path: `/cars/${c.slug}` }],
    description: fit([`${nm} with professional driver in Islamabad: ${uses.join(", ")}.`, `Photos, routes and booking.`, CTA]),
    og: { a: c.title.toUpperCase(), b: "With professional driver · Islamabad", vehicle: c.slug },
    service: { type: "Car rental with driver", areas: ["Islamabad", "Rawalpindi", "Pakistan"] } });
});

// ---------------------------------------------------------------- services
add({ path: "/airport-transfer/islamabad", kind: "airport", title: "Islamabad Airport Car With Driver (Pickup & Drop)", h1: "Islamabad Airport Transfer With Professional Driver", priority: 0.9,
  breadcrumbs: [home, { name: "Services", path: "/services" }, { name: "Airport Transfers", path: "/services/airport-transfers" }, { name: "Islamabad Airport", path: "/airport-transfer/islamabad" }],
  description: fit(["Islamabad International Airport pickup and drop with a professional driver for individuals, families, business guests and groups.", CTA]),
  og: { a: "ISLAMABAD AIRPORT", b: "Pickup & drop with professional driver", vehicle: "toyota-grande" },
  faqs: [
    { q: "Do you provide airport pickup in Islamabad?", a: "Yes. Share your flight details, number of passengers and luggage, and we confirm the vehicle, driver and pickup arrangements with you." },
    { q: "Can you pick up my family from the airport?", a: "Yes. Tell us how many people are travelling and how much luggage you have so we can suggest a sedan, an SUV or a Coaster." },
    { q: "Do you offer airport drops as well?", a: "Yes. Tell us your flight time and pickup address and we plan the departure so you reach the terminal comfortably." },
    { q: "How do I get a quote for an airport transfer?", a: `Call ${B.phoneDisplay} or send us a WhatsApp message with your pickup or drop address, date and time. We reply with a quote.` },
  ],
  service: { type: "Airport transfer with driver", areas: ["Islamabad International Airport", "Islamabad", "Rawalpindi"] } });
SERVICE_PAGES.forEach((s) => {
  const lead = categories().find((c) => c.slug === s.vehicles[0]);
  add({ path: `/services/${s.slug}`, kind: "service", slug: s.slug, title: s.h1.replace(/ in Islamabad$/, " in Islamabad"), h1: s.h1, priority: 0.7, faqs: s.faqs,
    breadcrumbs: [home, { name: "Services", path: "/services" }, { name: s.name, path: `/services/${s.slug}` }],
    description: fit([s.intro.split(". ")[0] + ".", CTA, "Professional driver included."]),
    og: { a: s.name.toUpperCase(), b: "With professional driver", vehicle: lead ? lead.slug : "prado" }, service: { type: s.name, areas: ["Islamabad", "Rawalpindi", "Pakistan"] } });
});

// ---------------------------------------------------------------- places
const nm = (p) => p.short || p.name;
PLACES.filter((p) => p.status === "live").forEach((p) => {
  const v = vehiclesForPlace(p).filter((c) => photoOf(c));
  const names = v.slice(0, 3).map((c) => VEH_SEO[c.slug] || c.title).join(", ");
  const path = placePath(p);
  const lead = (vehiclesForPlace(p).find((c) => photoOf(c)) || { slug: "prado" }).slug;
  const prov = PROVINCES[p.province] ? PROVINCES[p.province].name : "";
  if (p.type === "destination") {
    add({ path, kind: "destination", slug: p.slug, title: `Islamabad to ${nm(p)} Car With Driver`, h1: `Islamabad to ${p.name} Car With Driver`, priority: 0.7, faqs: p.faqs,
      breadcrumbs: [home, { name: "Destinations", path: "/destinations" }, { name: p.name, path }],
      description: fit([`Car with professional driver from Islamabad to ${p.name}${p.area ? ` (${p.area})` : ""}: ${lc(p.highlights[0])}.`, `${names} available.`, CTA]),
      og: { a: `ISLAMABAD → ${nm(p).toUpperCase()}`, b: "Car with professional driver", vehicle: lead }, service: { type: "Chauffeur-driven trip", areas: ["Islamabad", p.name] } });
  } else {
    const title = p.slug === "islamabad" ? "Islamabad Car Rental: City, Airport & Sector Pickups" : `${nm(p)} Car Rental With Driver`;
    add({ path, kind: "location", slug: p.slug, title, h1: p.slug === "islamabad" ? "Car Rental in Islamabad: Pickups Across the City" : `Car Rental in ${p.name} With Driver`, priority: p.slug === "islamabad" ? 0.9 : 0.7, faqs: p.faqs,
      breadcrumbs: [home, { name: "Locations", path: "/locations" }, ...(PROVINCES[p.province]?.own && PROVINCES[p.province].status === "live" ? [{ name: prov, path: `/locations/${PROVINCES[p.province].slug}` }] : []), { name: p.name, path }],
      description: fit([p.slug === "islamabad" ? "Car rental with professional driver in Islamabad: airport transfers, city trips, family, business and wedding travel." : `Car with professional driver for travel to and from ${p.name}, based in Islamabad: ${lc(p.highlights[0])}.`, names ? `${names} available.` : "", CTA]),
      og: { a: p.slug === "islamabad" ? "ISLAMABAD" : p.name.toUpperCase(), b: p.slug === "islamabad" ? "Car rental with professional driver" : "Car with driver · based in Islamabad", vehicle: lead }, service: { type: "Car rental with driver", areas: ["Islamabad", p.name] } });
  }
});
ROUTES.filter((r) => r.status === "live").forEach((r) => {
  const p = place(r.to); const path = `/routes/${r.slug}`;
  const v = vehiclesForPlace(p).filter((c) => photoOf(c)); const lead = (v[0] || { slug: "prado" }).slug;
  add({ path, kind: "route", slug: r.slug, title: `Islamabad to ${nm(p)} Car With Driver`, h1: `Islamabad to ${p.name} Car With Driver`, priority: 0.8,
    breadcrumbs: [home, { name: "Routes", path: "/routes" }, { name: `Islamabad to ${p.name}`, path }],
    description: fit([`Book a car with professional driver from Islamabad or Rawalpindi to ${p.name}. ${TERRAIN[p.terrain].label[0].toUpperCase()}${TERRAIN[p.terrain].label.slice(1)} route.`, `${v.slice(0, 3).map((c) => VEH_SEO[c.slug] || c.title).join(", ")} available.`, CTA]),
    og: { a: `ISLAMABAD → ${nm(p).toUpperCase()}`, b: "Car with professional driver", vehicle: lead }, service: { type: "Intercity car rental with driver", areas: ["Islamabad", p.name] } });
});

// ---------------------------------------------------------------- province / region hubs and national hubs
Object.entries(PROVINCES).filter(([, pv]) => pv.own && pv.status === "live").forEach(([key, pv]) => {
  const list = placesIn(key);
  add({ path: `/locations/${pv.slug}`, kind: "province", slug: key, title: `Car Rental With Driver in ${pv.name}`, h1: `Car Rental With Driver in ${pv.name}`, priority: 0.8,
    breadcrumbs: [home, { name: "Locations", path: "/locations" }, { name: pv.name, path: `/locations/${pv.slug}` }],
    description: fit([`Chauffeur-driven travel to and from ${pv.name}: ${list.slice(0, 4).map((p) => p.name).join(", ")} and more, from our Islamabad base.`, CTA]),
    og: { a: pv.name.toUpperCase(), b: "Car with driver · from Islamabad", vehicle: "prado" }, service: { type: "Car rental with driver", areas: [pv.name] } });
});
add({ path: "/car-rental-pakistan", kind: "hub", slug: "pakistan", title: "Car Rental With Driver in Pakistan", h1: "Car Rental With Driver Across Pakistan", priority: 0.9,
  breadcrumbs: [home, { name: "Pakistan", path: "/car-rental-pakistan" }],
  description: fit(["Islamabad-based chauffeur service providing cars with professional drivers for travel to and from Lahore, Peshawar, Murree, Hunza, Skardu and more.", CTA]),
  og: { a: "PAKISTAN-WIDE SERVICE", b: "Islamabad-based · Car with professional driver", vehicle: "land-cruiser-v8" }, faqs: FAQS.slice(5, 11),
  service: { type: "Car rental with driver", areas: ["Pakistan"] } });
add({ path: "/northern-areas", kind: "hub", slug: "northern", title: "Northern Areas Car Rental With Driver", h1: "Northern Areas of Pakistan: Car Rental With Driver", priority: 0.9,
  breadcrumbs: [home, { name: "Northern Areas", path: "/northern-areas" }],
  description: fit(["Car with professional driver from Islamabad to Murree, Naran, Swat, Hunza, Skardu, Fairy Meadows, Neelum Valley and more, in SUVs, 4x4s and Coasters.", CTA]),
  og: { a: "NORTHERN AREAS", b: "Murree · Naran · Hunza · Skardu · Swat", vehicle: "land-cruiser-v8" }, faqs: [FAQS[2], FAQS[1], ...(place("hunza").faqs.slice(0, 1))],
  service: { type: "Northern areas transport with driver", areas: ["Northern Pakistan"] } });
add({ path: "/locations", kind: "hub", slug: "locations", title: "Locations We Serve: Cities & Regions", h1: "Cities and Regions We Serve From Islamabad", priority: 0.7,
  breadcrumbs: [home, { name: "Locations", path: "/locations" }],
  description: fit(["Islamabad is our base. See the cities and regions where we provide chauffeur-driven travel, from Rawalpindi and Lahore to Hunza and Skardu.", CTA]),
  og: { a: "LOCATIONS WE SERVE", b: "Based in Islamabad", vehicle: "prado" } });
add({ path: "/destinations", kind: "hub", slug: "destinations", title: "Tourist Destinations by Car With Driver", h1: "Tourist Destinations: Car With Driver From Islamabad", priority: 0.7,
  breadcrumbs: [home, { name: "Destinations", path: "/destinations" }],
  description: fit(["Fairy Meadows, Attabad Lake, Kalam, Kumrat, Deosai, Neelum Valley and more: plan your trip with a professional driver from Islamabad.", CTA]),
  og: { a: "TOURIST DESTINATIONS", b: "By car with professional driver", vehicle: "revo" } });
add({ path: "/routes", kind: "hub", slug: "routes", title: "Intercity & Northern Routes With Driver", h1: "Routes From Islamabad With a Professional Driver", priority: 0.7,
  breadcrumbs: [home, { name: "Routes", path: "/routes" }],
  description: fit(["Islamabad to Lahore, Peshawar, Murree, Naran, Swat, Hunza, Skardu and more: one-way, round-trip and multi-day trips with a professional driver.", CTA]),
  og: { a: "ROUTES FROM ISLAMABAD", b: "One-way · Round trip · Multi-day", vehicle: "prado" } });
add({ path: "/faq", kind: "faq", slug: "faq", title: "FAQ: Car Rental With Driver in Islamabad", h1: "Frequently Asked Questions", priority: 0.6,
  breadcrumbs: [home, { name: "FAQ", path: "/faq" }],
  description: fit(["Answers about hiring a car with driver in Islamabad: vehicles, airport pickup, weddings, corporate travel, intercity trips and how to get a quote."]),
  og: { a: "FAQ", b: "Car rental with professional driver", vehicle: "prado" }, faqs: FAQS });

export const PAGES = pages;
export const pageByPath = (path) => { const p = path.length > 1 ? path.replace(/\/+$/, "") : path; return pages.find((x) => x.path === p); };
export const sitemapPages = () => pages.filter((p) => p.indexable);
export const headFor = (page) => ({
  title: page.fullTitle, description: page.description, robots: page.robots, canonical: page.canonical,
  og: { type: "website", url: page.canonical, title: page.fullTitle, description: page.description, image: abs(page.ogImage), imageType: "image/jpeg", imageWidth: 1200, imageHeight: 630, imageAlt: page.ogAlt, siteName: B.shortName, locale: "en_PK" },
  jsonLd: graphFor(page),
});
// Head for a path that is not in the registry (unknown URL): never indexable, never a duplicate of the home page.
export const notFoundHead = () => ({ title: `Page not found | ${BRAND}`, description: "This page does not exist. Browse our fleet or contact us.", robots: "noindex, follow", canonical: null, og: null, jsonLd: null });
