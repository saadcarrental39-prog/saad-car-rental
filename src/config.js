import { BUSINESS as B } from "./business.config";
// Backwards-compatible SITE object used all over the app. Everything is derived from business.config.js (single source of truth).
// Hidden owner/admin page. Not linked anywhere. If you change it, also change it in public/admin.webmanifest.
export const ADMIN_PATH = "/saad-owner-7k3x9";
export const SITE = {
  name: B.businessName, shortName: B.shortName, tagline: B.tagline, url: B.website,
  whatsapp: B.whatsapp, phone: B.phone, phoneDisplay: B.phoneDisplay, email: B.email,
  years: B.years, rating: B.rating, reviewCount: B.reviewCount, reviewsUrl: B.reviewsUrl,
  address: B.addressLines, maps: B.googleBusinessProfile, social: B.socialProfiles,
};
export const telHref = SITE.phone ? `tel:${SITE.phone.replace(/[^\d+]/g, "")}` : "";
export const waHref = (text = "") => (SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}` : "");
