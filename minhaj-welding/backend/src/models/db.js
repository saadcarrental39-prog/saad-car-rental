/**
 * MINHAJ WELDING - Database Connection (singleton)
 * Uses better-sqlite3 (synchronous, fast, file-based, zero cost).
 *
 * AUTO-MIGRATION: on every start, the live database is compared with
 * database/schema.sql. Missing columns are added (ALTER TABLE ADD COLUMN) and
 * missing tables/indexes are created. Existing data is never deleted, so an
 * older-phase database keeps working after upgrading the code.
 */
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../database/minhaj_welding.db');
const SCHEMA_PATH = path.join(__dirname, '../../database/schema.sql');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function migrate() {
  if (!fs.existsSync(SCHEMA_PATH)) return;
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');

  // 1) Build a reference copy of the schema in memory
  const ref = new Database(':memory:');
  ref.exec(schemaSql);
  const refTables = ref.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();

  // 2) Add any columns the live DB is missing (before running indexes from schema)
  for (const { name } of refTables) {
    const liveCols = db.prepare(`PRAGMA table_info("${name}")`).all();
    if (liveCols.length === 0) continue; // table missing entirely -> created in step 3
    const have = new Set(liveCols.map((c) => c.name));
    for (const col of ref.prepare(`PRAGMA table_info("${name}")`).all()) {
      if (have.has(col.name)) continue;
      let def = `"${col.name}" ${col.type || 'TEXT'}`;
      // SQLite cannot add NOT NULL / non-constant-default columns to existing tables;
      // only carry over simple constant defaults.
      const dynamicDefault = col.dflt_value !== null && /\(/.test(col.dflt_value);
      if (col.dflt_value !== null && !dynamicDefault) def += ` DEFAULT ${col.dflt_value}`;
      try {
        db.exec(`ALTER TABLE "${name}" ADD COLUMN ${def}`);
        console.log(`🔧 Migration: added ${name}.${col.name}`);
        // datetime('now') style defaults can't be used in ALTER; backfill instead
        if (dynamicDefault) {
          db.exec(`UPDATE "${name}" SET "${col.name}" = ${col.dflt_value} WHERE "${col.name}" IS NULL`);
        }
      } catch (e) {
        console.error(`⚠️  Migration failed for ${name}.${col.name}: ${e.message}`);
      }
    }
  }

  // 3) Create missing tables / indexes (all statements are IF NOT EXISTS)
  try {
    db.exec(schemaSql);
  } catch (e) {
    console.error('⚠️  Schema apply warning:', e.message);
  }
  ref.close();
}

try {
  migrate();
} catch (e) {
  console.error('⚠️  Auto-migration error:', e.message);
}

module.exports = db;
