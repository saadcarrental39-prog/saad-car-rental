-- =====================================================================
-- MINHAJ WELDING - DATABASE SCHEMA
-- Phase 1: Core estimation engine + rates + customers + quotations
-- Engine: SQLite (better-sqlite3)
-- NOTE: This schema will grow in later phases (projects, machinery,
-- inventory, roles/permissions, audit log, CMS, media library).
-- Every table designed to be "free-hand editable" from the admin UI.
-- =====================================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------
-- USERS (basic auth - roles expand in Phase 3)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    phone         TEXT,
    email         TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'admin', -- super_admin/admin/manager/estimator/pm/site_supervisor/accounts/inventory/viewer
    is_active     INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- CATEGORIES (free-hand editable classification used by rates & styles)
-- e.g. Chokat, Window, Bathroom, Gate, Railing, Fiber, Aluminium...
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    unit_type   TEXT NOT NULL DEFAULT 'running_ft', -- running_ft / sq_ft / piece / hour / day
    is_active   INTEGER NOT NULL DEFAULT 1,
    sort_order  INTEGER DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- STYLES (per category) - e.g. Door Standard, Window 2-Laar, Gate CNC
-- Fully editable: admin can add/edit/delete/duplicate any style.
-- formula_json holds the calculation recipe used by the calc engine.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS styles (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id    INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name           TEXT NOT NULL,               -- "Window - 2 Laar"
    code           TEXT,                        -- "WIN-L-002" (for brain.md tracking)
    formula_key    TEXT NOT NULL,                -- maps to a function in calculations/*.js
    formula_version INTEGER NOT NULL DEFAULT 1,
    config_json    TEXT NOT NULL DEFAULT '{}',   -- style-specific config (multipliers, defaults)
    is_active      INTEGER NOT NULL DEFAULT 1,
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- MATERIALS / PROFILES - e.g. 5 Inch, 10 Inch, 16 Gauge, 1.5x1.5 Pipe
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS materials (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name        TEXT NOT NULL,
    unit        TEXT,
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- RATES (current live rate per category/style/material)
-- Historical protection handled via rate_history table below.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rates (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id     INTEGER NOT NULL REFERENCES categories(id),
    style_id        INTEGER REFERENCES styles(id),
    material_id     INTEGER REFERENCES materials(id),
    unit            TEXT NOT NULL,               -- running_ft / sq_ft / piece
    min_rate        REAL,
    max_rate        REAL,
    current_rate    REAL NOT NULL,
    effective_from  TEXT NOT NULL DEFAULT (datetime('now')),
    effective_until TEXT,
    status          TEXT NOT NULL DEFAULT 'active', -- active/inactive
    notes           TEXT,
    created_by      INTEGER REFERENCES users(id),
    updated_by      INTEGER REFERENCES users(id),
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- RATE HISTORY (immutable log - every rate change appended here)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rate_history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    rate_id     INTEGER NOT NULL REFERENCES rates(id),
    old_rate    REAL,
    new_rate    REAL NOT NULL,
    changed_by  INTEGER REFERENCES users(id),
    reason      TEXT,
    changed_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- CUSTOMERS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    phone       TEXT,
    whatsapp    TEXT,
    email       TEXT,
    address     TEXT,
    area        TEXT,                 -- Hangu / Kohat / Thall / Doaba / Karak
    source      TEXT DEFAULT 'manual', -- manual / website_lead
    notes       TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- MEASUREMENTS (every calculation, per module, with full audit trail)
-- input_json  = raw user inputs (dimensions, counts, toggles)
-- calc_json   = component-by-component breakdown (auto calculation)
-- rate snapshot fields protect historical pricing permanently.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS measurements (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id        INTEGER REFERENCES customers(id),
    category_id        INTEGER NOT NULL REFERENCES categories(id),
    style_id           INTEGER REFERENCES styles(id),
    material_id        INTEGER REFERENCES materials(id),
    formula_key        TEXT NOT NULL,
    formula_version    INTEGER NOT NULL,
    input_json         TEXT NOT NULL,   -- {"height_ft":8,"height_in":6,...}
    calc_json          TEXT NOT NULL,   -- {"left":8.5,"right":8.5,"top":3.5,...,"auto_total":27.5}
    auto_value         REAL NOT NULL,   -- system calculated total (running ft / sq ft)
    manual_value       REAL,            -- overridden value (nullable)
    manual_reason      TEXT,
    final_value        REAL NOT NULL,   -- = manual_value if set else auto_value
    unit               TEXT NOT NULL,
    rate_id            INTEGER REFERENCES rates(id),
    rate_at_calc       REAL NOT NULL,   -- snapshot of rate used
    rate_source        TEXT NOT NULL DEFAULT 'current', -- current/custom/historical
    price_at_calc      REAL NOT NULL,   -- final_value * rate_at_calc (base, before discount/labour)
    discount_amount    REAL DEFAULT 0,
    discount_percent   REAL DEFAULT 0,
    labour_amount      REAL DEFAULT 0,
    transport_amount   REAL DEFAULT 0,
    total_price        REAL NOT NULL,
    status             TEXT NOT NULL DEFAULT 'draft', -- draft/saved/quoted/invoiced
    created_by         INTEGER REFERENCES users(id),
    created_at         TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- QUOTATIONS (group of measurements -> one document to send to customer)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quotations (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    quotation_no    TEXT NOT NULL UNIQUE,
    customer_id     INTEGER REFERENCES customers(id),
    subtotal        REAL NOT NULL DEFAULT 0,
    discount_amount REAL NOT NULL DEFAULT 0,
    total_amount    REAL NOT NULL DEFAULT 0,
    status          TEXT NOT NULL DEFAULT 'draft', -- draft/sent/approved/rejected
    valid_until     TEXT,
    notes           TEXT,
    pdf_path        TEXT,
    created_by      INTEGER REFERENCES users(id),
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS quotation_items (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    quotation_id   INTEGER NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    measurement_id INTEGER REFERENCES measurements(id),
    description    TEXT NOT NULL,
    quantity       REAL NOT NULL,
    unit           TEXT NOT NULL,
    rate           REAL NOT NULL,
    amount         REAL NOT NULL,
    sort_order     INTEGER DEFAULT 0
);

-- ---------------------------------------------------------------------
-- INVOICES + PAYMENTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_no      TEXT NOT NULL UNIQUE,
    quotation_id    INTEGER REFERENCES quotations(id),
    customer_id     INTEGER REFERENCES customers(id),
    total_amount    REAL NOT NULL,
    paid_amount     REAL NOT NULL DEFAULT 0,
    balance_amount  REAL NOT NULL,
    status          TEXT NOT NULL DEFAULT 'unpaid', -- unpaid/partial/paid
    pdf_path        TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payments (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id  INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount      REAL NOT NULL,
    mode        TEXT NOT NULL DEFAULT 'cash', -- cash/bank/other
    note        TEXT,
    paid_at     TEXT NOT NULL DEFAULT (datetime('now')),
    created_by  INTEGER REFERENCES users(id)
);

-- ---------------------------------------------------------------------
-- AUDIT LOG (every sensitive change recorded)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,   -- rate/formula/measurement/quotation/invoice/user
    entity_id   INTEGER,
    action      TEXT NOT NULL,   -- create/update/delete/override
    old_value   TEXT,
    new_value   TEXT,
    changed_by  INTEGER REFERENCES users(id),
    changed_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- SETTINGS (single-row key/value store for business info, comms config)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
    key         TEXT PRIMARY KEY,
    value       TEXT
);

CREATE INDEX IF NOT EXISTS idx_measurements_customer ON measurements(customer_id);
CREATE INDEX IF NOT EXISTS idx_measurements_category ON measurements(category_id);
CREATE INDEX IF NOT EXISTS idx_rates_category ON rates(category_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation ON quotation_items(quotation_id);

-- =====================================================================
-- PHASE 2 ADDITIONS
-- =====================================================================

-- ---------------------------------------------------------------------
-- EXPENSES (Module 13) — free-hand editable categories
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expense_categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    is_active   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS expenses (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_category_id INTEGER REFERENCES expense_categories(id),
    project_id      INTEGER, -- reserved for Phase 3 Projects module
    description     TEXT,
    amount          REAL NOT NULL,
    receipt_path    TEXT,  -- uploaded receipt image
    spent_at        TEXT NOT NULL DEFAULT (datetime('now')),
    created_by      INTEGER REFERENCES users(id),
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- MACHINERY RENTAL (Module 12)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS machinery (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,          -- Crusher, Tractor, Loader...
    status        TEXT NOT NULL DEFAULT 'available', -- available/reserved/rented/maintenance/unavailable
    hourly_rate   REAL,
    daily_rate    REAL,
    weekly_rate   REAL,
    monthly_rate  REAL,
    notes         TEXT,
    is_active     INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS machinery_bookings (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    machinery_id  INTEGER NOT NULL REFERENCES machinery(id) ON DELETE CASCADE,
    customer_id   INTEGER REFERENCES customers(id),
    start_at      TEXT NOT NULL,
    end_at        TEXT NOT NULL,
    rate_type     TEXT NOT NULL DEFAULT 'daily', -- hourly/daily/weekly/monthly/custom
    rate_amount   REAL NOT NULL,
    total_amount  REAL NOT NULL,
    status        TEXT NOT NULL DEFAULT 'reserved', -- reserved/active/completed/cancelled
    notes         TEXT,
    created_by    INTEGER REFERENCES users(id),
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_machinery_bookings_machine ON machinery_bookings(machinery_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(expense_category_id);

-- =====================================================================
-- PHASE 3 ADDITIONS
-- =====================================================================

-- ---------------------------------------------------------------------
-- PROJECTS (Module 11) — government + private contracts, BOQ, milestones
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    customer_id     INTEGER REFERENCES customers(id),
    project_type    TEXT NOT NULL DEFAULT 'private', -- government/private
    contract_value  REAL,
    status          TEXT NOT NULL DEFAULT 'planning', -- planning/in_progress/completed/on_hold/cancelled
    start_date      TEXT,
    end_date        TEXT,
    location        TEXT,
    notes           TEXT,
    created_by      INTEGER REFERENCES users(id),
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- BOQ (Bill of Quantities) line items — free-hand editable
CREATE TABLE IF NOT EXISTS project_boq_items (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id    INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    item_type     TEXT NOT NULL DEFAULT 'material', -- material/labour/equipment/transport/subcontractor
    description   TEXT NOT NULL,
    quantity      REAL NOT NULL DEFAULT 1,
    unit          TEXT,
    estimated_rate REAL NOT NULL DEFAULT 0,
    estimated_cost REAL NOT NULL DEFAULT 0, -- quantity x estimated_rate
    actual_cost   REAL DEFAULT 0,
    sort_order    INTEGER DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Milestone payments
CREATE TABLE IF NOT EXISTS project_milestones (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id    INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    amount        REAL NOT NULL,
    due_date      TEXT,
    status        TEXT NOT NULL DEFAULT 'pending', -- pending/invoiced/paid
    paid_at       TEXT,
    sort_order    INTEGER DEFAULT 0
);

-- Progress log (Module: Progress tracking)
CREATE TABLE IF NOT EXISTS project_progress (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id    INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    percent_complete INTEGER NOT NULL DEFAULT 0,
    note          TEXT,
    photo_path    TEXT,
    logged_by     INTEGER REFERENCES users(id),
    logged_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Project documents (contracts, drawings, permits — path only, files on disk)
CREATE TABLE IF NOT EXISTS project_documents (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id    INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    file_path     TEXT NOT NULL,
    uploaded_by   INTEGER REFERENCES users(id),
    uploaded_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- INVENTORY (Module 14)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_items (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,          -- Pipe, Angle Iron, Sheet, Welding Rod...
    unit          TEXT NOT NULL DEFAULT 'pc',
    quantity      REAL NOT NULL DEFAULT 0,
    cost_price    REAL DEFAULT 0,
    selling_price REAL DEFAULT 0,
    supplier      TEXT,
    min_stock     REAL DEFAULT 0,          -- low-stock alert threshold
    is_active     INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inventory_movements (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id       INTEGER NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    change_qty    REAL NOT NULL,  -- positive = stock in, negative = stock out
    reason        TEXT,           -- purchase/used_on_project/adjustment/sold
    project_id    INTEGER REFERENCES projects(id),
    created_by    INTEGER REFERENCES users(id),
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- REUSABLE ADDON / HARDWARE CATALOG
-- Free-hand price list for items that get added as quotation extra_items
-- (gate handles, locks, fiber frame pipe per-ft, transport charges...)
-- Keeps "no hardcoded prices" true even for these small extras.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS addon_catalog (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,          -- "Gate Handle", "Fiber Frame Pipe (16G)"
    category_id   INTEGER REFERENCES categories(id), -- optional link, e.g. only show for Gate
    unit          TEXT NOT NULL DEFAULT 'pc',
    default_rate  REAL NOT NULL DEFAULT 0,
    is_active     INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- LEADS (Module 15) — website / manual lead capture -> convert to customer
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    phone         TEXT,
    email         TEXT,
    message       TEXT,
    source        TEXT NOT NULL DEFAULT 'website', -- website/manual/referral
    status        TEXT NOT NULL DEFAULT 'new',      -- new/contacted/converted/rejected
    converted_customer_id INTEGER REFERENCES customers(id),
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_boq_project ON project_boq_items(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_project ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_progress_project ON project_progress(project_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_item ON inventory_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_expenses_project ON expenses(project_id);

-- =====================================================================
-- PHASE 4 ADDITIONS
-- =====================================================================

-- ---------------------------------------------------------------------
-- MEDIA LIBRARY (Module 17) — every uploaded image/video/360-set/document
-- goes through here so it can be searched, previewed, and assigned to
-- any entity (service, project, gallery, machine, design...).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media_assets (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    filename      TEXT NOT NULL,
    file_path     TEXT NOT NULL,       -- served from /uploads/media/<file_path>
    mime_type     TEXT,
    kind          TEXT NOT NULL DEFAULT 'image', -- image/video/document/360_frame
    size_bytes    INTEGER,
    -- 360 sequences: multiple frames share the same group_key, ordered by frame_index
    group_key     TEXT,
    frame_index   INTEGER,
    title         TEXT,
    tags          TEXT,                -- comma-separated, free-hand
    assigned_type TEXT,                -- service/project/gallery/machine/design/none
    assigned_id   INTEGER,
    uploaded_by   INTEGER REFERENCES users(id),
    uploaded_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_media_group ON media_assets(group_key);
CREATE INDEX IF NOT EXISTS idx_media_assigned ON media_assets(assigned_type, assigned_id);

-- ---------------------------------------------------------------------
-- WEBSITE CMS (Module 16) — every section is a free-hand editable block.
-- One row per (section, sort_order); content_json shape depends on section:
--   hero: {headline, subheading, cta_text, cta_link, background_media_id}
--   service: {icon_media_id, title, description}
--   project: {title, description, media_ids: [...]}
--   testimonial: {name, quote, media_id}
--   faq: {question, answer}
--   design: {title, category, media_ids: [...]}
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cms_blocks (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    section       TEXT NOT NULL, -- hero/service/project/testimonial/faq/design/footer
    content_json  TEXT NOT NULL DEFAULT '{}',
    sort_order    INTEGER DEFAULT 0,
    is_active     INTEGER NOT NULL DEFAULT 1,
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_cms_section ON cms_blocks(section, sort_order);

-- Site-wide settings (SEO meta, footer contact, published on/off) — reuses
-- the existing key/value `settings` table with `cms_` prefixed keys, so no
-- new table needed for that part.

-- ---------------------------------------------------------------------
-- CUSTOM FIELDS (free-hand editable extra fields on Customers/Projects/Measurements)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS custom_field_defs (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type   TEXT NOT NULL,  -- customer/project/measurement
    field_name    TEXT NOT NULL,
    field_type    TEXT NOT NULL DEFAULT 'text', -- text/number/date/dropdown/image/file
    options_json  TEXT,           -- for dropdown: ["A","B","C"]
    is_required   INTEGER NOT NULL DEFAULT 0,
    default_value TEXT,
    sort_order    INTEGER DEFAULT 0,
    is_active     INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS custom_field_values (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    field_def_id  INTEGER NOT NULL REFERENCES custom_field_defs(id) ON DELETE CASCADE,
    entity_type   TEXT NOT NULL,
    entity_id     INTEGER NOT NULL,
    value         TEXT,
    UNIQUE(field_def_id, entity_type, entity_id)
);
CREATE INDEX IF NOT EXISTS idx_custom_values_entity ON custom_field_values(entity_type, entity_id);
