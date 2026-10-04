# MINHAJ WELDING — PROJECT BRAIN

## Last Updated: 2026-09-28 00:00:00

## Business (LOCKED)
MINHAJ WELDING | Owners: Muhammad Nehal 0331 0092592, Muhammad Minhaj 0331 5214444 | Areas: Hangu, Kohat, Thall, Doaba, Karak
Colors LOCKED: bg #FFFFFF, text #000000/#1A1A1A, buttons #2563EB (hover #1E40AF) white text. Flat UI, no gradients.

## Project Structure
minhaj-welding/
- backend/ (Express + SQLite): src/{routes,services,calculations,models,middleware,templates}, database/{schema.sql,seed.js}, tests/acceptance.js
- frontend/ (React+Vite+Tailwind): src/{pages,components,services}, public/icons (+default/)
- cloudflare/ (tunnel guide), docs/, install.bat, start.bat

## Phase Status
### Phase 1 — code written, fixed after owner's first test run
- [x] DB schema + seed
- [x] Calc engine: door, bathroom, roshandan, gate, railing, fiber (acceptance tests pass in sandbox)
- [~] Window chokat: engine exists but 5x5/2 Laar example gives 45.00 vs expected 49.50 — OWNER RULE NEEDED
- [x] Rates + history + snapshot protection + audit_log
- [x] Measurements (preview/save/duplicate), Customers, Quotations, Invoices+Payments
- [x] PDF (Puppeteer), WhatsApp (wa.me), Email (Nodemailer), templates editable in Settings
- [x] Icon replace (upload/reset), bundled default icons
- [x] Frontend pages: Dashboard, Calculators(6), Rates, Customers, Quotations(+detail), Invoices, Reports(basic), Settings
- [x] FIXED: postcss.config.js / tailwind.config.js renamed to .cjs (package.json has "type":"module", CommonJS config files were crashing Vite on owner's PC)

### Phase 2 (this ZIP) — code written, NOT yet run on owner's PC
- [x] Login page + AuthContext + ProtectedRoute (whole app now requires login)
- [x] JWT auth enforced (requireAuth) on all mutating routes: rates value-change, settings, catalog CRUD, icons upload, measurements save, quotations create, invoices/payments
- [x] Users & Roles page (Module 19 — basic): super_admin/admin can create users, assign role, enable/disable. Roles list: super_admin, admin, manager, estimator, project_manager, site_supervisor, accounts, inventory, viewer. NOT yet: per-role UI restrictions (any logged-in user still sees all nav items; only the API enforces role on sensitive routes)
- [x] Audit Log viewer page (Module 20) — shows rate changes so far; other entity types not yet writing to audit_log (only rates.updateRateValue does)
- [x] Expenses module (Module 13): categories + expense CRUD + simple total
- [x] Machinery Rental (Module 12): machines, bookings, double-booking prevention (overlap check on start_at/end_at), status flow available→reserved→rented→available
- [x] Catalog admin page (Categories/Styles CRUD from the UI — Module: free-hand editable styles) — Materials CRUD still backend-only (no UI yet)
- [x] Quotations: extra_items (manual line items) supported — covers gate hardware, fiber frame/pipe charges, transport, anything not tied to a saved measurement
- [ ] Untested: npm install, PDF generation, email, login flow, machinery booking, expenses — sandbox had no network/DB runtime

### Owner-side patch (applied on owner's PC, adopted into this ZIP as new baseline)
- [x] Login "failed"/"500" fully diagnosed and fixed: DB auto-seeds if missing on server start; auto-migration in db.js compares live DB against schema.sql and ALTER TABLE ADD COLUMNs / creates missing tables on every start (old data never deleted) — this is what actually caused the 500 (old DB predated some columns); login email lookup now case-insensitive + trimmed + wrapped in try/catch with a real error message instead of a silent crash
- [x] CORS now allows localhost/127.0.0.1/LAN IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x) automatically, in addition to CORS_ORIGINS — so opening the app via a LAN IP no longer breaks login
- [x] Frontend switched to a Vite dev-server proxy (/api, /uploads → localhost:3001) so the browser talks to a relative path with zero CORS exposure locally; VITE_API_URL left empty for local dev
- [x] better-sqlite3 bumped 11→^12.2.0 (Node 24 compatibility — owner's PC has Node v24)
- [x] install.bat / start.bat hardened: error-checked steps with a clear fail message, PUPPETEER_SKIP_DOWNLOAD=1 (faster/more reliable install, Puppeteer's bundled Chromium wasn't essential to get running), auto-copies .env, start.bat checks node_modules exists first
- [x] LoginPage.jsx now distinguishes "wrong password" vs "backend returned an error" vs "can't reach backend at all" with a specific Urdu/English message for each

### Phase 3 — code written, previously untested; now confirmed running after owner-side patch above
- [x] Per-role nav filtering: sidebar/bottom-nav now hides items the logged-in role can't use (e.g. estimator doesn't see Users/Settings)
- [x] Projects/BOQ (Module 11): projects, BOQ line items (material/labour/equipment/transport/subcontractor), milestone payments, progress log (%, note), documents (path only, no upload UI yet), auto profit/margin (contract_value − actual_cost, where actual_cost = BOQ actual_cost + linked expenses)
- [x] Inventory (Module 14): items, stock movements (purchase/adjustment/used_on_project/sold), running quantity always kept in sync via transaction, low-stock flag
- [x] Reusable Hardware/Addon Catalog: price list (e.g. Gate Handle Rs.500) — selectable from a dropdown when adding Quotation extra items, so prices aren't retyped each time
- [x] Materials CRUD UI added to Catalog page (was backend-only before)
- [x] Leads (Module 15): POST /api/leads is public (no auth) — ready for a future public website form; admin Leads page lists/contacts/converts to Customer
- [x] Reports: added Expenses total, Net (Collected − Expenses), and a Projects contract-value table; full profit/margin per project lives on the Project detail page

### Phase 4 (this ZIP) — code written, NOT yet run on owner's PC

### Phase 4 (this ZIP) — code written, NOT yet run on owner's PC
- [x] Generic file upload (Media Library, Module 17): multer-based upload to uploads/media/, tracked in media_assets (title/tags/search/assign to any entity)
- [x] Real 360° viewer (Module 18): drag-to-rotate through an actual uploaded photo sequence (group_key + frame_index) — not a static image. Component: frontend/src/components/ThreeSixtyViewer.jsx
- [x] Website CMS (Module 16): hero/services/projects-gallery/testimonials/FAQs/footer — all free-hand blocks, editable from Admin > Website
- [x] Public website (Module: the actual public site): frontend route /site, NO login required, reads live content from GET /api/cms/public, posts contact form to POST /api/leads (already public from Phase 3) — this closes the loop Phase 3's Leads module was waiting on
- [x] Custom Field Builder: define extra fields per entity type (customer/project/measurement) from Admin > Custom Fields; CustomFieldsEditor component wired into the Customers page as a working example (Project/Measurement pages can reuse the same component — not yet added there)
- [ ] Untested: everything above — sandbox had no network/DB runtime; multer file uploads especially need a real-browser test

### Later phases (NOT built yet)
Urdu UI toggle (i18n), CustomFieldsEditor wired into Project/Measurement detail views (component exists, just not dropped into those two pages yet), project document/progress-photo upload UI using the new Media Library (currently still path-only in those two spots), audit_log coverage beyond rates, advanced/exportable reports (PDF/Excel), Aluminium/Construction-specific calculators, PDF template editor UI, public website theming/multiple pages (currently one single-page site), image optimization/thumbnails for Media Library (originals are served as-is).

## Change Log
<!-- CHANGELOG -->
- 2026-09-28 — Phase 4: Media Library (real uploads), real 360° viewer, Website CMS + live public site + working lead form, Custom Field Builder
- 2026-09-28 — Cleanup: removed stray literal-brace directories left over from an early shell command (backend/src/{...}, frontend/src/{...}, uploads/{...}) — harmless but removed for a clean ZIP
- 2026-09-28 — Phase 3: projects/BOQ/milestones/progress, inventory, addon catalog, leads, per-role nav filtering, reports profit/expense summary
- 2026-09-28 — Phase 2: auth+roles, expenses, machinery rental, catalog admin UI, audit log viewer, quotation extra line items
- 2026-09-28 — Phase 1 fix: postcss/tailwind config renamed .js → .cjs (ESM/CommonJS crash on owner's PC)
- 2026-09-28 — Phase 1 scaffold created

## Rate History (Central)
| Date | Category | Old | New | By |
|---|---|---|---|---|
<!-- RATE_HISTORY -->

## Formula Versions
| Code | Version | Style |
|---|---|---|
| CHK-D-001 | v1 | Door Standard |
| CHK-B-001 | v1 | Bathroom Standard |
| WIN-L-002/003 | v1 | Window 2/3 Laar (unconfirmed) |
| GT-001..004 | v1 | Gate |
| RL-001/002 | v1 | Railing |
| FB-001/002 | v1 | Fiber |

## Known Issues
- Window formula unconfirmed (see above)
- Only rate changes write to audit_log so far; measurement overrides, quotation/invoice edits, project/inventory changes don't yet
- Icons upload assumes frontend/ next to backend/
- Project documents and progress photos still store a plain file_path string — the new Media Library upload endpoint exists (POST /api/media/upload) but isn't wired into those two forms yet; easiest next step is swapping their text input for a file picker that uploads then saves the returned URL
- Media Library has no image thumbnailing/resizing — large photos are served at full size, fine for a handful of items but worth revisiting once there are hundreds
- Public website (/site) is a single page — no routing between multiple pages, no per-page SEO meta yet
- CHANGE THE DEFAULT ADMIN PASSWORD (admin@minhajwelding.com / changeme123) before real use

## Pending Tasks
- Owner: confirm Window/Roshandan laar rules; set real rates; test Phase 4 on real PC — especially file uploads (Media Library, 360° sets) and the public /site page + its contact form actually creating a Lead
- Next: Phase 5 — Urdu toggle, wire CustomFieldsEditor into Projects/Measurements, real file-upload pickers for project documents/progress photos, audit_log coverage beyond rates, exportable reports
