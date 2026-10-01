// EDIT HERE to add cars. Only put verified names/specs/images. Images: /public/assets/vehicles/<category>/<file>.webp
const PH = "/assets/placeholder-vehicle.svg";
const T = {
  white: { "--bg1": "#f4f4f2", "--bg2": "#fcfcfb", "--blob1": "#e9e9e6", "--blob2": "#d8d8d4", "--glow": "rgba(255,255,255,.9)", "--ink": "#16181b", "--sub": "#62666c", "--accent": "#3a3f46", "--glass": "rgba(255,255,255,.62)" },
  black: { "--bg1": "#0d0d10", "--bg2": "#1b1b20", "--blob1": "#33343b", "--blob2": "#17171b", "--glow": "rgba(190,196,210,.28)", "--ink": "#f3f1ec", "--sub": "#9b9ba6", "--accent": "#cfd3db", "--glass": "rgba(255,255,255,.09)" },
  grey: { "--bg1": "#dde1e6", "--bg2": "#eef0f3", "--blob1": "#bcc4cd", "--blob2": "#8e99a6", "--glow": "rgba(255,255,255,.85)", "--ink": "#14181d", "--sub": "#56606b", "--accent": "#55677a", "--glass": "rgba(255,255,255,.55)" },
  red: { "--bg1": "#f3e8e7", "--bg2": "#fbf5f4", "--blob1": "#e6c4c1", "--blob2": "#c4807b", "--glow": "rgba(255,255,255,.85)", "--ink": "#1c1213", "--sub": "#6a5757", "--accent": "#8f2d2d", "--glass": "rgba(255,255,255,.55)" },
  plum: { "--bg1": "#efe6ec", "--bg2": "#f9f5f8", "--blob1": "#d9c2d3", "--blob2": "#9d6a93", "--glow": "rgba(255,255,255,.85)", "--ink": "#1a1018", "--sub": "#665462", "--accent": "#6b2d5c", "--glass": "rgba(255,255,255,.55)" },
  blue: { "--bg1": "#e6edf6", "--bg2": "#f5f8fc", "--blob1": "#bfd1ea", "--blob2": "#7b9fd0", "--glow": "rgba(255,255,255,.85)", "--ink": "#0f1722", "--sub": "#52606f", "--accent": "#1f4fa3", "--glass": "rgba(255,255,255,.55)" },
};
const B = [{ rotate: 0, radius: "42% 58% 55% 45% / 45% 40% 60% 55%" }, { rotate: 18, radius: "58% 42% 40% 60% / 55% 55% 45% 45%" }, { rotate: -14, radius: "50% 50% 38% 62% / 42% 58% 42% 58%" }];
const car = (category, id, o, i = 0) => ({ id, category, name: o.name, trim: o.trim || "", tag: o.tag || "", subtitle: o.subtitle || "With Professional Driver",
  color: o.color || "Colour to be confirmed", image: o.image || PH, placeholder: !o.image, description: o.description || "Details to be confirmed.",
  theme: T[o.theme || "white"], blob: B[i % 3] });

const cats = [
  { slug: "land-cruiser-v8", title: "Land Cruiser V8", seo: "Land Cruiser V8 rental with driver in Islamabad", description: "Toyota Land Cruiser V8 with a professional driver for airport transfers, weddings, executive and long-distance travel.",
    models: [["land-cruiser-v8-white", { name: "Land Cruiser", trim: "V8", tag: "V8", color: "Pearl White", image: "/assets/vehicles/land-cruiser-v8-white.webp", subtitle: "Luxury SUV", description: "Effortless comfort for airports, weddings and long trips." }],
             ["land-cruiser-grey", { name: "Land Cruiser", tag: "LC", color: "Graphite Grey", image: "/assets/vehicles/land-cruiser-grey.webp", theme: "grey", subtitle: "Premium SUV", description: "Modern and refined, ideal for business and family travel." }]] },
  { slug: "land-cruiser-tz", title: "Land Cruiser TZ", seo: "Land Cruiser TZ rental with driver in Islamabad", description: "Toyota Land Cruiser TZ with a professional driver for executives and delegations.",
    models: [["land-cruiser-tz-black", { name: "Land Cruiser", trim: "TZ", tag: "TZ", color: "Obsidian Black", image: "/assets/vehicles/land-cruiser-tz-black.webp", theme: "black", subtitle: "Executive SUV", description: "Discreet and composed, made for executives and delegations." }]] },
  { slug: "prado", title: "Prado", seo: "Prado rental with driver in Islamabad", description: "Toyota Land Cruiser Prado with a professional driver for family, business and city-to-city travel.", models: [
      ["prado-black", { name: "Land Cruiser", trim: "Prado", tag: "PR", color: "Black", image: "/assets/vehicles/prado-black.webp", theme: "black", subtitle: "Premium SUV", description: "Comfortable and capable, ideal for family and city-to-city travel." }],
      ["prado-white", { name: "Land Cruiser", trim: "Prado", tag: "PR", color: "White", image: "/assets/vehicles/prado-white.webp", subtitle: "Premium SUV", description: "A spacious, refined ride for business and family journeys." }],
      ["prado-red", { name: "Land Cruiser", trim: "Prado", tag: "PR", color: "Red", image: "/assets/vehicles/prado-red.webp", theme: "red", subtitle: "Premium SUV", description: "Distinctive style with the comfort of a professional driver." }]] },
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
  { slug: "range-rover", title: "Range Rover", seo: "Range Rover rental with driver in Islamabad", description: "Range Rover with a professional driver for VIP and executive transportation.", models: [["range-rover-1", { name: "Range Rover", tag: "RR", theme: "black" }]] },
  { slug: "coaster", title: "Coaster", seo: "Toyota Coaster rental with driver in Islamabad", description: "Toyota Coaster with a professional driver for groups, events and tours.", models: [["coaster-1", { name: "Coaster", tag: "CO", theme: "grey" }]] },
];
export const fleet = cats.map((c) => ({ ...c, vehicles: c.models.map(([id, o], i) => car(c.slug, id, o, i)) }));
export const allVehicles = fleet.flatMap((c) => c.vehicles);
export const findCategory = (slug) => fleet.find((c) => c.slug === slug);
