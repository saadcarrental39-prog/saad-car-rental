import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { initFleet } from "./fleetSync";
import "./styles/automotive-carousel.css";
import "./styles/site.css";
import "./styles/seo.css";
import { initAnalytics } from "./analytics";
function Root() { // remounts once if the owner changed prices since this visitor's last visit
  const [k, setK] = useState(0);
  useEffect(() => { const f = () => setK((x) => x + 1); addEventListener("fleet-updated", f); return () => removeEventListener("fleet-updated", f); }, []);
  return <BrowserRouter><App key={k} /></BrowserRouter>;
}
initAnalytics();
initFleet().finally(() => createRoot(document.getElementById("root")).render(<Root />));

// Auto-refresh when a new version is deployed, so nobody keeps running old files.
if (import.meta.env.PROD) {
  const check = async () => {
    try {
      const r = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" }); const { id } = await r.json();
      if (id && id !== __BUILD_ID__ && sessionStorage.getItem("v") !== id) { sessionStorage.setItem("v", id); location.reload(); }
    } catch { /* offline: ignore */ }
  };
  check(); document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && check());
}
