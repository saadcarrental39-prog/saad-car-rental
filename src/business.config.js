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
  website: (/^https?:\/\/[^/]*\.pages\.dev/i.test(env.VITE_SITE_URL || "") ? "" : env.VITE_SITE_URL || "https://www.saadcarremtal.com").replace(/\/+$/, "") || "https://www.saadcarremtal.com",   // a preview address (xxx.pages.dev) is never used as the site address

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
  // A normal (long) Google Maps address. The old maps.app.goo.gl SHORT link was removed: scam checkers (ScamAdviser) flag "link-shortening technology".
  // BEST: open your business on Google Maps in a browser, copy the long address from the address bar (https://www.google.com/maps/place/...) and paste it here.
  googleBusinessProfile: "https://www.google.com/maps/search/?api=1&query=SAAD+CAR+RENTAL+SERVICES+Shah+Nawaz+Plaza+G-11+Markaz+Islamabad",
  reviewsUrl: "https://www.google.com/search?q=saad+car+rental+with+driver",
  businessHours: null,                                 // [BUSINESS CONFIRMATION REQUIRED] e.g. [{ days: ["Mo","Tu"], opens: "09:00", closes: "21:00" }]

  // ---- trust facts supplied by the owner (shown on the site; NOT used for AggregateRating schema on purpose) ----
  years: 22, rating: "5.0", reviewCount: 218,

  // ---- social profiles (add real URLs; they are automatically added to schema `sameAs` and the footer) ----
  socialProfiles: {
    facebook: "https://www.facebook.com/profile.php?id=61595505688733",
    instagram: "https://www.instagram.com/saadcarrental_/",
    x: "https://x.com/Saadcarrental",
    tiktok: "https://www.tiktok.com/@saad_carrental",
    pinterest: "https://www.pinterest.com/saadcarrental/",
    reddit: "https://www.reddit.com/user/saadcarrental/",
    threads: "https://www.threads.com/@saadcarrental_",
    youtube: "https://www.youtube.com/@SaadCarRental1",
    linkedin: null,
  },

  // ---- OFF-SITE PROFILES / CITATIONS (backlinks that point to this site) ----
  // Backlinks live on OTHER websites, so they cannot be "coded". What code CAN do is tell Google that those profiles are the same business:
  // every real URL you paste below goes into schema `sameAs` on the home / about / contact pages after the next build.
  // Paste ONLY profiles that really exist and show the same name, address and phone (see seo-backlinks/NAP-AND-BIO.txt). Empty = nothing is output.
  profiles: [
    // "https://www.bingplaces.com/...",
    // "https://www.yelp.com/biz/...",
    // "https://www.linkedin.com/company/...",
    // "https://www.foursquare.com/v/...",
    // "https://www.brownbook.net/business/...",
  ],

  // ---- freshness: the date shown as "Last updated" on guides, routes and destinations (change it when you review the content) ----
  contentUpdated: "2026-10-17",

  // ---- ABOUT page facts. Leave null / empty until you confirm them: a block appears on the About page ONLY when it has a value. ----
  about: {
    ownerName: null,        // e.g. "Saad Ahmed"  (owner or manager shown with a photo on the About page)
    ownerRole: null,        // e.g. "Owner and manager"
    ownerPhoto: null,       // e.g. "/assets/team/owner.webp" (put the file in public/assets/team/)
    ownerStory: null,       // 2-4 sentences: how the business started and why
    registration: null,     // e.g. "Registered with SECP / NTN 1234567-8" (only if you want it public)
    insurance: null,        // e.g. "Vehicles are insured"  (only if true)
    driverStandards: null,  // e.g. ["Valid licence checked", "Minimum 5 years driving experience"]  (array, only what is true)
    vehicleStandards: null, // e.g. ["Serviced regularly", "Cleaned before every trip"]  (array, only what is true)
    gallery: null,          // e.g. [{ src: "/assets/team/office.webp", alt: "Our office in G-11 Markaz" }]
    testimonials: null,     // e.g. [{ name: "Ali R.", date: "Sep 2026", trip: "Islamabad to Hunza", text: "..." }]  (real, with permission)
    clientTypes: ["Families and groups", "Business travellers and executives", "Companies and delegations", "Tourists and overseas Pakistanis", "Wedding and event parties"],
  },

  // ---- PRICE GUIDE. Numbers only (rupees per day / per trip). A line appears on car, service and guide pages ONLY when set. ----
  // The two daily rates already shown on the Land Cruiser cars (src/data/fleet.js) are used automatically.
  pricing: {
    localFromPerDay: null,        // e.g. 12000  (Local service inside Islamabad / Rawalpindi, with driver)
    outOfStationFromPerDay: null, // e.g. 18000  (Out of Station, per day)
    airportFrom: null,            // e.g. 5000   (airport pickup or drop)
    included: null,               // e.g. "Car, professional driver and fuel for the agreed route"
    notIncluded: null,            // e.g. "Tolls, parking, driver overnight stay and extra hours"
  },

  // ---- brand assets ----
  logo: "/assets/brand/saadcar-logo-dark.svg",
  logoPng: "/assets/brand/saadcar-logo-light-1200.png",
  favicon: "/favicon.ico",
  defaultOgImage: "/images/og/saad-car-rental-og.jpg",
  themeColor: "#16181b",

  // ---- analytics (public IDs only; leave empty to disable) ----
  analytics: { ga4: env.VITE_GA4_ID || "G-4X8SSHV3BG", cfBeacon: env.VITE_CF_BEACON || "", clarity: env.VITE_CLARITY_ID || "z0c8kv48pt" },
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
  "Price ranges and what is included (set `pricing` in this file: Local from / Out of Station from / airport from, included, not included)",
  "Owner or manager name, photo and story, driver and vehicle standards (set `about` in this file; blocks appear by themselves)",
  "Real customer testimonials with permission (`about.testimonials`)",
];
