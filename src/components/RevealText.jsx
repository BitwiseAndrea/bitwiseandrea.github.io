// RevealText.jsx
// -----------------------------------------------------------------------------
// A tiny wrapper that splits its text into characters/words and stagger-reveals
// them on scroll into view (via GSAP ScrollTrigger). Used by every scene's
// headline and lede.

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

export default function RevealText({
  as: Tag = 'h2',
  className = '',
  split = 'words',
  stagger = 0.04,
  duration = 0.9,
  yFrom = '120%',
  rotateFrom = 8,
  delay = 0,
  start = 'top 85%',
  end = 'bottom 30%',
  children,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const splitted = new SplitType(el, { types: split });

    const targets =
      split === 'chars' ? splitted.chars
        : split === 'lines' ? splitted.lines
          : splitted.words;

    if (!targets || !targets.length) return () => splitted.revert();

    // Wrap targets in a clipping span so the reveal looks like text emerging
    // from underneath itself.
    targets.forEach((t) => {
      const wrap = document.createElement('span');
      wrap.style.display = 'inline-block';
      wrap.style.overflow = 'hidden';
      wrap.style.verticalAlign = 'top';
      wrap.style.lineHeight = '1.1';
      // preserve trailing space so words don't collapse together
      const next = t.nextSibling;
      t.parentNode.insertBefore(wrap, t);
      wrap.appendChild(t);
      t.style.display = 'inline-block';
      t.style.willChange = 'transform, opacity';
      if (next && next.nodeType === Node.TEXT_NODE) {
        // leave the trailing whitespace text node where it was
      }
    });

    if (reduce) {
      gsap.set(targets, { y: 0, rotate: 0, opacity: 1 });
      return () => splitted.revert();
    }

    const tween = gsap.fromTo(
      targets,
      { yPercent: parseInt(yFrom, 10), rotate: rotateFrom, opacity: 0 },
      {
        yPercent: 0,
        rotate: 0,
        opacity: 1,
        duration,
        stagger,
        ease: 'power3.out',
        delay,
        scrollTrigger: {
          trigger: el,
          start,
          end,
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      splitted.revert();
    };
  }, [split, stagger, duration, yFrom, rotateFrom, delay, start, end]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
