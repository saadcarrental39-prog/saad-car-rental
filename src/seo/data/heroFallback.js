// A main picture for EVERY indexable page, so Google always has a real, crawlable image to use as the search thumbnail.
// A page's own pictures (pageImages.json) win; only pages without one get a relevant picture from here. The alt text always describes
// what is really in the picture. When you add better photos for a page, put them in pageImages.json and this list is simply skipped.
const ALT = {
  "group-tourism": "Saad Car Rental Land Cruiser with guests and local guides at the Pakistan Monument in Islamabad",
  "white-prado": "White Toyota Prado SUV with a professional driver on a mountain road in Pakistan",
  "black-prado": "Black Toyota Prado SUV parked outside a modern house",
  "honda-civic": "Honda Civic RS Turbo sedan on a highway at sunset",
  "plc-side": "Black Premium Luxury Land Cruiser seen from the side with alloy wheels and roof rails",
  "murree-3": "White Toyota Land Cruiser V8 on a pine-lined mountain road beside a blue river",
  "murree-patriata": "White Land Cruiser with a driver near the Patriata chairlift in the Murree hills",
  "murree": "Red-roofed hotels beside a green river in a hill valley of northern Pakistan",
  "murree-2": "Wooden camping pods in snow among pine trees in the Murree hills",
  "islamabad": "Faisal Mosque and the Margalla Hills in Islamabad at sunset",
  "gilgit-baltistan": "Baltit Fort gate in Hunza framing a snow-covered peak, Gilgit-Baltistan",
  "kpk": "Winding mountain road and fort walls in the northern mountains of Pakistan",
  "shigar-valley": "Braided Indus river channels and a rocky mountain in the Shigar valley near Skardu",
  "malam-jabba": "Snow-covered hills and red-roofed houses at Malam Jabba in Swat",
  "naran-toyota-corolla": "White Toyota Corolla on a mountain road above a river valley with snow peaks",
  "neelum-valley-prado": "White Toyota Prado parked on a mountain road above the Neelum river",
  "mariot-hotel": "Islamabad Marriott Hotel and gardens with cars at the entrance",
  "lahore": "Minar-e-Pakistan in Lahore at sunset",
  "punjab": "Badshahi Mosque and the old city of Lahore at sunset",
};
const CAP = "Saad Car Rental: a car with a professional driver, based in Islamabad.";
const A = (key, cap = CAP) => ({ key, alt: ALT[key], cap });
const CITY = A("group-tourism");
const MOUNTAIN = A("murree-3", "Hill and mountain roads north of Islamabad.");

const SERVICE = { "airport-transfers": "group-tourism", "business-travel": "honda-civic", "chauffeur-service": "black-prado", "corporate-transportation": "black-prado", "customized-travel": "murree-patriata",
  "family-travel": "white-prado", "hotel-transfers": "mariot-hotel", "islamabad-rawalpindi-transportation": "group-tourism", "long-distance-travel": "murree-3", "premium-car-rental": "plc-side",
  "private-tours": "murree-patriata", "vip-executive-transportation": "plc-side", "wedding-event-transportation": "plc-side" };
// place (a /locations/<x> page or the end of an /routes/islamabad-to-<x> page) -> picture
const PLACE = { abbottabad: "murree-3", "azad-kashmir": "neelum-valley-prado", chitral: "kpk", faisalabad: "honda-civic", gilgit: "gilgit-baltistan", hunza: "gilgit-baltistan", islamabad: "islamabad", multan: "honda-civic",
  murree: "murree-3", muzaffarabad: "neelum-valley-prado", naran: "naran-toyota-corolla", peshawar: "honda-civic", rawalpindi: "group-tourism", skardu: "shigar-valley", swat: "malam-jabba", lahore: "lahore" };
const DEST = { "deosai-national-park": "shigar-valley", khaplu: "shigar-valley", "nathia-gali": "murree-patriata" };
const MURREE = { "patriata-new-murree-chairlift": "murree-patriata", "pindi-point-chairlift": "murree-patriata", "mall-road-murree": "murree-2", "bhurban-murree": "murree", "kashmir-point-murree": "murree-3", "ayubia-national-park-chairlift": "murree-3" };
const GUIDE = { "wedding-car-with-driver-guide": "plc-side", "islamabad-airport-pickup-guide": "group-tourism", "car-rental-with-driver-islamabad-rates": "plc-side", "murree-galiyat-winter-road-guide": "murree-2",
  "northern-pakistan-road-trip-itineraries": "gilgit-baltistan", "which-car-for-which-trip-pakistan": "white-prado", "booking-terms-explained": "black-prado",
  "islamabad-to-peshawar-car-with-driver": "honda-civic", "islamabad-to-faisalabad-car-with-driver": "honda-civic", "islamabad-to-chakwal-kallar-kahar-guide": "honda-civic", "islamabad-to-haripur-car-with-driver": "white-prado", "islamabad-to-taxila-hasan-abdal-car-with-driver": "group-tourism", "islamabad-to-deosai-national-park-guide": "shigar-valley" };
const HUB = { "/services": "group-tourism", "/car-rental-pakistan": "murree-patriata", "/car-rental-guide": "group-tourism", "/guides": "group-tourism", "/faq": "group-tourism", "/about": "group-tourism", "/contact": "group-tourism",
  "/ai-info": "group-tourism", "/northern-areas": "gilgit-baltistan", "/islamabad-places": "islamabad", "/local-car-rental-islamabad": "group-tourism", "/out-of-station-car-rental": "murree-3", "/locations": "kpk",
  "/destinations": "gilgit-baltistan", "/murree-tourist-spots": "murree-patriata", "/airport-transfer/islamabad": "group-tourism", "/islamabad/aabpara-market": "group-tourism" };

export function fallbackFor(path) {
  const seg = String(path).split("/").filter(Boolean); if (!seg.length) return null;
  if (HUB[path]) return A(HUB[path]);
  const [a, b] = seg;
  if (a === "services" && b && SERVICE[b]) return A(SERVICE[b]);
  if (a === "locations" && b && PLACE[b]) return A(PLACE[b], PLACE[b] === "group-tourism" ? CAP : `${CAP.replace(": a car", ": a car")}`);
  if (a === "routes" && b) { const p = PLACE[b.replace(/^islamabad-to-/, "")]; return p ? A(p) : MOUNTAIN; }
  if (a === "destinations" && b) return DEST[b] ? A(DEST[b]) : MOUNTAIN;
  if (a === "murree-tourist-spots" && b && MURREE[b]) return A(MURREE[b]);
  if (a === "guides" && b && GUIDE[b]) return A(GUIDE[b]);
  if (a === "islamabad" && b) return CITY;
  return null;   // home, car pages (their own photos), policies and booking pages do not need one
}
