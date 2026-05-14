// Navigation.jsx
// -----------------------------------------------------------------------------
// Right-side dot navigation. Reads the scrollPlan's accent color directly
// (no React state needed for the per-tick recolor) so the nav always reads
// against whatever scene you're currently in.

import React, { useEffect, useRef, useState } from 'react';
import { subscribe } from '../lib/scrollState.js';
import { SECTION_PROGRESS } from '../lib/scrollPlan.js';

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

// Hook: returns the id of the section whose progress band best matches the
// current overall scroll progress. Reads directly from scrollState.
export function useScrollSpy(sections) {
  const [activeId, setActiveId] = useState(sections[0]?.id);

  useEffect(() => {
    const ids = sections.map((s) => s.id);
    const points = ids.map((id) => SECTION_PROGRESS[id] ?? 0);
    return subscribe(({ progress }) => {
      let bestId = ids[0];
      let bestDist = Infinity;
      for (let i = 0; i < ids.length; i += 1) {
        const dist = Math.abs(progress - points[i]);
        if (dist < bestDist) {
          bestDist = dist;
          bestId = ids[i];
        }
      }
      setActiveId(bestId);
    });
  }, [sections]);

  return activeId;
}
