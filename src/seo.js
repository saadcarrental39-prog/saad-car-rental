import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { pageByPath, headFor, notFoundHead } from "./seo/registry";
import { applyHead } from "./seo/head";
import { SITE } from "./config";
import { trackPageType } from "./analytics";

// Every page gets its head from the registry (same data the prerender used), so title, description, canonical, robots,
// Open Graph, Twitter and JSON-LD stay correct when visitors navigate inside the app.
// A page that is not in the registry may pass { title, description } as a fallback; { notFound: true } makes it noindex.
export function useSeo(fallback = {}) {
  const { pathname } = useLocation();
  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
    const page = pageByPath(path);
    if (fallback.notFound) return applyHead(notFoundHead());
    if (page) { trackPageType(page.kind, page.slug); return applyHead(headFor(page)); }
    if (fallback.title) applyHead({ title: `${fallback.title} | ${SITE.shortName}`, description: fallback.description || "", robots: "noindex, follow", canonical: null, og: null, jsonLd: null });
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
}
