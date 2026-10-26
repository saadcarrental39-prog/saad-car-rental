// All city trip posts, each with the standard "visitors from abroad" and "how to book" sections added at the end.
import { CITIES_1, visitors, book } from "./guidesCities1";
import { CITIES_2 } from "./guidesCities2";
export const CITY_GUIDES = [...CITIES_1, ...CITIES_2].map((g) => ({ ...g, sections: [...g.sections, visitors(g.bookTo), book(g.bookTo)], answerQ: g.answerQ, og: { a: g.bookTo.toUpperCase(), b: "Car with driver from Islamabad", vehicle: (g.vehicles || ["prado"])[0] } }));
