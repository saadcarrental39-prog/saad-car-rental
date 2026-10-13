// Tells the browser which country the visitor is in (Cloudflare knows it from the connection). Used ONLY to pick the website language.
// Nothing is stored and no personal data is returned: just a 2-letter country code.
export async function onRequestGet({ request }) {
  const cc = (request.cf && request.cf.country) || request.headers.get("cf-ipcountry") || "";
  return new Response(JSON.stringify({ country: /^[A-Za-z]{2}$/.test(cc) ? cc.toUpperCase() : "" }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
