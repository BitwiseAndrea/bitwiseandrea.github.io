// scrollState.js
// -----------------------------------------------------------------------------
// A tiny singleton store that holds the current interpolated scroll plan.
// Layers subscribe to receive updates every scroll tick (rAF-rate, from Lenis).
// This avoids React re-renders for high-frequency animation updates — each
// layer touches the DOM/canvas directly when notified.

import { interpolatePlan } from './scrollPlan.js';

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
