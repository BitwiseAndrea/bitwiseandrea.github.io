// IntroCurtain.jsx
// -----------------------------------------------------------------------------
// A first-load curtain reveal. Two solid-color panels slide off the top and
// bottom of the viewport, while the wordmark fades and lifts away. Calls
// onComplete when the animation finishes so the parent can release scroll lock
// or run any "page is ready" side effects.

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function IntroCurtain({ onComplete }) {
  const rootRef = useRef(null);
  const topRef = useRef(null);
  const botRef = useRef(null);
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
        .set(markRef.current, { autoAlpha: 0 });
      return () => tl.kill();
    }

    tl.fromTo(
      markRef.current,
      { autoAlpha: 0, y: 12, letterSpacing: '0.6em' },
      { autoAlpha: 1, y: 0, letterSpacing: '0.32em', duration: 0.9, ease: 'power3.out' }
    )
      .to(markRef.current, { autoAlpha: 0, y: -10, duration: 0.5, ease: 'power2.in' }, '+=0.6')
      .to(topRef.current, { yPercent: -100, duration: 1.0, ease: 'power3.inOut' }, '-=0.1')
      .to(botRef.current, { yPercent: 100, duration: 1.0, ease: 'power3.inOut' }, '<');

    return () => tl.kill();
  }, [onComplete]);

  return (
    <div ref={rootRef} className="intro-curtain" aria-hidden="true">
      <div ref={topRef} className="intro-curtain__panel intro-curtain__panel--top" />
      <div ref={botRef} className="intro-curtain__panel intro-curtain__panel--bot" />
      <div ref={markRef} className="intro-curtain__mark">bitwiseandrea</div>
    </div>
  );
}
