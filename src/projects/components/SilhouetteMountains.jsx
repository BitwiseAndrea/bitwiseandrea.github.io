// SilhouetteMountains.jsx
// -----------------------------------------------------------------------------
// Static three-layer mountain silhouette at the bottom of the viewport.
// Same SVG paths as the home page so the worlds visually rhyme, but without
// the scroll-driven parallax and tint animation.

import React from 'react';

const PATHS = {
  far:  'M0,260 L60,220 L120,240 L180,180 L260,210 L340,160 L420,200 L500,150 L600,200 L700,150 L820,210 L900,170 L1000,210 L1100,180 L1200,220 L1300,180 L1440,210 L1440,320 L0,320 Z',
  mid:  'M0,300 L80,250 L160,280 L240,220 L340,260 L440,220 L540,260 L640,230 L760,280 L860,240 L960,280 L1080,240 L1200,290 L1320,250 L1440,290 L1440,320 L0,320 Z',
  near: 'M0,320 L0,300 L60,280 L140,300 L240,260 L340,300 L440,270 L560,310 L660,280 L780,310 L900,285 L1040,315 L1160,295 L1280,310 L1380,290 L1440,310 L1440,320 Z',
};

export default function SilhouetteMountains() {
  return (
    <div className="project-mountains" aria-hidden="true">
      <Silhouette className="project-mountains__far"  d={PATHS.far}  opacity={0.55} />
      <Silhouette className="project-mountains__mid"  d={PATHS.mid}  opacity={0.78} />
      <Silhouette className="project-mountains__near" d={PATHS.near} opacity={1.0} />
    </div>
  );
}

function Silhouette({ className, d, opacity }) {
  return (
    <svg
      className={`project-mountains__svg ${className}`}
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      style={{ opacity }}
    >
      <path d={d} fill="currentColor" />
    </svg>
  );
}
