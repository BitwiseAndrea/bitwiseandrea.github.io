// WeatherCanvas.jsx
// -----------------------------------------------------------------------------
// A full-viewport canvas that always renders weather particles appropriate to
// the current scroll moment. As scroll progress changes the active weather
// type (petals -> pollen -> leaves -> rain -> fireflies), the canvas crossfades
// by blending two particle types based on the keyframe interpolation.
//
// All particle physics live in the rAF loop. Scroll updates only adjust how
// many of each type get spawned each frame and how visible each is.

import React, { useEffect, useRef } from 'react';
import { subscribe } from '../lib/scrollState.js';

const TYPES = ['petals', 'pollen', 'leaves', 'rain', 'fireflies'];

const MAX_PARTICLES = 220;

export default function WeatherCanvas() {
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

    // Local mutable state of the scroll plan; updated by subscription.
    const planState = {
      weatherFrom: 'petals',
      weatherTo: 'pollen',
      weatherBlend: 0,
      weatherIntensity: 0.5,
    };
    const unsubscribe = subscribe(({ plan }) => {
      planState.weatherFrom = plan.weatherFrom;
      planState.weatherTo = plan.weatherTo;
      planState.weatherBlend = plan.weatherBlend;
      planState.weatherIntensity = plan.weatherIntensity;
    });

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const particles = [];
    let rafId = 0;
    let lastTime = performance.now();

    const spawn = (type) => {
      if (particles.length >= MAX_PARTICLES) return;
      particles.push(makeParticle(type));
    };

    const tick = (time) => {
      const dt = Math.min(48, time - lastTime) / 16;
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const wFrom = planState.weatherFrom;
      const wTo = planState.weatherTo;
      const blend = planState.weatherBlend;
      const intensity = planState.weatherIntensity;

      if (!reducedMotion) {
        // Spawn budget per frame. Distribute between 'from' and 'to' weighted by blend.
        const totalRate = 0.4 + intensity * 4.6;
        const rateFrom = totalRate * (1 - blend);
        const rateTo   = totalRate * blend;

        let spawnFrom = rateFrom;
        while (spawnFrom > 0) {
          if (Math.random() < spawnFrom) spawn(wFrom);
          spawnFrom -= 1;
        }
        let spawnTo = rateTo;
        while (spawnTo > 0) {
          if (Math.random() < spawnTo) spawn(wTo);
          spawnTo -= 1;
        }
      }

      for (let k = particles.length - 1; k >= 0; k -= 1) {
        const p = particles[k];
        updateParticle(p, dt);
        // Alpha fades out particles whose type is no longer dominant.
        const dominance = p.type === wTo ? blend : (p.type === wFrom ? 1 - blend : 0);
        const visible = Math.min(1, dominance * 1.4 + 0.05);
        drawParticle(ctx, p, visible);
        if (p.dead || p.y > window.innerHeight + 60 || p.x < -80 || p.x > window.innerWidth + 80) {
          particles.splice(k, 1);
        }
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      unsubscribe();
    };
  }, []);

  return <canvas ref={canvasRef} className="layer weather-canvas" aria-hidden="true" />;
}

// =============================================================================
// Particle factory + behaviors
// =============================================================================

function makeParticle(type) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  switch (type) {
    case 'petals':
      return {
        type, x: Math.random() * w, y: -20 - Math.random() * 200,
        vx: 0.2 + Math.random() * 0.6, vy: 0.6 + Math.random() * 0.6,
        rot: Math.random() * Math.PI * 2, vRot: (Math.random() - 0.5) * 0.04,
        size: 6 + Math.random() * 8,
        hue: 340 + Math.random() * 25,
        sway: 0.5 + Math.random() * 1.2, swayPhase: Math.random() * Math.PI * 2,
        life: 1, dead: false,
      };
    case 'pollen':
      return {
        type, x: Math.random() * w, y: Math.random() * h * 0.7,
        vx: 0.1 + Math.random() * 0.4, vy: -0.05 + Math.random() * 0.15,
        rot: 0, vRot: 0,
        size: 2 + Math.random() * 2.5,
        hue: 48 + Math.random() * 10,
        sway: 0.8 + Math.random() * 1.4, swayPhase: Math.random() * Math.PI * 2,
        life: 1 + Math.random() * 2, dead: false,
      };
    case 'leaves':
      return {
        type, x: Math.random() * w, y: -30 - Math.random() * 200,
        vx: 0.4 + Math.random() * 0.8, vy: 0.8 + Math.random() * 0.9,
        rot: Math.random() * Math.PI * 2, vRot: (Math.random() - 0.5) * 0.06,
        size: 9 + Math.random() * 10,
        hue: 90 + Math.random() * 40,
        sway: 1 + Math.random() * 2, swayPhase: Math.random() * Math.PI * 2,
        life: 1, dead: false,
      };
    case 'rain':
      return {
        type, x: Math.random() * (w + 200) - 100, y: -20 - Math.random() * 80,
        vx: 1.5 + Math.random() * 1.5, vy: 12 + Math.random() * 8,
        rot: 0, vRot: 0,
        size: 10 + Math.random() * 12,
        hue: 210,
        sway: 0, swayPhase: 0,
        life: 1, dead: false,
      };
    case 'fireflies':
    default:
      return {
        type, x: Math.random() * w, y: h * (0.3 + Math.random() * 0.6),
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.3,
        rot: 0, vRot: 0,
        size: 2 + Math.random() * 2,
        hue: 55,
        sway: 0.6 + Math.random(), swayPhase: Math.random() * Math.PI * 2,
        life: 6 + Math.random() * 6, dead: false,
      };
  }
}

function updateParticle(p, dt) {
  p.swayPhase += 0.04 * dt;
  switch (p.type) {
    case 'petals':
      p.x += (p.vx + Math.sin(p.swayPhase) * p.sway) * dt;
      p.y += p.vy * dt;
      p.rot += p.vRot * dt;
      break;
    case 'pollen':
      p.x += (p.vx + Math.sin(p.swayPhase) * p.sway) * dt;
      p.y += (p.vy + Math.cos(p.swayPhase * 0.7) * 0.3) * dt;
      p.life -= 0.004 * dt;
      if (p.life <= 0) p.dead = true;
      break;
    case 'leaves':
      p.x += (p.vx + Math.sin(p.swayPhase) * p.sway) * dt;
      p.y += p.vy * dt;
      p.rot += p.vRot * dt;
      break;
    case 'rain':
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      break;
    case 'fireflies':
    default: {
      p.x += (p.vx + Math.sin(p.swayPhase) * 0.6) * dt;
      p.y += (p.vy + Math.cos(p.swayPhase * 1.3) * 0.5) * dt;
      p.life -= 0.002 * dt;
      if (p.life <= 0) p.dead = true;
      break;
    }
  }
}

function drawParticle(ctx, p, alpha) {
  if (alpha < 0.02) return;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);

  switch (p.type) {
    case 'petals': {
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
      grad.addColorStop(0, `hsla(${p.hue}, 95%, 88%, ${alpha})`);
      grad.addColorStop(1, `hsla(${p.hue}, 78%, 65%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'pollen': {
      const a = alpha * Math.min(1, p.life);
      ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${a * 0.85})`;
      ctx.shadowColor = `hsla(${p.hue}, 95%, 80%, ${a * 0.9})`;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'leaves': {
      ctx.fillStyle = `hsla(${p.hue}, 60%, 45%, ${alpha})`;
      ctx.beginPath();
      // teardrop-ish leaf
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.5, p.size * 0.7, p.size * 0.5, 0, p.size);
      ctx.bezierCurveTo(-p.size * 0.7, p.size * 0.5, -p.size * 0.7, -p.size * 0.5, 0, -p.size);
      ctx.fill();
      ctx.strokeStyle = `hsla(${p.hue}, 60%, 28%, ${alpha * 0.6})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 0.9);
      ctx.lineTo(0, p.size * 0.9);
      ctx.stroke();
      break;
    }
    case 'rain': {
      ctx.strokeStyle = `rgba(190, 215, 245, ${alpha * 0.5})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-p.vx * 0.6, -p.size);
      ctx.stroke();
      break;
    }
    case 'fireflies':
    default: {
      const flicker = 0.55 + Math.sin(p.swayPhase * 4) * 0.45;
      const a = alpha * Math.min(1, p.life) * flicker;
      ctx.fillStyle = `hsla(${p.hue}, 100%, 80%, ${a})`;
      ctx.shadowColor = `hsla(${p.hue}, 100%, 80%, ${a})`;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}

// not yet used elsewhere; exported so tests / debug can iterate.
export { TYPES };
