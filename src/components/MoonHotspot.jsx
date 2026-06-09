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
import { subscribe, getScrollState } from '../lib/scrollState.js';

// Must match CENTERED_MOON_VMIN in CelestialLayer.jsx so the hotspot follows
// the centered easter-egg moon exactly.
const CENTERED_MOON_VMIN = 0.32;

export default function MoonHotspot({ onClick, frozen = false }) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const frozenRef = useRef(frozen);
  const applyRef = useRef(null);
  const hasMountedRef = useRef(false);
  const animRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const apply = ({ plan }) => {
      const viewportMin = Math.min(window.innerWidth, window.innerHeight);
      // Fixed reference box; we use translate + scale to position and
      // resize. This matches CelestialLayer so both elements glide with
      // an identical compositor-only transform animation when the
      // constellation overlay opens/closes.
      const refSize = viewportMin;

      let cx;
      let cy;
      let scale;
      if (frozenRef.current) {
        cx = window.innerWidth / 2;
        cy = window.innerHeight / 2;
        scale = CENTERED_MOON_VMIN;
      } else {
        cx = plan.sunX * window.innerWidth;
        cy = plan.sunY * window.innerHeight;
        scale = plan.sunSize;
      }

      el.style.width = `${refSize}px`;
      el.style.height = `${refSize}px`;
      el.style.left = '0px';
      el.style.top = '0px';
      el.style.transform = `translate3d(${cx - refSize / 2}px, ${cy - refSize / 2}px, 0) scale(${scale})`;

      // Active either when the moon is on-screen as a moon (scroll path) OR
      // any time the constellation overlay is open (so the hotspot can
      // double as the close button).
      const moonish = plan.sunCrater > 0.85 || frozenRef.current;
      setActive((prev) => (prev === moonish ? prev : moonish));
    };

    applyRef.current = () => apply({ plan: getScrollState().plan });
    const unsub = subscribe(apply);
    const onResize = () => applyRef.current && applyRef.current();
    window.addEventListener('resize', onResize);
    return () => {
      applyRef.current = null;
      unsub();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Re-position when frozen toggles, animating from the previous transform
  // to the new one with the same WAAPI approach as CelestialLayer. This
  // keeps the hotspot perfectly aligned with the moon disc throughout the
  // open/close transition.
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const fromTransform = el.style.transform;

    frozenRef.current = frozen;
    if (applyRef.current) applyRef.current();

    const toTransform = el.style.transform;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return undefined;
    }
    if (!fromTransform) return undefined;
    if (fromTransform === toTransform) return undefined;

    if (animRef.current) animRef.current.cancel();
    const anim = el.animate(
      [
        { transform: fromTransform },
        { transform: toTransform },
      ],
      // Match CelestialLayer exactly so the click target rides with the disc.
      { duration: 800, easing: 'cubic-bezier(.4, 0, .2, 1)' },
    );
    animRef.current = anim;
    anim.onfinish = () => {
      if (animRef.current === anim) animRef.current = null;
    };
    return () => {
      anim.cancel();
      if (animRef.current === anim) animRef.current = null;
    };
  }, [frozen]);

  return (
    <button
      ref={ref}
      type="button"
      className={`moon-hotspot${active ? ' is-active' : ''}${frozen ? ' is-frozen' : ''}`}
      onClick={active ? onClick : undefined}
      tabIndex={active ? 0 : -1}
      aria-label={active ? (frozen ? 'Close the night sky' : 'Open the night sky') : undefined}
      aria-hidden={!active}
    />
  );
}
