import { useEffect, useLayoutEffect, useRef } from "react";
import { useVehicleCarousel } from "../../hooks/useVehicleCarousel";
import BackgroundLayers from "./BackgroundLayers";
import VehicleVisual from "./VehicleVisual";
import VehicleInfo from "./VehicleInfo";
import CarouselControls from "./CarouselControls";
import SoundToggle from "./SoundToggle";
import { armOnFirstGesture } from "../../audio/carSound";

export default function VehicleCarousel({ vehicles, label = "Fleet" }) {
  const root = useRef(null);
  const { index, go } = useVehicleCarousel(vehicles, root);
  const v = vehicles[index];

  // first paint: only the first car is visible, the others wait off-stage
  useLayoutEffect(() => {
    root.current.querySelectorAll("[data-car]").forEach((c, i) => {
      c.style.opacity = i === 0 ? "1" : "0";
      c.style.visibility = i === 0 ? "visible" : "hidden";
      c.setAttribute("aria-hidden", i === 0 ? "false" : "true");
    });
    Object.entries(vehicles[0].theme).forEach(([k, val]) => root.current.style.setProperty(k, val));
    const b = root.current.querySelector(".lc__blob");
    b.style.setProperty("--rot", `${vehicles[0].blob.rotate}deg`);
    b.style.setProperty("--radius", vehicles[0].blob.radius);
  }, []);

  // browsers need a user gesture before audio may play – unlock it on the very first tap / key
  useEffect(() => armOnFirstGesture(), []);

  // The car pictures are lazy (they download when this carousel is about to be seen, not while the page first opens).
  // "lc--near" also switches on the shine effect, whose small picture is only fetched at that moment.
  useEffect(() => {
    const el = root.current;
    if (!("IntersectionObserver" in window)) { el.classList.add("lc--near"); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("lc--near"); io.disconnect(); } }, { rootMargin: "500px 0px" });
    io.observe(el); return () => io.disconnect();
  }, []);

  // keyboard, swipe / drag, and a tiny pointer parallax (desktop only)
  useEffect(() => {
    const el = root.current;
    let act = false;
    const on = () => { act = true; }, off = () => { act = false; };
    const onKey = (e) => { if (!act) return; if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    let sx = 0, sy = 0, tracking = false;
    const down = (e) => { if (e.target.closest("a,button")) return; tracking = true; sx = e.clientX; sy = e.clientY; };
    const up = (e) => {
      if (!tracking) return; tracking = false;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) go(dx < 0 ? 1 : -1);
    };
    addEventListener("keydown", onKey);
    el.addEventListener("pointerdown", down); addEventListener("pointerup", up);
    el.addEventListener("pointerenter", on); el.addEventListener("pointerleave", off); el.addEventListener("focusin", on); el.addEventListener("focusout", off);
    return () => {
      removeEventListener("keydown", onKey); el.removeEventListener("pointerdown", down); removeEventListener("pointerup", up);
      el.removeEventListener("pointerenter", on); el.removeEventListener("pointerleave", off); el.removeEventListener("focusin", on); el.removeEventListener("focusout", off);
    };
  }, [go]);

  return (
    <section className="lc" ref={root} aria-roledescription="carousel" aria-label={label}>
      <BackgroundLayers />
      <VehicleVisual vehicles={vehicles} index={index} />
      <VehicleInfo key={v.id} v={v} />
      <SoundToggle />
      <CarouselControls index={index} total={vehicles.length} onPrev={() => go(-1)} onNext={() => go(1)} />
    </section>
  );
}
