// SunRaysLayer.jsx
// -----------------------------------------------------------------------------
// Volumetric beams that radiate outward from the celestial body in every
// direction, like a real sun. Sits between the celestial body and the
// mountains so the rays appear to be cast over the silhouettes and through
// the air.
//
// The intensity (plan.sunRays) and origin (plan.sunX/sunY) come from the
// global scroll plan. We render a ring of long, narrow gradient blades on a
// single canvas, anchored to the sun position, with a slow drifting rotation
// so they breathe instead of feeling static.

import React, { useEffect, useRef } from 'react';
import { subscribe, getScrollState } from '../lib/scrollState.js';

// Rays fan around the full 360° so the sun reads like a real sun rather
// than a directional spotlight. We use an odd count so the pattern doesn't
// look mirror-symmetric around the horizon.
const RAY_COUNT = 14;

export default function SunRaysLayer() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = reduceQuery.matches;
    const onReduceChange = (e) => { reducedMotion = e.matches; };
    reduceQuery.addEventListener?.('change', onReduceChange);

    // Distribute rays evenly around the full circle, with a small per-ray
    // jitter so the pattern doesn't read as a perfectly geometric starburst.
    const rays = Array.from({ length: RAY_COUNT }, (_, i) => {
      const evenAngle = (i / RAY_COUNT) * Math.PI * 2;
      const jitter = (Math.random() - 0.5) * (Math.PI / RAY_COUNT) * 0.6;
      return {
        baseAngle: evenAngle + jitter,
        phase: Math.random() * Math.PI * 2,
        speed: 0.0005 + Math.random() * 0.0008,
        width: 0.04 + Math.random() * 0.05, // angular thickness in radians
      };
    });

    const planState = { plan: getScrollState().plan };
    const unsub = subscribe((s) => { planState.plan = s.plan; });

    let raf = 0;
    const tick = (now) => {
      const plan = planState.plan;
      const intensity = plan.sunRays || 0;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (intensity > 0.01) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const ox = plan.sunX * w;
        const oy = plan.sunY * h;
        const reach = Math.hypot(w, h) * 1.1;

        // The whole ring slowly rotates so rays breathe rather than feeling
        // pinned. Each ray also sways individually for a hand-drawn feel.
        const wobble = reducedMotion ? 0 : now * 0.00004;
        ctx.save();
        ctx.translate(ox, oy);
        ctx.globalCompositeOperation = 'lighter';

        for (let i = 0; i < rays.length; i += 1) {
          const r = rays[i];
          const sway = reducedMotion ? 0 : Math.sin(now * r.speed + r.phase) * 0.04;
          const angle = r.baseAngle + sway + wobble;

          // Build a thin wedge: two edges fanning out from the sun.
          const halfWidth = r.width;
          const ax = Math.cos(angle - halfWidth) * reach;
          const ay = Math.sin(angle - halfWidth) * reach;
          const bx = Math.cos(angle + halfWidth) * reach;
          const by = Math.sin(angle + halfWidth) * reach;
          const tx = Math.cos(angle) * reach;
          const ty = Math.sin(angle) * reach;

          const grad = ctx.createLinearGradient(0, 0, tx, ty);
          const a = intensity * 0.22;
          const tint = plan.sunColor || '#fff2c8';
          grad.addColorStop(0.0, withAlpha(tint, a * 1.1));
          grad.addColorStop(0.45, withAlpha(tint, a * 0.55));
          grad.addColorStop(1.0, withAlpha(tint, 0));

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.closePath();
          ctx.fillStyle = grad;
          ctx.fill();
        }

        ctx.restore();
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      reduceQuery.removeEventListener?.('change', onReduceChange);
      unsub();
    };
  }, []);

  return <canvas ref={canvasRef} className="layer sun-rays" aria-hidden="true" />;
}

// --- helpers ----------------------------------------------------------------
function withAlpha(hex, alpha) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
