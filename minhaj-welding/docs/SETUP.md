# SETUP (Urdu + English)

## Requirements
- Windows PC, Node.js 18 ya naya, internet (install ke waqt).

## Steps
1. ZIP extract karein (e.g. C:\minhaj-welding).
2. `install.bat` chalayen. Ye backend+frontend packages install karega aur database + sample data bana dega.
3. `start.bat` chalayen. Backend: http://localhost:3001/api/health  Frontend: http://localhost:5173
4. Rates page par apni asal rates set karein (sample rates sirf test ke liye hain).

## Test
`cd backend` phir `node tests/acceptance.js` — formulas ke tests chalte hain.

## Masail (Troubleshooting)
- `better-sqlite3` install error: Node LTS (18/20) use karein, phir `npm install` dobara.
- PDF na bane: Puppeteer Chromium download na hua ho to `.env` mein PUPPETEER_EXECUTABLE_PATH Chrome ka path dein.
- Email: Gmail mein 2-step verification on karke "App Password" banayein, Settings page mein daalein.
- WhatsApp: Phase 1 mein wa.me link khulta hai (click se), PDF khud attach karni hoti hai.
- Icons: Settings > Icons & Assets se replace karein. (Backend aur frontend folders ek saath rahen.)

## Deploy
cloudflare/README.md dekhein.

## Phase 2: Login
App ab login mangta hai. Pehli baar: admin@minhajwelding.com / changeme123 — turant Settings/Users se badal dein.
Naye users Users page (super_admin/admin only) se banayein, unhe role dein (estimator, accounts, manager, waghera).
