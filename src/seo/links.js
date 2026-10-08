// Internal-link relationships (the "entity graph"): business -> vehicles -> services -> locations -> routes -> destinations -> FAQ.
// Pure functions, used by the page components AND by the audit (link counts), so what is linked is always what is counted.
import { baseFleet } from "../data/fleet";
import { PLACES, place, placePath } from "./data/places";
import { ROUTES } from "./data/routes";
import { SERVICE_PAGES } from "./data/services";
import { TERRAIN, VEHICLE_FIT } from "./data/vehicles";

export const categories = () => baseFleet;
export const category = (slug) => baseFleet.find((c) => c.slug === slug);
export const hasPhoto = (c) => !!c && c.vehicles.some((v) => !v.placeholder);
export const photoOf = (c) => (c && c.vehicles.find((v) => !v.placeholder)) || null;
export const vehiclesForPlace = (p) => (p.vehicles || TERRAIN[p.terrain].vehicles).map(category).filter(Boolean);
export const livePlacesList = () => PLACES.filter((p) => p.status === "live");
export const routeFor = (slug) => ROUTES.find((r) => r.status === "live" && r.to === slug);
export const routePath = (r) => `/routes/${r.slug}`;
// The best page for "Islamabad to <place>": route page where one exists, otherwise the destination page itself.
export const tripPath = (p) => { const r = routeFor(p.slug); return r ? routePath(r) : placePath(p); };
export const tripLabel = (p) => `Islamabad to ${p.short || p.name}`;
export const nearby = (p) => (p.nearby || []).map(place).filter((x) => x && x.status === "live");
export const servicesForPlace = (p) => {
  const base = ["premium-car-rental", "family-travel", "private-tours"];
  const intercity = ["long-distance-travel", "customized-travel"];
  const city = ["airport-transfers", "business-travel", "chauffeur-service"];
  const ids = p.terrain === "city" ? city.concat(base) : p.terrain === "plains" ? intercity.concat(["business-travel", "family-travel"]) : base.concat(intercity);
  return [...new Set(ids)].map((s) => SERVICE_PAGES.find((x) => x.slug === s)).filter(Boolean).slice(0, 5);
};
export const servicesForVehicle = (slug) => SERVICE_PAGES.filter((s) => s.vehicles.includes(slug)).slice(0, 6);
export const placesForVehicle = (slug) => livePlacesList().filter((p) => (p.vehicles || TERRAIN[p.terrain].vehicles).includes(slug)).slice(0, 8);
export const fitFor = (slug) => VEHICLE_FIT[slug] || [];
export const northernPlaces = () => livePlacesList().filter((p) => p.terrain === "mountain" || p.terrain === "extreme" || ["murree", "abbottabad"].includes(p.slug));
export const placesIn = (provinceKey) => livePlacesList().filter((p) => p.province === provinceKey);
