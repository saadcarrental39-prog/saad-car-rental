/**
 * MINHAJ WELDING - Database Init + Seed
 * Run: node database/seed.js
 * Safe to re-run — uses CREATE TABLE IF NOT EXISTS + INSERT OR IGNORE.
 */
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'minhaj_welding.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

console.log('📦 Applying schema...');
db.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));

// ---------------------------------------------------------------------
// Default admin user
// ---------------------------------------------------------------------
const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
if (userCount === 0) {
  const hash = bcrypt.hashSync('changeme123', 10);
  db.prepare(`INSERT INTO users (name, phone, email, password_hash, role)
              VALUES (?, ?, ?, ?, ?)`)
    .run('Muhammad Nehal', '03310092592', 'admin@minhajwelding.com', hash, 'super_admin');
  console.log('👤 Default admin created -> email: admin@minhajwelding.com / password: changeme123 (CHANGE THIS)');
}

// ---------------------------------------------------------------------
// Categories (free-hand editable — this is just a starting seed)
// ---------------------------------------------------------------------
const categories = [
  { name: 'Chokat - Door',      unit_type: 'running_ft' },
  { name: 'Chokat - Window',    unit_type: 'running_ft' },
  { name: 'Chokat - Bathroom',  unit_type: 'running_ft' },
  { name: 'Chokat - Roshandan', unit_type: 'running_ft' },
  { name: 'Gate',               unit_type: 'sq_ft' },
  { name: 'Railing',            unit_type: 'running_ft' },
  { name: 'Fiber Sheet',        unit_type: 'sq_ft' },
  { name: 'Aluminium',          unit_type: 'sq_ft' },
  { name: 'Welding - General',  unit_type: 'running_ft' },
  { name: 'Construction',       unit_type: 'sq_ft' },
  { name: 'Machinery Rental',   unit_type: 'day' },
  { name: 'Labour',             unit_type: 'day' },
];

const insertCategory = db.prepare(
  `INSERT OR IGNORE INTO categories (name, unit_type, sort_order) VALUES (?, ?, ?)`
);
categories.forEach((c, i) => insertCategory.run(c.name, c.unit_type, i));

const getCategoryId = (name) =>
  db.prepare('SELECT id FROM categories WHERE name = ?').get(name)?.id;

// ---------------------------------------------------------------------
// Styles per category — formula_key maps to calculations/*.js functions
// config_json holds style-specific multipliers (fully editable later
// from Admin > Styles, this is only the initial seed).
// ---------------------------------------------------------------------
const styles = [
  // DOOR CHOKAT
  { cat: 'Chokat - Door', name: 'Door - Standard', code: 'CHK-D-001', formula_key: 'chokat_door',
    config: { paithaan_multiplier: 1, laar_multiplier: 1 } },

  // WINDOW CHOKAT
  { cat: 'Chokat - Window', name: 'Window - 2 Laar', code: 'WIN-L-002', formula_key: 'chokat_window',
    config: { laar_count_default: 2, laar_multiplier: 2, paithaan_multiplier: 1 } },
  { cat: 'Chokat - Window', name: 'Window - 3 Laar', code: 'WIN-L-003', formula_key: 'chokat_window',
    config: { laar_count_default: 3, laar_multiplier: 2, paithaan_multiplier: 1 } },

  // BATHROOM CHOKAT
  { cat: 'Chokat - Bathroom', name: 'Bathroom - Standard', code: 'CHK-B-001', formula_key: 'chokat_bathroom',
    config: { anglaran_free: true } },

  // ROSHANDAN
  { cat: 'Chokat - Roshandan', name: 'Roshandan - Standard', code: 'CHK-R-001', formula_key: 'chokat_roshandan',
    config: {} },

  // GATE
  { cat: 'Gate', name: 'Gate - Simple', code: 'GT-001', formula_key: 'gate_area', config: { design: 'simple' } },
  { cat: 'Gate', name: 'Gate - Pipe', code: 'GT-002', formula_key: 'gate_area', config: { design: 'pipe' } },
  { cat: 'Gate', name: 'Gate - Grill', code: 'GT-003', formula_key: 'gate_area', config: { design: 'grill' } },
  { cat: 'Gate', name: 'Gate - CNC Decorative', code: 'GT-004', formula_key: 'gate_area', config: { design: 'cnc' } },

  // RAILING
  { cat: 'Railing', name: 'Railing - Round Pipe', code: 'RL-001', formula_key: 'railing_running_ft', config: { design: 'round_pipe' } },
  { cat: 'Railing', name: 'Railing - Square Curas Pipe', code: 'RL-002', formula_key: 'railing_running_ft', config: { design: 'square_curas' } },

  // FIBER
  { cat: 'Fiber Sheet', name: 'Fiber - 2 Ply', code: 'FB-001', formula_key: 'fiber_sheet', config: { ply: 2 } },
  { cat: 'Fiber Sheet', name: 'Fiber - 3 Ply', code: 'FB-002', formula_key: 'fiber_sheet', config: { ply: 3 } },
];

const insertStyle = db.prepare(
  `INSERT OR IGNORE INTO styles (category_id, name, code, formula_key, formula_version, config_json)
   VALUES (?, ?, ?, ?, 1, ?)`
);
styles.forEach((s) => {
  const catId = getCategoryId(s.cat);
  if (catId) insertStyle.run(catId, s.name, s.code, s.formula_key, JSON.stringify(s.config));
});

// ---------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------
const materials = [
  { cat: 'Chokat - Door', name: '5 Inch Profile', unit: 'ft' },
  { cat: 'Chokat - Door', name: '10 Inch Profile', unit: 'ft' },
  { cat: 'Fiber Sheet', name: '1.5x1.5 Frame Pipe - 16 Gauge', unit: 'ft' },
  { cat: 'Fiber Sheet', name: '1.5x1.5 Frame Pipe - 18 Gauge', unit: 'ft' },
  { cat: 'Fiber Sheet', name: '1.5x1.5 Frame Pipe - 20 Gauge', unit: 'ft' },
];
const insertMaterial = db.prepare(
  `INSERT OR IGNORE INTO materials (category_id, name, unit) VALUES (?, ?, ?)`
);
materials.forEach((m) => {
  const catId = getCategoryId(m.cat);
  if (catId) insertMaterial.run(catId, m.name, m.unit);
});

// ---------------------------------------------------------------------
// Sample starting rates (EDITABLE from Admin > Pricing & Market Rates)
// ---------------------------------------------------------------------
const rateCount = db.prepare('SELECT COUNT(*) as c FROM rates').get().c;
if (rateCount === 0) {
  const rateRows = [
    { cat: 'Chokat - Door', style: 'Door - Standard', unit: 'running_ft', min: 1300, max: 1800, cur: 1500 },
    { cat: 'Chokat - Window', style: 'Window - 2 Laar', unit: 'running_ft', min: 1300, max: 1800, cur: 1500 },
    { cat: 'Chokat - Window', style: 'Window - 3 Laar', unit: 'running_ft', min: 1400, max: 1900, cur: 1600 },
    { cat: 'Chokat - Bathroom', style: 'Bathroom - Standard', unit: 'running_ft', min: 1200, max: 1700, cur: 1400 },
    { cat: 'Gate', style: 'Gate - Simple', unit: 'sq_ft', min: 350, max: 600, cur: 450 },
    { cat: 'Gate', style: 'Gate - CNC Decorative', unit: 'sq_ft', min: 700, max: 1200, cur: 900 },
    { cat: 'Railing', style: 'Railing - Round Pipe', unit: 'running_ft', min: 800, max: 1300, cur: 1000 },
    { cat: 'Fiber Sheet', style: 'Fiber - 2 Ply', unit: 'sq_ft', min: 250, max: 400, cur: 300 },
  ];
  const insertRate = db.prepare(`
    INSERT INTO rates (category_id, style_id, unit, min_rate, max_rate, current_rate, created_by, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, 1, 1)
  `);
  rateRows.forEach((r) => {
    const catId = getCategoryId(r.cat);
    const styleId = db.prepare('SELECT id FROM styles WHERE name = ? AND category_id = ?').get(r.style, catId)?.id;
    insertRate.run(catId, styleId, r.unit, r.min, r.max, r.cur);
  });
  console.log('💰 Sample rates seeded (edit anytime from Admin > Pricing)');
}

// ---------------------------------------------------------------------
// Settings — business info + communication config (all editable)
// ---------------------------------------------------------------------
const settings = {
  business_name: 'MINHAJ WELDING',
  owner_1_name: 'Muhammad Nehal',
  owner_1_phone: '03310092592',
  owner_2_name: 'Muhammad Minhaj',
  owner_2_phone: '03315214444',
  service_areas: 'Hangu,Kohat,Thall,Doaba,Karak',
  whatsapp_number: '923310092592',
  email_smtp_host: 'smtp.gmail.com',
  email_smtp_port: '587',
  email_smtp_user: '',
  email_smtp_pass: '',
  theme_bg: '#FFFFFF',
  theme_text: '#000000',
  theme_button: '#2563EB',
  theme_button_hover: '#1E40AF',
};
const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
Object.entries(settings).forEach(([k, v]) => insertSetting.run(k, v));

// Sample customer for testing
const custCount = db.prepare('SELECT COUNT(*) as c FROM customers').get().c;
if (custCount === 0) {
  db.prepare(`INSERT INTO customers (name, phone, area) VALUES (?, ?, ?)`)
    .run('Test Customer', '03001234567', 'Kohat');
}

// ---------------------------------------------------------------------
// PHASE 2: Expense categories + sample machinery
// ---------------------------------------------------------------------
const expenseCats = ['Steel', 'Pipe', 'Sheet', 'Fiber', 'Aluminium', 'Welding Rod', 'Paint', 'Hardware', 'Transport', 'Fuel', 'Labour', 'Machinery', 'Other'];
const insertExpenseCat = db.prepare('INSERT OR IGNORE INTO expense_categories (name) VALUES (?)');
expenseCats.forEach((c) => insertExpenseCat.run(c));

const machineCount = db.prepare('SELECT COUNT(*) as c FROM machinery').get().c;
if (machineCount === 0) {
  const machines = [
    { name: 'Crusher', daily_rate: 8000 },
    { name: 'Tractor', daily_rate: 6000 },
    { name: 'Loader', daily_rate: 10000 },
  ];
  const insertMachine = db.prepare('INSERT INTO machinery (name, daily_rate) VALUES (?, ?)');
  machines.forEach((m) => insertMachine.run(m.name, m.daily_rate));
  console.log('🚜 Sample machinery seeded (edit anytime from Machinery page)');
}

// ---------------------------------------------------------------------
// PHASE 3: Addon/hardware catalog + sample inventory
// ---------------------------------------------------------------------
const addonCount = db.prepare('SELECT COUNT(*) as c FROM addon_catalog').get().c;
if (addonCount === 0) {
  const gateCatId = getCategoryId('Gate');
  const fiberCatId = getCategoryId('Fiber Sheet');
  const addons = [
    { name: 'Gate Handle', category_id: gateCatId, unit: 'pc', default_rate: 500 },
    { name: 'Gate Lock', category_id: gateCatId, unit: 'pc', default_rate: 800 },
    { name: 'Gate Kabza (Hinge)', category_id: gateCatId, unit: 'pc', default_rate: 250 },
    { name: 'Gate Wheel', category_id: gateCatId, unit: 'pc', default_rate: 1200 },
    { name: 'Fiber Frame Pipe (16G, per ft)', category_id: fiberCatId, unit: 'running_ft', default_rate: 120 },
    { name: 'Transport Charges', category_id: null, unit: 'trip', default_rate: 1500 },
  ];
  const insertAddon = db.prepare('INSERT INTO addon_catalog (name, category_id, unit, default_rate) VALUES (?, ?, ?, ?)');
  addons.forEach((a) => insertAddon.run(a.name, a.category_id, a.unit, a.default_rate));
  console.log('🔩 Sample hardware/addon catalog seeded');
}

const invCount = db.prepare('SELECT COUNT(*) as c FROM inventory_items').get().c;
if (invCount === 0) {
  const items = [
    { name: 'Angle Iron 2x2', unit: 'ft', quantity: 200, cost_price: 150, selling_price: 180, min_stock: 50 },
    { name: 'Welding Rod (packet)', unit: 'pc', quantity: 30, cost_price: 400, selling_price: 500, min_stock: 10 },
  ];
  const insertItem = db.prepare(`
    INSERT INTO inventory_items (name, unit, quantity, cost_price, selling_price, min_stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  items.forEach((it) => insertItem.run(it.name, it.unit, it.quantity, it.cost_price, it.selling_price, it.min_stock));
  console.log('📦 Sample inventory seeded');
}

// ---------------------------------------------------------------------
// PHASE 4: Default Website CMS content (so the public site isn't empty)
// ---------------------------------------------------------------------
const cmsCount = db.prepare('SELECT COUNT(*) as c FROM cms_blocks').get().c;
if (cmsCount === 0) {
  const insertBlock = db.prepare('INSERT INTO cms_blocks (section, content_json, sort_order) VALUES (?, ?, ?)');

  insertBlock.run('hero', JSON.stringify({
    headline: 'MINHAJ WELDING',
    subheading: 'Welding, Aluminium, Fiber Sheets & Construction — Hangu, Kohat, Thall, Doaba, Karak',
    cta_text: 'Get a Free Quote',
    cta_link: '#contact',
  }), 0);

  const services = [
    { title: 'Welding', description: 'Gates, grills, railings, structural steel work for homes and businesses.' },
    { title: 'Aluminium', description: 'Doors, windows, and aluminium fabrication.' },
    { title: 'Fiber Sheets', description: 'Roofing and partition fiber sheet installation.' },
    { title: 'Construction', description: 'Residential, commercial, and government contract work.' },
  ];
  services.forEach((s, i) => insertBlock.run('service', JSON.stringify(s), i));

  insertBlock.run('footer', JSON.stringify({
    text: 'MINHAJ WELDING — trusted welding & construction services across Hangu, Kohat, Thall, Doaba and Karak.',
  }), 0);

  console.log('🌐 Default website CMS content seeded (edit anytime from Admin > Website)');
}

console.log('✅ Database ready at:', DB_PATH);
db.close();
