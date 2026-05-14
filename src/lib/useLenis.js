// useLenis.js
// -----------------------------------------------------------------------------
// Bootstraps Lenis (smooth scrolling) and wires it to:
//   - GSAP ScrollTrigger (so all GSAP scroll-driven animations stay in sync)
//   - our global scrollState store (so layers can update from one source)
//
// Returns the Lenis instance so callers can call lenis.scrollTo(target).

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setScrollProgress } from './scrollState.js';

gsap.registerPlugin(ScrollTrigger);

export function useLenis() {
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', (e) => {
      ScrollTrigger.update();
      // e.progress is 0..1 of total scrollable area.
      setScrollProgress(typeof e.progress === 'number' ? e.progress : 0);
    });

    let frame = 0;
    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // Make sure progress reflects the initial scroll position.
    setScrollProgress(lenis.progress || 0);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}
