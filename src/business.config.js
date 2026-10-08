// ============================================================================
//  business.config.js  -  THE SINGLE SOURCE OF TRUTH for every business detail.
//  Header, footer, contact page, buttons, schema (Organization / LocalBusiness / WebSite), Open Graph,
//  sitemap, robots.txt and the WhatsApp / phone links all read from here. Change a value once, rebuild, done.
//
//  Anything we do not know yet is `null` and listed in `needsConfirmation` below
//  ( = [BUSINESS CONFIRMATION REQUIRED] ). Nothing here is invented: null fields are simply not shown anywhere.
// ============================================================================
const env = import.meta.env || {};

export const BUSINESS = {
  businessName: "SAAD CAR RENTAL SERVICES",          // display name used on the site and in the header/footer
  shortName: "Saad Car Rental",                        // used in page titles and as the WebSite name
  alternateNames: ["Saad Car Rental With Driver", "SAAD CAR RENTAL SERVICES"],
  legalBusinessName: null,                             // [BUSINESS CONFIRMATION REQUIRED]
  tagline: "Premium Car Rental With Professional Driver",
  businessDescription: "SAAD CAR RENTAL SERVICES is an Islamabad-based car rental with professional driver (chauffeur) service for airport transfers, business and family travel, weddings and intercity and northern-areas trips across Pakistan.",

  // ---- website (ONE canonical host; set VITE_SITE_URL to change it, never type the domain anywhere else) ----
  website: (env.VITE_SITE_URL || "https://www.saadcarremtal.com").replace(/\/+$/, ""),

  // ---- contact ----
  phone: env.VITE_PHONE_NUMBER || "+923339850599",
  phoneDisplay: "0333 9850599",
  whatsapp: String(env.VITE_WHATSAPP_NUMBER || "923339850599").replace(/\D/g, ""),
  email: null,                                         // [BUSINESS CONFIRMATION REQUIRED]
  contactUrl: "/contact",
  bookingUrl: "/book",

  // ---- location ----
  addressLines: ["Office No 12, 3rd Floor,", "Shah Nawaz Plaza,", "G-11 Markaz,", "Islamabad 44000,", "Pakistan"],
  streetAddress: "Office No 12, 3rd Floor, Shah Nawaz Plaza, G-11 Markaz",
  city: "Islamabad",
  region: "Islamabad Capital Territory",
  postalCode: "44000",
  country: "Pakistan",
  countryCode: "PK",
  geo: null,                                           // { latitude, longitude } [BUSINESS CONFIRMATION REQUIRED] (copy from Google Maps)
  googleBusinessProfile: "https://maps.app.goo.gl/MHzBvUAZeretA5Q86",
  reviewsUrl: "https://www.google.com/search?q=saad+car+rental+with+driver",
  businessHours: null,                                 // [BUSINESS CONFIRMATION REQUIRED] e.g. [{ days: ["Mo","Tu"], opens: "09:00", closes: "21:00" }]

  // ---- trust facts supplied by the owner (shown on the site; NOT used for AggregateRating schema on purpose) ----
  years: 22, rating: "5.0", reviewCount: 211,

  // ---- social profiles (add real URLs; they are automatically added to schema `sameAs` and the footer) ----
  socialProfiles: { facebook: null, instagram: null, tiktok: null, youtube: null },

  // ---- brand assets ----
  logo: "/assets/brand/saadcar-logo-dark.svg",
  logoPng: "/assets/brand/saadcar-logo-light-1200.png",
  favicon: "/favicon.ico",
  defaultOgImage: "/images/og/saad-car-rental-og.jpg",
  themeColor: "#16181b",

  // ---- analytics (public IDs only; leave empty to disable) ----
  analytics: { ga4: env.VITE_GA4_ID || "", cfBeacon: env.VITE_CF_BEACON || "" },
};

// What the owner still has to confirm. The build prints this list (npm run seo:audit) and /BUSINESS-INFO-REQUIRED.md repeats it.
export const needsConfirmation = [
  "Official e-mail address (shown in schema/contact once added)",
  "Legal business name",
  "Business hours (never guessed)",
  "Map coordinates (latitude / longitude from Google Maps)",
  "Social profile URLs: Facebook, Instagram, TikTok, YouTube",
  "Real photographs for Range Rover and Coaster (currently placeholders; no page claims a photo that does not exist)",
  "Seating / luggage / model-year for each vehicle (not stated anywhere until confirmed)",
  "Which intercity routes and pickup cities you truly serve (see src/seo/data/places.js: status live / draft)",
  "Whether you pick up in cities other than Islamabad / Rawalpindi (Lahore, Peshawar, Faisalabad, Multan ...)",
  "Airports where you really offer pickup / drop (only Islamabad is published)",
  "Pricing rules (no prices are shown; every page says 'call or WhatsApp for today's quote')",
];
