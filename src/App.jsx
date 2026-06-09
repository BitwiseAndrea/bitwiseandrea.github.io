import React, { useCallback, useEffect, useState } from 'react';

import './styles/global.scss';

import { useLenis } from './lib/useLenis.js';
import Navigation, { useScrollSpy } from './components/Navigation.jsx';
import SkyLayer from './components/SkyLayer.jsx';
import MountainsLayer from './components/MountainsLayer.jsx';
import OceanLayer from './components/OceanLayer.jsx';
import CelestialLayer from './components/CelestialLayer.jsx';
import SunRaysLayer from './components/SunRaysLayer.jsx';
import ForegroundFloraLayer from './components/ForegroundFloraLayer.jsx';
import WeatherCanvas from './components/WeatherCanvas.jsx';
import RainCursorCanvas from './components/RainCursorCanvas.jsx';
import CustomCursor from './components/CustomCursor.jsx';
import IntroCurtain from './components/IntroCurtain.jsx';
import ConstellationOverlay from './components/ConstellationOverlay.jsx';
import MoonHotspot from './components/MoonHotspot.jsx';
import {
  DawnScene,
  DaylightScene,
  DesertScene,
  GardenScene,
  StormScene,
  NightScene,
} from './components/Scenes.jsx';

const SECTIONS = [
  { id: 'dawn',   label: 'Dawn' },
  { id: 'day',    label: 'About' },
  { id: 'desert', label: 'Tooling' },
  { id: 'garden', label: 'Projects' },
  { id: 'storm',  label: 'Skills' },
  { id: 'night',  label: 'Contact' },
];

export default function App() {
  const lenisRef = useLenis();
  const [activeId, pinNavTo] = useScrollSpy(SECTIONS);
  const [constellationOpen, setConstellationOpen] = useState(false);

  // While the curtain is up, lock the scroll so users land on the hero
  // instead of mid-way down if they refreshed.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return undefined;
    lenis.stop();
    document.body.style.overflow = 'hidden';
    return () => {
      lenis.start();
      document.body.style.overflow = '';
    };
  }, [lenisRef]);

  const releaseScroll = useCallback(() => {
    const lenis = lenisRef.current;
    if (lenis) lenis.start();
    document.body.style.overflow = '';
  }, [lenisRef]);

  const handleNavSelect = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Pin the nav highlight to the clicked section before kicking off the
    // smooth scroll. Without the pin, the directional scroll-spy would
    // briefly light up every section we pass during the animated jump.
    pinNavTo(id);
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 });
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [lenisRef, pinNavTo]);

  // While the constellation overlay is up, freeze the page so users don't
  // accidentally scroll the world behind it.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return undefined;
    if (constellationOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }
    return undefined;
  }, [constellationOpen, lenisRef]);

  // Single handler for the moon-hotspot: it doubles as both the "open"
  // and "close" trigger so the centered moon stays clickable.
  const toggleConstellations = useCallback(() => {
    setConstellationOpen((prev) => !prev);
  }, []);
  const closeConstellations = useCallback(() => setConstellationOpen(false), []);

  return (
    <div className={`app-root${constellationOpen ? ' constellation-open' : ''}`}>
      <SkyLayer />
      {/* SunRaysLayer renders BEFORE the celestial body so when both share
          z-index 2, the sun's gradient disc draws on top of the rays —
          rays radiate out from behind the sun rather than crossing over
          its face. */}
      <SunRaysLayer />
      <CelestialLayer onMoonClick={toggleConstellations} frozen={constellationOpen} />
      <MountainsLayer />
      <OceanLayer />
      <ForegroundFloraLayer />
      <WeatherCanvas />
      <RainCursorCanvas />

      <Navigation
        sections={SECTIONS}
        activeId={activeId}
        onSelect={handleNavSelect}
      />

      <main className="page">
        <DawnScene     id="dawn"   label="Hello" />
        <DaylightScene id="day"    label="About" />
        <DesertScene   id="desert" label="Tooling" />
        <GardenScene   id="garden" label="Projects" />
        <StormScene    id="storm"  label="Skills" />
        <NightScene    id="night"  label="Contact" />

        <footer className="footnote">
          © {new Date().getFullYear()} Andrea Fletcher · made with rain
        </footer>
      </main>

      <MoonHotspot onClick={toggleConstellations} frozen={constellationOpen} />
      <CustomCursor />
      <ConstellationOverlay open={constellationOpen} onClose={closeConstellations} />
      <IntroCurtain onComplete={releaseScroll} />
    </div>
  );
}
