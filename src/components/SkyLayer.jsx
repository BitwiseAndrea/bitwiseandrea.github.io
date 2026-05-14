// SkyLayer.jsx
// -----------------------------------------------------------------------------
// Fixed-position gradient that morphs through every keyframe of the page.
// Three CSS custom properties (--sky-top/mid/bot) feed into a single
// linear-gradient. We update them directly on every scroll tick — no React
// re-render, no animation library, just style mutations.

import React, { useEffect, useRef } from 'react';
import { subscribe } from '../lib/scrollState.js';

export default function SkyLayer() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    return subscribe(({ plan }) => {
      el.style.setProperty('--sky-top', plan.skyTop);
      el.style.setProperty('--sky-mid', plan.skyMid);
      el.style.setProperty('--sky-bot', plan.skyBot);
    });
  }, []);

  return <div ref={ref} className="layer sky-layer" aria-hidden="true" />;
}
