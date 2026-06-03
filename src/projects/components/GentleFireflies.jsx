// GentleFireflies.jsx
// -----------------------------------------------------------------------------
// A tiny canvas of slow-floating glow specks. Cheap, ambient, kind of
// pollen-meets-fireflies. Pauses if the user prefers reduced motion.

import React, { useEffect, useRef } from 'react';

export default function GentleFireflies({ count = 32 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const flies = Array.from({ length: count }).map(() => spawn(width, height));

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, width, height);
      for (const f of flies) {
        if (!reduce) {
          f.t += dt;
          f.x += Math.cos(f.t * 0.4 + f.phase) * f.drift * dt * 60;
          f.y += Math.sin(f.t * 0.3 + f.phase) * f.drift * dt * 40 - f.rise * dt * 60;
          if (f.y < -10 || f.x < -20 || f.x > width + 20) {
            Object.assign(f, spawn(width, height, true));
          }
        }
        const flicker = 0.55 + 0.45 * Math.sin(f.t * 1.8 + f.phase);
        const r = f.size * (0.85 + 0.35 * flicker);
        const grd = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r * 4);
        grd.addColorStop(0, `rgba(255, 240, 196, ${0.55 * flicker})`);
        grd.addColorStop(1, 'rgba(255, 240, 196, 0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(f.x, f.y, r * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 247, 220, ${0.85 * flicker})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [count]);

  return <canvas ref={canvasRef} className="project-fireflies" aria-hidden="true" />;
}

function spawn(width, height, fromBottom = false) {
  return {
    x: Math.random() * width,
    y: fromBottom ? height + Math.random() * 60 : Math.random() * height,
    t: Math.random() * 10,
    phase: Math.random() * Math.PI * 2,
    drift: 0.2 + Math.random() * 0.5,
    rise: 0.05 + Math.random() * 0.18,
    size: 0.8 + Math.random() * 1.6,
  };
}
