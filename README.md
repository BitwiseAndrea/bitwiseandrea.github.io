# bitwiseandrea.com

Andrea Fletcher's personal site — a small garden of work, grown in code.

A single-page vertical-scrolling portfolio choreographed as one continuous
animation: the sky, the celestial body, the weather, and the rain all share a
single timeline driven by scroll. From dawn pink through a midday garden,
into a thundering storm, and out the other side under a moon.

## Stack

- **Vite 5** + **React 18**
- **GSAP** + **ScrollTrigger** — scroll-driven choreography
- **Lenis** — smooth scroll inertia
- **split-type** — character/word-level text reveals
- **Sass** — palette & layout
- **HTML5 Canvas** — weather particles + cursor-driven rain

## Run it

```bash
npm install
npm run dev      # http://localhost:8000
npm run build    # -> dist/
npm run preview  # serve the build locally
```

## Animation architecture

The page is **one continuous world**, not five separate scenes. Five
fixed-position layers stacked behind the scrollable content morph together as
you scroll:

| Layer | What it does |
| ----- | ------------ |
| `SkyLayer` | A single linear-gradient that morphs through every keyframe color |
| `MountainsLayer` | Three parallax SVG silhouettes that tint + drift |
| `CelestialLayer` | One element that arcs from a dawn sun → noon sun → storm-dim sun → moon |
| `WeatherCanvas` | Particles that crossfade: petals → pollen → leaves → rain → fireflies |
| `RainCursorCanvas` | Cursor-aware rain. Always responsive; pours during the storm scene |

All of them subscribe to a single source of truth — `src/lib/scrollState.js`
— which is updated every scroll tick by Lenis. The keyframes live in
`src/lib/scrollPlan.js` and define the entire visual journey.

The scenes themselves (`Scenes.jsx`) are transparent content layers — text
that reveals character-by-character on scroll (via `RevealText`), SVG plants
and ferns that draw themselves in via stroke-dashoffset, lightning bolts and
twinkling stars.

A few other touches:

- **Custom cursor** (`CustomCursor.jsx`) — a halo that lags behind the
  cursor with spring physics, plus a tiny dot. Both adapt to the current
  scene's accent color. Any element marked `data-magnetic` gets a soft
  pull on the cursor and a halo grow.
- **Intro curtain** (`IntroCurtain.jsx`) — a two-panel curtain wipes off
  the viewport on first load, while the wordmark fades.
- **Reduced motion** — every animation respects
  `prefers-reduced-motion: reduce` and degrades to a static, legible page.

## Project layout

```
src/
  main.jsx                       # Vite entry
  App.jsx                        # composes everything
  styles/global.scss             # palette + layers + scenes
  lib/
    scrollPlan.js                # the keyframes (the soul of the site)
    scrollState.js               # singleton store, layers subscribe here
    useLenis.js                  # smooth scroll + ScrollTrigger sync
    useReducedMotion.js
  components/
    SkyLayer.jsx
    MountainsLayer.jsx
    CelestialLayer.jsx
    WeatherCanvas.jsx
    RainCursorCanvas.jsx
    Navigation.jsx
    CustomCursor.jsx
    IntroCurtain.jsx
    RevealText.jsx
    Scenes.jsx                   # all five scenes in one file (they share structure)
public/
  icon.png
  CNAME                          # custom domain (www.bitwiseandrea.com)
.github/workflows/deploy.yml     # builds & deploys to GH Pages on push to main
```

## Tuning the look

Almost every visual decision lives in **one place**:
`src/lib/scrollPlan.js`. Each keyframe describes a moment along the page
(0..1 of scroll progress) and sets:

- Three sky gradient stops (top / mid / bottom)
- The celestial body's position, size, color, glow, and crater-overlay
- Which weather type is active and how intense
- Mountain silhouette tint and parallax baseline
- UI accent colors

To shift the entire mood of the page, edit those values. Everything else
follows.

## Roadmap

- [ ] Replace placeholder copy with real project content.
- [ ] Build the line-runner portfolio experience in Roblox and link it
      from the Projects scene.
- [ ] Optional: add 3D foreground plants in the Garden scene with R3F.
- [ ] Optional: subtle ambient audio per scene (toggle in nav).
