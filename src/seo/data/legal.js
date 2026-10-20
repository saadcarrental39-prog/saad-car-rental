// Legal and compliance pages. To change wording, edit the text here and run update.bat. Every page is in the footer, the sitemap and llms.txt.
// Rules (the build checks them): no prices, no refund percentages, no invented company facts, no "guarantee" / "best price" / "cheapest".
// Things the owner has NOT confirmed are written in a way that points to the quote, not as a number:
//   - refund share at each cancellation stage  -> edit REFUND_STAGES below when the percentages are decided
//   - a business email address                 -> set `email` in src/business.config.js and it appears on every legal page automatically
const f = (q, a) => ({ q, a });
export const LEGAL_UPDATED = "October 2026";

// Cancellation stages (24h / 12h / 6h before pickup). `share` is plain words. Put exact percentages here once decided, e.g. "80 percent of the advance".
export const REFUND_STAGES = [
  { when: "More than 24 hours before pickup", share: "The largest share of any advance is returned, or kept as credit for a new date if you prefer. The vehicle can usually be offered to another customer." },
  { when: "Between 24 and 12 hours before pickup", share: "A reduced share is returned, because the driver and vehicle are already planned for you." },
  { when: "Between 12 and 6 hours before pickup", share: "A small share is returned, because the day's plan is fixed and the vehicle is hard to offer again." },
  { when: "Less than 6 hours before pickup, or no-show", share: "The advance is normally not returned, because the vehicle and driver were kept for you." },
];

export const LEGAL = [
  // ------------------------------------------------------------------------------------------------ 1. privacy policy
  {
    slug: "privacy-policy", path: "/privacy-policy", short: "Privacy Policy",
    title: "Privacy Policy", h1: "Privacy Policy",
    description: "Saad Car Rental privacy policy: what details we collect for car rental with driver in Islamabad, how we use and share them, and your data protection rights.",
    ogA: "PRIVACY POLICY", ogB: "How we handle your details", eyebrow: "Legal",
    lead: "This is the Saad Car Rental privacy policy. It explains what data we collect when you book a car with a professional driver in Islamabad, why we collect it, who can see it and what you can ask us to do.",
    summary: [
      "We collect the details you give us (name, phone, email, trip details) and simple visit statistics.",
      "We use them to confirm your booking, give customer support and meet legal duties. We do not sell your details.",
      "Some services process data for us, for example WhatsApp and website analytics.",
      "You can ask to see, correct or delete your details at any time.",
    ],
    sections: [
      { h: "Who we are", p: [
        "This website is run by SAAD CAR RENTAL SERVICES, a car rental with professional driver (chauffeur) service at Office No 12, 3rd Floor, Shah Nawaz Plaza, G-11 Markaz, Islamabad, Pakistan. In this policy, \"we\", \"us\" and \"our\" mean SAAD CAR RENTAL SERVICES.",
        "We care about car rental Islamabad data protection: we ask only for what we need to arrange your trip and we keep it private.",
      ] },
      { h: "What data we collect", p: ["Depending on how you use the website we may collect:"], list: [
        "Details you give us: name, phone or WhatsApp number, email address, country, pickup and drop-off places, travel dates, number of passengers, the vehicle you prefer and any notes you write.",
        "Booking details: the booking message and receipt created with our Book Now form, and our reply.",
        "Partly completed forms: if you type your name, phone number or email into a form and leave before pressing send, the details may still reach us so that we can follow up.",
        "Visit information: the pages you open, device and browser type, approximate time of visit, and whether you pressed a Call, WhatsApp or Book button. A random visitor code stored in your browser counts visits. It does not contain your name.",
        "Calls and messages: your number and the content of messages when you call us or write on WhatsApp.",
      ] },
      { h: "How we use your data", p: ["We use your data to:"], list: [
        "confirm your booking, arrange the vehicle and driver, and send you a quote;",
        "give customer support before, during and after your trip;",
        "follow up on a booking you started but did not finish, when you gave us a way to contact you;",
        "understand which pages and services people use, so we can improve the website;",
        "keep the website secure and prevent misuse;",
        "meet legal duties in Pakistan where they apply to us.",
      ] },
      { h: "How we share your data", p: [
        "We do not sell your personal data and we do not share it with other businesses for their own marketing. We share data only with services that help us run the website and your booking:",
      ], list: [
        "WhatsApp: when you press a WhatsApp button, your own WhatsApp opens with a prepared message. Nothing is sent until you press Send, and WhatsApp then handles the chat under its own policy.",
        "Website analytics: we may use Google Analytics, Microsoft Clarity or Cloudflare Web Analytics to count visits. They receive anonymous usage figures under their own policies. Microsoft Clarity also records anonymous screen interactions (taps, scrolling, clicks) so we can improve the website; typed text is masked.",
        "Hosting and security: our hosting provider (Cloudflare) delivers the pages and stores the information sent through our forms.",
        "Payment providers: the website does not take online payment today. If we add it, the payment provider will process your payment details under its own policy and we will update this page first.",
        "Authorities: when the law of Pakistan requires us to.",
      ] },
      { h: "Cookies and local storage", p: [
        "Our website uses your browser's local storage for a visitor code, for the booking form and for your cookie choice. Read our cookie policy for the full list and how to switch things off.",
      ] },
      { h: "How long we keep your data", p: [
        "We keep enquiry and booking details for as long as we need them to handle your request, to answer questions about a past trip and to meet legal duties. Visit statistics are kept in summary form. Access is limited to our team through a private, password-protected area.",
      ] },
      { h: "Your rights", p: ["You can contact us at any time to:"], list: [
        "ask what details we hold about you (access);",
        "ask us to correct details that are wrong (correction);",
        "ask us to delete your details, unless the law requires us to keep them (deletion);",
        "ask us to stop contacting you about a trip you no longer need.",
      ] },
      { h: "Children", p: [
        "The website is for adults who arrange travel. We do not knowingly collect details about children, except the number of passengers you tell us about for a booking.",
      ] },
      { h: "Changes and contact", p: [
        "We may update this policy when our service or the law changes. The date at the top shows the last update. For questions about your data, call or WhatsApp us, use the contact page, or visit our office in G-11 Markaz, Islamabad.",
      ] },
    ],
    faqs: [
      f("Do you sell my phone number or personal details?", "No. We use your details to answer you and arrange your trip. We do not sell them and we do not give them to other businesses for marketing."),
      f("Which outside services receive my data?", "WhatsApp handles the chat once you send a message, and analytics tools such as Google Analytics, Microsoft Clarity or Cloudflare may receive anonymous visit figures. Our hosting provider stores form submissions."),
      f("How do I see or correct the details you hold?", "Call or WhatsApp us, or use the contact page, and give the name or number you used. We will show you what we hold and correct anything that is wrong."),
    ],
  },

  // ------------------------------------------------------------------------------------------------ 2. terms of service
  {
    slug: "terms-of-service", path: "/terms-of-service", short: "Terms of Service",
    title: "Terms of Service", h1: "Terms of Service",
    description: "Car rental terms Islamabad: Saad Car Rental booking terms covering bookings, drivers, vehicles, payment, liability and Pakistan governing law.",
    ogA: "TERMS OF SERVICE", ogB: "Booking terms for car with driver", eyebrow: "Legal",
    lead: "These are the Saad Car Rental booking terms. They explain how our car rental with driver works in Islamabad, what we expect from drivers, vehicles and customers, and how payment and responsibility are handled.",
    summary: [
      "Every vehicle is provided with a professional driver. We do not offer self-drive hire.",
      "A booking is confirmed only when our team confirms it to you. Sending a form is a request.",
      "Payment is by cash or bank transfer. The website does not take online payment yet.",
      "Out of Station trips need the driver's accommodation and meals to be provided by the customer.",
    ],
    sections: [
      { h: "About these terms", p: [
        "These terms apply to every request, quote and booking made with SAAD CAR RENTAL SERVICES and to your use of this website. By sending a booking request or using our service you agree to them. Some trips, such as weddings or long journeys, have extra terms written in your quote.",
      ] },
      { h: "Bookings", p: [
        "Sending the Book Now form, a WhatsApp message or a call is a request for a quote. We reply with availability and a quote for your route, dates and vehicle. A booking is confirmed only when we confirm it to you in writing, for example on WhatsApp.",
        "Book in advance where you can, especially for weddings, holidays and the summer travel season. An advance payment may be requested for some bookings, and this is stated in your quote. Please read our refund and cancellation policy for changes, cancellations and no-shows.",
      ] },
      { h: "Service types and the driver", p: [
        "Customers choose Local (inside Islamabad) or Out of Station (any trip that leaves Islamabad). The two are quoted differently.",
        "For Local bookings you choose whether you will provide the driver's accommodation and meals. If you do not, the car returns to our office after your schedule and is sent again at the agreed pickup time, and a food allowance for the driver is paid as set out when you book. For Out of Station trips, providing the driver's accommodation and meals for the whole trip is compulsory.",
      ] },
      { h: "Driver rules", p: ["Our drivers are experienced professionals. You can expect:"], list: [
        "a valid driving licence and a driver who follows traffic law;",
        "punctuality: the driver arrives at the agreed place and time, and tells you early if something delays him;",
        "safe routing: the driver chooses the safest practical route, and may change or shorten a route when weather, closures or security make it unsafe;",
        "reasonable requests for extra stops are welcome, and may change the quote, which we tell you before we go ahead.",
      ] },
      { h: "Vehicle rules", p: ["To keep our vehicles in good condition and everyone safe, passengers agree to:"], list: [
        "keep to the number of seats and use the seat belts;",
        "treat the vehicle with care and tell us about any damage; damage caused by passengers is charged at the actual cost of repair;",
        "avoid unlawful goods and anything that puts others at risk, and smoke only if the driver agrees;",
        "leave the vehicle reasonably clean; extra cleaning after unusual mess may be charged;",
        "ask in advance about fuel: whether fuel is included is stated in your quote.",
      ] },
      { h: "Payment terms", p: [
        "Payment is made in cash or by bank transfer, as agreed in your quote. The website does not take online payment at this time. We will update these terms before we add it.",
      ] },
      { h: "Delays and conditions on the road", p: [
        "Traffic, weather, road closures, landslides, snow and checkpoints can change travel times, especially in the northern areas. Times we mention are estimates. We do our best to be on time but we cannot control the road.",
      ] },
      { h: "Responsibility", p: [
        "We provide our service with reasonable care and skill. We are not responsible for delay or loss caused by events outside our control, such as weather, road closures, strikes, flight changes or government orders, and our responsibility for any claim is limited to the amount you paid for the trip, as far as the law allows.",
        "Please keep valuables and important documents with you. Nothing in these terms removes a right you have under Pakistani law that cannot be removed.",
      ] },
      { h: "Using this website and governing law", p: [
        "The website is for information and booking requests. The text, logo and photos belong to SAAD CAR RENTAL SERVICES or are used with permission. These terms are governed by the laws of Pakistan, and a disagreement we cannot settle by talking may be taken to the courts of Islamabad.",
      ] },
    ],
    faqs: [
      f("Is my booking confirmed when I send the form?", "No. The form is a request. The booking is confirmed when our team confirms the vehicle, driver and quote to you in writing."),
      f("Can I hire a car without a driver?", "No. Every vehicle is provided with a professional driver who stays with it for the whole booking."),
      f("How can I pay?", "By cash or bank transfer, as agreed in your quote. The website does not take online payment yet."),
    ],
  },

  // ------------------------------------------------------------------------------------------------ 3. refund and cancellation policy
  {
    slug: "refund-policy", path: "/refund-policy", short: "Refund Policy",
    title: "Refund and Cancellation Policy", h1: "Refund and Cancellation Policy",
    description: "Car rental cancellation policy Islamabad: Saad Car Rental refund policy with cancellation stages before pickup, no-show, weather and road closure rules.",
    ogA: "REFUND & CANCELLATION", ogB: "Clear stages before pickup", eyebrow: "Legal",
    lead: "Plans change. This Saad Car Rental refund policy and car rental cancellation policy for Islamabad explains how to cancel, what happens at each stage before pickup, and what we do when weather or road closures stop a trip.",
    summary: [
      "Tell us as early as you can by phone or WhatsApp. The earlier you tell us, the more of any advance we can return.",
      "Four stages apply: more than 24 hours, 24 to 12 hours, 12 to 6 hours, and less than 6 hours or no-show.",
      "If weather or a road closure stops the trip, we offer a new date or a refund for the unused part.",
      "Refunds are paid in cash or by bank transfer.",
    ],
    sections: [
      { h: "How to cancel or change a booking", p: [
        "Call us or send a WhatsApp message with your name, phone number and the date of your trip. We confirm the cancellation or change to you in writing. A change is final only when we confirm it. The website does not take online payment, so a refund concerns only an advance you have paid to us.",
      ] },
      { h: "Cancellation stages", p: [
        "The stage is counted from the moment you tell us to the agreed pickup time. The share we return depends on the stage, and the exact figure for your trip is written in your quote before you confirm.",
      ], stages: true },
      { h: "No-show", p: [
        "If the driver arrives at the agreed place and time and we cannot reach you, or you do not travel and have not told us, the booking is treated as a no-show and the less than 6 hours stage applies. Please call us if you are delayed so that the driver can adjust.",
      ] },
      { h: "Weather and road closures", p: [
        "Trips to the northern areas depend on weather, snow, landslides and road closures. If the trip cannot go ahead safely before or during the journey because of these, we offer you a new date, or a refund for the part of the trip that was not used. We will explain the options and agree them with you, and the driver's advice on safety is final on the day.",
      ] },
      { h: "Changes made by us", p: [
        "If a vehicle becomes unavailable we contact you as early as we can and offer an equivalent vehicle or another suitable arrangement. If you do not accept it, any advance you paid is returned in full.",
      ] },
      { h: "How refunds are paid", p: [
        "Refunds are paid in cash at our office or by bank transfer to an account in your name, whichever you choose. We aim to complete the refund soon after we confirm the cancellation, and we tell you the expected date when we confirm.",
      ] },
      { h: "Questions and complaints", p: [
        "If you are unhappy with any part of your trip or a refund, please tell us as soon as possible. You can reach us by phone, WhatsApp or the contact page, and we will work to put it right.",
      ] },
    ],
    faqs: [
      f("Until when can I cancel and get most of my advance back?", "The earlier the better. More than 24 hours before pickup is the stage where the largest share of any advance is returned."),
      f("What happens if I do not turn up?", "A no-show is treated like a cancellation in the last stage, because the vehicle and driver were kept for you. Call us if you are delayed so we can adjust."),
      f("What if snow or a landslide closes the road to Hunza or Skardu?", "We offer a new date or a refund for the unused part of the trip, and agree the details with you. The driver's safety advice is final on the day."),
    ],
  },

  // ------------------------------------------------------------------------------------------------ 4. cookie policy
  {
    slug: "cookie-policy", path: "/cookie-policy", short: "Cookie Policy",
    title: "Cookie Policy", h1: "Cookie Policy",
    description: "Saad Car Rental cookie policy: which cookies and local storage our car rental website uses, why, third-party services, and how to switch them off.",
    ogA: "COOKIE POLICY", ogB: "What we store and why", eyebrow: "Legal",
    lead: "This is the Saad Car Rental cookie policy. It lists what our website stores in your browser, why, which outside services may set cookies, and how you can turn them off.",
    summary: [
      "The website works with only the storage it needs: a visitor code, your form entries and your cookie choice.",
      "Visit-statistics tools such as Google Analytics, Microsoft Clarity and Cloudflare Web Analytics load only if you accept.",
      "Cloudflare may set security cookies that keep the website safe and fast.",
      "You can block or delete cookies in your browser settings at any time.",
    ],
    sections: [
      { h: "What cookies and local storage are", p: [
        "Cookies are small text files saved by your browser. Local storage is a similar space in your browser. Websites use them to remember things between pages and visits.",
      ] },
      { h: "What this website stores", p: ["We use the following."], list: [
        "Essential storage: a random visitor code used to count visits without your name, the details you type into our booking form so they are not lost if you reload, and your cookie choice. The website needs these to work properly.",
        "Analytics (only if you accept): tools such as Google Analytics, Microsoft Clarity or Cloudflare Web Analytics, which count visits, show which pages are useful and (Clarity) record anonymous screen interactions with typed text masked. They may set cookies.",
        "Security and performance: our hosting provider, Cloudflare, may set cookies to protect the website from attacks and to deliver pages quickly.",
        "Session storage: short-term storage that is cleared when you close the tab, used to remember small things such as the last review figure shown.",
      ] },
      { h: "Why we use them", p: [
        "We use essential storage so the booking form and the site work. We use analytics to improve pages and services. We use security cookies to keep the website available and safe. We do not use cookies to show you advertising.",
      ] },
      { h: "Third-party cookies", p: [
        "Google (Analytics, and Google Maps links) and Cloudflare are outside companies. When they set cookies, those cookies are controlled by them and covered by their own privacy and cookie policies. You will not see third-party analytics cookies unless you accept them in the cookie notice.",
      ] },
      { h: "Your choices and how to disable cookies", p: [
        "The cookie notice lets you accept or decline analytics. You can change your choice by clearing this site's stored data in your browser, after which the notice appears again.",
        "You can also block or delete cookies in your browser settings. Most browsers let you block all cookies, block third-party cookies or delete cookies when you close the browser. If you block essential storage, parts of the website, such as the booking form, may not work as expected.",
      ] },
      { h: "Updates and contact", p: [
        "We will update this policy if we change what the website stores. Questions about cookies are welcome by phone, WhatsApp or the contact page. See our privacy policy for how we handle your data.",
      ] },
    ],
    faqs: [
      f("Does this website use advertising cookies?", "No. We do not use cookies to show advertising. Optional analytics load only if you accept them in the cookie notice."),
      f("How do I turn cookies off?", "Use your browser settings to block or delete cookies, or decline analytics in the cookie notice. The essential parts of the website still work in most cases."),
    ],
  },

  // ------------------------------------------------------------------------------------------------ 5. accessibility
  {
    slug: "accessibility", path: "/accessibility", short: "Accessibility",
    title: "Accessibility Statement", h1: "Accessibility Statement",
    description: "Saad Car Rental accessibility statement: our aim to meet WCAG 2.1 AA, image text, colour contrast, keyboard use, screen readers, and how to report a problem.",
    ogA: "ACCESSIBILITY", ogB: "A website everyone can use", eyebrow: "Legal",
    lead: "Saad Car Rental accessibility: we want everyone to be able to find a car with a driver and book it. This statement explains our aim, what we have done and how to tell us about a problem.",
    summary: [
      "We aim to meet WCAG 2.1 level AA on every page.",
      "Images have text descriptions, text has strong colour contrast, and the site works with a keyboard.",
      "Automated checks score the website at the top level, and we have not yet had a full manual audit by an outside expert.",
      "If something is hard to use, tell us and we will fix it or help you another way.",
    ],
    sections: [
      { h: "Our aim", p: [
        "We aim to make this website follow the Web Content Accessibility Guidelines (WCAG) 2.1 at level AA. Accessibility is part of how we build and check every page, not an extra added at the end.",
      ] },
      { h: "What we have done", p: ["Our work includes:"], list: [
        "Text descriptions (alt text) on images, so people who cannot see a picture still get its meaning, and decorative images are marked so that screen readers skip them.",
        "Colour contrast: text and buttons use strong contrast between text and background, and information is never shown by colour alone.",
        "Keyboard use: you can reach links, buttons and forms with the Tab key, there is a skip link to the main content, and the focus outline stays visible.",
        "Screen readers: pages use clear headings, landmarks and labelled form fields, and form errors are announced.",
        "Readable text: text can be enlarged in the browser, and pages work on phones, tablets and computers.",
      ] },
      { h: "How we test", p: [
        "We run automated accessibility checks each time we change the website, and the website currently scores at the top level in those checks. Automated tools find many problems, but not all of them, so we also try pages by keyboard and with real devices. We have not yet commissioned a full manual audit from an outside specialist.",
      ] },
      { h: "Known limits", p: [
        "Some parts come from other companies, for example map links and WhatsApp, and we cannot change how they work. Photos of vehicles are shown as pictures, with their name and details written in text next to them.",
      ] },
      { h: "Help and feedback", p: [
        "If you find a part of the website hard to use, or you need information in another way, please tell us. Call or WhatsApp us, use the contact page, or visit our office in G-11 Markaz, Islamabad. Tell us the page, what went wrong and the device or assistive tool you use. We will reply, fix the problem where we can, and always help you book by phone or WhatsApp if the website does not work for you.",
      ] },
    ],
    faqs: [
      f("Can I book without using the website form?", "Yes. You can call us or send a WhatsApp message and our team will take your booking details and reply with a quote."),
      f("How do I report an accessibility problem?", "Call or WhatsApp us, or use the contact page. Tell us the page, what went wrong and the device or tool you use, and we will work on a fix."),
    ],
  },

  // ------------------------------------------------------------------------------------------------ 6. data deletion
  {
    slug: "data-deletion", path: "/data-deletion", short: "Data Deletion",
    title: "Data Deletion Request", h1: "Data Deletion Request",
    description: "Saad Car Rental data deletion: how to ask us to delete your name, phone, email and booking details, what we remove, and how long it takes.",
    ogA: "DATA DELETION", ogB: "Ask us to delete your details", eyebrow: "Legal",
    lead: "You can ask Saad Car Rental to delete the details you gave us. This page explains how to send a data deletion request, what we delete and how long it takes.",
    summary: [
      "Ask by WhatsApp, phone or the contact page, and by email if we list one.",
      "Tell us the name and number or email you used, so we can find your details.",
      "We delete your enquiry, contact and booking details, except what the law requires us to keep.",
      "We complete the request within 7 to 14 days and confirm to you.",
    ],
    sections: [
      { h: "How to request deletion", p: [
        "Send us a message on WhatsApp or call, or use the contact page. If we publish an email address on this website, you can email it as well. Please write \"data deletion request\", your full name and the phone number, WhatsApp number or email you used when you contacted us.",
      ] },
      { h: "How we check it is you", p: [
        "To protect your privacy we confirm that the request comes from the person it concerns. We may ask you to message from the same number you used before or to confirm a detail of your enquiry. We do not ask for card numbers or passwords.",
      ] },
      { h: "What we delete", p: ["When we accept your request we delete:"], list: [
        "your name, phone or WhatsApp number, email address and country;",
        "your enquiry, quote and booking details, including pickup places, dates and notes;",
        "details saved from forms you started but did not finish;",
        "the link between you and the visit statistics, where it can be identified.",
      ] },
      { h: "What we may keep", p: [
        "We may keep limited records where the law of Pakistan requires it, for example accounts or a record of a completed trip, for as long as the law asks. We keep summary visit statistics that do not identify you. Messages in your own WhatsApp app stay on your phone and can be deleted by you there.",
      ] },
      { h: "How long it takes", p: [
        "We complete deletion requests within 7 to 14 days from the day we confirm your identity. When it is done we tell you by the same channel you used. If we need more time or cannot delete something, we explain why.",
      ] },
      { h: "Other rights", p: [
        "You can also ask to see the details we hold, or to correct them. See our privacy policy for all your rights, and the form consent notice for the details our forms collect.",
      ] },
    ],
    faqs: [
      f("How long does a data deletion request take?", "We complete requests within 7 to 14 days after we confirm your identity, and we tell you when it is done."),
      f("Do I need to give a reason?", "No. You do not need to give a reason. Tell us your name and the number or email you used and we will handle the request."),
    ],
  },

  // ------------------------------------------------------------------------------------------------ 7. contact consent
  {
    slug: "contact-consent", path: "/contact-consent", short: "Form Consent",
    title: "Form Consent Notice", h1: "Form Consent Notice",
    description: "Saad Car Rental form consent notice: what details our booking and contact forms collect, why we collect them, how long we keep them, and your choices.",
    ogA: "FORM CONSENT", ogB: "What our forms collect and why", eyebrow: "Legal",
    lead: "This short notice explains what happens to the details you type into the Saad Car Rental booking and contact forms, and why we ask for them.",
    summary: [
      "Our forms collect name, WhatsApp or phone, email, country and trip details.",
      "We use them only to answer you and arrange your trip.",
      "We keep them as long as needed for your request, and delete them on request.",
      "Ticking the Privacy Policy box shows that you have read our privacy policy.",
    ],
    sections: [
      { h: "What our forms collect", p: ["The booking, popup and contact forms ask for:"], list: [
        "your name, WhatsApp or phone number, email address and country;",
        "trip details: pickup and destination, dates, number of passengers, vehicle and service you choose, and how the driver's accommodation and meals will be arranged;",
        "any notes you write.",
      ] },
      { h: "Why we ask", p: [
        "We ask for these details to answer your enquiry, confirm the vehicle and driver, send a quote, contact you about your trip and, where needed, meet legal duties. We do not use them for anything unrelated and we do not sell them.",
      ] },
      { h: "Saving what you type", p: [
        "If you type your details and leave before pressing send, they may still reach us, so that our team can contact you about the trip you were planning. You can ask us to delete them at any time.",
      ] },
      { h: "How long we keep the details", p: [
        "We keep the details for as long as we need them to handle your request and any later question about your trip, and for as long as the law asks. You can ask us to delete them earlier using the data deletion page.",
      ] },
      { h: "Your choices", p: [
        "The Privacy Policy checkbox on each form shows that you have read our privacy policy. Read it for your rights to see, correct or delete your details. You can also contact us by phone or WhatsApp instead of using a form.",
      ] },
    ],
    faqs: [
      f("Do I have to tick the Privacy Policy box?", "Yes, to send a booking or contact form. It shows you have read how we handle your details. You can also call or WhatsApp us instead."),
      f("Can I withdraw my consent?", "Yes. Tell us by phone, WhatsApp or the contact page and we will stop using your details and delete them if you ask."),
    ],
  },

  // ------------------------------------------------------------------------------------------------ 8. unsubscribe
  {
    slug: "unsubscribe", path: "/unsubscribe", short: "Unsubscribe",
    title: "Email Unsubscribe", h1: "Email and Message Unsubscribe",
    description: "Unsubscribe from Saad Car Rental emails and WhatsApp messages: how to tell us to stop, what happens next, and which booking messages you will still get.",
    ogA: "UNSUBSCRIBE", ogB: "Stop emails and messages", eyebrow: "Legal",
    lead: "Do not want to hear from Saad Car Rental any more? This page explains how to unsubscribe from emails and WhatsApp messages and what happens next.",
    summary: [
      "We do not send a regular newsletter. We contact you only about your enquiry or booking.",
      "To stop messages, reply STOP or tell us by WhatsApp, phone or the contact page.",
      "We note your request and stop contacting you about offers.",
      "Messages about a trip you have booked continue until the trip ends.",
    ],
    sections: [
      { h: "How to unsubscribe", p: [
        "Reply STOP to any email or WhatsApp message from us, or send us a short message saying \"unsubscribe\" with your name and the email address or number you want removed. You can also call us or use the contact page. If we publish an email address on this website, you can write to it as well.",
      ] },
      { h: "What happens next", p: [
        "We record your request and stop sending you messages about offers or follow-ups. We will confirm by the same channel. If you contact us again about a new trip, we will answer that enquiry, and will not treat it as a request to restart marketing.",
      ] },
      { h: "Messages you may still receive", p: [
        "If you have an active booking, we will still contact you about it, for example to confirm the pickup time or tell you about a delay, until the trip is finished. These are service messages, not marketing.",
      ] },
      { h: "Delete your details as well", p: [
        "Unsubscribing stops messages but keeps your enquiry record. If you want your details removed from our records, use the data deletion page.",
      ] },
    ],
    faqs: [
      f("Do you send a newsletter?", "No. We do not send a regular newsletter. We contact you about your enquiry or booking, and sometimes follow up when you started a form."),
      f("Will I still get messages about my booking?", "Yes, until the trip ends. These are service messages about pickup times and changes, not marketing."),
    ],
  },

  // ------------------------------------------------------------------------------------------------ disclaimer (kept)
  {
    slug: "disclaimer", path: "/disclaimer", short: "Disclaimer",
    title: "Disclaimer", h1: "Website and Travel Disclaimer",
    description: "Important notes about the information on this website: availability, road and weather conditions, third-party links and travel advice.",
    ogA: "DISCLAIMER", ogB: "Please read before you travel", eyebrow: "Legal",
    lead: "We work to keep this website accurate and useful. Travel in Pakistan depends on things nobody can control, so please read these notes before you plan.",
    summary: [
      "Website information is general and may change. Your quote and our confirmation are what apply to your trip.",
      "Road, weather and security conditions can change travel plans, especially in the north.",
      "We do not give visa, immigration, legal, medical or insurance advice.",
      "Links and reviews from other companies are outside our control.",
    ],
    sections: [
      { h: "General information only", p: [
        "The pages on this website describe our services, vehicles, routes and destinations in general terms. We take care to keep them correct, but we cannot promise that every detail is complete or up to date at the moment you read it. If anything on the website differs from your written quote or our confirmation, the quote and the confirmation apply.",
      ] },
      { h: "Availability and vehicles", p: [
        "Vehicles and drivers are limited and are confirmed on a first come, first served basis after we reply to you. A vehicle shown in a photo may be in use on your dates. In that case we offer an equivalent vehicle of the same class and ask you before we proceed.",
      ] },
      { h: "Roads, weather and travel times", p: [
        "Journeys to Murree, Naran, Hunza, Skardu, Swat and other mountain areas depend on weather, snow, landslides, road works and closures. Passes and roads can close with little notice and travel can take longer than expected. Times and seasons on this website are estimates for planning, and your driver advises on the safest option on the day.",
      ] },
      { h: "Travel advice, permits and documents", p: [
        "We provide vehicles with drivers. We do not provide visa, immigration, legal, medical, insurance or security advice. Visitors from abroad should check the latest entry and travel requirements with official sources before they travel.",
      ] },
      { h: "Links, maps and reviews from other companies", p: [
        "The website links to services from other companies, for example Google Maps and WhatsApp, and shows ratings from our Google business listing. We do not control those services or their content.",
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
];
export const legalPage = (slug) => LEGAL.find((x) => x.slug === slug);
