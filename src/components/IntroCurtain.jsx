// IntroCurtain.jsx
// -----------------------------------------------------------------------------
// A first-load reveal that plays like a sunrise: a warm horizon-glow swells
// up from the bottom of the viewport, the wordmark fades through a soft halo
// of light, and then the two warm-tinted panels peel apart to reveal the
// dawn scene underneath. Calls onComplete when finished so the parent can
// release scroll lock or run any "page is ready" side effects.

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function IntroCurtain({ onComplete }) {
  const rootRef = useRef(null);
  const topRef = useRef(null);
  const botRef = useRef(null);
  const glowRef = useRef(null);
  const markRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tl = gsap.timeline({
      onComplete: () => {
        if (rootRef.current) rootRef.current.style.display = 'none';
        onComplete?.();
      },
    });

    if (reduce) {
      tl.set([topRef.current, botRef.current], { yPercent: -100 })
        .set([glowRef.current, markRef.current], { autoAlpha: 0 });
      return () => tl.kill();
    }

    tl.fromTo(
      glowRef.current,
      { autoAlpha: 0, scale: 0.6 },
      { autoAlpha: 1, scale: 1.05, duration: 1.1, ease: 'power2.out' }
    )
      .fromTo(
        markRef.current,
        { autoAlpha: 0, y: 14, letterSpacing: '0.6em' },
        { autoAlpha: 1, y: 0, letterSpacing: '0.32em', duration: 0.9, ease: 'power3.out' },
        '-=0.7'
      )
      .to(markRef.current, { autoAlpha: 0, y: -10, duration: 0.5, ease: 'power2.in' }, '+=0.6')
      .to(glowRef.current, { autoAlpha: 0, scale: 1.4, duration: 0.8, ease: 'power2.inOut' }, '<')
      .to(topRef.current, { yPercent: -100, duration: 1.1, ease: 'power3.inOut' }, '-=0.5')
      .to(botRef.current, { yPercent: 100, duration: 1.1, ease: 'power3.inOut' }, '<');

    return () => tl.kill();
  }, [onComplete]);

  return (
    <div ref={rootRef} className="intro-curtain" aria-hidden="true">
      <div ref={topRef} className="intro-curtain__panel intro-curtain__panel--top" />
      <div ref={botRef} className="intro-curtain__panel intro-curtain__panel--bot" />
      <div ref={glowRef} className="intro-curtain__glow" />
      <div ref={markRef} className="intro-curtain__mark">bitwiseandrea</div>
    </div>
  );
}
