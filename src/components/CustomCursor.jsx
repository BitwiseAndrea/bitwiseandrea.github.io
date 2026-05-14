// CustomCursor.jsx
// -----------------------------------------------------------------------------
// A two-element custom cursor:
//   - a soft "halo" that lags behind the real cursor (springy)
//   - a tiny "dot" that pins exactly to the cursor
//
// Hover any element with [data-magnetic] and the dot snaps to its center while
// the halo grows. Color adapts to the current scroll plan's accent color so
// the cursor reads correctly against any scene background.
//
// Pointer events are disabled (pointer-events: none) so the cursor never
// intercepts clicks.

import React, { useEffect, useRef } from 'react';
import { subscribe } from '../lib/scrollState.js';

export default function CustomCursor() {
  const haloRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    // Pointer-only — no custom cursor on touch devices.
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer) return undefined;

    const halo = haloRef.current;
    const dot = dotRef.current;
    if (!halo || !dot) return undefined;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const halo_ = { x: target.x, y: target.y };
    const dot_ = { x: target.x, y: target.y };

    let magnet = null;
    let isHovering = false;

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };
    window.addEventListener('mousemove', onMove);

    // Magnetic hover detection: any element with [data-magnetic] in the
    // tree gets a soft pull on the dot toward its center, and the halo
    // doubles in size.
    const onOver = (e) => {
      const el = e.target.closest?.('[data-magnetic], a, button');
      if (el) {
        magnet = el;
        isHovering = true;
        document.body.classList.add('is-magnetic');
      }
    };
    const onOut = (e) => {
      const el = e.target.closest?.('[data-magnetic], a, button');
      if (el) {
        magnet = null;
        isHovering = false;
        document.body.classList.remove('is-magnetic');
      }
    };
    window.addEventListener('mouseover', onOver);
    window.addEventListener('mouseout', onOut);

    const unsub = subscribe(({ plan }) => {
      halo.style.borderColor = withAlpha(plan.accentColor, 0.65);
      halo.style.background = withAlpha(plan.accentColor, 0.06);
      dot.style.background = plan.accentColor;
      dot.style.boxShadow = `0 0 14px ${withAlpha(plan.accentColor, 0.65)}`;
    });

    let raf = 0;
    const tick = () => {
      let dotTargetX = target.x;
      let dotTargetY = target.y;
      let haloScale = 1;

      if (isHovering && magnet) {
        const rect = magnet.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        dotTargetX = target.x + (cx - target.x) * 0.45;
        dotTargetY = target.y + (cy - target.y) * 0.45;
        haloScale = 2.2;
      }

      dot_.x += (dotTargetX - dot_.x) * 0.32;
      dot_.y += (dotTargetY - dot_.y) * 0.32;
      halo_.x += (target.x - halo_.x) * 0.14;
      halo_.y += (target.y - halo_.y) * 0.14;

      dot.style.transform = `translate3d(${dot_.x}px, ${dot_.y}px, 0)`;
      halo.style.transform = `translate3d(${halo_.x}px, ${halo_.y}px, 0) scale(${haloScale})`;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Tell the document we're rendering a custom cursor (hides default cursor).
    document.body.classList.add('has-custom-cursor');

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mouseout', onOut);
      document.body.classList.remove('has-custom-cursor');
      document.body.classList.remove('is-magnetic');
      unsub();
    };
  }, []);

  return (
    <>
      <div ref={haloRef} className="custom-cursor-halo" aria-hidden="true" />
      <div ref={dotRef} className="custom-cursor-dot" aria-hidden="true" />
    </>
  );
}

function withAlpha(hex, alpha) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
