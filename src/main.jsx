import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/automotive-carousel.css";
import "./styles/site.css";
import "./styles/reviews.css";
createRoot(document.getElementById("root")).render(<BrowserRouter><App /></BrowserRouter>);

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
