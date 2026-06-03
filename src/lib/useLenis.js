// useLenis.js
// -----------------------------------------------------------------------------
// Bootstraps Lenis (smooth scrolling) and wires it to:
//   - GSAP ScrollTrigger (so all GSAP scroll-driven animations stay in sync)
//   - our global scrollState store (so layers can update from one source)
//   - a layout-measurement loop (so keyframe progress values track the real
//     pixel height of each <section>, not a hardcoded number)
//
// Returns the Lenis instance so callers can call lenis.scrollTo(target).

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setScrollProgress, refreshLayout } from './scrollState.js';

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

    // Measure section heights once layout has settled, then again whenever
    // the page reflows. The plan keyframes resolve against these numbers, so
    // changes to copy / images / responsive breakpoints flow through to the
    // animation without any manual progress-value tweaking. ScrollTrigger
    // also needs to be told to re-measure its own trigger element positions
    // (otherwise per-section triggers like the StormScene lightning loop
    // keep their initial offsets and never fire when the layout shifts).
    const refresh = () => {
      refreshLayout();
      ScrollTrigger.refresh();
    };
    let kickoff = requestAnimationFrame(() => {
      // Two rAFs so styles/fonts have a chance to apply before measuring.
      kickoff = requestAnimationFrame(refresh);
    });
    window.addEventListener('resize', refresh);
    // ResizeObserver catches content-driven height changes (image loads,
    // collapsing/expanding sections, dynamic copy) that a resize listener
    // alone would miss.
    let ro = null;
    const main = document.querySelector('main.page');
    if (typeof ResizeObserver !== 'undefined' && main) {
      ro = new ResizeObserver(refresh);
      ro.observe(main);
    }

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(kickoff);
      window.removeEventListener('resize', refresh);
      if (ro) ro.disconnect();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}
