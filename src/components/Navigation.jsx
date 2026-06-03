// Navigation.jsx
// -----------------------------------------------------------------------------
// Right-side dot navigation. Reads the scrollPlan's accent color directly
// (no React state needed for the per-tick recolor) so the nav always reads
// against whatever scene you're currently in.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { subscribe } from '../lib/scrollState.js';
import { getSectionRange } from '../lib/scrollPlan.js';

export default function Navigation({ sections, activeId, onSelect }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    return subscribe(({ plan }) => {
      root.style.setProperty('--nav-accent', plan.accentColor);
      root.style.setProperty('--nav-ink', plan.ambient);
    });
  }, []);

  return (
    <nav ref={rootRef} className="nav" aria-label="Section navigation">
      {sections.map((s) => {
        const isActive = s.id === activeId;
        return (
          <button
            key={s.id}
            type="button"
            data-magnetic
            className={`nav__item ${isActive ? 'nav__item--active' : ''}`}
            onClick={() => onSelect(s.id)}
            aria-label={`Jump to ${s.label}`}
          >
            <span className="nav__label">{s.label}</span>
            <span className="nav__dot" />
          </button>
        );
      })}
    </nav>
  );
}

// Hook: returns [activeId, pinTo].
//
// `activeId` is the id of the section the pip nav should highlight.
// `pinTo(id)` lets the click handler force a particular pip active for the
// duration of the click-to-jump animation, so the directional spy doesn't
// briefly highlight neighboring sections while Lenis animates past them.
//
// Spy logic: the deepest section whose start has been crossed by an anchor
// point that sits ~1/3 viewport ahead of the user in the direction they're
// scrolling. Going down → next section activates as it approaches; going
// up → previous section activates as it approaches. Section ranges come
// from `scrollPlan`, which recomputes them whenever the page reflows.
export function useScrollSpy(sections) {
  const [activeId, setActiveId] = useState(sections[0]?.id);
  // Pin state for click-to-jump. While a pin is active, the spy returns the
  // pinned id. The pin is released as soon as we measure that the scroll has
  // landed at the pinned target. A safety timeout also clears the pin if
  // we never quite arrive (rounding, user-interrupted scroll, etc.).
  const pinRef = useRef(null);
  // Scroll direction: -1 up, +1 down, 0 settled / no bias. Stored as a ref
  // so `pinTo` can reset it the moment a click happens — this prevents the
  // spy from carrying old velocity into the click-to-jump animation, and
  // again into the very first post-pin frame.
  const directionRef = useRef(0);

  useEffect(() => {
    const ids = sections.map((s) => s.id);
    let lastProgress = 0;
    const EPS = 0.0005;

    return subscribe(({ progress }) => {
      const delta = progress - lastProgress;
      lastProgress = progress;

      // Pin honored: hold the active id at the click target until Lenis
      // arrives. When the pin releases, leave direction at 0 (set by
      // `pinTo`) so the post-pin frame uses the un-biased section that
      // contains the actual scroll position.
      const pin = pinRef.current;
      if (pin) {
        const range = getSectionRange(pin.id);
        const arrived = range && Math.abs(progress - range.start) < 0.002;
        if (arrived) {
          pinRef.current = null;
          directionRef.current = 0;
        } else {
          setActiveId(pin.id);
          return;
        }
      } else if (delta > EPS) {
        directionRef.current = 1;
      } else if (delta < -EPS) {
        directionRef.current = -1;
      }
      // |delta| <= EPS: leave direction unchanged so the bias persists at
      // whatever was last observed (or 0 if we just settled).

      const scrollMax = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const offset = (window.innerHeight / 3) / scrollMax;
      // Lenis often settles ~0.5 pixels short of the click-to-jump target,
      // which would otherwise leave the spy one section behind. Allow a
      // ~1px slack on the boundary check so we still credit the section
      // when we land essentially on its top edge.
      const slack = 1 / scrollMax;
      const anchor = progress + directionRef.current * offset + slack;

      let bestId = ids[0];
      let bestStart = -Infinity;
      for (const id of ids) {
        const range = getSectionRange(id);
        if (!range) continue;
        if (range.start <= anchor && range.start > bestStart) {
          bestStart = range.start;
          bestId = id;
        }
      }
      setActiveId(bestId);
    });
  }, [sections]);

  const pinTo = useCallback((id) => {
    pinRef.current = { id, startedAt: Date.now() };
    // Reset direction so the click-to-jump animation can't carry stale
    // velocity into the post-pin frame; if Lenis doesn't quite arrive at
    // the pinned target (rounding, user-interrupted scroll), the safety
    // timeout below releases the pin with direction still at 0, so the
    // spy will pick the section actually containing the final scroll.
    directionRef.current = 0;
    setActiveId(id);
    setTimeout(() => {
      const pin = pinRef.current;
      if (pin && pin.id === id) {
        pinRef.current = null;
        directionRef.current = 0;
      }
    }, 2000);
  }, []);

  return [activeId, pinTo];
}
