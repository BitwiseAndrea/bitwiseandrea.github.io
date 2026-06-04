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
      let size;
      let cx;
      let cy;
      if (frozenRef.current) {
        size = viewportMin * CENTERED_MOON_VMIN;
        cx = window.innerWidth / 2;
        cy = window.innerHeight / 2;
      } else {
        size = plan.sunSize * viewportMin;
        cx = plan.sunX * window.innerWidth;
        cy = plan.sunY * window.innerHeight;
      }
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.left = `${cx - size / 2}px`;
      el.style.top = `${cy - size / 2}px`;
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

  // Re-position when frozen toggles, animating from the previous spot to
  // the new one with the same WAAPI approach as CelestialLayer. This keeps
  // the hotspot perfectly aligned with the moon disc throughout the
  // open/close transition.
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const fromLeft = el.style.left;
    const fromTop = el.style.top;
    const fromWidth = el.style.width;
    const fromHeight = el.style.height;

    frozenRef.current = frozen;
    if (applyRef.current) applyRef.current();

    const toLeft = el.style.left;
    const toTop = el.style.top;
    const toWidth = el.style.width;
    const toHeight = el.style.height;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return undefined;
    }
    if (!fromLeft) return undefined;
    if (
      fromLeft === toLeft
      && fromTop === toTop
      && fromWidth === toWidth
      && fromHeight === toHeight
    ) {
      return undefined;
    }

    if (animRef.current) animRef.current.cancel();
    const anim = el.animate(
      [
        { left: fromLeft, top: fromTop, width: fromWidth, height: fromHeight },
        { left: toLeft, top: toTop, width: toWidth, height: toHeight },
      ],
      { duration: 900, easing: 'cubic-bezier(.22, .9, .26, 1)' },
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
