# MINHAJ WELDING — ERP + Estimation System (Phase 1)

Free stack: React + Vite + Tailwind | Node + Express + SQLite | Cloudflare Tunnel.

## Quick Start (Windows)
1. Node.js 18+ install karein (nodejs.org).
2. `install.bat` double-click (internet chahiye, sirf pehli baar).
3. `start.bat` double-click -> browser http://localhost:5173 khulega.
4. Default login (API): admin@minhajwelding.com / changeme123 (badal dein).

Detail: docs/SETUP.md | Formulas: docs/FORMULAS.md | API: docs/API_DOCS.md | Status: brain.md

## Phase 1 mein kya hai
Calculators (Door/Window/Bathroom/Roshandan chokat, Gate, Railing, Fiber), Rates + history, rate snapshot protection, Customers, Quotations (+PDF/WhatsApp/Email), Invoices + payments, Reports (basic), Settings (business, templates, icon replace).

## Phase 2 mein kya add hua
Login system (ab poora app login mangta hai), Users & Roles, Audit Log viewer, Expenses, Machinery Rental (double-booking se mehfooz), Catalog admin page (Categories/Styles add/edit/delete UI se), Quotations mein manual extra items (gate hardware, fiber frame charges waghera).

## Phase 3 mein kya add hua
Projects/BOQ (milestones, progress %, khud profit/margin calculate), Inventory (stock in/out, low-stock alert), Hardware/Addon Catalog (Quotation mein dropdown se select), Materials CRUD UI, Leads (website form ready — POST /api/leads public hai), role ke hisaab se menu ab chhupta hai.

## Phase 4 mein kya add hua
Media Library (asal file upload — images/videos/PDFs, search, kisi bhi cheez se assign), real 360° viewer (asal photos drag kar ke ghumayein, fake static image nahi), Website CMS (hero/services/gallery/testimonials/FAQs/footer sab edit hote hain), **asal public website `/site` par** (login ki zaroorat nahi, live content CMS se aata hai, contact form seedha Leads mein jata hai), Custom Field Builder (Customers/Projects/Measurements mein apni marzi ke fields — Customers page mein working example laga hua hai).

**Pehli baar login:** admin@minhajwelding.com / changeme123 — turant Users page se badal dein ya naya admin bana kar is wale ko disable kar dein.

## Login "Login failed" fix (Phase 3 patch)
- Backend ab database na milne par khud seed kar deta hai.
- CORS: localhost / 127.0.0.1 / LAN IP sab allowed.
- Frontend ab `/api` Vite proxy se backend se baat karta hai (koi CORS/port masla nahi).
- Login page ab wazeh batata hai: galat password ya server band.

## Login "server error 500" fix (Phase 3 patch 2)
- Wajah: purani database mein naye columns (jaise `users.is_active`) nahi thay.
- Ab backend har start par database ko `schema.sql` se compare kar ke missing columns/tables khud bana deta hai. Purana data safe rehta hai.
- Login email ab case-insensitive hai, aur error ki wazeh detail dikhti hai.

## Patch 3 - Cannot find module dotenv
- Pehle install.bat chalayen (zip mein node_modules nahi hota). better-sqlite3 ^12 (Node 24 ke liye).
