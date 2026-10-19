'use strict';
/* ZIP backup (DB + uploads + pdfs), restore staging, USB detection, auto-backup */
const fs = require('fs'); const path = require('path'); const os = require('os');
const archiver = require('archiver'); const AdmZip = require('adm-zip');
const { execFile } = require('child_process');
const { db, settings } = require('../database/db');
const ROOT = path.join(__dirname, '..');
const DEFAULT_DIR = path.join(ROOT, 'uploads', 'backups');
const stamp = () => { const d = new Date(), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`; };

async function createBackup(folder) {
  const dir = folder || settings.get('system').backup_folder || DEFAULT_DIR;
  fs.mkdirSync(dir, { recursive: true });
  const tmp = path.join(os.tmpdir(), 'noor_snapshot_' + Date.now() + '.db');
  await db.backup(tmp); /* consistent online snapshot */
  const file = path.join(dir, `backup_${stamp()}.zip`);
  await new Promise((resolve, reject) => {
    const out = fs.createWriteStream(file); const zip = archiver('zip', { zlib: { level: 6 } });
    out.on('close', resolve); zip.on('error', reject); zip.pipe(out);
    zip.file(tmp, { name: 'database/noor_dental.db' });
    for (const d of ['uploads', 'pdfs']) {
      const full = path.join(ROOT, d); if (!fs.existsSync(full)) continue;
      zip.glob('**/*', { cwd: full, ignore: d === 'uploads' ? ['backups/**'] : [], dot: false }, { prefix: d });
    }
    zip.finalize();
  });
  try { fs.unlinkSync(tmp); } catch {}
  settings.set('last_backup', { at: new Date().toISOString(), file });
  return { file, size: fs.statSync(file).size };
}
function listBackups(folder) {
  const dir = folder || settings.get('system').backup_folder || DEFAULT_DIR;
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => /^backup_.*\.zip$/.test(f)).map(f => ({ name: f, path: path.join(dir, f), size: fs.statSync(path.join(dir, f)).size, mtime: fs.statSync(path.join(dir, f)).mtime }))
    .sort((a, b) => b.mtime - a.mtime);
}
/* Extract uploads/pdfs now, stage DB for swap at next start (see database/db.js) */
function stageRestore(zipPath) {
  const zip = new AdmZip(zipPath);
  if (!zip.getEntry('database/noor_dental.db')) throw new Error('Not a valid Noor Dental backup (database missing)');
  const pend = path.join(ROOT, 'database', 'restore_pending'); fs.rmSync(pend, { recursive: true, force: true }); fs.mkdirSync(pend, { recursive: true });
  fs.writeFileSync(path.join(pend, 'noor_dental.db'), zip.getEntry('database/noor_dental.db').getData());
  for (const e of zip.getEntries()) {
    if (e.isDirectory || !/^(uploads|pdfs)\//.test(e.entryName) || e.entryName.includes('..')) continue;
    const dest = path.join(ROOT, e.entryName); fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, e.getData());
  }
}
function usbDrives() {
  return new Promise(resolve => {
    if (process.platform !== 'win32') return resolve([]);
    execFile('powershell', ['-NoProfile', '-Command', "Get-CimInstance Win32_LogicalDisk -Filter 'DriveType=2' | Select-Object -ExpandProperty DeviceID"], { timeout: 8000 },
      (err, out) => resolve(err ? [] : out.split(/\r?\n/).map(s => s.trim()).filter(Boolean).map(d => d + '\\')));
  });
}
function backupAgeHours() { const l = settings.get('last_backup'); return l && l.at ? (Date.now() - new Date(l.at)) / 36e5 : null; }
module.exports = { createBackup, listBackups, stageRestore, usbDrives, backupAgeHours };
