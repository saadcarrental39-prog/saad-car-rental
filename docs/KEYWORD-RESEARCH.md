# Keyword map (Oct 2026)

**Important:** this map is built from search intent and from how people in Pakistan and abroad phrase car-with-driver searches. It has NO search-volume numbers, because no keyword tool was available while writing it. Check volumes and the words people really use in Google Search Console (Performance > Queries) every month and move phrases between groups. Add new phrases in `src/seo/data/guide.js` (visible page, never hidden text).

## 1. The 12 target keywords and the page that owns each one
Only ONE page owns a keyword. Other pages may mention it but link to the owner.

| Keyword | Owner page | Supporting pages |
|---|---|---|
| car rental with driver in Islamabad | `/` (Home) | `/services/chauffeur-service`, `/local-car-rental-islamabad` |
| rent a car in Islamabad with driver | `/locations/islamabad` | `/car-rental-guide`, `/local-car-rental-islamabad` |
| chauffeur service Islamabad | `/services/chauffeur-service` | `/services/vip-executive-transportation` |
| airport transfer Islamabad | `/airport-transfer/islamabad` | `/visit-pakistan`, `/overseas-pakistanis`, `/islamabad/serena-hotel-islamabad` |
| northern areas tour by car | `/northern-areas` | `/out-of-station-car-rental`, `/destinations/hunza`, `/destinations/skardu` |
| car rental for wedding Islamabad | `/services/wedding-event-transportation` | `/faq` |
| corporate car rental Islamabad | `/services/corporate-transportation` | `/services/business-travel` |
| car rental near me | `/locations/islamabad` (pickup from any sector) | `/islamabad-places`, `/faq` |
| Land Cruiser rental Islamabad | `/cars/land-cruiser-v8` | `/cars/land-cruiser-tz` |
| Prado rental Islamabad | `/cars/prado` | `/cars` |
| tour operator in Pakistan | `/car-rental-pakistan` (we provide the car and driver, not hotels or flights) | `/out-of-station-car-rental` |
| Pakistan tour with car | `/out-of-station-car-rental` | `/visit-pakistan`, `/routes` |

## 2. Keyword sets by page type
Primary = 1 phrase in title, H1 and first paragraph. Secondary = 3 to 5 phrases in H2s. Long-tail = FAQ questions and body. LSI = natural related words. Local = place + service. Questions = FAQ headings.

### Home `/`
- Primary: car rental with driver in Islamabad
- Secondary: chauffeur service Islamabad, rent a car Islamabad with driver, luxury car rental Islamabad, airport pickup Islamabad
- Long-tail: Prado with driver Islamabad, Land Cruiser V8 rental Islamabad, family car with driver Islamabad, wedding car rental Islamabad, corporate car rental Islamabad, Islamabad to Hunza by car
- LSI: professional driver, chauffeur-driven, premium SUV, daily rental, private car, executive transport, pickup and drop
- Local: G-11 Markaz, Blue Area, F-7, DHA, Rawalpindi
- Questions: how to rent a car with a driver in Islamabad, which car is best for a family trip, do you provide airport pickup

### Vehicle pages `/cars/<vehicle>`
- Primary: <vehicle> rental Islamabad with driver (e.g. Land Cruiser V8 rental Islamabad, Prado with driver Islamabad)
- Secondary: <vehicle> on rent, <vehicle> for wedding, <vehicle> for northern areas, <vehicle> airport pickup
- Long-tail: <vehicle> with driver for Hunza trip, <vehicle> for family of six, <vehicle> executive travel Islamabad
- LSI: SUV, 4x4, seats, luggage, comfort, mountain roads, chauffeur
- Questions: is the <vehicle> good for the north, how many passengers fit, can I book it for a wedding

### Services `/services/<slug>`
- Primary: <service> Islamabad (chauffeur service, wedding car rental, corporate car rental, airport transfer, hotel transfer)
- Secondary: <service> with driver, premium <service>, <service> Rawalpindi
- Long-tail: wedding car with driver Islamabad, executive car for meetings Islamabad, group transport Islamabad Coaster
- LSI: event, guests, schedule, punctual, uniformed driver (only if true), booking in advance
- Questions: how early should I book, can the car wait, which vehicle suits my group

### Local service and Islamabad places `/local-car-rental-islamabad`, `/islamabad/<place>`
- Primary: local car with driver Islamabad / <place> car with driver
- Secondary: Islamabad shopping day car with driver, Islamabad city tour with driver, hotel pickup Islamabad
- Long-tail: Daman-e-Koh car with driver, Centaurus Mall pick and drop, Faisal Mosque tour with car, Pir Sohawa taxi with driver
- LSI: Margalla Hills, Blue Area, sectors F-6 F-7 G-11, markets, picnic
- Questions: can the driver wait while I shop, what is the best time to visit <place>

### Out of Station, routes, destinations, cities `/out-of-station-car-rental`, `/destinations/*`, `/locations/*`, `/routes`
- Primary: Islamabad to <place> car with driver
- Secondary: <place> tour with driver, <place> trip by car, Pakistan tour with car
- Long-tail: Hunza trip by car, Skardu tour with driver, Kumrat Valley car rental, Naran Kaghan tour car, Islamabad to Lahore car with driver
- LSI: highway, mountain road, season, itinerary, luggage, SUV, 4x4
- Questions: which car is best for <place>, how many days for <place>, is the road open in winter

### Visitors `/visit-pakistan`, `/overseas-pakistanis`
- Primary: tourist car with driver Pakistan / car with driver for overseas Pakistanis
- Secondary: Islamabad airport pickup for tourists, book a car in Islamabad from abroad, family airport pickup
- Long-tail: rent a car in Pakistan for tourists, hire a driver for a Pakistan tour, wedding trip car overseas Pakistani
- Questions: can I book from abroad, how does airport pickup work, do you provide a driver

### Airport `/airport-transfer/islamabad`
- Primary: airport transfer Islamabad
- Secondary: Islamabad airport pickup and drop, Islamabad International Airport taxi with driver, hotel transfer from airport
- Long-tail: airport pickup Islamabad airport for family, late night airport pickup Islamabad
- Questions: where does the driver meet me, what if my flight is late

### Guide, FAQ, About, Contact
- Guide `/car-rental-guide`: all group phrases (see `guide.js`), including Urdu and Roman Urdu
- FAQ `/faq`: the question keywords (how, what, where, when, can I)
- About `/about`: Saad Car Rental Islamabad, car rental company Islamabad
- Contact `/contact`: car rental Islamabad phone number, Saad Car Rental address G-11 Markaz

## 3. Question keywords to keep answering (AEO)
how to rent a car with driver in Islamabad, how much to hire a car with driver (answer: quoted per trip), which car is best for Hunza and Skardu, can I book an Islamabad airport pickup from abroad, is self drive available (no), what is the difference between local and out of station, can a driver stay with us on a tour (driver arrangement rules), where is Saad Car Rental located.

## 4. How to check the keywords really work
1. Google Search Console > Performance: filter by each owner page and note impressions and position for its keyword.
2. Add the new real phrases (what people typed) to `guide.js`.
3. If two pages show for the same keyword, keep the owner page and link the other to it.
