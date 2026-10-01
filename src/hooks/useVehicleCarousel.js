import { useCallback, useEffect, useRef, useState } from "react";
import { playRoll } from "../audio/carSound";
import { bezierTimes } from "../audio/bezier";

// ---- tune the roll here -------------------------------------------------------------------------
const ARC_DEG = 56;        // how far round the circle the car travels (bigger = bigger sweep)
const RADIUS = 1.25;       // circle radius as a multiple of the car width (smaller = tighter circle)
const TICK_DEG = 4.5;      // one "tik" every this many degrees of travel (tiks come fast when the car is fast, slow when it brakes)
const RESPECT_REDUCED_MOTION = false; // true = skip the animation if the OS has "reduce motion" on (that made the car just swap)
const LEAN = 0.16;         // 0 = car stays perfectly upright, 1 = car spins with the wheel. A little lean feels premium
const OUT_MS = 950;        // current car: accelerates away round the circle + fades
const IN_MS = 1300;        // next car: sweeps in round the circle, brakes, settles
const IN_DELAY = 260;      // next car starts slightly after, so the two overlap softly
const SWAP_MS = 330;       // when text / counter switch to the new vehicle
const BEZ_OUT = [.4, 0, .8, .45];
const BEZ_IN = [.12, .75, .2, 1];
const EASE_OUT_CAR = `cubic-bezier(${BEZ_OUT})`;   // pulls away: slow start, fast exit
const EASE_IN_CAR = `cubic-bezier(${BEZ_IN})`;    // arrives fast, brakes smoothly to a stop
// -------------------------------------------------------------------------------------------------

const reduced = () => RESPECT_REDUCED_MOTION && matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Cars sit on a big wheel. NEXT = the wheel turns ANTI-clockwise: the current car drives down and away
 * round the circle, the next car swings in from the top-right round the same circle and brakes to a stop.
 * PREV = exactly the reverse (clockwise). Sound is synthesised in ../audio/carSound.js.
 */
export function useVehicleCarousel(vehicles, root) {
  const [index, setIndex] = useState(0);
  const cur = useRef(0);
  const busy = useRef(false);
  const pending = useRef(0);      // one queued click, so fast clicking never feels dead
  const timers = useRef([]);

  const applyTheme = useCallback((i) => {
    const el = root.current; const v = vehicles[i];
    Object.entries(v.theme).forEach(([k, val]) => el.style.setProperty(k, val));
    const blob = el.querySelector(".lc__blob");
    blob.style.setProperty("--rot", `${v.blob.rotate}deg`);
    blob.style.setProperty("--radius", v.blob.radius);
  }, [vehicles, root]);

  const go = useCallback((dir) => {
    const el = root.current;
    if (!el || vehicles.length < 2) return;
    if (busy.current) { pending.current = dir; return; }
    busy.current = true;

    const n = vehicles.length;
    const from = cur.current;
    const to = (from + dir + n) % n;
    const cars = el.querySelectorAll("[data-car]");
    const outCar = cars[from], inCar = cars[to];
    const commit = () => { cur.current = to; setIndex(to); };

    const settle = (anims = []) => {
      cars.forEach((c, i) => {
        c.style.transformOrigin = "";
        const on = i === to;
        c.style.opacity = on ? "1" : "0";
        c.style.visibility = on ? "visible" : "hidden";
        c.setAttribute("aria-hidden", on ? "false" : "true");
      });
      anims.forEach((a) => a.cancel());   // only ours; the idle float / text CSS animations keep running
      busy.current = false;
      const next = pending.current; pending.current = 0;
      if (next) go(next);
    };

    applyTheme(to);

    if (reduced()) { commit(); settle(); return; }

    // pivot sits to the right of the car → rotating round it makes the car travel on a circle
    const w = outCar.offsetWidth;
    const pivot = `${w / 2 + w * RADIUS}px 50%`;
    const a = -ARC_DEG * dir;                     // CSS: negative = anti-clockwise  (dir = 1 → anti-clockwise)
    const mk = (node, frames, opts) => node.animate(frames, { fill: "both", ...opts });

    // the car follows the circle (car rotate) while its body is counter-rotated so it only leans a little
    const roll = (car, fromDeg, toDeg, fade, blur, scale, opts) => {
      car.style.transformOrigin = pivot;
      const counter = car.querySelector("[data-counter]");
      const k = 1 - LEAN;
      return [
        mk(car, [{ transform: `rotate(${fromDeg}deg)` }, { transform: `rotate(${toDeg}deg)` }], opts),
        mk(counter, [
          { transform: `rotate(${-fromDeg * k}deg) scale(${scale[0]})`, filter: `blur(${blur[0]}px)` },
          { transform: `rotate(${-toDeg * k}deg) scale(${scale[1]})`, filter: `blur(${blur[1]}px)` },
        ], opts),
        mk(car, fade, opts),
      ];
    };

    inCar.style.visibility = "visible";
    const anims = [
      ...roll(outCar, 0, a, [{ opacity: 1 }, { opacity: 1, offset: 0.45 }, { opacity: 0 }], [0, 5], [1, 0.9],
        { duration: OUT_MS, easing: EASE_OUT_CAR }),
      ...roll(inCar, -a, 0, [{ opacity: 0 }, { opacity: 1, offset: 0.35 }, { opacity: 1 }], [5, 0], [0.9, 1],
        { duration: IN_MS, delay: IN_DELAY, easing: EASE_IN_CAR }),
    ];

    // premium touches on the arriving car only (not waited for, they just play out)
    const arrive = IN_DELAY + IN_MS;
    const img = inCar.querySelector("img");
    const shine = inCar.querySelector(".lc__shine");
    if (shine) shine.animate(
      [{ opacity: 0, backgroundPosition: "170% 0" }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.85 }, { opacity: 0, backgroundPosition: "-70% 0" }],
      { duration: 1100, delay: IN_DELAY + IN_MS * 0.5, easing: "ease-in-out" });
    if (img) img.animate(                                         // nose-dip when the car brakes to a stop
      [{ transform: "translateY(0) rotate(0)" },
       { transform: "translateY(6px) rotate(-.7deg)", offset: 0.35 },
       { transform: "translateY(-2px) rotate(.25deg)", offset: 0.7 },
       { transform: "translateY(0) rotate(0)" }],
      { duration: 650, delay: arrive - 520, easing: "ease-out" });

    // "tik" moments: one every TICK_DEG degrees of the same eased motion the car follows, so the ticks match what you see
    const steps = Math.round(ARC_DEG / TICK_DEG);
    const outTicks = bezierTimes(BEZ_OUT, OUT_MS, steps);                        // speeding up  → ticks get closer
    const inTicks = bezierTimes(BEZ_IN, IN_MS, steps).map((t) => t + IN_DELAY);  // braking      → ticks spread out
    playRoll({ outMs: OUT_MS, inMs: IN_MS, inDelay: IN_DELAY, settleAt: arrive - 480, outTicks, inTicks });

    // text + big ghost label leave quickly, then the new ones mount and play their enter animation
    const info = el.querySelector(".lc__info");
    const ghost = el.querySelector(".lc__ghost");
    [...(info ? info.children : []), ghost].filter(Boolean).forEach((node, i) => {
      node.animate([{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-14px)" }],
        { duration: 220, delay: i * 25, easing: "ease-in", fill: "forwards" });
    });
    timers.current.push(setTimeout(commit, SWAP_MS));

    let done = false;
    const finish = () => { if (done) return; done = true; settle(anims); };
    Promise.all(anims.map((x) => x.finished)).then(finish, finish);
    timers.current.push(setTimeout(finish, IN_DELAY + IN_MS + 600)); // safety net
  }, [vehicles, root, applyTheme]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return { index, go };
}
