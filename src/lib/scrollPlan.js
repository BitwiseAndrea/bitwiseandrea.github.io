// scrollPlan.js
// -----------------------------------------------------------------------------
// The page is one continuous animation. This file defines the named keyframes
// along total scroll progress (0..1) and a single interpolator that returns
// the morphed values for any progress between them.
//
// Every "layer" of the site (sky, celestial body, weather, mountains, rain)
// reads from this plan instead of having its own scroll triggers — that way
// everything stays perfectly in lockstep, and the whole page reads as a single
// hand-choreographed sequence.

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
// Each entry is a moment along the page. progress is 0..1 of total page scroll.
//
// Fields:
//   skyTop/Mid/Bot     -> the three stops of the global sky gradient
//   sunX/sunY          -> celestial position, 0..1 of viewport (Y: 0 top, 1 bottom)
//   sunColor           -> the warm body color (sun) vs cool (moon)
//   sunGlow            -> outer halo strength, 0..1
//   sunSize            -> diameter as fraction of min(vw,vh)
//   sunCrater          -> 0 = sun, 1 = moon (drives crater overlay opacity)
//   weather            -> dominant particle type for this moment
//   weatherIntensity   -> 0..1
//   rainBoost          -> additive contribution to global cursor rain (0..1)
//   mountainTint       -> CSS color filter target for the silhouette layer
//   mountainShift      -> parallax baseline (0..1)
//   accentColor        -> color of UI accents (cursor, nav) in this moment
//   ambient            -> a soft text-color for hint copy (cursor labels etc.)

const KEYFRAMES = [
  // --- SUN ARC --- the sun rises in the east (left), arcs overhead, and
  // descends into the west (right). It's biggest at dawn and shrinks as it
  // climbs into the bright midday sky.
  {
    progress: 0.00,
    name: 'dawn',
    skyTop: '#fcd1a1', skyMid: '#f7a2a0', skyBot: '#6e5a8a',
    sunX: 0.18, sunY: 0.74, sunColor: '#fff0c4', sunGlow: 0.55, sunSize: 0.42, sunCrater: 0.0,
    weather: 'petals',    weatherIntensity: 0.55,
    rainBoost: 0.0,
    mountainTint: '#1c1230', mountainShift: 0.10,
    accentColor: '#fff0c4', ambient: '#fff3df',
  },
  {
    progress: 0.18,
    name: 'morning',
    skyTop: '#9fc8ff', skyMid: '#d6ecff', skyBot: '#fff4d8',
    sunX: 0.30, sunY: 0.42, sunColor: '#fff8d6', sunGlow: 0.80, sunSize: 0.28, sunCrater: 0.0,
    weather: 'pollen',    weatherIntensity: 0.65,
    rainBoost: 0.0,
    mountainTint: '#345689', mountainShift: 0.18,
    accentColor: '#fcb86a', ambient: '#1c2a3a',
  },
  {
    progress: 0.36,
    name: 'noon',
    skyTop: '#71c5ff', skyMid: '#b9e5ff', skyBot: '#f4fbff',
    sunX: 0.52, sunY: 0.12, sunColor: '#fffdf2', sunGlow: 1.00, sunSize: 0.18, sunCrater: 0.0,
    weather: 'pollen',    weatherIntensity: 0.45,
    rainBoost: 0.0,
    mountainTint: '#5e6e8a', mountainShift: 0.26,
    accentColor: '#ffba5b', ambient: '#1c2a3a',
  },
  {
    progress: 0.54,
    name: 'garden',
    skyTop: '#bfe199', skyMid: '#7eba78', skyBot: '#244a2e',
    sunX: 0.72, sunY: 0.22, sunColor: '#fff1b8', sunGlow: 0.55, sunSize: 0.22, sunCrater: 0.0,
    weather: 'leaves',    weatherIntensity: 0.80,
    rainBoost: 0.05,
    mountainTint: '#22301f', mountainShift: 0.35,
    accentColor: '#f2e89e', ambient: '#1f2a1f',
  },
  {
    progress: 0.70,
    name: 'storm',
    skyTop: '#1a1b2e', skyMid: '#3a3e63', skyBot: '#585f86',
    sunX: 0.90, sunY: 0.58, sunColor: '#3f4665', sunGlow: 0.18, sunSize: 0.22, sunCrater: 0.15,
    weather: 'rain',      weatherIntensity: 1.00,
    rainBoost: 0.95,
    mountainTint: '#0e1024', mountainShift: 0.50,
    accentColor: '#bcd4ff', ambient: '#e7ecff',
  },
  // --- sun has set; body slides under the horizon out of view ---------
  {
    progress: 0.78,
    name: 'sunset',
    skyTop: '#13162a', skyMid: '#262d5a', skyBot: '#3a407d',
    sunX: 0.98, sunY: 1.20, sunColor: '#2a2f4a', sunGlow: 0.05, sunSize: 0.22, sunCrater: 0.4,
    weather: 'rain',      weatherIntensity: 0.85,
    rainBoost: 0.45,
    mountainTint: '#0a0d22', mountainShift: 0.55,
    accentColor: '#cdd5ec', ambient: '#dee4f0',
  },
  // --- MOON ARC --- body wraps under the world and emerges from the east -
  {
    progress: 0.82,
    name: 'moonrise_under',
    skyTop: '#0d122b', skyMid: '#1d2558', skyBot: '#2f3779',
    sunX: 0.04, sunY: 1.20, sunColor: '#dde4ff', sunGlow: 0.30, sunSize: 0.22, sunCrater: 1.0,
    weather: 'fireflies', weatherIntensity: 0.75,
    rainBoost: 0.30,
    mountainTint: '#080a20', mountainShift: 0.58,
    accentColor: '#ffeec0', ambient: '#e3eaf0',
  },
  {
    progress: 0.90,
    name: 'twilight',
    skyTop: '#0b1230', skyMid: '#1a2257', skyBot: '#2a3170',
    sunX: 0.12, sunY: 0.52, sunColor: '#f6efd5', sunGlow: 0.50, sunSize: 0.22, sunCrater: 1.0,
    weather: 'fireflies', weatherIntensity: 0.70,
    rainBoost: 0.18,
    mountainTint: '#070b1f', mountainShift: 0.60,
    accentColor: '#fff6b3', ambient: '#e7ecff',
  },
  {
    progress: 1.00,
    name: 'night',
    skyTop: '#04050f', skyMid: '#0b1230', skyBot: '#1a2257',
    sunX: 0.30, sunY: 0.20, sunColor: '#fffaf0', sunGlow: 0.78, sunSize: 0.20, sunCrater: 1.0,
    weather: 'fireflies', weatherIntensity: 0.85,
    rainBoost: 0.12,
    mountainTint: '#04050f', mountainShift: 0.65,
    accentColor: '#fff6b3', ambient: '#eef1ff',
  },
];

export const SECTION_PROGRESS = {
  dawn:   0.08,
  day:    0.30,
  garden: 0.52,
  storm:  0.70,
  night:  0.92,
};

// Easing inside a segment for nicer transitions (cubic ease-in-out).
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function interpolatePlan(progress) {
  const p = clamp(progress, 0, 1);
  // Find the two keyframes we're between.
  let a = KEYFRAMES[0];
  let b = KEYFRAMES[KEYFRAMES.length - 1];
  for (let i = 0; i < KEYFRAMES.length - 1; i += 1) {
    if (p >= KEYFRAMES[i].progress && p <= KEYFRAMES[i + 1].progress) {
      a = KEYFRAMES[i];
      b = KEYFRAMES[i + 1];
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
