// EDIT HERE to add cars. Only put verified names/specs/images. Images: /public/assets/vehicles/<category>/<file>.webp
const PH = "/assets/placeholder-vehicle.svg";
const T = {
  white: { "--bg1": "#f4f4f2", "--bg2": "#fcfcfb", "--blob1": "#e9e9e6", "--blob2": "#d8d8d4", "--glow": "rgba(255,255,255,.9)", "--ink": "#16181b", "--sub": "#62666c", "--accent": "#3a3f46", "--glass": "rgba(255,255,255,.62)" },
  black: { "--bg1": "#0d0d10", "--bg2": "#1b1b20", "--blob1": "#33343b", "--blob2": "#17171b", "--glow": "rgba(190,196,210,.28)", "--ink": "#f3f1ec", "--sub": "#9b9ba6", "--accent": "#cfd3db", "--glass": "rgba(255,255,255,.09)" },
  grey: { "--bg1": "#dde1e6", "--bg2": "#eef0f3", "--blob1": "#bcc4cd", "--blob2": "#8e99a6", "--glow": "rgba(255,255,255,.85)", "--ink": "#14181d", "--sub": "#56606b", "--accent": "#55677a", "--glass": "rgba(255,255,255,.55)" },
  red: { "--bg1": "#f3e8e7", "--bg2": "#fbf5f4", "--blob1": "#e6c4c1", "--blob2": "#c4807b", "--glow": "rgba(255,255,255,.85)", "--ink": "#1c1213", "--sub": "#6a5757", "--accent": "#8f2d2d", "--glass": "rgba(255,255,255,.55)" },
  maroon: { "--bg1": "#efe4e2", "--bg2": "#faf4f3", "--blob1": "#d9b5b0", "--blob2": "#8a4a45", "--glow": "rgba(255,255,255,.85)", "--ink": "#1c1211", "--sub": "#6a5553", "--accent": "#6e2a2a", "--glass": "rgba(255,255,255,.55)" },
  plum: { "--bg1": "#efe6ec", "--bg2": "#f9f5f8", "--blob1": "#d9c2d3", "--blob2": "#9d6a93", "--glow": "rgba(255,255,255,.85)", "--ink": "#1a1018", "--sub": "#665462", "--accent": "#6b2d5c", "--glass": "rgba(255,255,255,.55)" },
  blue: { "--bg1": "#e6edf6", "--bg2": "#f5f8fc", "--blob1": "#bfd1ea", "--blob2": "#7b9fd0", "--glow": "rgba(255,255,255,.85)", "--ink": "#0f1722", "--sub": "#52606f", "--accent": "#1f4fa3", "--glass": "rgba(255,255,255,.55)" },
};
const B = [{ rotate: 0, radius: "42% 58% 55% 45% / 45% 40% 60% 55%" }, { rotate: 18, radius: "58% 42% 40% 60% / 55% 55% 45% 45%" }, { rotate: -14, radius: "50% 50% 38% 62% / 42% 58% 42% 58%" }];
const car = (category, id, o, i = 0) => ({ id, category, name: o.name, trim: o.trim || "", tag: o.tag || "", subtitle: o.subtitle || "With Professional Driver",
  color: o.color || "Colour on request", image: o.image || PH, placeholder: !o.image, description: o.description || "Available on request.",
  theme: T[o.theme || "white"], blob: B[i % 3], price: o.price || null, priceOut: o.priceOut || null });   // price = Local per day, priceOut = Out of Station per day (set from the admin app)

const cats = [
  { slug: "premium-luxury-land-cruiser", title: "Premium Luxury Land Cruiser", seo: "Premium Luxury Land Cruiser rental with driver in Islamabad", description: "Premium Luxury Land Cruiser (2025 model, black) with a professional driver for VIP, executive, wedding and long-distance travel from Islamabad.",
    models: [["land-cruiser-premium-black", { name: "Premium Luxury Land Cruiser", trim: "", tag: "LC", color: "Black", image: "/assets/vehicles/land-cruiser-premium-black.webp", theme: "black", subtitle: "2025 Model · Luxury SUV", price: 100000, description: "Our 2025 model Land Cruiser in black, made for VIP, executive and wedding arrivals." }]] },
  { slug: "land-cruiser-v8", title: "Land Cruiser V8 2018 Model", seo: "Land Cruiser V8 2018 model rental with driver in Islamabad", description: "Toyota Land Cruiser V8 2018 model in white and black with a professional driver for airport transfers, weddings, executive and long-distance travel.",
    models: [["land-cruiser-v8-2018-black", { name: "Land Cruiser V8", trim: "2018 Model", tag: "V8", color: "Black", image: "/assets/vehicles/land-cruiser-v8-2018-black.webp", theme: "black", subtitle: "2018 Model · Luxury SUV", price: 22000, description: "A glossy black 2018 Land Cruiser V8 for executives, weddings and long trips." }],
             ["land-cruiser-v8-2018-white", { name: "Land Cruiser V8", trim: "2018 Model", tag: "V8", color: "White", image: "/assets/vehicles/land-cruiser-v8-2018-white.webp", subtitle: "2018 Model · Luxury SUV", price: 22000, description: "A clean white 2018 Land Cruiser V8, comfortable for families, airports and long journeys." }]] },
  { slug: "lexus-lx-570", title: "Lexus LX 570", seo: "Lexus LX 570 rental with driver in Islamabad", description: "Lexus LX 570 with a professional driver for VIP, executive, wedding and long-distance travel from Islamabad.",
    models: [["lexus-lx570-black", { name: "Lexus", trim: "LX 570", tag: "LX", color: "Black", image: "/assets/vehicles/lexus-lx570-black.webp", theme: "black", subtitle: "Luxury SUV", description: "A dark, composed LX 570 for executives, delegations and formal arrivals." }],
             ["lexus-lx570-pearl", { name: "Lexus", trim: "LX 570", tag: "LX", color: "Cream White", image: "/assets/vehicles/lexus-lx570-pearl.webp", subtitle: "Luxury SUV", description: "A soft cream-white LX 570 that suits weddings, VIP guests and family occasions." }],
             ["lexus-lx570-white", { name: "Lexus", trim: "LX 570", tag: "LX", color: "Pearl White", image: "/assets/vehicles/lexus-lx570-white.webp", subtitle: "Luxury SUV", description: "A crisp Pearl White LX 570 with a bold front grille, made for statement arrivals." }]] },
  { slug: "prado", title: "Prado", seo: "Prado rental with driver in Islamabad", description: "Toyota Land Cruiser Prado with a professional driver for family, business and city-to-city travel.", models: [
      ["prado-black", { name: "Land Cruiser", trim: "Prado", tag: "PR", color: "Black", image: "/assets/vehicles/prado-black.webp", theme: "black", subtitle: "Premium SUV", description: "Comfortable and capable, ideal for family and city-to-city travel." }],
      ["prado-white", { name: "Land Cruiser", trim: "Prado", tag: "PR", color: "White", image: "/assets/vehicles/prado-white.webp", subtitle: "Premium SUV", description: "A spacious, refined ride for business and family journeys." }],
      ["prado-red", { name: "Land Cruiser", trim: "Prado", tag: "PR", color: "Red", image: "/assets/vehicles/prado-red.webp", theme: "red", subtitle: "Premium SUV", description: "Distinctive style with the comfort of a professional driver." }]] },
  { slug: "toyota-fortuner", title: "Toyota Fortuner", seo: "Toyota Fortuner rental with driver in Islamabad", description: "Toyota Fortuner with a professional driver for family trips, northern areas and long-distance travel from Islamabad.", models: [
      ["fortuner-black", { name: "Toyota Fortuner", tag: "FT", color: "Black", image: "/assets/vehicles/fortuner-black.webp", theme: "black", subtitle: "Family SUV", description: "A confident black Fortuner for families and groups heading out of the city." }],
      ["fortuner-white", { name: "Toyota Fortuner", tag: "FT", color: "Pearl White", image: "/assets/vehicles/fortuner-white.webp", subtitle: "Family SUV", description: "A bright white Fortuner, easy to spot at airports and comfortable on long drives." }],
      ["fortuner-maroon", { name: "Toyota Fortuner", tag: "FT", color: "Maroon", image: "/assets/vehicles/fortuner-maroon.webp", theme: "maroon", subtitle: "Family SUV", description: "A rich maroon Fortuner with a warm, distinctive look for family and tour travel." }]] },
  { slug: "revo", title: "Revo", seo: "Toyota Hilux Revo rental with driver in Islamabad", description: "Toyota Hilux Revo with a professional driver for road trips and rugged routes.", models: [
      ["revo-blue", { name: "Hilux", trim: "Revo", tag: "RV", color: "Blue", image: "/assets/vehicles/revo-blue.webp", theme: "blue", subtitle: "Double Cabin", description: "Strong and dependable for road trips and rugged routes." }],
      ["hilux-white", { name: "Hilux", tag: "HX", color: "White", image: "/assets/vehicles/hilux-white.webp", subtitle: "Double Cabin", description: "A practical workhorse for long distances and tough roads." }],
      ["revo-black", { name: "Hilux", trim: "Revo", tag: "RV", color: "Black", image: "/assets/vehicles/revo-black.webp", theme: "black", subtitle: "Extra Cabin", description: "Bold looks and reliable performance on any route." }]] },
  { slug: "honda-civic", title: "Honda Civic", seo: "Honda Civic rental with driver in Islamabad", description: "Honda Civic with a professional driver for comfortable city travel.", models: [
      ["civic-rs-red", { name: "Honda Civic", trim: "RS", tag: "RS", color: "Red", image: "/assets/vehicles/civic-rs-red.webp", theme: "red", subtitle: "Sport Sedan", description: "Sporty and refined, a stylish choice for city and business travel." }],
      ["civic-rs-black", { name: "Honda Civic", trim: "RS", tag: "RS", color: "Black", image: "/assets/vehicles/civic-rs-black.webp", theme: "black", subtitle: "Sport Sedan", description: "Sleek and composed for executive journeys with a professional driver." }],
      ["civic-silver", { name: "Honda Civic", tag: "CV", color: "Silver", image: "/assets/vehicles/civic-silver.webp", theme: "grey", subtitle: "Comfort Sedan", description: "Smooth and comfortable for airport transfers and daily travel." }],
      ["civic-rs-white", { name: "Honda Civic", trim: "RS", tag: "RS", color: "White", image: "/assets/vehicles/civic-rs-white.webp", subtitle: "Sport Sedan", description: "Crisp and modern, ideal for weddings and special occasions." }]] },
  { slug: "toyota-grande", title: "Toyota Grande", seo: "Toyota Corolla Grande rental with driver in Islamabad", description: "Toyota Grande with a professional driver for business and family journeys.", models: [
      ["grande-x-black", { name: "Toyota Corolla", trim: "X", tag: "X", color: "Black", image: "/assets/vehicles/grande-x-black.webp", theme: "black", subtitle: "Executive Sedan", description: "Elegant and comfortable for business and city travel." }],
      ["grande-plum", { name: "Toyota Corolla", trim: "Grande", tag: "GR", color: "Plum", image: "/assets/vehicles/grande-plum.webp", theme: "plum", subtitle: "Comfort Sedan", description: "A refined, comfortable ride for family and business journeys." }],
      ["corolla-altis-silver", { name: "Toyota Corolla", trim: "Altis", tag: "AL", color: "Silver", image: "/assets/vehicles/corolla-altis-silver.webp", theme: "grey", subtitle: "Comfort Sedan", description: "Smooth, dependable and easy for airport and hotel transfers." }],
      ["corolla-white", { name: "Toyota Corolla", tag: "CR", color: "White", image: "/assets/vehicles/corolla-white.webp", subtitle: "Comfort Sedan", description: "Clean and classic for everyday travel with a professional driver." }]] },
  { slug: "mercedes-g-wagon", title: "Mercedes G Wagon", seo: "Mercedes G Wagon rental with driver in Islamabad", description: "Mercedes-Benz G Wagon (G-Class) with a professional driver for weddings, VIP arrivals, events and city travel in Islamabad.", models: [
      ["g-wagon-black", { name: "Mercedes G Wagon", tag: "GW", color: "Black", image: "/assets/vehicles/g-wagon-black.webp", theme: "black", subtitle: "Luxury SUV", description: "The black G Wagon, an icon that gives any arrival real presence." }],
      ["g-wagon-white", { name: "Mercedes G Wagon", tag: "GW", color: "Silver White", image: "/assets/vehicles/g-wagon-white.webp", subtitle: "Luxury SUV", description: "A silver-white G Wagon with a clean, bright look for weddings and photo moments." }],
      ["g-wagon-grey", { name: "Mercedes G Wagon", tag: "GW", color: "Grey", image: "/assets/vehicles/g-wagon-grey.webp", theme: "grey", subtitle: "Luxury SUV", description: "A modern grey G Wagon with a sporty, business-ready character." }]] },
  { slug: "audi", title: "Audi", seo: "Audi rental with driver in Islamabad", description: "Audi luxury car with a professional driver for executives, weddings, airport transfers and city travel in Islamabad.", models: [
      ["audi-grey", { name: "Audi", tag: "AU", color: "Silver Grey", image: "/assets/vehicles/audi-grey.webp", theme: "grey", subtitle: "Luxury Car", description: "A sleek silver-grey Audi for executives and guests who want a refined, quiet ride." }],
      ["audi-white", { name: "Audi", tag: "AU", color: "Glacier White", image: "/assets/vehicles/audi-white.webp", subtitle: "Luxury Car", description: "A glacier-white Audi with sharp lines, ideal for weddings and stylish city arrivals." }]] },
  { slug: "range-rover", title: "Range Rover", seo: "Range Rover rental with driver in Islamabad", description: "Range Rover with a professional driver for VIP and executive transportation.", models: [["range-rover-1", { name: "Range Rover", tag: "RR", theme: "black" }]] },
  { slug: "coaster", title: "Coaster", seo: "Toyota Coaster rental with driver in Islamabad", description: "Toyota Coaster with a professional driver for groups, events and tours.", models: [["coaster-1", { name: "Coaster", tag: "CO", theme: "grey" }]] },
];
const BASE = cats.map((c) => ({ ...c, vehicles: c.models.map(([id, o], i) => car(c.slug, id, o, i)) }));
export const baseFleet = BASE; // untouched defaults (the admin app lists these)
export const fleet = BASE.map((c) => ({ ...c, vehicles: [...c.vehicles] }));
export const allVehicles = fleet.flatMap((c) => c.vehicles);
export const findCategory = (slug) => fleet.find((c) => c.slug === slug);

// Prices / extra cars saved from the admin app (served by /api/fleet) are applied here, in place, before the site renders.
const patch = (v, o) => {
  if (!o) return v; const n = { ...v };
  ["name", "trim", "color", "subtitle", "description"].forEach((k) => { if (o[k]) n[k] = o[k]; });
  if ("price" in o) n.price = o.price || null;
  if ("priceOut" in o) n.priceOut = o.priceOut || null;
  if (o.image) { n.image = o.image; n.placeholder = false; }
  n.hidden = !!o.hidden; return n;
};
export function applyOverrides(d) {
  d = d && typeof d === "object" ? d : {};
  const list = BASE.map((c) => ({ ...c, vehicles: c.vehicles.map((v) => patch(v, d.vehicles?.[v.id])) }));
  (d.cats || []).forEach((c) => { if (!list.some((x) => x.slug === c.slug)) list.push({ slug: c.slug, title: c.title, seo: `${c.title} rental with driver in Islamabad`, description: c.description || `${c.title} with a professional driver.`, vehicles: [] }); });
  (d.added || []).forEach((a) => {
    const c = list.find((x) => x.slug === a.cat); if (!c) return;
    c.vehicles.push(patch(car(a.cat, a.id, { name: a.name, trim: a.trim, tag: String(a.name).replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase(), color: a.color, image: a.image, subtitle: a.subtitle, description: a.description, theme: a.theme, price: a.price, priceOut: a.priceOut }, c.vehicles.length), { hidden: a.hidden }));
  });
  const final = list.map((c) => ({ ...c, vehicles: c.vehicles.filter((v) => !v.hidden) })).filter((c) => c.vehicles.length);
  if (!final.length) return;                                   // never leave the site empty
  fleet.length = 0; fleet.push(...final); allVehicles.length = 0; allVehicles.push(...fleet.flatMap((c) => c.vehicles));
}
