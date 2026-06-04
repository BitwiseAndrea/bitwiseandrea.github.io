// ConstellationOverlay.jsx
// -----------------------------------------------------------------------------
// Easter-egg view that takes over the screen when the moon (last scene) is
// clicked. The world fades to navy, the moon centers, and a sky full of
// constellations is drawn over the top. Click the moon again — or press
// Escape — to exit.
//
// Constellations are stored as normalized [x, y] coordinates (0..1) in viewport
// space, so the layout adapts to any viewport. The component itself owns no
// scroll state; opening/closing is driven by the `open` prop.

import React, { useEffect, useMemo, useRef } from 'react';

// A small but recognizable selection of northern-hemisphere constellations.
// Stars are placed around (but not over) the centered moon. Coords are 0..1
// of viewport width / height. `lines` are pairs of indexes into `stars`.
const CONSTELLATIONS = [
  {
    name: 'Ursa Major',
    // Big Dipper, top-left.
    stars: [
      [0.06, 0.16], [0.13, 0.13], [0.20, 0.16],
      [0.26, 0.22], [0.33, 0.20], [0.34, 0.27], [0.27, 0.30],
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]],
    label: { star: 4, dx: 0.012, dy: -0.018 },
  },
  {
    name: 'Cassiopeia',
    // The "W", top-right.
    stars: [
      [0.66, 0.12], [0.72, 0.18], [0.78, 0.13], [0.84, 0.19], [0.91, 0.13],
    ],
    lines: [[0,1],[1,2],[2,3],[3,4]],
    label: { star: 4, dx: 0.012, dy: 0.022 },
  },
  {
    name: 'Orion',
    // Hourglass with the famous 3-star belt, lower-left.
    stars: [
      [0.10, 0.62], [0.18, 0.58], // shoulders
      [0.13, 0.70], [0.16, 0.70], [0.19, 0.70], // belt
      [0.10, 0.82], [0.20, 0.82], // feet
    ],
    lines: [[0,1],[0,2],[1,4],[2,3],[3,4],[2,5],[4,6],[5,6]],
    label: { star: 6, dx: 0.012, dy: 0.022 },
  },
  {
    name: 'Lyra',
    // Small parallelogram with Vega at top, mid-right.
    stars: [
      [0.78, 0.46], [0.83, 0.50], [0.81, 0.56], [0.76, 0.52],
    ],
    lines: [[0,1],[1,2],[2,3],[3,0]],
    label: { star: 0, dx: -0.06, dy: -0.012 },
  },
  {
    name: 'Cygnus',
    // The Northern Cross, lower-right.
    stars: [
      [0.74, 0.74], [0.80, 0.82], [0.86, 0.90],
      [0.83, 0.78], [0.77, 0.86],
    ],
    lines: [[0,1],[1,2],[3,1],[1,4]],
    label: { star: 2, dx: -0.07, dy: 0.022 },
  },
];

// A scattering of decorative background stars. Avoid the central moon area.
function makeBackgroundStars(count, seed = 1) {
  // Tiny LCG so this is stable across renders.
  let s = seed;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const stars = [];
  while (stars.length < count) {
    const x = rand();
    const y = rand();
    // Skip stars within ~22% of the centered moon.
    const dx = x - 0.5;
    const dy = y - 0.55;
    if (Math.hypot(dx, dy) < 0.22) continue;
    stars.push({
      x,
      y,
      r: 0.4 + rand() * 1.6,
      delay: rand() * 6,
      duration: 2.5 + rand() * 4,
    });
  }
  return stars;
}

export default function ConstellationOverlay({ open, onClose }) {
  const rootRef = useRef(null);

  // Keyboard: escape closes. Only listen while the overlay is open.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Lock body scroll while open so we don't drift off the night scene behind.
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const bgStars = useMemo(() => makeBackgroundStars(110), []);

  return (
    <div
      ref={rootRef}
      className={`constellation-overlay ${open ? 'is-open' : ''}`}
      aria-hidden={!open}
      role="dialog"
      aria-label="Night sky constellations"
    >
      {/* Background stars (twinkling) */}
      <svg className="constellation-overlay__stars" viewBox="0 0 100 100" preserveAspectRatio="none">
        {bgStars.map((s, i) => (
          <circle
            key={i}
            cx={s.x * 100}
            cy={s.y * 100}
            r={s.r * 0.12}
            className="bg-star"
            style={{ animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }}
          />
        ))}
      </svg>

      {/* Constellations: thin lines + bright dots + labels */}
      <svg className="constellation-overlay__map" viewBox="0 0 100 100" preserveAspectRatio="none">
        {CONSTELLATIONS.map((c, ci) => (
          <g key={c.name} className="constellation" style={{ animationDelay: `${0.4 + ci * 0.18}s` }}>
            {c.lines.map(([a, b], li) => {
              const sa = c.stars[a];
              const sb = c.stars[b];
              return (
                <line
                  key={li}
                  x1={sa[0] * 100}
                  y1={sa[1] * 100}
                  x2={sb[0] * 100}
                  y2={sb[1] * 100}
                  className="constellation__line"
                />
              );
            })}
            {c.stars.map((s, si) => (
              <circle
                key={si}
                cx={s[0] * 100}
                cy={s[1] * 100}
                r={0.32}
                className="constellation__star"
              />
            ))}
            {c.label && (() => {
              const anchor = c.stars[c.label.star];
              return (
                <text
                  x={(anchor[0] + c.label.dx) * 100}
                  y={(anchor[1] + c.label.dy) * 100}
                  className="constellation__label"
                >
                  {c.name}
                </text>
              );
            })()}
          </g>
        ))}
      </svg>

      {/*
        We deliberately don't render a moon here — the real celestial body
        in CelestialLayer animates to center while this overlay fades in,
        so users see the actual moon glide into place rather than a
        cross-fade between two moons.
      */}

      <p className="constellation-hint">
        click the moon · or press <kbd>esc</kbd>
      </p>
    </div>
  );
}
