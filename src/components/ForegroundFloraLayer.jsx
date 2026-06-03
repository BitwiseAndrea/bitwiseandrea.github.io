// ForegroundFloraLayer.jsx
// -----------------------------------------------------------------------------
// A fixed-position foreground layer rooted at the bottom of the viewport,
// sitting in front of the mountains and behind the weather.
//
// Each plant has a "lifecycle window" along the page's scroll progress
// (grow -> full -> wither -> gone). As you scroll, every plant's growth is
// recomputed and applied directly to its transform (scaleY rooted at the
// bottom), opacity, and a CSS filter so the plant visibly:
//   1. sprouts up from the ground when its scene starts,
//   2. stands proud while its scene is on-screen,
//   3. dries out and darkens as we scroll past, and
//   4. is completely gone — opacity 0, scaleY 0 — before the next scene
//      gets its hooks in.
//
// Current world rules:
//   * Dawn and Daylight have NO foreground flora — just sky / sun / mountains
//     (and during Daylight, the ocean).
//   * Desert grows a sparse line of cacti along the foreground.
//   * Garden grows lush, leafy trees along the foreground.
//   * Both groups MUST be fully withered (opacity 0, scaleY 0) before the
//     Storm scene starts at progress 0.70, so the silhouettes don't bleed
//     into the storm/night pages.

import React, { useEffect, useRef } from 'react';
import { subscribe } from '../lib/scrollState.js';

// =============================================================================
// Lifecycle math
// =============================================================================
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeIn  = (t) => t * t * t;
const clamp01 = (v) => Math.max(0, Math.min(1, v));

// Given the current scroll progress and a {growStart, growEnd, witherStart,
// witherEnd} window, returns a growth value in 0..1.
function growthAt(p, w) {
  if (p <= w.growStart) return 0;
  if (p < w.growEnd) {
    const t = clamp01((p - w.growStart) / (w.growEnd - w.growStart));
    return easeOut(t);
  }
  if (p < w.witherStart) return 1;
  if (p < w.witherEnd) {
    const t = clamp01((p - w.witherStart) / (w.witherEnd - w.witherStart));
    return 1 - easeIn(t);
  }
  return 0;
}

// Withering factor — climbs from 0 (healthy) to 1 (bare and dead) only in
// the wither half of the window. Drives:
//   * a faster-fading "leaves" layer so the plant loses its leaves before
//     its trunk collapses, and
//   * a darken / sepia / desaturate filter on the whole plant so the
//     silhouette reads as "dried out" while it's collapsing, not just
//     "shrinking."
function witheringAt(p, w) {
  if (p <= w.witherStart) return 0;
  if (p >= w.witherEnd)   return 1;
  return easeIn(clamp01((p - w.witherStart) / (w.witherEnd - w.witherStart)));
}

// Returns a CSS filter string that ramps from "alive" (no filter) to "dead"
// (darker, drier, more desaturated) as the wither factor climbs 0..1. Kept
// in one place so both cacti and garden trees share the same dying look.
function witherFilter(wither) {
  if (wither <= 0) return 'none';
  const bright   = 1 - 0.55 * wither;
  const sat      = 1 - 0.7  * wither;
  const sepia    = 0.55 * wither;
  return `brightness(${bright.toFixed(3)}) saturate(${sat.toFixed(3)}) sepia(${sepia.toFixed(3)})`;
}

function shifted(window, offset) {
  return {
    growStart:   window.growStart   + offset,
    growEnd:     window.growEnd     + offset,
    witherStart: window.witherStart + offset,
    witherEnd:   window.witherEnd   + offset,
  };
}

// =============================================================================
// Plant catalogues
// =============================================================================
// `offset` shifts each plant's lifecycle window so neighbours don't grow in
// lockstep — every plant has its own clock.

// --- Desert cacti ---
// Sparse, deliberately spaced. Cacti are slow-growing in real life and they
// should read that way visually too — fewer plants than the garden, more
// space between them.
const DESERT_CACTI = [
  { variant: 'tall',  left: '5%',  scale: 1.05, mirror: false, offset: -0.014 },
  { variant: 'short', left: '15%', scale: 0.75, mirror: true,  offset:  0.006 },
  { variant: 'tall',  left: '28%', scale: 0.90, mirror: false, offset:  0.010 },
  { variant: 'short', left: '40%', scale: 0.65, mirror: false, offset: -0.004 },
  { variant: 'tall',  left: '54%', scale: 1.00, mirror: true,  offset:  0.014 },
  { variant: 'short', left: '66%', scale: 0.70, mirror: false, offset: -0.008 },
  { variant: 'tall',  left: '78%', scale: 0.95, mirror: false, offset:  0.018 },
  { variant: 'short', left: '90%', scale: 0.80, mirror: true,  offset: -0.006 },
];

// Cacti grow into the Desert moment (~0.58), persist briefly into the
// Garden transition, then wither away. The wither MUST finish before the
// Storm scene at progress 0.88 — witherEnd = 0.80 leaves ~0.08 of dead
// air before storm, with per-plant offsets providing a small jitter, so
// even the latest-withering cactus is gone well before storm.
const CACTUS_WINDOW = {
  growStart:   0.46,
  growEnd:     0.60,
  witherStart: 0.68,
  witherEnd:   0.80,
};

// --- Garden trees ---
// Denser than the cacti — a proper little orchard. Lush, leafy canopy on a
// dark trunk. Mix of "round" canopies and slightly "tall" canopies so the
// silhouettes don't read as identical copies.
const GARDEN_TREES = [
  { variant: 'round', left: '3%',  scale: 1.00, mirror: false, offset: -0.012 },
  { variant: 'tall',  left: '12%', scale: 0.80, mirror: false, offset:  0.005 },
  { variant: 'round', left: '20%', scale: 0.70, mirror: true,  offset:  0.018 },
  { variant: 'round', left: '30%', scale: 0.95, mirror: true,  offset:  0.010 },
  { variant: 'tall',  left: '40%', scale: 0.75, mirror: false, offset:  0.008 },
  { variant: 'round', left: '50%', scale: 0.85, mirror: false, offset: -0.006 },
  { variant: 'tall',  left: '60%', scale: 0.75, mirror: true,  offset:  0.011 },
  { variant: 'round', left: '70%', scale: 0.90, mirror: false, offset: -0.004 },
  { variant: 'tall',  left: '80%', scale: 0.80, mirror: true,  offset:  0.012 },
  { variant: 'round', left: '90%', scale: 1.05, mirror: false, offset:  0.018 },
  { variant: 'tall',  left: '97%', scale: 0.70, mirror: true,  offset:  0.024 },
];

// Trees grow into the Garden moment (~0.74), peak through the garden, then
// wither away cleanly before the Storm scene at 0.88. witherEnd = 0.84
// keeps a small margin so even with positive per-plant offsets every tree
// is fully gone before storm starts.
const GARDEN_TREE_WINDOW = {
  growStart:   0.62,
  growEnd:     0.76,
  witherStart: 0.78,
  witherEnd:   0.84,
};

// =============================================================================
// Component
// =============================================================================
export default function ForegroundFloraLayer() {
  const cactusRefs = useRef([]);
  const cactusSpineRefs = useRef([]);
  const treeRefs = useRef([]);
  const canopyRefs = useRef([]);

  useEffect(() => {
    const cacti       = cactusRefs.current.filter(Boolean);
    const cactusSpines = cactusSpineRefs.current.filter(Boolean);
    const trees       = treeRefs.current.filter(Boolean);
    const canopies    = canopyRefs.current.filter(Boolean);

    [...cacti, ...trees].forEach((el) => {
      el.style.transformOrigin = 'bottom center';
      el.style.willChange = 'transform, opacity, filter';
    });

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      // In reduced-motion mode, snap to "fully grown" for whichever group
      // the user's current scroll position belongs to. Simplest and safest:
      // skip the animation and show every plant. (They still get a styled
      // hidden/visible flip based on opacity below, so they don't all stack
      // — but reduced-motion users see the static composition.)
      cacti.forEach((el) => { el.style.transform = 'scale(1)'; el.style.opacity = 1; });
      trees.forEach((el) => { el.style.transform = 'scale(1)'; el.style.opacity = 1; });
      cactusSpines.forEach((el) => { el.style.opacity = 1; });
      canopies.forEach((el) => { el.style.opacity = 1; });
      return undefined;
    }

    return subscribe(({ progress }) => {
      cacti.forEach((el, i) => {
        const cfg = DESERT_CACTI[i];
        const win = shifted(CACTUS_WINDOW, cfg.offset);
        const g = growthAt(progress, win);
        const wither = witheringAt(progress, win);
        const sx = 0.85 + 0.15 * g;
        el.style.transform = `scaleX(${sx}) scaleY(${g})`;
        el.style.opacity = clamp01(g);
        el.style.filter = witherFilter(wither);

        const spine = cactusSpines[i];
        if (spine) {
          // Spines / accent ticks fade faster than the body so the cactus
          // visibly loses its detail before it collapses.
          spine.style.opacity = clamp01(1 - wither * 1.15);
        }
      });

      trees.forEach((el, i) => {
        const cfg = GARDEN_TREES[i];
        const win = shifted(GARDEN_TREE_WINDOW, cfg.offset);
        const g = growthAt(progress, win);
        const wither = witheringAt(progress, win);
        const sx = 0.7 + 0.3 * g;
        el.style.transform = `scaleX(${sx}) scaleY(${g})`;
        el.style.opacity = clamp01(g);
        el.style.filter = witherFilter(wither);

        const canopy = canopies[i];
        if (canopy) {
          // Leaves drop off ahead of the trunk so the wither reads as a
          // tree losing its leaves first, not just shrinking.
          canopy.style.opacity = clamp01(1 - wither * 1.2);
        }
      });
    });
  }, []);

  return (
    <div className="layer foreground-flora" aria-hidden="true">
      <div className="flora-group flora-group--desert">
        {DESERT_CACTI.map((cfg, i) => {
          const setRef = (el) => { cactusRefs.current[i] = el; };
          const setSpine = (el) => { cactusSpineRefs.current[i] = el; };
          return (
            <Cactus
              key={`c-${i}`}
              innerRef={setRef}
              spineRef={setSpine}
              {...cfg}
            />
          );
        })}
      </div>
      <div className="flora-group flora-group--garden">
        {GARDEN_TREES.map((cfg, i) => {
          const setRef = (el) => { treeRefs.current[i] = el; };
          const setCanopy = (el) => { canopyRefs.current[i] = el; };
          return (
            <GardenTree
              key={`t-${i}`}
              innerRef={setRef}
              canopyRef={setCanopy}
              {...cfg}
            />
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// SVGs — easily replaceable placeholders
// =============================================================================

// -----------------------------------------------------------------------------
// PLACEHOLDER — user wants to swap for fancier cacti later.
// -----------------------------------------------------------------------------
// A saguaro-style cactus silhouette: tall central body with one (or two,
// for the "tall" variant) curved side arms, plus a column of tiny spine
// ticks down the body. Flat-shaded green. Anchored to the bottom of the
// viewBox so the grow-from-the-ground transform reads correctly.
function Cactus({ innerRef, spineRef, left, scale = 1, mirror = false, variant = 'tall' }) {
  const isTall = variant === 'tall';
  return (
    <svg
      ref={innerRef}
      className="flora flora--cactus"
      viewBox="0 0 120 240"
      style={{ left, width: 130 * scale, height: 280 * scale }}
    >
      <g transform={mirror ? 'translate(120, 0) scale(-1, 1)' : ''}>
        {/* central body */}
        <path
          d="M52,240 L52,80 Q52,52 60,52 Q68,52 68,80 L68,240 Z"
          fill="#3f6b3a"
        />
        {/* rounded top of the body — slight highlight for shape */}
        <ellipse cx="60" cy="52" rx="8" ry="6" fill="#4a7a44" />

        {/* right-side arm — always present */}
        <path
          d="M68,150
             Q86,150 86,128
             L86,96
             Q86,84 92,84
             Q98,84 98,96
             L98,128
             Q98,162 68,162 Z"
          fill="#3f6b3a"
        />
        <ellipse cx="92" cy="84" rx="6" ry="5" fill="#4a7a44" />

        {/* left-side arm — only on the taller variant */}
        {isTall ? (
          <>
            <path
              d="M52,180
                 Q34,180 34,158
                 L34,134
                 Q34,124 28,124
                 Q22,124 22,134
                 L22,158
                 Q22,192 52,192 Z"
              fill="#3f6b3a"
            />
            <ellipse cx="28" cy="124" rx="6" ry="5" fill="#4a7a44" />
          </>
        ) : null}

        {/* spine ticks — fade first during wither so the cactus visibly
            dries out before its silhouette collapses */}
        <g ref={spineRef} className="flora__spines">
          {/* central column */}
          <line x1="60" y1="80"  x2="60" y2="84"  stroke="#2a4a26" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="60" y1="100" x2="60" y2="104" stroke="#2a4a26" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="60" y1="120" x2="60" y2="124" stroke="#2a4a26" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="60" y1="140" x2="60" y2="144" stroke="#2a4a26" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="60" y1="160" x2="60" y2="164" stroke="#2a4a26" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="60" y1="180" x2="60" y2="184" stroke="#2a4a26" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="60" y1="200" x2="60" y2="204" stroke="#2a4a26" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="60" y1="220" x2="60" y2="224" stroke="#2a4a26" strokeWidth="1.4" strokeLinecap="round" />
          {/* right arm */}
          <line x1="92" y1="100" x2="92" y2="104" stroke="#2a4a26" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="92" y1="118" x2="92" y2="122" stroke="#2a4a26" strokeWidth="1.4" strokeLinecap="round" />
          {/* left arm */}
          {isTall ? (
            <>
              <line x1="28" y1="138" x2="28" y2="142" stroke="#2a4a26" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="28" y1="154" x2="28" y2="158" stroke="#2a4a26" strokeWidth="1.4" strokeLinecap="round" />
            </>
          ) : null}
        </g>
      </g>
    </svg>
  );
}

// -----------------------------------------------------------------------------
// PLACEHOLDER — easy to swap. Lush garden tree: trunk + round leafy canopy.
// -----------------------------------------------------------------------------
// Single-color trunk (warm brown) with a clustered canopy of overlapping
// dark-green circles to read as foliage rather than a single egg-shape.
// Two variants:
//   * 'round' — wide, low canopy (apple-tree look)
//   * 'tall'  — taller, narrower canopy (poplar-ish look)
function GardenTree({ innerRef, canopyRef, left, scale = 1, mirror = false, variant = 'round' }) {
  const isTall = variant === 'tall';
  return (
    <svg
      ref={innerRef}
      className="flora flora--tree"
      viewBox="0 0 160 280"
      style={{ left, width: 170 * scale, height: 310 * scale }}
    >
      <g transform={mirror ? 'translate(160, 0) scale(-1, 1)' : ''}>
        {/* trunk — warm brown, slight taper */}
        <path
          d="M72,280 L70,180 Q68,150 76,140 Q88,138 86,170 L88,280 Z"
          fill="#5b3a22"
        />
        {/* lighter trunk highlight on the lit side */}
        <path
          d="M78,280 L77,180 Q76,155 80,148 L80,280 Z"
          fill="#7a4f30"
        />

        {/* canopy — fades first during wither so leaves drop off before the
            trunk collapses */}
        <g ref={canopyRef} className="flora__canopy">
          {isTall ? (
            <>
              {/* tall, narrow canopy — vertical stack of overlapping blobs */}
              <ellipse cx="80" cy="40"  rx="32" ry="36" fill="#2f5a32" />
              <ellipse cx="62" cy="74"  rx="30" ry="32" fill="#346536" />
              <ellipse cx="98" cy="74"  rx="30" ry="32" fill="#2f5a32" />
              <ellipse cx="80" cy="100" rx="40" ry="34" fill="#3a6b3a" />
              <ellipse cx="64" cy="124" rx="28" ry="26" fill="#356135" />
              <ellipse cx="96" cy="124" rx="28" ry="26" fill="#356135" />
              {/* a couple of mid-canopy highlights */}
              <ellipse cx="74" cy="56"  rx="14" ry="12" fill="#4a7a48" opacity="0.85" />
              <ellipse cx="86" cy="110" rx="14" ry="11" fill="#4a7a48" opacity="0.7" />
            </>
          ) : (
            <>
              {/* round, wide canopy — apple-tree shape */}
              <ellipse cx="80" cy="100" rx="64" ry="46" fill="#2f5a32" />
              <ellipse cx="50" cy="90"  rx="34" ry="32" fill="#356135" />
              <ellipse cx="110" cy="90" rx="36" ry="32" fill="#356135" />
              <ellipse cx="80" cy="66"  rx="42" ry="36" fill="#3a6b3a" />
              <ellipse cx="60" cy="60"  rx="22" ry="20" fill="#3f7240" />
              <ellipse cx="100" cy="64" rx="22" ry="20" fill="#3f7240" />
              {/* dappled-light highlights */}
              <ellipse cx="72" cy="52"  rx="14" ry="11" fill="#5a8a52" opacity="0.85" />
              <ellipse cx="98" cy="80"  rx="12" ry="10" fill="#5a8a52" opacity="0.75" />
              <ellipse cx="56" cy="98"  rx="11" ry="9"  fill="#5a8a52" opacity="0.7" />
            </>
          )}
        </g>
      </g>
    </svg>
  );
}
