# BUSINESS INFORMATION REQUIRED  [BUSINESS CONFIRMATION REQUIRED]

Nothing below was guessed. Until you give it, the site simply does not show it. Put each answer in `src/business.config.js` (one place; header, footer, schema, previews and sitemap update by themselves).

1. E-mail address (shown in schema and contact once added)
2. Legal business name
3. Business hours (never guessed; add to `businessHours`)
4. Map coordinates (latitude / longitude from Google Maps, add to `geo`)
5. Social profile URLs: Facebook, Instagram, TikTok, YouTube (`socialProfiles`; become schema `sameAs` automatically)
6. Real photos for **Range Rover** and **Coaster** (pages say "photo coming soon, available on request")
7. Seating, luggage and model-year per vehicle (not stated anywhere until confirmed)
8. **Routes and cities you truly serve.** Live now: Islamabad, Rawalpindi, Lahore, Peshawar, Faisalabad, Multan, Murree, Abbottabad, Swat, Naran, Chitral, Gilgit, Hunza, Skardu, Muzaffarabad and 15 destinations (Nathia Gali, Shogran, Babusar Top, Kalam, Malam Jabba, Kumrat, Attabad Lake, Khunjerab, Fairy Meadows, Deosai, Naltar, Astore, Neelum Valley, Shigar, Khaplu). If any is NOT a trip you do, set its `status` to `"draft"` in `src/seo/data/places.js` and the page disappears (no page, no sitemap, no links).
9. Do you pick up in cities other than Islamabad / Rawalpindi (Lahore, Peshawar ...)? Pages currently say "tell us and we will confirm". Draft routes waiting for your answer: Lahore/Peshawar/Faisalabad/Multan to Murree, Naran, Hunza, Skardu, Swat; Islamabad to Karachi, Quetta, Gwadar, Hyderabad, Sukkur, Sialkot, Gujranwala, Bahawalpur, Sargodha, Jhelum, Gujrat, Mardan, Nowshera, Kohat, Mansehra, Mirpur, Rawalakot.
10. Airports: only Islamabad is published. Add Lahore, Peshawar, Karachi ... only if you really offer them. Also: do you meet passengers inside arrivals, and do you track flights? (The page says neither.)
11. Pricing rules (no prices are shown anywhere; every page says call or WhatsApp for a quote)
12. Review the destination facts once (season, road, jeep stages) with your drivers; they were written from general knowledge and contain no distances, times or prices.
13. Google Analytics 4 ID and/or Cloudflare Web Analytics token (`VITE_GA4_ID`, `VITE_CF_BEACON`)
