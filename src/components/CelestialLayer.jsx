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

export default function CelestialLayer() {
  const wrapRef = useRef(null);
  const bodyRef = useRef(null);
  const haloRef = useRef(null);
  const craterRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const body = bodyRef.current;
    const halo = haloRef.current;
    const crater = craterRef.current;
    if (!wrap || !body || !halo || !crater) return undefined;

    const apply = ({ plan }) => {
      const viewportMin = Math.min(window.innerWidth, window.innerHeight);
      const size = plan.sunSize * viewportMin;
      const x = plan.sunX * window.innerWidth - size / 2;
      const y = plan.sunY * window.innerHeight - size / 2;

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
    };

    const unsub = subscribe(apply);
    const onResize = () => apply({ plan: getCurrentPlan() });
    window.addEventListener('resize', onResize);
    return () => {
      unsub();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="layer celestial-layer" aria-hidden="true">
      <div ref={wrapRef} className="celestial">
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
