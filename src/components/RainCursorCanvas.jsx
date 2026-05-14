// RainCursorCanvas.jsx
// -----------------------------------------------------------------------------
// Cursor-aware rain on a full-viewport canvas. Two contributions to intensity:
//   1) scrollPlan.rainBoost — peaks during the storm scene, light at dawn/garden.
//   2) cursor motion velocity — flick the mouse and you get a burst.
//
// This complements WeatherCanvas (which handles the dominant scene-weather):
// rain here is always the *interactive* layer, so even in scenes where rain
// isn't the dominant weather, the cursor still gets a delicate response.

import React, { useEffect, useRef } from 'react';
import { subscribe } from '../lib/scrollState.js';

const MAX_DROPS = 280;
const BASE_INTENSITY = 0.05;

export default function RainCursorCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = reduceQuery.matches;
    const onReduceChange = (e) => { reducedMotion = e.matches; };
    reduceQuery.addEventListener?.('change', onReduceChange);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, last: 0 };
    const onMove = (e) => {
      const now = performance.now();
      const dt = Math.max(1, now - mouse.last);
      mouse.vx = (e.clientX - mouse.x) / dt * 16;
      mouse.vy = (e.clientY - mouse.y) / dt * 16;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.last = now;
    };
    window.addEventListener('mousemove', onMove);
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    window.addEventListener('mouseleave', onLeave);

    let rainTarget = BASE_INTENSITY;
    const unsub = subscribe(({ plan }) => {
      rainTarget = BASE_INTENSITY + plan.rainBoost * 0.95;
    });

    let rainCurrent = BASE_INTENSITY;
    const drops = [];
    const splashes = [];
    let raf = 0;
    let last = performance.now();

    const spawn = (intensity) => {
      if (drops.length >= MAX_DROPS) return;
      const cursorAnchored = mouse.x > -1000 && Math.random() < (0.55 + intensity * 0.2);
      const x = cursorAnchored
        ? mouse.x + (Math.random() - 0.5) * (60 + intensity * 240) + mouse.vx * 0.6
        : Math.random() * window.innerWidth;
      const y = cursorAnchored
        ? mouse.y - 40 - Math.random() * 80
        : -20 - Math.random() * 80;
      drops.push({
        x, y,
        vx: mouse.vx * 0.05 + (Math.random() - 0.5) * 0.4,
        vy: 8 + Math.random() * 6 + intensity * 10,
        len: 8 + Math.random() * 14 + intensity * 10,
        life: 1,
        groundY: window.innerHeight - 10 - Math.random() * 20,
      });
    };

    const tick = (now) => {
      const dt = Math.min(48, now - last) / 16;
      last = now;

      rainCurrent += (rainTarget - rainCurrent) * 0.05;
      const i = rainCurrent;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!reducedMotion) {
        const moveBoost = Math.min(8, Math.hypot(mouse.vx, mouse.vy) * 0.18);
        const rate = 0.2 + i * 7.5 + moveBoost;
        let toSpawn = rate;
        while (toSpawn > 0) {
          if (Math.random() < toSpawn) spawn(i);
          toSpawn -= 1;
        }
        mouse.vx *= 0.86;
        mouse.vy *= 0.86;
      }

      const slant = 0.3 + i * 0.7;
      ctx.lineCap = 'round';

      for (let k = drops.length - 1; k >= 0; k -= 1) {
        const d = drops[k];
        d.x += d.vx * dt + i * 0.35 * dt;
        d.y += d.vy * dt;

        const alpha = Math.min(0.65, 0.22 + i * 0.55) * d.life;
        ctx.strokeStyle = `rgba(200, 220, 248, ${alpha})`;
        ctx.lineWidth = 1 + i * 0.7;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.vx * slant, d.y - d.len);
        ctx.stroke();

        if (d.y >= d.groundY) {
          splashes.push({ x: d.x, y: d.groundY, r: 1, life: 1 });
          drops.splice(k, 1);
          continue;
        }
        if (d.x < -40 || d.x > window.innerWidth + 40) {
          drops.splice(k, 1);
        }
      }

      for (let k = splashes.length - 1; k >= 0; k -= 1) {
        const s = splashes[k];
        s.r += 0.7 * dt;
        s.life -= 0.045 * dt;
        if (s.life <= 0) {
          splashes.splice(k, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(200, 220, 248, ${0.35 * s.life})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      reduceQuery.removeEventListener?.('change', onReduceChange);
      unsub();
    };
  }, []);

  return <canvas ref={canvasRef} className="layer rain-cursor" aria-hidden="true" />;
}
