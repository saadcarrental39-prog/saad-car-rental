// JSON-LD builders. Every business fact is read from business.config.js; nothing is hard-coded and nothing is invented.
// No AggregateRating / Review markup on purpose (self-served reviews are not eligible for rich results and must be real).
import { BUSINESS as B } from "../business.config";

export const abs = (p) => (/^https?:\/\//.test(p) ? p : `${B.website}${p === "/" ? "/" : p}`);
const ID = { site: `${B.website}/#website`, biz: `${B.website}/#business` };
const sameAs = () => [...new Set([...Object.values(B.socialProfiles), ...(B.profiles || [])].filter(Boolean).concat(B.googleBusinessProfile ? [B.googleBusinessProfile] : []))];   // social + off-site citation profiles (business.config.js) + Google Maps
const DAY = { Mo: "Monday", Tu: "Tuesday", We: "Wednesday", Th: "Thursday", Fr: "Friday", Sa: "Saturday", Su: "Sunday" };   // schema.org wants full day names
const clean = (o) => JSON.parse(JSON.stringify(o, (k, v) => (v === null || v === undefined || v === "" ? undefined : v)));

export const providerRef = () => ({ "@type": "AutoRental", "@id": ID.biz, name: B.businessName, url: abs("/") });

export const businessNode = (areas = []) => clean({
  "@type": "AutoRental", "@id": ID.biz, name: B.businessName, alternateName: B.alternateNames.filter((n) => n !== B.businessName),
  url: abs("/"), description: B.businessDescription, telephone: B.phone, email: B.email,
  image: abs(B.defaultOgImage), logo: { "@type": "ImageObject", url: abs("/icons/saad-512.png"), width: 512, height: 512 },
  address: { "@type": "PostalAddress", streetAddress: B.streetAddress, addressLocality: B.city, addressRegion: B.region, postalCode: B.postalCode, addressCountry: B.countryCode },
  geo: B.geo ? { "@type": "GeoCoordinates", latitude: B.geo.latitude, longitude: B.geo.longitude } : undefined,
  hasMap: B.googleBusinessProfile, sameAs: sameAs(),
  areaServed: [{ "@type": "City", name: B.city }, { "@type": "Country", name: B.country }, ...areas],
  openingHoursSpecification: B.businessHours ? B.businessHours.map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: h.days.map((d) => DAY[d] || d), opens: h.opens, closes: h.closes })) : undefined,
  contactPoint: [{ "@type": "ContactPoint", telephone: B.phone, contactType: "customer service", areaServed: B.countryCode }],
  knowsAbout: ["Car rental with driver", "Chauffeur service", "Airport transfers", "Intercity travel in Pakistan", "Northern areas of Pakistan"],
});

export const websiteNode = () => clean({ "@type": "WebSite", "@id": ID.site, url: abs("/"), name: B.shortName, alternateName: B.alternateNames, inLanguage: "en", publisher: { "@id": ID.biz } });

export const breadcrumbNode = (crumbs) => ({ "@type": "BreadcrumbList", itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(c.path) })) });

export const faqNode = (faqs) => ({ "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });

export const imageNode = (url, caption) => clean({ "@type": "ImageObject", url: abs(url), contentUrl: abs(url), width: 1200, height: 630, caption });

// Full @graph for one page record (see registry.js).
export function graphFor(page) {
  const url = abs(page.path);
  const webPageType = { about: "AboutPage", contact: "ContactPage", hub: "CollectionPage", province: "CollectionPage" }[page.kind] || "WebPage";
  const modified = page.updated || (["route", "destination", "guide", "article", "vehicle"].includes(page.kind) ? B.contentUpdated : undefined);
  const image = imageNode(page.ogImage, page.ogAlt);
  const g = [];
  if (page.path === "/" || page.kind === "about" || page.kind === "contact") g.push(businessNode(page.areaServed || []));
  if (page.path === "/") g.push(websiteNode());
  g.push(clean({ "@type": webPageType, "@id": `${url}#webpage`, url, name: page.fullTitle, description: page.description, inLanguage: "en", isPartOf: { "@id": ID.site }, about: { "@id": ID.biz }, dateModified: modified, primaryImageOfPage: image, image, breadcrumb: page.breadcrumbs.length > 1 ? { "@id": `${url}#breadcrumb` } : undefined }));
  if (page.breadcrumbs.length > 1) g.push({ ...breadcrumbNode(page.breadcrumbs), "@id": `${url}#breadcrumb` });
  if (page.service) g.push(clean({ "@type": "Service", "@id": `${url}#service`, name: page.h1, serviceType: page.service.type, description: page.description, url, provider: providerRef(), image: abs(page.ogImage), areaServed: page.service.areas.map((a) => ({ "@type": a.type || "Place", name: a })), availableChannel: { "@type": "ServiceChannel", serviceUrl: abs(B.bookingUrl), servicePhone: { "@type": "ContactPoint", telephone: B.phone } } }));
  if (page.product) { const P = page.product; g.push(clean({ "@type": "Product", "@id": `${url}#product`, name: `${P.name} with professional driver`, alternateName: P.alias, brand: { "@type": "Brand", name: P.brand }, model: P.model, color: P.colors && P.colors.length ? P.colors.join(", ") : undefined, category: "Chauffeur-driven car rental", description: page.description, image: P.images && P.images.length ? P.images.map(abs) : abs(page.ogImage), url,
    offers: { "@type": "Offer", url, businessFunction: "http://purl.org/goodrelations/v1#LeaseOut", seller: { "@id": ID.biz }, areaServed: "Islamabad, Rawalpindi and Pakistan" } })); }   // no price on purpose: every trip is quoted
  if (page.kind === "article" && page.slug !== "index") g.push(clean({ "@type": "Article", "@id": `${url}#article`, headline: page.h1, description: page.description, mainEntityOfPage: { "@id": `${url}#webpage` }, image: abs(page.ogImage), datePublished: page.updated, dateModified: page.updated, inLanguage: "en", author: { "@id": ID.biz }, publisher: { "@id": ID.biz } }));
  if (page.itemList && page.itemList.length) g.push(clean({ "@type": "ItemList", "@id": `${url}#fleet`, name: "SAAD CAR RENTAL fleet: cars with professional driver", numberOfItems: page.itemList.length, itemListElement: page.itemList.map((it, i) => ({ "@type": "ListItem", position: i + 1, url: abs(it.path), name: it.name, image: it.image ? abs(it.image) : undefined })) }));
  if (page.faqs && page.faqs.length) g.push({ ...faqNode(page.faqs), "@id": `${url}#faq` });
  return { "@context": "https://schema.org", "@graph": g };
}
