// scrollState.js
// -----------------------------------------------------------------------------
// A tiny singleton store that holds the current interpolated scroll plan.
// Layers subscribe to receive updates every scroll tick (rAF-rate, from Lenis).
// This avoids React re-renders for high-frequency animation updates — each
// layer touches the DOM/canvas directly when notified.
//
// `refreshLayout` reads `<section>` positions out of the DOM and re-resolves
// the scroll plan against them, so keyframes and section pip targets always
// reflect the real height of the page (no hardcoded progress values).

import { interpolatePlan, resolveLayout } from './scrollPlan.js';

const listeners = new Set();

const state = {
  progress: 0,
  plan: interpolatePlan(0),
};

export function subscribe(fn) {
  listeners.add(fn);
  fn(state); // prime
  return () => listeners.delete(fn);
}

export function setScrollProgress(progress) {
  state.progress = progress;
  state.plan = interpolatePlan(progress);
  listeners.forEach((fn) => fn(state));
}

export function getScrollState() {
  return state;
}

// Measure all `<section id="…">` children of <main class="page"> and re-derive
// the plan's keyframe progress values + section midpoints from the actual
// pixel layout. Safe to call from any frame; subscribers get a fresh snapshot
// at the current scroll position immediately after.
export function refreshLayout() {
  if (typeof document === 'undefined') return;
  const sections = document.querySelectorAll('main.page > section[id]');
  if (!sections.length) return;

  const measurements = {};
  sections.forEach((sec) => {
    measurements[sec.id] = { top: sec.offsetTop, height: sec.offsetHeight };
  });

  const scrollMax = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );

  resolveLayout(measurements, scrollMax);

  // Re-emit at the current progress so layers redraw against the fresh plan.
  state.plan = interpolatePlan(state.progress);
  listeners.forEach((fn) => fn(state));
}
