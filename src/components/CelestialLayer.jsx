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

      // We give the wrap a fixed reference size (viewportMin) and use
      // `translate + scale` to handle BOTH position and visual size. This
      // keeps the open/close animation entirely on the compositor — without
      // it, animating width/height alongside transform forced a layout pass
      // every frame, which manifested as visible "stopping points" while
      // the moon glided up to the centered constellation pose.
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

      // Position the wrap with center at (cx, cy). Because the box is
      // sized to refSize and scaled around its own center (transform-origin
      // is the default 50% 50%), the visible disc is `refSize * scale` wide
      // and centered on (cx, cy).
      wrap.style.width = `${refSize}px`;
      wrap.style.height = `${refSize}px`;
      wrap.style.transform = `translate3d(${cx - refSize / 2}px, ${cy - refSize / 2}px, 0) scale(${scale})`;

      body.style.background = `radial-gradient(circle at 36% 36%, ${tint(plan.sunColor, 8)} 0%, ${plan.sunColor} 60%, ${tint(plan.sunColor, -18)} 100%)`;
      // Box-shadow is in the wrap's local (pre-scale) coordinate system, so
      // we use refSize here. The whole wrap then scales uniformly around
      // its center, taking the inset shadow with it, so the visible shadow
      // always reads at ~12%/8%/18% of the apparent moon diameter.
      body.style.boxShadow = `inset -${refSize * 0.12}px -${refSize * 0.08}px ${refSize * 0.18}px rgba(60, 50, 30, ${0.05 + plan.sunCrater * 0.32})`;

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

  // When `frozen` toggles, snapshot the moon's current transform, write the
  // new (centered or scroll-driven) transform via apply(), then run a Web
  // Animations API animation between the two snapshots. WAAPI is used here
  // instead of CSS transitions because the class-toggle + style-mutation
  // sequence wasn't reliably triggering CSS transitions across browsers.
  //
  // We animate ONLY `transform` (translate + scale). The wrap's `width` and
  // `height` are now constant (set to viewportMin in apply()), so every
  // visual change goes through the compositor. Earlier versions animated
  // width/height alongside transform, which forced a per-frame layout pass
  // and was visible as "stopping points" mid-glide on slower frames.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;

    const fromTransform = wrap.style.transform;

    frozenRef.current = frozen;
    if (applyRef.current) applyRef.current();

    const toTransform = wrap.style.transform;

    // First mount: nothing to glide from yet.
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return undefined;
    }
    // No previous inline transform, or no actual change.
    if (!fromTransform) return undefined;
    if (fromTransform === toTransform) return undefined;

    if (animRef.current) animRef.current.cancel();
    const anim = wrap.animate(
      [
        { transform: fromTransform },
        { transform: toTransform },
      ],
      // `cubic-bezier(.4, 0, .2, 1)` is the same Material-style ease-in-out
      // used by most well-behaved UI animations: gentle accel, smooth body,
      // gentle decel. Earlier we had a punchy ease-out (.22, .9, .26, 1)
      // which read as a "lurch then drift" — feeling like two distinct
      // movements rather than one continuous glide.
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
