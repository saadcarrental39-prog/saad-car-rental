# API (base: /api)
- GET /health
- POST /auth/login, /auth/change-password
- /catalog/categories | /catalog/styles (+/formula-keys, /:id/duplicate) | /catalog/materials  — GET/POST/PUT/DELETE
- /rates — GET, POST; PUT /rates/:id/value {new_rate, reason}; GET /rates/:id/history; DELETE (soft)
- /measurements — POST /calculate (preview), POST / (save), GET, GET /:id, DELETE, POST /:id/duplicate
- /customers — CRUD (?search=)
- /quotations — GET, GET /:id, POST {customer_id, measurement_ids[], discount_amount, notes}, PUT /:id/status, DELETE
- /invoices — GET, GET /:id, POST /from-quotation/:qid, POST /:id/payments
- /settings — GET, PUT
- /communication — POST /quotation/:id/pdf, POST /whatsapp-link, POST /email
- /icons — GET, POST /:name (multipart file), DELETE /:name

## Phase 2 additions
- Auth: mutating requests now need `Authorization: Bearer <token>` from POST /auth/login. Read (GET) endpoints stay open unless noted.
- /expenses, /expenses/categories — GET open, POST/DELETE need login
- /machinery, /machinery/:id/bookings, /machinery/bookings/all, /machinery/bookings/:id/status — booking POST prevents overlapping time ranges (409 on conflict)
- /users, /users/roles — super_admin/admin only
- /audit-log — super_admin/admin/manager only
- POST /quotations now also accepts `extra_items: [{description, quantity, unit, rate}]` for hardware/frame/manual charges not tied to a saved measurement

## Phase 3 additions
- /projects — GET, GET /:id (full detail: boq, milestones, progress, documents, expenses, summary{estimatedCost,actualCost,profit,margin}), POST, PUT /:id, DELETE
- /projects/:id/boq — POST; PUT/DELETE /projects/boq/:boqId
- /projects/:id/milestones — POST; PUT /projects/milestones/:milestoneId {status}
- /projects/:id/progress — POST {percent_complete, note, photo_path}
- /projects/:id/documents — POST {title, file_path}
- /inventory — GET (adds low_stock flag), POST, PUT/:id, DELETE/:id
- /inventory/:id/movements — POST {change_qty, reason, project_id}; GET history
- /addons — GET (?category_id=), POST, PUT/:id, DELETE/:id — reusable hardware/extras price list
- /leads — POST is PUBLIC (no auth, for a future public website contact form); GET/PUT status/convert need login

## Phase 4 additions
- /media — GET (?search=&kind=&assigned_type=&assigned_id=&group_key=), POST /upload (multipart, field "files", optional group_key for 360 sets), PUT/:id, DELETE/:id, GET /groups/360
- /cms/public — PUBLIC, no auth. Returns { sections: {hero:[],service:[],project:[],testimonial:[],faq:[],footer:[]}, settings } for the live website
- /cms/blocks — admin CRUD (GET ?section=, POST, PUT/:id, DELETE/:id)
- /custom-fields/defs — GET ?entity_type=, POST, PUT/:id, DELETE/:id (entity_type: customer/project/measurement)
- /custom-fields/values/:entityType/:entityId — GET (defs + current values merged), PUT { values: {defId: value} }
- Public website: frontend route /site (no login) renders from /api/cms/public and posts to /api/leads
