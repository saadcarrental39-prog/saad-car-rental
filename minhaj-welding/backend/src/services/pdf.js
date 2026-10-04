/**
 * MINHAJ WELDING - PDF Service
 * Renders Handlebars templates (src/templates/*.hbs) to HTML, then uses
 * Puppeteer (headless Chromium) to print to PDF. Templates are plain
 * HTML/CSS files — the owner or a developer can edit them directly with
 * no code changes needed elsewhere (Module: PDF Templates - editable).
 *
 * NOTE: Puppeteer downloads a Chromium binary on `npm install`. On a
 * machine with no internet at install time, set PUPPETEER_EXECUTABLE_PATH
 * in .env to point at an existing Chrome/Chromium install instead.
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');

Handlebars.registerHelper('inc', (value) => Number(value) + 1);

const TEMPLATES_DIR = path.join(__dirname, '../templates');
const OUTPUT_DIR = path.join(__dirname, '../../uploads/pdf');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function renderTemplate(templateName, data) {
  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.hbs`);
  const source = fs.readFileSync(templatePath, 'utf8');
  const template = Handlebars.compile(source);
  return template(data);
}

/**
 * generatePdf('quotation', {...data}, 'quotation-MW-Q-2026-0001.pdf')
 * Returns the absolute file path of the generated PDF.
 */
async function generatePdf(templateName, data, outputFilename) {
  const html = renderTemplate(templateName, data);
  const outputPath = path.join(OUTPUT_DIR, outputFilename);

  const launchOptions = { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const browser = await puppeteer.launch(launchOptions);
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({ path: outputPath, format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px' } });
  } finally {
    await browser.close();
  }
  return outputPath;
}

module.exports = { generatePdf, renderTemplate };
