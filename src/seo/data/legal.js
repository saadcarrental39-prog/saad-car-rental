// Legal / policy pages. To change wording, edit the text here and rebuild. Pages are listed in the footer and in sitemap.xml.
// Rules (same as the rest of the site): no prices, no invented company facts, no promises we cannot keep.
// Nothing here names a legal company number, a refund period or a fee, because those are not confirmed. Real terms are agreed in each quote.
const f = (q, a) => ({ q, a });
export const LEGAL_UPDATED = "October 2026";

export const LEGAL = [
  {
    slug: "privacy-policy", path: "/privacy-policy", short: "Privacy Policy",
    title: "Privacy Policy", h1: "Privacy Policy",
    description: "How SAAD CAR RENTAL SERVICES collects, uses and protects the details you share when you book a car with a professional driver or contact us.",
    ogA: "PRIVACY POLICY", ogB: "How we handle your details",
    eyebrow: "Legal",
    lead: "We only ask for what we need to arrange your car and driver. This page explains what we collect, why, who can see it and what you can ask us to do.",
    summary: [
      "We collect the details you type into our booking, contact and enquiry forms, and simple visit statistics.",
      "We use them to reply to you, arrange your trip and improve the website. We do not sell your details.",
      "If you start a form and leave before sending, the details you typed may still reach us so that we can follow up.",
      "You can ask us to correct or delete your details by phone or WhatsApp at any time.",
    ],
    sections: [
      { h: "Who we are", p: [
        "This website is run by SAAD CAR RENTAL SERVICES, a car rental with professional driver (chauffeur) service based at Office No 12, 3rd Floor, Shah Nawaz Plaza, G-11 Markaz, Islamabad, Pakistan.",
        "In this policy, \"we\", \"us\" and \"our\" mean SAAD CAR RENTAL SERVICES. \"You\" means anyone who visits the website, calls us, messages us on WhatsApp or sends us an enquiry or booking request.",
      ] },
      { h: "What information we collect", p: ["Depending on how you use the website, we may collect the following."], list: [
        "Details you give us: your name, phone or WhatsApp number, email address, pickup and drop-off places, travel dates and times, number of passengers, the vehicle you prefer and any notes you write.",
        "Details from your booking: the booking message and receipt that you create with our Book Now form, and the reply we send you.",
        "Partly completed forms: if you type your name, phone number or email into a form and leave before pressing send, the details you typed may still be saved for us, so that we can contact you about the trip you were planning.",
        "Visit information: the pages you open, the type of device and browser, the approximate time of your visit and whether you pressed a Call, WhatsApp or Book button. We use a random visitor code stored in your browser to count visits. It does not contain your name.",
        "Calls and messages: your phone number and the content of messages when you call us or write to us on WhatsApp.",
      ] },
      { h: "How we use your information", p: ["We use your information to:"], list: [
        "reply to your enquiry, confirm your vehicle and driver and send you a quote;",
        "arrange pickups, transfers and trips you have asked for, and contact you about changes to your booking;",
        "follow up on a booking you started but did not finish, when you have given us a way to contact you;",
        "understand which pages and services people use, so we can improve the website and our service;",
        "keep the website secure and prevent misuse;",
        "meet legal duties in Pakistan when they apply to us.",
      ] },
      { h: "WhatsApp, phone and email", p: [
        "When you press a WhatsApp button, your own WhatsApp opens with a message prepared for you. Nothing is sent until you press Send. Once you message us, WhatsApp processes the conversation under its own terms and privacy policy.",
        "When you press a Call button, your phone makes a normal call under your mobile network's terms. We may keep a record of numbers that called or messaged us so that we can return your call.",
      ] },
      { h: "Cookies and similar technologies", p: [
        "Our website uses your browser's local storage rather than advertising cookies. It is used to remember a visitor code for visit counting, to keep the booking form working and to remember small preferences such as a form you were filling in.",
        "We do not use the website to show you advertising. We may also use a visit-statistics tool from another company, such as Google Analytics or Cloudflare Web Analytics, which collects anonymous usage figures under that company's own policy. You can clear the stored data at any time in your browser settings, and the website will still work.",
      ] },
      { h: "Services provided by other companies", p: [
        "We rely on other companies to run the website. Our hosting and security provider (Cloudflare) delivers the pages and stores the information sent through our forms. Google Maps links open Google's service, and reviews or ratings shown on the site come from our Google business listing. These companies have their own privacy policies.",
        "We do not sell your personal information and we do not share it with other businesses for their own marketing.",
      ] },
      { h: "How long we keep your information and how we protect it", p: [
        "We keep enquiry and booking details for as long as we need them to handle your request, to deal with questions about a past trip and to meet our legal duties. Visit statistics are kept in summary form.",
        "Access to the stored details is limited to our team through a private, password-protected area. No method of sending data over the internet is completely safe, so we ask you not to include card numbers or passwords in any form or message.",
      ] },
      { h: "Your choices and rights", p: ["You can contact us at any time to:"], list: [
        "ask what details we hold about you;",
        "ask us to correct details that are wrong;",
        "ask us to delete the details you gave us, unless we must keep them by law;",
        "ask us to stop contacting you about a trip you no longer need.",
      ] },
      { h: "Children", p: [
        "The website is meant for adults who arrange travel. We do not knowingly collect details about children, except the number of passengers you tell us about for a booking.",
      ] },
      { h: "Changes to this policy", p: [
        "We may update this policy when our service or the law changes. The date at the top of the page shows when it was last updated. Please check it from time to time.",
      ] },
      { h: "Contact us about privacy", p: [
        "For any question about this policy or your details, call or WhatsApp 0333 9850599, use our contact page, or visit our office in G-11 Markaz, Islamabad.",
      ] },
    ],
    faqs: [
      f("Do you sell my phone number or personal details?", "No. We use your details to answer you and arrange your trip. We do not sell them and we do not hand them to other businesses for marketing."),
      f("Do you save what I type if I do not press send?", "Yes. If you type your name, phone number or email into a booking or contact form and leave, the details may still be saved so that our team can follow up. You can ask us to delete them."),
      f("How can I ask you to delete my details?", "Call or WhatsApp 0333 9850599, or use the contact page, and tell us the name or number you used. We will remove the details unless the law requires us to keep them."),
    ],
  },
  {
    slug: "terms-and-conditions", path: "/terms-and-conditions", short: "Terms & Conditions",
    title: "Terms and Conditions", h1: "Terms and Conditions",
    description: "The terms for hiring a car with a professional driver from SAAD CAR RENTAL SERVICES in Islamabad, and for using this website.",
    ogA: "TERMS & CONDITIONS", ogB: "Hiring a car with a driver",
    eyebrow: "Legal",
    lead: "These terms explain how our chauffeur-driven car rental works and what we and our customers can expect from each other.",
    summary: [
      "Every vehicle is provided with a professional driver. We do not offer self-drive hire.",
      "A booking is confirmed only when our team confirms it to you. Submitting a form is a request, not a confirmed booking.",
      "Each trip is quoted individually, and the quote lists what is included.",
      "Please treat the vehicle and the driver with respect and follow the driver's safety instructions.",
    ],
    sections: [
      { h: "About these terms", p: [
        "These terms apply to every request, quote and booking made with SAAD CAR RENTAL SERVICES, and to your use of this website. By sending a booking request or using the service you agree to them. If you do not agree, please do not use the service.",
        "Some trips have extra terms, for example for weddings or long journeys. Those terms are written in your quote and apply together with this page.",
      ] },
      { h: "Our service", p: [
        "We provide cars and coaches together with an experienced professional driver, for airport transfers, city travel, business and family journeys, weddings and events, and trips from Islamabad and Rawalpindi to other cities and the northern areas.",
        "We do not rent vehicles without a driver. The driver stays with the vehicle for the whole booking.",
      ] },
      { h: "Requests, quotes and confirmation", p: [
        "Sending the Book Now form, a WhatsApp message or a call is a request for a quote. We reply with availability and a quote for your route, dates, vehicle and requirements.",
        "A booking is confirmed only when we confirm it to you in writing, for example by WhatsApp. Vehicles and drivers depend on availability, so we recommend booking early, especially for weddings, holidays and the summer travel season.",
        "The website does not take online payment. How and when you pay is explained in your quote.",
      ] },
      { h: "Information you give us", p: [
        "Please give accurate pickup places, times, flight details and passenger numbers. If your plan changes, tell us as early as possible so that we can adjust. Extra stops, longer waiting or a different route may change the quote, and we will tell you before we go ahead.",
      ] },
      { h: "Passengers and use of the vehicle", p: ["For the safety of everyone on board, passengers agree to:"], list: [
        "keep to the number of seats in the vehicle and use the seat belts;",
        "treat the vehicle with care and tell us about any damage you cause;",
        "avoid unlawful goods, smoking inside the vehicle unless the driver agrees, and behaviour that puts others at risk;",
        "follow the driver's reasonable instructions about safety, speed, rest stops and road conditions.",
      ] },
      { h: "Drivers, routes and conditions", p: [
        "Our drivers choose the safest practical route. Traffic, weather, road closures, landslides, snow, security checkpoints and similar events can change travel times, especially in the mountains. A driver may refuse or change a route when it is unsafe.",
        "Travel times we mention are estimates only. We do our best to be on time, but we cannot control the road.",
      ] },
      { h: "Changes and cancellations", p: [
        "You can ask to change or cancel a booking at any time by calling or messaging us. Please read our cancellation policy for how changes are handled.",
      ] },
      { h: "Responsibility", p: [
        "We provide our service with reasonable care and skill. We are not responsible for delays or losses caused by events outside our control, such as weather, road closures, strikes, flight changes or government orders.",
        "Please keep valuables and important documents with you. Nothing in these terms limits any right you have under the law of Pakistan that cannot be limited.",
      ] },
      { h: "Using this website", p: [
        "The website is for information and booking requests. Photos, descriptions and routes are shown in good faith, and the vehicle you receive may be an equivalent one of the same class if the shown vehicle is not available, as agreed with you.",
        "The text, logo and photos belong to SAAD CAR RENTAL SERVICES or are used with permission. Please do not copy them without our written permission.",
      ] },
      { h: "Law and contact", p: [
        "These terms are governed by the laws of Pakistan. If we cannot settle a disagreement by talking, it may be taken to the courts of Islamabad.",
        "Questions about these terms are welcome. Call or WhatsApp 0333 9850599 or use our contact page.",
      ] },
    ],
    faqs: [
      f("Is a booking confirmed when I send the form?", "No. The form is a request. Your booking is confirmed when our team confirms the vehicle, driver and quote to you."),
      f("Can I hire a car without a driver?", "No. Every vehicle is provided with a professional driver who stays with it for the whole booking."),
      f("What if my plans change after I book?", "Tell us as soon as you can by call or WhatsApp. We will adjust the booking where possible and explain any change to the quote before going ahead."),
    ],
  },
  {
    slug: "disclaimer", path: "/disclaimer", short: "Disclaimer",
    title: "Disclaimer", h1: "Website and Travel Disclaimer",
    description: "Important notes about the information on this website: availability, road and weather conditions, third-party links and travel advice.",
    ogA: "DISCLAIMER", ogB: "Please read before you travel",
    eyebrow: "Legal",
    lead: "We work to keep this website accurate and useful. Travel in Pakistan depends on things nobody can control, so please read these notes before you plan.",
    summary: [
      "Website information is general and may change. Your quote and our confirmation are what apply to your trip.",
      "Road, weather and security conditions can change travel plans, especially in the north.",
      "We do not give visa, immigration, legal, medical or insurance advice.",
      "Links and reviews from other companies are outside our control.",
    ],
    sections: [
      { h: "General information only", p: [
        "The pages on this website describe our services, vehicles, routes and destinations in general terms. We take care to keep them correct, but we cannot promise that every detail is complete or up to date at the moment you read it.",
        "If anything on the website differs from your written quote or our confirmation, the quote and the confirmation apply.",
      ] },
      { h: "Availability and vehicles", p: [
        "Vehicles and drivers are limited and are confirmed on a first come, first served basis after we reply to you. A vehicle shown in a photo may be in use on your dates. In that case we will offer an equivalent vehicle of the same class and ask you before we proceed.",
        "Photos show our real vehicles, but colours, trims and features can vary a little between vehicles of the same model.",
      ] },
      { h: "Roads, weather and travel times", p: [
        "Journeys to Murree, Naran, Hunza, Skardu, Swat and other mountain areas depend on weather, snow, landslides, road works and closures. Passes and roads can close with little notice and travel can take longer than expected.",
        "Travel times and seasons mentioned on this website are estimates for planning. Your driver will advise on the safest option on the day and may change or shorten a route when conditions are unsafe.",
      ] },
      { h: "Travel advice, permits and documents", p: [
        "We provide vehicles with drivers. We do not provide visa, immigration, legal, medical, insurance or security advice. Visitors from abroad should check the latest entry and travel requirements with official sources before they travel.",
        "Hotels, flights, permits and any special documents for certain areas are arranged by you or your tour operator unless we have agreed otherwise in writing.",
      ] },
      { h: "Links, maps and reviews from other companies", p: [
        "The website links to services from other companies, for example Google Maps and WhatsApp, and shows ratings from our Google business listing. We do not control those services or their content, and we are not responsible for them.",
      ] },
      { h: "Limits of our responsibility", p: [
        "We are not responsible for loss or delay caused by events outside our control, or for decisions you make only on the basis of general information on this website. This does not limit any right you have by law that cannot be limited.",
      ] },
      { h: "Reporting a mistake", p: [
        "If you see something on the website that looks wrong, please tell us by phone, WhatsApp or the contact page so that we can correct it.",
      ] },
    ],
    faqs: [
      f("Are road and weather conditions included in your travel times?", "Times on the website are planning estimates. Weather, snow, landslides and closures can change them, and your driver will advise on the day."),
      f("Do you help with visas or permits?", "No. We provide a car with a professional driver. Please check entry rules and any permits with official sources or your tour operator."),
    ],
  },
  {
    slug: "cancellation-policy", path: "/cancellation-policy", short: "Cancellation Policy",
    title: "Cancellation and Changes Policy", h1: "Cancellation and Changes Policy",
    description: "How to change or cancel a car with driver booking at SAAD CAR RENTAL SERVICES, and how your quote sets out the terms for your trip.",
    ogA: "CANCELLATION POLICY", ogB: "Changes and cancellations",
    eyebrow: "Legal",
    lead: "Plans change. This page explains how to tell us, and how changes and cancellations are handled for our chauffeur-driven bookings.",
    summary: [
      "Tell us as early as possible by phone or WhatsApp. Early notice helps us offer the vehicle to someone else.",
      "The terms for your trip, including any payment arrangements, are written in your quote.",
      "Weddings, long trips and peak dates can have their own terms, which we explain before you confirm.",
      "We will always explain a change or charge to you before it applies.",
    ],
    sections: [
      { h: "How to change or cancel", p: [
        "Call 0333 9850599 or send us a WhatsApp message with your name, phone number and the date of your trip. We will confirm the change or cancellation back to you in writing. A change is only final when we confirm it.",
      ] },
      { h: "Why early notice matters", p: [
        "Each booking reserves a vehicle and a driver for your dates, and other customers may be waiting for the same dates. The earlier you tell us, the easier it is for us to offer your slot to someone else and the fairer we can be to you.",
      ] },
      { h: "Terms are set out in your quote", p: [
        "Every trip is quoted individually, by vehicle, route, number of days and requirements. Your quote explains what is included and any payment arrangements for that trip. Where a booking needs an advance, or a different arrangement for cancellation, we tell you before you confirm, so that you can decide with full information.",
        "This website does not take online payments, so nothing is charged automatically when you send a form.",
      ] },
      { h: "Changing your plan", p: ["You can ask to change:"], list: [
        "the date or time of pickup;",
        "the pickup place or the destination;",
        "the vehicle, if another suitable one is available;",
        "the number of passengers or days.",
      ] },
      { h: "Changes made by us", p: [
        "If a vehicle becomes unavailable we will contact you as early as we can and offer an equivalent vehicle or another suitable arrangement. If safety, weather or road closures make a trip unsafe, your driver may change or stop the journey and we will explain the options, including rescheduling.",
      ] },
      { h: "Missed pickups and delays", p: [
        "If your flight or plan is delayed, tell us on WhatsApp as soon as you can so that the driver can adjust. If we cannot reach you at the agreed time and place, please call us. Waiting beyond what was agreed may change the quote, and we will tell you first.",
      ] },
      { h: "Complaints and questions", p: [
        "If you are unhappy with any part of your trip, please tell us as soon as possible so that we can put it right. You can reach us by phone, WhatsApp or the contact page.",
      ] },
    ],
    faqs: [
      f("How do I cancel my booking?", "Call or WhatsApp 0333 9850599 with your name and trip date. We confirm the cancellation to you in writing."),
      f("Do I pay anything online when I send the booking form?", "No. The website does not take online payments. Your quote explains how and when payment works for your trip."),
    ],
  },
];
export const legalPage = (slug) => LEGAL.find((x) => x.slug === slug);
