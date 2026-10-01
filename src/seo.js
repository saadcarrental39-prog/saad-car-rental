import { useEffect } from "react";
import { SITE } from "./config";
const set = (sel, attr, val, make) => { let e = document.head.querySelector(sel); if (!e) { e = document.createElement(make[0]); e.setAttribute(make[1], make[2]); document.head.appendChild(e); } e.setAttribute(attr, val); };
export function useSeo({ title, description, path = "/" }) {
  useEffect(() => {
    const url = SITE.url + path; document.title = `${title} | ${SITE.name}`;
    set('meta[name="description"]', "content", description, ["meta", "name", "description"]);
    set('link[rel="canonical"]', "href", url, ["link", "rel", "canonical"]);
    set('meta[property="og:title"]', "content", title, ["meta", "property", "og:title"]);
    set('meta[property="og:description"]', "content", description, ["meta", "property", "og:description"]);
    set('meta[property="og:url"]', "content", url, ["meta", "property", "og:url"]);
    const ld = document.getElementById("ld") || Object.assign(document.createElement("script"), { id: "ld", type: "application/ld+json" });
    ld.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "AutoRental", name: SITE.name, url: SITE.url, address: { "@type": "PostalAddress", streetAddress: "Office No 12, 3rd Floor, Shah Nawaz Plaza, G-11 Markaz", addressLocality: "Islamabad", postalCode: "44000", addressCountry: "PK" }, hasMap: SITE.maps });
    document.head.appendChild(ld);
  }, [title, description, path]);
}
