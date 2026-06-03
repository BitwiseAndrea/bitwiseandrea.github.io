// scrollPlan.js
// -----------------------------------------------------------------------------
// The page is one continuous animation. This file defines the named keyframes
// along total scroll progress (0..1) and a single interpolator that returns
// the morphed values for any progress between them.
//
// Each "layer" of the site (sky, celestial body, weather, mountains, rain)
// reads from this plan instead of having its own scroll triggers — that way
// everything stays perfectly in lockstep, and the whole page reads as a single
// hand-choreographed sequence.
//
// Keyframe placement
// ------------------
// Keyframes don't hardcode a `progress` value (those numbers depend on the
// real pixel layout of the page, which changes every time copy or imagery is
// added). Instead, each keyframe declares an `anchor`, which is one of:
//
//   'page-start'              -> scrollY = 0 (progress = 0)
//   'page-end'                -> scrollY = scrollMax (progress = 1)
//   ['<sectionId>', t]        -> scrollY = sectionTop + sectionHeight * t,
//                                where t is 0..1 within that section.
//
// At runtime, `resolveLayout(measurements, scrollMax)` is called whenever
// section sizes change (initial mount, window resize, content resize). It
// translates each keyframe's anchor into a concrete progress value. The
// interpolator and the navigation scroll-spy both read from those resolved
// values, so the animation always tracks the real DOM, no matter how tall a
// section grows.
//
// Click-to-jump alignment
// -----------------------
// The right-side pip nav scrolls each section to its `offsetTop`. To make
// nav clicks feel "right" (matching content + matching scene visual), each
// scene's primary keyframe is anchored at t=0 of its section. So clicking
// "Tooling" lands the user at the desert scene's peak, with the section's
// heading and cards in view at the same time. Secondary keyframes (sunset,
// moonrise, twilight) are placed within the storm section so the moon-arc
// transition reads as a continuous descent into night.

// --- helpers -----------------------------------------------------------------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r, g, b) {
  const to = (v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function lerpColor(a, b, t) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex(lerp(ca.r, cb.r, t), lerp(ca.g, cb.g, t), lerp(ca.b, cb.b, t));
}

// --- keyframes ---------------------------------------------------------------
// Each entry is a moment along the page.
//
// Fields:
//   anchor             -> see "Keyframe placement" notes above
//   skyTop/Mid/Bot     -> the three stops of the global sky gradient
//   sunX/sunY          -> celestial position, 0..1 of viewport (Y: 0 top, 1 bottom)
//   sunColor           -> the warm body color (sun) vs cool (moon)
//   sunGlow            -> outer halo strength, 0..1
//   sunSize            -> diameter as fraction of min(vw,vh)
//   sunCrater          -> 0 = sun, 1 = moon (drives crater overlay opacity)
//   sunRays            -> volumetric god-rays opacity (0..1). Peaks at dawn,
//                         fades through morning, gone by garden onward.
//   oceanAmount        -> visibility (0..1) of the OceanLayer's waves. 0
//                         everywhere except the Daylight stretch (morning
//                         and noon), where it peaks at 1.0 so the
//                         foreground reads as a moving water surface
//                         instead of mountains.
//   weather            -> dominant particle type for this moment
//   weatherIntensity   -> 0..1
//   rainBoost          -> additive contribution to global cursor rain (0..1).
//                         Kept at 0 outside the storm/sunset window so the
//                         rain only falls in the last page or two.
//   mountainTint       -> CSS color filter target for the silhouette layer
//   mountainShift      -> parallax baseline (0..1)
//   accentColor        -> color of UI accents (cursor, nav) in this moment
//   ambient            -> a soft text-color for hint copy (cursor labels etc.)

const KEYFRAMES = [
  // --- SUN ARC --- the sun rises in the east (left), arcs overhead, and
  // descends into the west (right). It's biggest at dawn and shrinks as it
  // climbs into the bright midday sky.
  {
    anchor: 'page-start',
    name: 'dawn',
    skyTop: '#ffd9a8', skyMid: '#ffb486', skyBot: '#7d6ea4',
    sunX: 0.18, sunY: 0.74, sunColor: '#fff2c8', sunGlow: 0.70, sunSize: 0.44, sunCrater: 0.0,
    sunRays: 1.00,
    oceanAmount: 0.0,
    weather: 'mist', weatherIntensity: 0.0,
    rainBoost: 0.0,
    mountainTint: '#1c1230', mountainShift: 0.10,
    accentColor: '#fff0c4', ambient: '#fff3df',
  },
  {
    anchor: ['day', 0.0],
    name: 'morning',
    skyTop: '#9fc8ff', skyMid: '#d6ecff', skyBot: '#fff4d8',
    sunX: 0.30, sunY: 0.42, sunColor: '#fff8d6', sunGlow: 0.85, sunSize: 0.28, sunCrater: 0.0,
    sunRays: 0.45,
    oceanAmount: 1.0,
    weather: 'mist', weatherIntensity: 0.0,
    rainBoost: 0.0,
    mountainTint: '#345689', mountainShift: 0.18,
    accentColor: '#fcb86a', ambient: '#1c2a3a',
  },
  {
    anchor: ['day', 0.78],
    name: 'noon',
    skyTop: '#71c5ff', skyMid: '#b9e5ff', skyBot: '#f4fbff',
    sunX: 0.52, sunY: 0.12, sunColor: '#fffdf2', sunGlow: 1.00, sunSize: 0.18, sunCrater: 0.0,
    sunRays: 0.18,
    oceanAmount: 1.0,
    weather: 'mist', weatherIntensity: 0.0,
    rainBoost: 0.0,
    mountainTint: '#5e6e8a', mountainShift: 0.26,
    accentColor: '#ffba5b', ambient: '#1c2a3a',
  },
  // --- DESERT --- high-noon sun bakes a dusty, sandy landscape. The ocean
  // is gone; mountains read as faraway pale-tan dunes. Cacti grow in along
  // the foreground here (see ForegroundFloraLayer's CACTUS_WINDOW). The
  // daylight stretch (dawn → desert) all share `weather: 'mist'` with
  // intensity 0 so no particles spawn, and the garden's mist can fade in
  // cleanly without a particle-type cross-fade.
  {
    anchor: ['desert', 0.0],
    name: 'desert',
    skyTop: '#fff0c0', skyMid: '#ffe1a0', skyBot: '#f4cc88',
    sunX: 0.60, sunY: 0.14, sunColor: '#fffaea', sunGlow: 1.00, sunSize: 0.20, sunCrater: 0.0,
    sunRays: 0.15,
    oceanAmount: 0.0,
    weather: 'mist', weatherIntensity: 0.0,
    rainBoost: 0.0,
    mountainTint: '#c89a6a', mountainShift: 0.30,
    accentColor: '#e89a4a', ambient: '#3a2418',
  },
  {
    anchor: ['garden', 0.0],
    name: 'garden',
    skyTop: '#bfe199', skyMid: '#7eba78', skyBot: '#244a2e',
    sunX: 0.72, sunY: 0.22, sunColor: '#fff1b8', sunGlow: 0.55, sunSize: 0.22, sunCrater: 0.0,
    sunRays: 0.08,
    oceanAmount: 0.0,
    weather: 'mist', weatherIntensity: 0.55,
    rainBoost: 0.0,
    mountainTint: '#22301f', mountainShift: 0.35,
    accentColor: '#f2e89e', ambient: '#1f2a1f',
  },
  {
    anchor: ['storm', 0.0],
    name: 'storm',
    skyTop: '#1a1b2e', skyMid: '#3a3e63', skyBot: '#585f86',
    sunX: 0.90, sunY: 0.58, sunColor: '#3f4665', sunGlow: 0.18, sunSize: 0.22, sunCrater: 0.15,
    sunRays: 0.0,
    oceanAmount: 0.0,
    weather: 'rain',      weatherIntensity: 1.00,
    rainBoost: 1.0,
    mountainTint: '#0e1024', mountainShift: 0.50,
    accentColor: '#bcd4ff', ambient: '#e7ecff',
  },
  // --- sun has set; body slides under the horizon out of view ---------
  {
    anchor: ['storm', 0.5],
    name: 'sunset',
    skyTop: '#13162a', skyMid: '#262d5a', skyBot: '#3a407d',
    sunX: 0.98, sunY: 1.20, sunColor: '#2a2f4a', sunGlow: 0.05, sunSize: 0.22, sunCrater: 0.4,
    sunRays: 0.0,
    oceanAmount: 0.0,
    weather: 'rain',      weatherIntensity: 0.55,
    rainBoost: 0.40,
    mountainTint: '#0a0d22', mountainShift: 0.55,
    accentColor: '#cdd5ec', ambient: '#dee4f0',
  },
  // --- MOON ARC --- the moon wraps under the world during sunset and rises
  // straight up from bottom-center: a slow, big, full-moon moonrise rather
  // than a horizontal sweep across the sky. Horizontal position is locked
  // at 0.50 across the whole arc so the only motion the eye reads is the
  // gentle rise. The end pose hangs the moon comfortably below the contact
  // copy and well above the mountain silhouettes.
  //
  // moonrise_under keeps weather='rain' (matching sunset) so the rain
  // particles smoothly decay to nothing as you scroll past the storm.
  // The type swap to 'fireflies' happens at the moonrise→twilight boundary,
  // where both keyframes have intensity 0, so no particles of either type
  // spawn during the type change. This avoids a "firefly blip" that would
  // otherwise appear mid-way through the sunset→moonrise cross-fade.
  {
    anchor: ['storm', 0.75],
    name: 'moonrise_under',
    skyTop: '#0d122b', skyMid: '#1d2558', skyBot: '#2f3779',
    sunX: 0.50, sunY: 1.55, sunColor: '#dde4ff', sunGlow: 0.30, sunSize: 0.95, sunCrater: 1.0,
    sunRays: 0.0,
    oceanAmount: 0.0,
    weather: 'rain', weatherIntensity: 0.0,
    rainBoost: 0.0,
    mountainTint: '#080a20', mountainShift: 0.58,
    accentColor: '#ffeec0', ambient: '#e3eaf0',
  },
  {
    anchor: ['storm', 0.92],
    name: 'twilight',
    skyTop: '#0b1230', skyMid: '#1a2257', skyBot: '#2a3170',
    sunX: 0.50, sunY: 1.18, sunColor: '#f6efd5', sunGlow: 0.55, sunSize: 0.95, sunCrater: 1.0,
    sunRays: 0.0,
    oceanAmount: 0.0,
    weather: 'fireflies', weatherIntensity: 0.0,
    rainBoost: 0.0,
    mountainTint: '#070b1f', mountainShift: 0.60,
    accentColor: '#fff6b3', ambient: '#e7ecff',
  },
  {
    anchor: 'page-end',
    name: 'night',
    skyTop: '#04050f', skyMid: '#0b1230', skyBot: '#1a2257',
    sunX: 0.50, sunY: 0.95, sunColor: '#fffaf0', sunGlow: 0.85, sunSize: 0.95, sunCrater: 1.0,
    sunRays: 0.0,
    oceanAmount: 0.0,
    weather: 'fireflies', weatherIntensity: 0.40,
    rainBoost: 0.0,
    mountainTint: '#04050f', mountainShift: 0.65,
    accentColor: '#fff6b3', ambient: '#eef1ff',
  },
];

// --- runtime layout resolution ----------------------------------------------
// `resolved` holds the keyframes with concrete `progress` values. Until the
// first DOM measurement happens we fall back to even-spaced progress values
// so the page isn't broken during SSR / first paint.

function fallbackResolved() {
  const last = Math.max(1, KEYFRAMES.length - 1);
  return KEYFRAMES.map((kf, i) => ({ ...kf, progress: i / last }));
}

let resolved = fallbackResolved();

// Section midpoints (for legacy callers) and full ranges (start/end as 0..1
// fractions of total scroll), both recomputed from measurements every time
// the layout changes. The scroll-spy uses the ranges to figure out which pip
// to activate, so clicking a nav pip immediately matches the active pip
// regardless of where the section's midpoint sits relative to neighbors.
let sectionProgress = {};
let sectionRanges = {};

function progressForAnchor(anchor, measurements, scrollMax) {
  if (anchor === 'page-start') return 0;
  if (anchor === 'page-end') return 1;
  if (Array.isArray(anchor)) {
    const [id, t] = anchor;
    const sec = measurements[id];
    if (!sec || scrollMax <= 0) return 0;
    return clamp((sec.top + sec.height * t) / scrollMax, 0, 1);
  }
  return 0;
}

// Recompute resolved keyframes + section midpoints against fresh DOM
// measurements. `measurements` is { [sectionId]: { top, height } }.
export function resolveLayout(measurements, scrollMax) {
  if (!measurements || scrollMax <= 0) {
    resolved = fallbackResolved();
    sectionProgress = {};
    sectionRanges = {};
    return;
  }

  resolved = KEYFRAMES.map((kf) => ({
    ...kf,
    progress: progressForAnchor(kf.anchor, measurements, scrollMax),
  }));

  sectionProgress = {};
  sectionRanges = {};
  for (const id in measurements) {
    const sec = measurements[id];
    const start = clamp(sec.top / scrollMax, 0, 1);
    const end = clamp((sec.top + sec.height) / scrollMax, 0, 1);
    sectionProgress[id] = clamp((sec.top + sec.height * 0.5) / scrollMax, 0, 1);
    sectionRanges[id] = { start, end };
  }
}

export function getSectionProgress(id) {
  return sectionProgress[id] ?? 0;
}

export function getSectionRange(id) {
  return sectionRanges[id] ?? null;
}

// --- interpolation -----------------------------------------------------------
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function interpolatePlan(progress) {
  const frames = resolved;
  const p = clamp(progress, 0, 1);
  // Find the two keyframes we're between.
  let a = frames[0];
  let b = frames[frames.length - 1];
  for (let i = 0; i < frames.length - 1; i += 1) {
    if (p >= frames[i].progress && p <= frames[i + 1].progress) {
      a = frames[i];
      b = frames[i + 1];
      break;
    }
  }
  const span = Math.max(0.0001, b.progress - a.progress);
  const tLin = (p - a.progress) / span;
  const t = easeInOut(tLin);

  return {
    progress: p,
    name: tLin < 0.5 ? a.name : b.name,
    from: a.name,
    to: b.name,
    segmentT: tLin,

    skyTop: lerpColor(a.skyTop, b.skyTop, t),
    skyMid: lerpColor(a.skyMid, b.skyMid, t),
    skyBot: lerpColor(a.skyBot, b.skyBot, t),

    sunX: lerp(a.sunX, b.sunX, t),
    sunY: lerp(a.sunY, b.sunY, t),
    sunColor: lerpColor(a.sunColor, b.sunColor, t),
    sunGlow: lerp(a.sunGlow, b.sunGlow, t),
    sunSize: lerp(a.sunSize, b.sunSize, t),
    sunCrater: lerp(a.sunCrater, b.sunCrater, t),
    sunRays: lerp(a.sunRays ?? 0, b.sunRays ?? 0, t),
    oceanAmount: lerp(a.oceanAmount ?? 0, b.oceanAmount ?? 0, t),

    weatherFrom: a.weather,
    weatherTo: b.weather,
    weatherIntensity: lerp(a.weatherIntensity, b.weatherIntensity, t),
    weatherBlend: t,

    rainBoost: lerp(a.rainBoost, b.rainBoost, t),

    mountainTint: lerpColor(a.mountainTint, b.mountainTint, t),
    mountainShift: lerp(a.mountainShift, b.mountainShift, t),

    accentColor: lerpColor(a.accentColor, b.accentColor, t),
    ambient: lerpColor(a.ambient, b.ambient, t),
  };
}

export { KEYFRAMES };
