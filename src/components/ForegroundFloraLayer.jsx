// ForegroundFloraLayer.jsx
// -----------------------------------------------------------------------------
// A fixed-position foreground layer rooted at the bottom of the viewport,
// sitting in front of the distant mountains and behind the weather.
//
// Each plant has a "lifecycle window" along the page's scroll progress
// (grow -> full -> wither -> gone). As you scroll, every plant's growth is
// recomputed and applied directly to its transform (scaleY rooted at the
// bottom) and opacity — so the plants visibly sprout up from the ground while
// you scroll into their scene, and visibly wither and fade as you scroll past
// it. No one-shot animations; every frame is a function of scroll progress.

import React, { useEffect, useMemo, useRef } from 'react';
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

// Withering "leaf loss" factor — climbs from 0 (healthy) to 1 (bare) only in
// the wither half of the window. The plant components use this to fade the
// side fronds before the stem, mimicking losing leaves.
function witheringAt(p, w) {
  if (p <= w.witherStart) return 0;
  if (p >= w.witherEnd)   return 1;
  return easeIn(clamp01((p - w.witherStart) / (w.witherEnd - w.witherStart)));
}

// =============================================================================
// Plant catalogue
// =============================================================================
// `offset` shifts the plant's lifecycle window so neighbours don't grow in
// perfect lockstep — each tree/fern has its own clock.

const TREES = [
  { left: '4%',  scale: 0.95, mirror: false, offset: -0.012 },
  { left: '14%', scale: 0.6,  mirror: false, offset:  0.014 },
  { left: '24%', scale: 0.78, mirror: true,  offset:  0.024 },
  { left: '72%', scale: 0.7,  mirror: false, offset: -0.008 },
  { left: '84%', scale: 1.0,  mirror: true,  offset:  0.016 },
  { left: '94%', scale: 0.6,  mirror: true,  offset:  0.028 },
];

const FERNS = [
  { left: '-2%', scale: 1.0,  mirror: false, offset: -0.018 },
  { left: '8%',  scale: 0.65, mirror: false, offset:  0.010 },
  { left: '22%', scale: 0.82, mirror: true,  offset:  0.026 },
  { left: '78%', scale: 0.78, mirror: false, offset: -0.012 },
  { left: '88%', scale: 1.0,  mirror: true,  offset:  0.014 },
  { left: '96%', scale: 0.62, mirror: true,  offset:  0.028 },
];

// Trees occupy the dawn moment (0.00 .. ~0.18). They start as saplings at
// scroll 0 and grow as you scroll through dawn into morning, then wither
// before noon.
const TREE_WINDOW   = { growStart: -0.04, growEnd: 0.12, witherStart: 0.18, witherEnd: 0.32 };

// Ferns occupy the garden moment. They sprout in the run-up to garden
// (around 0.40) and wither as you scroll into storm.
const FERN_WINDOW   = { growStart:  0.40, growEnd: 0.56, witherStart: 0.66, witherEnd: 0.80 };

// =============================================================================
// Component
// =============================================================================
export default function ForegroundFloraLayer() {
  const treeRefs = useRef([]);
  const fernRefs = useRef([]);
  // The "leafy" parts of each plant are stored separately so we can fade them
  // before the stem during the wither phase (simulating leaf loss).
  const treeLeafRefs = useRef([]);
  const fernLeafRefs = useRef([]);

  useEffect(() => {
    const trees = treeRefs.current.filter(Boolean);
    const ferns = fernRefs.current.filter(Boolean);
    const treeLeaves = treeLeafRefs.current.filter(Boolean);
    const fernLeaves = fernLeafRefs.current.filter(Boolean);

    // Set transform-origin once. Width tracking comes via inline style.
    [...trees, ...ferns].forEach((el) => {
      el.style.transformOrigin = 'bottom center';
      el.style.willChange = 'transform, opacity';
    });

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      trees.forEach((el) => { el.style.transform = 'scale(1)'; el.style.opacity = 1; });
      ferns.forEach((el) => { el.style.transform = 'scale(1)'; el.style.opacity = 0; });
      treeLeaves.forEach((el) => { el.style.opacity = 1; });
      fernLeaves.forEach((el) => { el.style.opacity = 1; });
      return undefined;
    }

    return subscribe(({ progress }) => {
      trees.forEach((el, i) => {
        const cfg = TREES[i];
        const win = shifted(TREE_WINDOW, cfg.offset);
        const g = growthAt(progress, win);
        const sx = 0.62 + 0.38 * g;
        el.style.transform = `scaleX(${sx}) scaleY(${g})`;
        el.style.opacity = clamp01(0.05 + g * 0.95);

        const leaf = treeLeaves[i];
        if (leaf) {
          // Bare-twig trees: "leaf loss" reduces the side branches as wither
          // progresses. They go translucent before the trunk does.
          const wither = witheringAt(progress, win);
          leaf.style.opacity = clamp01(1 - wither * 1.1);
        }
      });

      ferns.forEach((el, i) => {
        const cfg = FERNS[i];
        const win = shifted(FERN_WINDOW, cfg.offset);
        const g = growthAt(progress, win);
        const sx = 0.6 + 0.4 * g;
        el.style.transform = `scaleX(${sx}) scaleY(${g})`;
        el.style.opacity = clamp01(0.04 + g * 0.96);

        const leaf = fernLeaves[i];
        if (leaf) {
          // Fronds fade out before the central stem during the wither phase.
          const wither = witheringAt(progress, win);
          leaf.style.opacity = clamp01(1 - wither * 1.15);
        }
      });
    });
  }, []);

  return (
    <div className="layer foreground-flora" aria-hidden="true">
      <div className="flora-group flora-group--trees">
        {TREES.map((t, i) => (
          <Tree
            key={`tree-${i}`}
            innerRef={(el) => { treeRefs.current[i] = el; }}
            leafRef={(el) => { treeLeafRefs.current[i] = el; }}
            {...t}
          />
        ))}
      </div>
      <div className="flora-group flora-group--ferns">
        {FERNS.map((f, i) => (
          <Fern
            key={`fern-${i}`}
            innerRef={(el) => { fernRefs.current[i] = el; }}
            leafRef={(el) => { fernLeafRefs.current[i] = el; }}
            {...f}
          />
        ))}
      </div>
    </div>
  );
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
// SVGs
// =============================================================================
// Each plant is split into a trunk/stem path (always visible while alive)
// and a "leaves" group (the side fronds/branches) that fades first during
// withering — visually selling the "lose their leaves" effect.

function Tree({ innerRef, leafRef, left, scale = 1, mirror = false }) {
  return (
    <svg
      ref={innerRef}
      className="flora flora--tree"
      viewBox="0 0 100 240"
      style={{ left, width: 130 * scale, height: 312 * scale }}
    >
      <g transform={mirror ? 'translate(100, 0) scale(-1, 1)' : ''}>
        {/* trunk */}
        <path
          d="M50,240 C48,200 52,160 50,120 C48,90 56,70 50,30"
          fill="none"
          stroke="rgba(20, 12, 32, 0.95)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* branches (the "leaves" for these wintery trees) */}
        <g ref={leafRef} className="flora__leaves">
          <path
            d="M50,150 C28,140 18,118 16,96 M50,130 C72,118 84,98 88,76 M50,90 C36,80 26,62 24,44 M50,70 C62,60 72,46 76,28"
            fill="none"
            stroke="rgba(20, 12, 32, 0.95)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </svg>
  );
}

function Fern({ innerRef, leafRef, left, scale = 1, mirror = false }) {
  // The stem stays visible until the very end of wither; the fronds (left/right
  // pinnae) fade earlier.
  const fronds = useMemo(() => {
    const paths = [];
    for (let i = 0; i < 8; i += 1) {
      const y = 320 - i * 38;
      const size = 90 - i * 8;
      paths.push(`M100,${y} C${100 - size * 0.8},${y - 10} ${100 - size},${y - 30} ${100 - size},${y - 50}`);
      paths.push(`M100,${y} C${100 + size * 0.8},${y - 10} ${100 + size},${y - 30} ${100 + size},${y - 50}`);
    }
    return paths.join(' ');
  }, []);

  return (
    <svg
      ref={innerRef}
      className="flora flora--fern"
      viewBox="0 0 200 360"
      style={{ left, width: 220 * scale, height: 400 * scale }}
    >
      <g transform={mirror ? 'translate(200, 0) scale(-1, 1)' : ''}>
        {/* stem */}
        <path
          d="M100,360 C100,300 96,240 100,170 C104,120 110,80 100,30"
          fill="none"
          stroke="rgba(20, 50, 30, 0.95)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* fronds (the actual "leaves") */}
        <g ref={leafRef} className="flora__leaves">
          <path
            d={fronds}
            fill="none"
            stroke="rgba(20, 50, 30, 0.95)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  );
}
