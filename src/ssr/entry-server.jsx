// Build-time only (never shipped to browsers). scripts/prerender.mjs bundles this file with esbuild and calls render(path) for every
// public page, so the HTML that Google, WhatsApp, Facebook, Telegram etc. download already contains the right title, description,
// canonical, Open Graph image, structured data AND the real page content (headings, text, links).
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server.js";
import App from "../App";
import { PAGES, pageByPath, headFor } from "../seo/registry";
import { headHtml } from "../seo/head";

export function render(path) {
  const page = pageByPath(path);
  const html = renderToString(<StaticRouter location={path}><App /></StaticRouter>);
  return { html, head: headHtml(headFor(page)), page };
}
export { PAGES, pageByPath, headFor } from "../seo/registry";
export { BUSINESS, needsConfirmation } from "../business.config";
export { PLACES, PROVINCES, PUNJAB_DISTRICTS, place } from "../seo/data/places";
export { ROUTES, DRAFT_ROUTES } from "../seo/data/routes";
export { SERVICE_PAGES, notOffered } from "../seo/data/services";
export { FAQS } from "../seo/data/faq";
export { VEHICLE_FIT, TERRAIN } from "../seo/data/vehicles";
export { MIN_SCORE, FORBIDDEN, score, uniqueText } from "../seo/quality";
export { baseFleet } from "../data/fleet";
export { ADMIN_PATH } from "../config";
