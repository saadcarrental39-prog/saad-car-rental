/* Optional helper: run "npm run setup" after dropping your own login-bg.mp4 / logo.png into assets/ */
const fs = require('fs'); const path = require('path');
const ROOT = path.join(__dirname, '..');
console.log('Assets folder:', path.join(ROOT, 'assets'));
console.log('Place your clinic login background video at assets/login-bg.mp4 (falls back to an animated gradient if missing).');
console.log('Place your clinic logo (square PNG) at assets/logo.png to use it across the app, PDF and icons.');
