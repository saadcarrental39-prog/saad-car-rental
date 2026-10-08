// ROUTES. A route page is only built where it adds real value on top of the place page (trip format, vehicle choice, season, booking).
// Destination places (Fairy Meadows, Kalam ...) already carry their own "Islamabad to X" content on their destination page,
// so they do NOT get a second near-identical route page (that would be a doorway page).
import { PLACES } from "./places";

const ROUTE_PLACES = ["lahore", "peshawar", "faisalabad", "multan", "murree", "abbottabad", "swat", "naran", "chitral", "gilgit", "hunza", "skardu", "muzaffarabad"];
const NOTES = {
 "lahore": "The journey follows the motorway network between the capital and Lahore, so the drive is comfortable and predictable outside fog season. Business guests often leave early and return the same evening, while families usually travel one way and come back days later. Tell us if you need to stop in Lahore for several meetings or an airport connection and we will plan the booking around it.",
 "peshawar": "The road is a straightforward highway journey from the capital, and many guests make it a same-day return. If you are visiting universities, hospitals or offices in Peshawar, share the addresses so your driver can plan the day. Guests continuing north to Swat or Chitral can book Peshawar as the first leg of a longer trip.",
 "faisalabad": "Faisalabad is reached by motorway and highway links, and most business guests plan a same-day return. If you are visiting several factories or offices in the city, share the stops in advance so we can quote by time and distance. Families travelling for weddings often book one way and return days later.",
 "multan": "Multan is a long run south-west and the day needs planning: an early start, a comfortable vehicle and sensible rest stops. Some guests break the trip with an overnight stay halfway, others drive straight through with a rested driver. We quote either plan; share your dates and how much luggage you carry.",
 "murree": "Murree is close enough for a day trip, but weather and weekend traffic decide how long it really takes. Early starts on holiday weekends avoid the worst of the queues, and in winter you should ask us about snow before you set off. Your driver can wait at Mall Road or Patriata, or return at a time you choose.",
 "abbottabad": "Abbottabad sits at the point where the highway turns into hill road, so it works both as a destination and as the first night of a longer northern trip. Many guests continue from here to Nathia Gali, Thandiani or Naran, and we can quote the full chain as a single booking.",
 "swat": "The journey north to Swat combines motorway driving with a long mountain approach, so most guests treat arrival in Mingora or Madyan as the end of day one. From there the road follows the Swat River to Bahrain and Kalam. Tell us how many days you have and which towns you want to sleep in, and we will suggest a sensible pace.",
 "naran": "The road to Naran passes through Abbottabad, Mansehra and Balakot before climbing into Kaghan Valley, so the real mountain driving begins late in the day. Guests spend a night or two in Naran and take a local jeep to Lake Saif-ul-Malook. Share your dates early because the season and road status affect the plan.",
 "chitral": "Chitral is among the longest mountain journeys we quote from Islamabad, usually through Dir and the Lowari Tunnel. Most guests split it with an overnight stop and allow time in the valleys, not only the drive. Roads in side valleys such as the Kalash valleys can be narrow, so a driver with local road knowledge is worth having.",
 "gilgit": "The Karakoram Highway to Gilgit is a full multi-day journey with a rhythm of its own: early starts, a long driving day and a night at a stopping point before reaching Gilgit. Guests often keep the same vehicle and driver to continue to Hunza or Skardu, which keeps the whole trip under one booking.",
 "hunza": "Hunza is reached by the Karakoram Highway through Gilgit and is almost always planned as one connected trip rather than a point-to-point transfer. Guests typically combine a day or two in Karimabad with Attabad Lake and Passu. Share the number of days you have and we will suggest where to sleep and how to split the driving.",
 "skardu": "Skardu is reached by the Karakoram Highway and then a turn onto the Skardu road along the Indus, which makes the journey long and scenic. Tell us whether you want the vehicle to stay with you in Skardu or return, and whether you need side trips to Shigar, Khaplu or Deosai, and we will quote it accordingly.",
 "muzaffarabad": "The road to Muzaffarabad climbs through the hills near Murree and then descends toward the Jhelum River, so it is slower than the distance suggests. Many guests treat it as a day trip, while others use it as the first leg toward Neelum Valley. Share your plan and we will quote the full journey."
};
export const ROUTES = ROUTE_PLACES.map((to) => ({ slug: `islamabad-to-${to}`, from: "islamabad", to, status: "live", note: NOTES[to] }));

// Planned only: data for the owner to confirm. No pages, not in the sitemap, not linked.
const OTHER_ORIGINS = ["lahore", "peshawar", "faisalabad", "multan"];
const OTHER_TARGETS = ["murree", "naran", "hunza", "skardu", "swat", "islamabad"];
export const DRAFT_ROUTES = [
  ...OTHER_ORIGINS.flatMap((from) => OTHER_TARGETS.filter((to) => to !== from).map((to) => ({ slug: `${from}-to-${to}`, from, to, status: "draft", reason: `pickup in ${from} needs owner confirmation` }))),
  ...PLACES.filter((p) => p.status === "draft").map((p) => ({ slug: `islamabad-to-${p.slug}`, from: "islamabad", to: p.slug, status: "draft", reason: "long-haul / unconfirmed service" })),
];
export const route = (slug) => ROUTES.find((r) => r.slug === slug);
