/**
 * brain.md auto-maintainer. Appends entries under marker sections.
 * Called on rate changes and formula version bumps. Never throws.
 */
const fs = require('fs');
const path = require('path');
const BRAIN = path.join(__dirname, '../../../brain.md');

function stamp() { return new Date().toISOString().replace('T', ' ').slice(0, 19); }

function insertAfter(marker, line) {
  try {
    let txt = fs.readFileSync(BRAIN, 'utf8');
    if (!txt.includes(marker)) txt += `\n${marker}\n`;
    txt = txt.replace(marker, `${marker}\n${line}`);
    txt = txt.replace(/^## Last Updated:.*$/m, `## Last Updated: ${stamp()}`);
    fs.writeFileSync(BRAIN, txt);
  } catch (e) { /* brain.md is best-effort */ }
}

function logRateChange({ id, category, style, oldRate, newRate, by }) {
  insertAfter('<!-- RATE_HISTORY -->', `| ${stamp()} | ${category || ''} ${style || ''} (rate #${id}) | ${oldRate} | ${newRate} | ${by} |`);
}
function logChange({ text, file, reason }) {
  insertAfter('<!-- CHANGELOG -->', `- ${stamp()} — ${text}${file ? ` (file: ${file})` : ''}${reason ? ` — ${reason}` : ''}`);
}
module.exports = { logRateChange, logChange };
