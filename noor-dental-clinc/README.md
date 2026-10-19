# Noor Dental Clinic Management System

100% offline dental clinic software for **Dr. M. AlNoor Orakzai** — Alshifa Medical & Surgical Center, Thall Road, Hangu.
Node.js + Express + SQLite (Node's built-in node:sqlite, requires Node.js 22.13+). Installable as a PWA. No internet required except to send WhatsApp/Email.

## Quick start (Windows)
1. Install [Node.js LTS](https://nodejs.org) if not already installed.
2. Double-click **start.bat** once. It runs `npm install` (first time only), starts the server, and opens the browser at `http://127.0.0.1:3000`.
3. Then double-click **"Install App Icon.bat"** once. This puts a **Noor Dental Clinic** icon on the Desktop and makes the app start quietly by itself whenever the computer turns on — no more cmd window, no more start.bat. From then on, just click the Desktop icon (or simply turn the PC on).

> Note: the green/red **Online/Offline** indicator in the top bar only reflects internet access, used for WhatsApp/Email. It has nothing to do with the app itself — patients, appointments, POS, ledger, reports, backups etc. always work with no internet at all.

## Quick start (any OS / manual)
```bash
npm install
npm run seed      # optional: adds sample patients/appointments/sales for testing
npm start
```
Open **http://127.0.0.1:3000**.

## First login
- Username: `admin`
- Password: `admin123`
- Change it immediately in **Settings → My Account**.

## Install as an app (PWA)
Open the site in Chrome/Edge → click **📲 Install App** in the top bar (or the install icon in the address bar). The app then opens in its own window and works fully offline after the first load — turn off Wi-Fi and it still opens, patients still save, POS still works. WhatsApp and Email buttons are disabled while offline (shown by the red 🔴 Offline indicator) since those need internet to actually send.

## Folder structure
```
noor-dental-clinic/
  server.js            Express app + all /api routes
  database/db.js        SQLite schema, defaults, seed-on-first-run settings
  database/seed.js       npm run seed - demo data
  lib/pdf.js             Patient dossier / ortho report / receipt / report PDFs (pdfkit)
  lib/backup.js           ZIP backup + restore + USB detection
  lib/reminders.js         Reminder auto-generation (cron, hourly)
  public/                 Frontend (multi-page, Tailwind-free hand CSS, vanilla JS)
    css/  theme.css (CSS variables) + style.css
    js/   app.js (shell/router/UI toolkit), api.js, theme.js, whatsapp.js, pages/*.js
    manifest.json, service-worker.js, offline.html
    icons/               PWA icons generated from your clinic logo
  uploads/                patient photos, x-rays, receipts, backups, intake (auto-import folder)
  pdfs/                   generated dossiers cached here
  assets/logo.png, assets/login-bg.mp4 (optional - falls back to animated gradient)
```

## Replacing the login background video
Drop an MP4 at `assets/login-bg.mp4` (any short, muted, looping clip). If it's missing, the login page shows an animated
gradient instead — nothing breaks.

## Backups
- Auto-backup runs every 6 hours (configurable in Settings → Backup) to `uploads/backups/`.
- Manual backup / restore also in Settings → Backup. Restoring requires typing `RESTORE` to confirm and briefly restarts the server.

## Roles
- **Admin** (the doctor) — full access, including Settings, Users, Backup, Audit log.
- **Receptionist** — Patients, Appointments, Ortho, POS, Reminders.
- **Accountant** — Ledger, Expenses, Reports, Patients (read).

Create extra staff logins in Settings → Users (admin only).

## Support
Developed by **Muhammad Hasin** (mhsoftwaredevelopers@gmail.com).
