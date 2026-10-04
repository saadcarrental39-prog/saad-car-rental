const env = import.meta.env;
// Hidden owner/admin page. Not linked anywhere. If you change it, also change it in public/admin.webmanifest.
export const ADMIN_PATH = "/saad-owner-7k3x9";
export const SITE = {
  name: "SAAD CAR RENTAL SERVICES", tagline: "Premium Car Rental With Professional Driver",
  url: (env.VITE_SITE_URL || "https://YOUR_DOMAIN.com").replace(/\/$/, ""),
  whatsapp: (env.VITE_WHATSAPP_NUMBER || "923339850599").replace(/\D/g, ""),
  phone: env.VITE_PHONE_NUMBER || "+923339850599", phoneDisplay: "0333 9850599", years: 22, rating: "5.0", reviewCount: 211, reviewsUrl: "https://www.google.com/search?q=saad+car+rental+with+driver",
  address: ["Office No 12, 3rd Floor,", "Shah Nawaz Plaza,", "G-11 Markaz,", "Islamabad 44000,", "Pakistan"],
  maps: "https://maps.app.goo.gl/MHzBvUAZeretA5Q86",
};
export const telHref = SITE.phone ? `tel:${SITE.phone.replace(/[^\d+]/g, "")}` : "";
export const waHref = (text = "") => (SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}` : "");
