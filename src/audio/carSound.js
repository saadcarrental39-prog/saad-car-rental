// Synthesised "car rolls through" sound – no audio files needed (Web Audio API).
//  • outgoing car : engine revs up, tyres roar, it pulls away to the right and fades
//  • incoming car : arrives from the right, engine drops to idle, tyres settle, soft suspension thump
// Browsers only allow audio after a user gesture, so the context is created lazily on the first click / key / swipe.

let ctx = null, master = null, brown = null, white = null;
const BED = 0.4;   // loudness of engine + tyres + air under the ticks (0 = ticks only, 1 = as loud as before)

const KEY = "lc-sound";
let muted = false;
try { muted = localStorage.getItem(KEY) === "off"; } catch (_) { /* private mode */ }

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();

  master = ctx.createGain();
  master.gain.value = 0.6;
  const comp = ctx.createDynamicsCompressor();       // keeps peaks polite on phone speakers
  master.connect(comp); comp.connect(ctx.destination);

  const len = ctx.sampleRate * 2;
  brown = ctx.createBuffer(1, len, ctx.sampleRate);
  white = ctx.createBuffer(1, len, ctx.sampleRate);
  const b = brown.getChannelData(0), w = white.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const r = Math.random() * 2 - 1;
    w[i] = r;
    last = (last + 0.02 * r) / 1.02;                  // brown noise = deep road rumble
    b[i] = last * 3.5;
  }
  return ctx;
}

/** Call from any user gesture so the very first click already has sound. */
export function unlock() {
  const c = ensure();
  if (c && c.state === "suspended") c.resume();
}

export function armOnFirstGesture() {
  const once = () => { unlock(); ["pointerdown", "pointerup", "keydown", "touchend"].forEach((e) => removeEventListener(e, once, true)); };
  ["pointerdown", "pointerup", "keydown", "touchend"].forEach((e) => addEventListener(e, once, true));
  return () => ["pointerdown", "pointerup", "keydown", "touchend"].forEach((e) => removeEventListener(e, once, true));
}

export const isMuted = () => muted;
export function setMuted(v) {
  muted = v;
  try { localStorage.setItem(KEY, v ? "off" : "on"); } catch (_) { /* ignore */ }
  if (!v) unlock();
}

// small helpers ---------------------------------------------------------------------------------
const noise = (buf, t0, dur) => {
  const s = ctx.createBufferSource();
  s.buffer = buf; s.loop = true;
  s.start(t0, Math.random()); s.stop(t0 + dur + 0.05);
  return s;
};
const env = (param, t0, pts) => {                     // pts = [[time offset, value], ...]
  param.setValueAtTime(Math.max(pts[0][1], 0.0001), t0 + pts[0][0]);
  for (let i = 1; i < pts.length; i++) param.linearRampToValueAtTime(Math.max(pts[i][1], 0.0001), t0 + pts[i][0]);
};

/**
 * One car passing by.
 * leaving = true  → revs up and drives away (pitch ↑, volume ↓, pan → right)
 * leaving = false → arrives and brakes to idle (pitch ↓, volume ↑, pan ← to centre)
 */
function pass(t0, dur, leaving) {
  const out = ctx.createGain();
  out.gain.value = BED;
  let tail = out;
  if (ctx.createStereoPanner) {
    const pan = ctx.createStereoPanner();
    env(pan.pan, t0, leaving ? [[0, 0], [dur, 0.85]] : [[0, 0.85], [dur * 0.9, 0]]);
    out.connect(pan); tail = pan;
  }
  tail.connect(master);

  // engine
  const eng = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass"; lp.Q.value = 3;
  const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
  o1.type = "sawtooth"; o2.type = "triangle";
  const [f0, f1] = leaving ? [62, 230] : [190, 58];
  o1.frequency.setValueAtTime(f0, t0);
  o1.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  o2.frequency.setValueAtTime(f0 / 2, t0);
  o2.frequency.exponentialRampToValueAtTime(f1 / 2, t0 + dur);
  lp.frequency.setValueAtTime(f0 * 4, t0);
  lp.frequency.exponentialRampToValueAtTime(f1 * 4, t0 + dur);
  env(eng.gain, t0, leaving
    ? [[0, 0.0001], [dur * 0.15, 0.2], [dur * 0.55, 0.22], [dur, 0.0001]]
    : [[0, 0.0001], [dur * 0.45, 0.14], [dur * 0.85, 0.2], [dur, 0.0001]]);
  o1.connect(lp); o2.connect(lp); lp.connect(eng); eng.connect(out);
  o1.start(t0); o2.start(t0); o1.stop(t0 + dur + 0.05); o2.stop(t0 + dur + 0.05);

  // tyres / road rumble (brown noise)
  const rum = ctx.createGain();
  const rlp = ctx.createBiquadFilter();
  rlp.type = "lowpass"; rlp.frequency.value = leaving ? 260 : 200;
  env(rum.gain, t0, leaving
    ? [[0, 0.0001], [dur * 0.3, 0.55], [dur, 0.0001]]
    : [[0, 0.0001], [dur * 0.5, 0.5], [dur, 0.0001]]);
  const rn = noise(brown, t0, dur);
  rn.connect(rlp); rlp.connect(rum); rum.connect(out);

  // air whoosh (bandpassed white noise, sweeping)
  const wh = ctx.createGain();
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass"; bp.Q.value = 0.9;
  bp.frequency.setValueAtTime(leaving ? 500 : 2600, t0);
  bp.frequency.exponentialRampToValueAtTime(leaving ? 2600 : 420, t0 + dur);
  env(wh.gain, t0, [[0, 0.0001], [dur * 0.45, 0.16], [dur, 0.0001]]);
  const wn = noise(white, t0, dur);
  wn.connect(bp); bp.connect(wh); wh.connect(out);
}


/** One crisp mechanical "tik": a tiny click of filtered noise + a short wooden blip. pan = -1 (left) … 1 (right). */
function tick(t0, strength, pan) {
  const g = ctx.createGain();
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass"; bp.frequency.value = 3200 + Math.random() * 500; bp.Q.value = 2.2;
  env(g.gain, t0, [[0, 0.0001], [0.0015, 0.55 * strength], [0.022, 0.0001]]);
  const n = noise(white, t0, 0.03);
  n.connect(bp); bp.connect(g);

  const o = ctx.createOscillator(), og = ctx.createGain();
  o.type = "square"; o.frequency.setValueAtTime(1900, t0); o.frequency.exponentialRampToValueAtTime(900, t0 + 0.018);
  env(og.gain, t0, [[0, 0.0001], [0.001, 0.12 * strength], [0.02, 0.0001]]);
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 4200;
  o.connect(lp); lp.connect(og);
  o.start(t0); o.stop(t0 + 0.03);

  let tail = ctx.createGain(); tail.gain.value = 1;
  g.connect(tail); og.connect(tail);
  if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; tail.connect(p); tail = p; }
  tail.connect(master);
}

function thump(t0) {                                   // suspension settling when the car stops
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(95, t0);
  o.frequency.exponentialRampToValueAtTime(38, t0 + 0.28);
  env(g.gain, t0, [[0, 0.0001], [0.015, 0.45], [0.3, 0.0001]]);
  o.connect(g); g.connect(master);
  o.start(t0); o.stop(t0 + 0.35);
}

/** outMs / inMs / inDelay are the same numbers the animation uses, so sound and motion stay in sync.
 *  outTicks / inTicks = times (ms) of each "tik", measured from the click. */
export function playRoll({ outMs, inMs, inDelay, settleAt, outTicks = [], inTicks = [] }) {
  if (muted) return;
  const c = ensure();
  if (!c) return;
  if (c.state === "suspended") c.resume();
  const t = c.currentTime + 0.02;
  pass(t, outMs / 1000, true);
  pass(t + inDelay / 1000, inMs / 1000, false);

  // leaving car: ticks get louder + pan to the right as it speeds off
  outTicks.forEach((ms, i) => tick(t + ms / 1000, 0.55 + 0.45 * (i / outTicks.length), (i / outTicks.length) * 0.8));
  // arriving car: ticks start loud & far right, soften and centre as it brakes (last one is the firm "tok")
  inTicks.forEach((ms, i, a) => {
    const k = i / a.length;
    tick(t + ms / 1000, i === a.length - 1 ? 1 : 1 - 0.55 * k, 0.8 * (1 - k));
  });
  thump(t + settleAt / 1000);
}
