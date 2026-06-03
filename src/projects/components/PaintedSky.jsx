// PaintedSky.jsx
// -----------------------------------------------------------------------------
// A static painterly sky for project pages. Picks a palette that matches one
// of the home page's scene keyframes so the project pages feel like they
// belong to the same world, just frozen at a particular moment.

import React from 'react';

const PALETTES = {
  dawn:   { top: '#fcd1a1', mid: '#f7a2a0', bot: '#6e5a8a' },
  noon:   { top: '#71c5ff', mid: '#b9e5ff', bot: '#f4fbff' },
  garden: { top: '#bfe199', mid: '#7eba78', bot: '#244a2e' },
  dusk:   { top: '#1c1f3c', mid: '#3a3e63', bot: '#6e5a8a' },
  night:  { top: '#04050f', mid: '#0b1230', bot: '#1a2257' },
};

export default function PaintedSky({ palette = 'dusk' }) {
  const colors = PALETTES[palette] || PALETTES.dusk;
  const style = {
    background: `linear-gradient(180deg, ${colors.top} 0%, ${colors.mid} 55%, ${colors.bot} 100%)`,
  };
  return <div className="project-sky" style={style} aria-hidden="true" />;
}
