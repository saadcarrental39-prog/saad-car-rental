/**
 * MINHAJ WELDING - Backend Server
 * Run: npm start   (or npm run dev with nodemon)
 * Designed to run on the owner's personal PC, exposed to the internet
 * ONLY via Cloudflare Tunnel (see /cloudflare/README.md) — no open ports.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const { attachUser } = require('./middleware/auth');

const DB_PATH = path.join(__dirname, '../database/minhaj_welding.db');
if (!fs.existsSync(DB_PATH)) {
  console.log('⚠️  Database not found - creating it now (running seed)...');
  require('child_process').execFileSync(process.execPath, [path.join(__dirname, '../database/seed.js')], { stdio: 'inherit' });
}

const app = express();
const PORT = process.env.PORT || 3001;

// ---- Security ----
app.use(helmet({ crossOriginResourcePolicy: false }));
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((o) => o.trim());
// Local/LAN origins (localhost, 127.0.0.1, 192.168.x.x, 10.x.x.x) are always allowed so
// login works no matter how the browser address is typed. Others must be in CORS_ORIGINS.
const localOrigin = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/;
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || localOrigin.test(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use('/api/', limiter);

app.use(attachUser);

// ---- Static file serving (uploaded PDFs / images) ----
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ---- Health check ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', business: 'MINHAJ WELDING', time: new Date().toISOString() });
});

// ---- Routes ----
app.use('/api/auth', require('./routes/auth'));
app.use('/api/catalog', require('./routes/catalog'));
app.use('/api/rates', require('./routes/rates'));
app.use('/api/measurements', require('./routes/measurements'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/quotations', require('./routes/quotations'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/communication', require('./routes/communication'));
app.use('/api/icons', require('./routes/icons'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/machinery', require('./routes/machinery'));
app.use('/api/users', require('./routes/users'));
app.use('/api/audit-log', require('./routes/auditlog'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/addons', require('./routes/addons'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/media', require('./routes/media'));
app.use('/api/cms', require('./routes/cms'));
app.use('/api/custom-fields', require('./routes/custom_fields'));

// ---- 404 ----
app.use('/api', (req, res) => res.status(404).json({ error: 'Route not found' }));

// ---- Error handler ----
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error', detail: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

app.listen(PORT, () => {
  console.log(`
  ✅ MINHAJ WELDING backend running on http://localhost:${PORT}
  📄 API health check: http://localhost:${PORT}/api/health
  `);
});
