// MountainsLayer.jsx
// -----------------------------------------------------------------------------
// Three layered SVG silhouettes at the bottom of the viewport. They tint and
// parallax-shift to add depth as you scroll. The far layer barely moves; the
// near layer slides up faster.

import React, { useEffect, useRef } from 'react';
import { subscribe } from '../lib/scrollState.js';

const PATHS = {
  far:    'M0,260 L60,220 L120,240 L180,180 L260,210 L340,160 L420,200 L500,150 L600,200 L700,150 L820,210 L900,170 L1000,210 L1100,180 L1200,220 L1300,180 L1440,210 L1440,320 L0,320 Z',
  mid:    'M0,300 L80,250 L160,280 L240,220 L340,260 L440,220 L540,260 L640,230 L760,280 L860,240 L960,280 L1080,240 L1200,290 L1320,250 L1440,290 L1440,320 L0,320 Z',
  near:   'M0,320 L0,300 L60,280 L140,300 L240,260 L340,300 L440,270 L560,310 L660,280 L780,310 L900,285 L1040,315 L1160,295 L1280,310 L1380,290 L1440,310 L1440,320 Z',
};

export default function MountainsLayer() {
  const farRef = useRef(null);
  const midRef = useRef(null);
  const nearRef = useRef(null);

  useEffect(() => {
    const refs = [farRef.current, midRef.current, nearRef.current];
    if (refs.some((r) => !r)) return undefined;

    return subscribe(({ plan }) => {
      // The far mountains barely move; near layer translates more.
      const shifts = [4, 10, 16];
      const tints = [
        mixTint(plan.mountainTint, 0.35),
        mixTint(plan.mountainTint, 0.65),
        plan.mountainTint,
      ];
      // When the ocean is showing (Daylight scene), fade the mountains
      // out so the foreground reads as a water surface rather than land.
      const baseOpacities = [0.7, 0.88, 1.0];
      const mountainAlpha = 1 - (plan.oceanAmount || 0);
      refs.forEach((el, i) => {
        const dy = plan.mountainShift * shifts[i];
        el.style.transform = `translate3d(0, ${dy}vh, 0)`;
        el.style.color = tints[i];
        el.style.opacity = `${baseOpacities[i] * mountainAlpha}`;
      });
    });
  }, []);

  return (
    <div className="layer mountains-layer" aria-hidden="true">
      <Silhouette innerRef={farRef}  className="mountains__far"  d={PATHS.far} />
      <Silhouette innerRef={midRef}  className="mountains__mid"  d={PATHS.mid} />
      <Silhouette innerRef={nearRef} className="mountains__near" d={PATHS.near} />
    </div>
  );
}

function Silhouette({ innerRef, className, d }) {
  return (
    <svg
      ref={innerRef}
      className={`mountains ${className}`}
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
    >
      <path d={d} fill="currentColor" />
    </svg>
  );
}

function mixTint(hex, lightness) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const m = (v) => Math.round(v + (255 - v) * (1 - lightness) * 0.18);
  return `rgb(${m(r)}, ${m(g)}, ${m(b)})`;
}
