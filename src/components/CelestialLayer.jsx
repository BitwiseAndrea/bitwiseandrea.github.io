// CelestialLayer.jsx
// -----------------------------------------------------------------------------
// A single celestial body that arcs across the viewport as you scroll:
//   - starts low and warm (dawn sun)
//   - climbs and brightens (noon)
//   - dims behind storm clouds (storm)
//   - becomes a cool moon with craters at the end (night)
//
// Position, size, color, glow, and "crater" overlay opacity all interpolate
// from the scroll plan.

import React, { useEffect, useRef } from 'react';
import { subscribe, getScrollState } from '../lib/scrollState.js';

// Diameter (as a fraction of min(viewportW, viewportH)) the moon snaps to
// when the constellation easter egg is open. Slightly larger than the
// constellation-overlay's old static moon so the centering animation
// reads as a real movement.
const CENTERED_MOON_VMIN = 0.32;

export default function CelestialLayer({ onMoonClick, frozen = false }) {
  const wrapRef = useRef(null);
  const bodyRef = useRef(null);
  const haloRef = useRef(null);
  const craterRef = useRef(null);

  // The frozen state is read inside the scroll-state subscription, so we
  // mirror it through a ref to avoid having to resubscribe on every toggle.
  const frozenRef = useRef(frozen);
  // Imperative re-apply hook: the frozen toggle effect calls this so the
  // celestial body re-positions itself immediately when the prop flips.
  const applyRef = useRef(null);
  // Tracks whether we've already done the initial mount apply. The first
  // run shouldn't animate — there's no "previous" position to glide from.
  const hasMountedRef = useRef(false);
  // The currently-running open/close animation, so we can cancel it if the
  // user toggles again before the previous one finishes.
  const animRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const body = bodyRef.current;
    const halo = haloRef.current;
    const crater = craterRef.current;
    if (!wrap || !body || !halo || !crater) return undefined;

    const apply = ({ plan }) => {
      const viewportMin = Math.min(window.innerWidth, window.innerHeight);

      // Choose between scroll-driven position and the centered easter-egg
      // position. Visual style (color, halo, craters) always tracks the
      // scroll plan so the moon keeps its current "look" while it moves.
      let size;
      let x;
      let y;
      if (frozenRef.current) {
        size = viewportMin * CENTERED_MOON_VMIN;
        x = window.innerWidth / 2 - size / 2;
        y = window.innerHeight / 2 - size / 2;
      } else {
        size = plan.sunSize * viewportMin;
        x = plan.sunX * window.innerWidth - size / 2;
        y = plan.sunY * window.innerHeight - size / 2;
      }

      wrap.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      wrap.style.width = `${size}px`;
      wrap.style.height = `${size}px`;

      body.style.background = `radial-gradient(circle at 36% 36%, ${tint(plan.sunColor, 8)} 0%, ${plan.sunColor} 60%, ${tint(plan.sunColor, -18)} 100%)`;
      body.style.boxShadow = `inset -${size * 0.12}px -${size * 0.08}px ${size * 0.18}px rgba(60, 50, 30, ${0.05 + plan.sunCrater * 0.32})`;

      const haloAlpha = 0.18 + plan.sunGlow * 0.55;
      halo.style.background = `radial-gradient(circle, ${withAlpha(plan.sunColor, haloAlpha)} 0%, ${withAlpha(plan.sunColor, 0)} 70%)`;
      halo.style.transform = `scale(${1.5 + plan.sunGlow * 1.6})`;
      halo.style.opacity = `${0.4 + plan.sunGlow * 0.6}`;

      crater.style.opacity = `${plan.sunCrater}`;

      // The body is clickable only when we're well into "moon" state, so
      // the easter-egg trigger doesn't fire while the sun is on screen.
      // We also flip role/aria/tabIndex imperatively so AT users only hear
      // the "open the night sky" affordance once it's actually wired up.
      const moonish = plan.sunCrater > 0.85;
      const wasMoon = wrap.dataset.moon === 'true';
      if (moonish !== wasMoon) {
        wrap.dataset.moon = moonish ? 'true' : 'false';
        if (onMoonClick && moonish) {
          wrap.setAttribute('role', 'button');
          wrap.setAttribute('aria-label', 'Open the night sky');
          wrap.setAttribute('tabindex', '0');
          wrap.removeAttribute('aria-hidden');
        } else {
          wrap.removeAttribute('role');
          wrap.removeAttribute('aria-label');
          wrap.removeAttribute('tabindex');
          wrap.setAttribute('aria-hidden', 'true');
        }
      }
    };

    applyRef.current = () => apply({ plan: getCurrentPlan() });
    const unsub = subscribe(apply);
    const onResize = () => apply({ plan: getCurrentPlan() });
    window.addEventListener('resize', onResize);
    return () => {
      applyRef.current = null;
      unsub();
      window.removeEventListener('resize', onResize);
    };
  }, [onMoonClick]);

  // When `frozen` toggles, snapshot the moon's current position, write the
  // new (centered or scroll-driven) position via apply(), then run a Web
  // Animations API animation between the two snapshots. WAAPI is used here
  // instead of CSS transitions because the class-toggle + style-mutation
  // sequence wasn't reliably triggering CSS transitions across browsers.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;

    // Snapshot the inline values BEFORE we change frozenRef + re-apply.
    const fromTransform = wrap.style.transform;
    const fromWidth = wrap.style.width;
    const fromHeight = wrap.style.height;

    frozenRef.current = frozen;
    if (applyRef.current) applyRef.current();

    const toTransform = wrap.style.transform;
    const toWidth = wrap.style.width;
    const toHeight = wrap.style.height;

    // First mount: nothing to glide from yet.
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return undefined;
    }
    // No actual change (e.g. StrictMode double-invoke landing on the same
    // frozen value, or unset inline style on first call).
    if (!fromTransform) return undefined;
    if (
      fromTransform === toTransform
      && fromWidth === toWidth
      && fromHeight === toHeight
    ) {
      return undefined;
    }

    if (animRef.current) animRef.current.cancel();
    const anim = wrap.animate(
      [
        { transform: fromTransform, width: fromWidth, height: fromHeight },
        { transform: toTransform, width: toWidth, height: toHeight },
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

  const handleClick = () => {
    if (!onMoonClick) return;
    const wrap = wrapRef.current;
    if (!wrap || wrap.dataset.moon !== 'true') return;
    onMoonClick();
  };

  return (
    <div className="layer celestial-layer" aria-hidden="true">
      <div
        ref={wrapRef}
        className="celestial"
        onClick={onMoonClick ? handleClick : undefined}
        onKeyDown={onMoonClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        } : undefined}
        aria-hidden="true"
      >
        <div ref={haloRef} className="celestial__halo" />
        <div ref={bodyRef} className="celestial__body" />
        <div ref={craterRef} className="celestial__craters">
          <span style={{ left: '24%', top: '38%', width: '18%', height: '18%' }} />
          <span style={{ left: '58%', top: '26%', width: '10%', height: '10%' }} />
          <span style={{ left: '52%', top: '60%', width: '14%', height: '14%' }} />
          <span style={{ left: '32%', top: '70%', width: '8%',  height: '8%'  }} />
          <span style={{ left: '70%', top: '52%', width: '6%',  height: '6%'  }} />
        </div>
      </div>
    </div>
  );
}

// --- color helpers ----------------------------------------------------------
function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function tint(hex, amt) {
  const { r, g, b } = hexToRgb(hex);
  const t = (v) => Math.max(0, Math.min(255, Math.round(v + amt * 2.55)));
  return `rgb(${t(r)}, ${t(g)}, ${t(b)})`;
}
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function getCurrentPlan() {
  return getScrollState().plan;
}
