import React, { useCallback, useEffect } from 'react';

import './styles/global.scss';

import { useLenis } from './lib/useLenis.js';
import Navigation, { useScrollSpy } from './components/Navigation.jsx';
import SkyLayer from './components/SkyLayer.jsx';
import MountainsLayer from './components/MountainsLayer.jsx';
import CelestialLayer from './components/CelestialLayer.jsx';
import ForegroundFloraLayer from './components/ForegroundFloraLayer.jsx';
import WeatherCanvas from './components/WeatherCanvas.jsx';
import RainCursorCanvas from './components/RainCursorCanvas.jsx';
import CustomCursor from './components/CustomCursor.jsx';
import IntroCurtain from './components/IntroCurtain.jsx';
import {
  DawnScene,
  DaylightScene,
  GardenScene,
  StormScene,
  NightScene,
} from './components/Scenes.jsx';

const SECTIONS = [
  { id: 'dawn',   label: 'Dawn' },
  { id: 'day',    label: 'About' },
  { id: 'garden', label: 'Projects' },
  { id: 'storm',  label: 'Skills' },
  { id: 'night',  label: 'Contact' },
];

export default function App() {
  const lenisRef = useLenis();
  const activeId = useScrollSpy(SECTIONS);

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
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 });
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [lenisRef]);

  return (
    <>
      <SkyLayer />
      <MountainsLayer />
      <CelestialLayer />
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
        <GardenScene   id="garden" label="Projects" />
        <StormScene    id="storm"  label="Skills" />
        <NightScene    id="night"  label="Contact" />

        <footer className="footnote">
          © {new Date().getFullYear()} Andrea Fletcher · made with rain
        </footer>
      </main>

      <CustomCursor />
      <IntroCurtain onComplete={releaseScroll} />
    </>
  );
}
