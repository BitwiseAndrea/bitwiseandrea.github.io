// OceanLayer.jsx
// -----------------------------------------------------------------------------
// A curvy ocean horizon that fades in during the Daylight stretch. Three
// parallaxing wave layers (far / mid / near) animate horizontally so the
// surface reads as moving water instead of static hills.
//
// The wave paths are deliberately authored to repeat with a clean seam at
// 50% of their width — the CSS animation then translates by -50% over a
// loop, which gives a continuous, gap-free drift.
//
// Visibility (plan.oceanAmount) comes from the global scroll plan:
//   * 0 outside Daylight
//   * 1 at the morning / noon keyframes (the Daylight stretch)
// The MountainsLayer fades down on the inverse so the foreground reads as
// "ocean horizon" while we're in the Daylight scene, then transitions back
// to mountains for the Garden moment onward.

import React, { useEffect, useRef } from 'react';
import { subscribe } from '../lib/scrollState.js';

// SVG viewBox math:
//   * VIEWBOX_W is 2x the natural mountain viewBox (1440 * 2 = 2880) so the
//     SVG can render twice as wide as the viewport. CSS gives the SVG
//     width: 200vw and then animates translateX from 0 to -50% — that's
//     exactly one VIEWBOX_W / 2 worth of motion, which is a whole number
//     of wavelengths, so the loop is seamless.
//   * WAVELENGTH must divide VIEWBOX_W / 2 (= 1440) evenly. We use 480
//     (three wavelengths per visible viewport width).
const VIEWBOX_W = 2880;
const VIEWBOX_H = 320;
const WAVELENGTH = 480;

// Build a smooth periodic wave path that spans VIEWBOX_W, capped to the
// bottom of the viewBox so it can fill in as a water surface.
function buildWavePath(amplitude, baseY) {
  let d = `M0,${baseY}`;
  for (let x = 0; x < VIEWBOX_W; x += WAVELENGTH) {
    const cx1 = x + WAVELENGTH * 0.25;
    const cx2 = x + WAVELENGTH * 0.75;
    const mid = x + WAVELENGTH * 0.5;
    const end = x + WAVELENGTH;
    d += ` Q${cx1},${baseY - amplitude} ${mid},${baseY}`;
    d += ` Q${cx2},${baseY + amplitude} ${end},${baseY}`;
  }
  d += ` L${VIEWBOX_W},${VIEWBOX_H} L0,${VIEWBOX_H} Z`;
  return d;
}

const PATHS = {
  far:  buildWavePath(14, 200),
  mid:  buildWavePath(20, 230),
  near: buildWavePath(28, 260),
};

export default function OceanLayer() {
  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    // Opacity is driven entirely by oceanAmount from the scroll plan; the
    // horizontal drift is a CSS animation so it keeps running smoothly
    // without per-frame JS work.
    return subscribe(({ plan }) => {
      const amt = plan.oceanAmount || 0;
      wrap.style.opacity = `${amt}`;
      // Hide entirely when below ~1% so we don't keep paints alive when
      // the ocean is fully off-screen.
      wrap.style.visibility = amt < 0.01 ? 'hidden' : 'visible';
    });
  }, []);

  return (
    <div ref={wrapRef} className="layer ocean-layer" aria-hidden="true">
      <WaveSvg className="ocean ocean--far"  d={PATHS.far}  fill="rgba(120, 175, 220, 0.55)" />
      <WaveSvg className="ocean ocean--mid"  d={PATHS.mid}  fill="rgba(85, 145, 200, 0.78)" />
      <WaveSvg className="ocean ocean--near" d={PATHS.near} fill="rgba(50, 110, 175, 0.9)" />
    </div>
  );
}

function WaveSvg({ className, d, fill }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      preserveAspectRatio="none"
    >
      <path d={d} fill={fill} />
    </svg>
  );
}
