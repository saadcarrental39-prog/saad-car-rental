// Vehicle -> use-case matrix. These suitability lists come from the owner's brief; nothing about seats, luggage or model-year is
// stated until the owner confirms it (see needsConfirmation in business.config.js).
export const USE = {
  family: "Family travel", northern: "Northern areas", "long-distance": "Long-distance trips", airport: "Airport transfers",
  corporate: "Corporate travel", vip: "VIP / executive", wedding: "Weddings", tourism: "Tourism and private tours", mountain: "Mountain roads",
  adventure: "Adventure routes", luggage: "Luggage-heavy trips", executive: "Executive travel", city: "City travel", couples: "Couples",
  "short-distance": "Short trips", intercity: "Intercity travel", groups: "Group travel", "family-groups": "Family groups",
  "corporate-groups": "Corporate groups", tours: "Group tours", events: "Events", "wedding-guests": "Wedding guests", "northern-group": "Northern group trips",
};
export const VEHICLE_FIT = {
  prado: ["family", "northern", "long-distance", "airport", "corporate", "vip", "wedding", "tourism"],
  "land-cruiser-v8": ["northern", "family", "vip", "long-distance", "corporate", "tourism", "mountain"],
  "land-cruiser-tz": ["northern", "family", "vip", "long-distance", "corporate", "tourism", "mountain"],
  revo: ["adventure", "northern", "mountain", "family", "luggage", "long-distance"],
  "range-rover": ["vip", "corporate", "wedding", "executive", "airport"],
  "honda-civic": ["city", "airport", "corporate", "executive", "couples", "short-distance"],
  "toyota-grande": ["family", "airport", "city", "corporate", "intercity"],
  coaster: ["groups", "family-groups", "corporate-groups", "tours", "events", "wedding-guests", "northern-group"],
};
// One short, honest sentence per vehicle used on route / service / location pages.
export const VEHICLE_PITCH = {
  prado: "a comfortable, capable SUV that suits families, business trips and city-to-city journeys",
  "land-cruiser-v8": "a premium full-size SUV for comfort on long drives, weddings and executive travel",
  "land-cruiser-tz": "an executive SUV for discreet, composed travel for delegations and business guests",
  revo: "a rugged double-cabin pickup for tougher roads, adventure routes and luggage-heavy trips",
  "range-rover": "a VIP choice for executive, wedding and airport travel (available on request)",
  "honda-civic": "a refined sedan for city travel, airport transfers and executive journeys",
  "toyota-grande": "a comfortable sedan for family, airport, city and intercity travel",
  coaster: "a group vehicle for families, tours, events and wedding guests (available on request)",
};
// Terrain -> default recommendation order (a place can override with its own `vehicles` list).
export const TERRAIN = {
  city:     { label: "city", vehicles: ["honda-civic", "toyota-grande", "prado", "land-cruiser-v8", "range-rover"], advice: "Sedans are the practical choice for city and airport runs; choose an SUV when you want more room or a more premium arrival." },
  plains:   { label: "highway / motorway", vehicles: ["toyota-grande", "honda-civic", "prado", "land-cruiser-v8", "coaster"], advice: "On motorway and highway journeys comfort matters most: a sedan suits one to three passengers, an SUV suits families with luggage, and a Coaster suits groups." },
  hills:    { label: "hill-road", vehicles: ["prado", "land-cruiser-v8", "revo", "toyota-grande", "coaster"], advice: "Hill roads are fine for a comfortable SUV; in winter, when snow or ice is possible, ask us about a 4x4 choice before you book." },
  mountain: { label: "mountain-road", vehicles: ["prado", "land-cruiser-v8", "land-cruiser-tz", "revo", "coaster"], advice: "Mountain routes reward higher ground clearance and a driver who knows the road: an SUV or 4x4 is the sensible choice, and a Coaster works for larger groups on the main routes." },
  extreme:  { label: "rough-road / 4x4", vehicles: ["revo", "land-cruiser-v8", "prado"], advice: "Some stretches here are rough, steep or seasonal. A 4x4 such as the Revo or Land Cruiser is the sensible choice, and some final legs use local jeeps." },
};
