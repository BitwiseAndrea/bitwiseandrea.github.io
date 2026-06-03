// MoonHotspot.jsx
// -----------------------------------------------------------------------------
// A transparent click target that sits over the visible portion of the moon
// during the night scene. It exists because the celestial layer (z-index 2)
// is drawn behind the page content (z-index 10), so a click on the moon
// disc would otherwise land on the .page background and do nothing.
//
// The hotspot subscribes to scroll state and only becomes interactive once
// `sunCrater > 0.85` (i.e., the body has fully transitioned to a moon). It
// also tracks the moon's on-screen position so the hit area follows it as
// the moon arcs upward at the very end of the page.

import React, { useEffect, useRef, useState } from 'react';
import { subscribe } from '../lib/scrollState.js';

export default function MoonHotspot({ onClick }) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const apply = ({ plan }) => {
      const moonish = plan.sunCrater > 0.85;
      // Position + size in viewport units, mirroring CelestialLayer math.
      const viewportMin = Math.min(window.innerWidth, window.innerHeight);
      const size = plan.sunSize * viewportMin;
      const cx = plan.sunX * window.innerWidth;
      const cy = plan.sunY * window.innerHeight;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.left = `${cx - size / 2}px`;
      el.style.top = `${cy - size / 2}px`;
      setActive((prev) => (prev === moonish ? prev : moonish));
    };

    const unsub = subscribe(apply);
    const onResize = () => apply({ plan: window.__lastPlan ?? {} });
    window.addEventListener('resize', onResize);
    return () => {
      unsub();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      className={`moon-hotspot${active ? ' is-active' : ''}`}
      onClick={active ? onClick : undefined}
      tabIndex={active ? 0 : -1}
      aria-label={active ? 'Open the night sky' : undefined}
      aria-hidden={!active}
    />
  );
}
