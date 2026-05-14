// Scenes.jsx
// -----------------------------------------------------------------------------
// All five scene components live in one file because they share the same
// underlying shape: an id'd <section> that hosts content laid over the global
// animated layers (sky, mountains, celestial, foreground flora, weather, rain).
//
// Per-scene flourishes (the rest of the world is global):
//   - Storm:    SVG lightning bolts that flash periodically while in view
//   - Night:    a twinkling star field anchored to the section
//
// Text reveals use the shared RevealText component.

import React, { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RevealText from './RevealText.jsx';

gsap.registerPlugin(ScrollTrigger);

// =============================================================================
// Generic scene wrapper
// =============================================================================
function SceneSection({ id, label, ariaLabel, children, decorations, contentAlign = 'left' }) {
  return (
    <section id={id} className="scene" aria-label={ariaLabel || label}>
      {decorations}
      <div className={`scene__content scene__content--${contentAlign}`}>
        <span className="scene__eyebrow">{label}</span>
        {children}
      </div>
    </section>
  );
}

// =============================================================================
// Dawn — Hero
// =============================================================================
// Trees that sprout up from the ground are handled by ForegroundFloraLayer
// (so they stay rooted to the viewport bottom even as you scroll through the
// rest of the page).

export function DawnScene({ id, label }) {
  return (
    <SceneSection
      id={id}
      label={label}
      contentAlign="center"
    >
      <RevealText as="h1" className="scene__title" split="words" stagger={0.08} yFrom="120%">
        A small garden of work, grown in code.
      </RevealText>
      <RevealText as="p" className="scene__lede" split="words" stagger={0.018} yFrom="80%" delay={0.1}>
        I'm Andrea Fletcher — a software engineer who likes to build things
        that feel like places. Scroll through a day with me.
      </RevealText>
      <div className="dawn-signature">
        <span className="dawn-signature__line" />
        ↓ scroll the day
        <span className="dawn-signature__line" />
      </div>
    </SceneSection>
  );
}

// =============================================================================
// Daylight — About
// =============================================================================
export function DaylightScene({ id, label }) {
  return (
    <SceneSection id={id} label={label}>
      <RevealText as="h2" className="scene__title" split="words" stagger={0.06} yFrom="100%">
        Designing the daylight hours.
      </RevealText>
      <RevealText as="p" className="scene__lede" split="words" stagger={0.014}>
        I write frontend code, sketch interfaces, and quietly over-engineer
        my side projects. I care about craft, performance, and the details
        you only notice if you're looking.
      </RevealText>
      <RevealText as="p" className="scene__body" split="lines" stagger={0.08}>
        Currently building experiences at Roblox. Previously a long list of
        web apps, design systems, and the occasional Roblox world.
      </RevealText>
    </SceneSection>
  );
}

// =============================================================================
// Garden — Projects
// =============================================================================
// Ferns growing up from the ground are handled by ForegroundFloraLayer.

const PROJECTS = [
  {
    kicker: 'Roblox · 2026',
    title: 'A world worth wandering',
    body:
      'An ambient social space exploring what makes a virtual place feel inhabited — light, sound, and the slow rhythms of weather.',
  },
  {
    kicker: 'Web · ongoing',
    title: 'bitwiseandrea.com',
    body:
      'This site. Hand-painted gradients, a canvas of rain that listens to your cursor, and a single continuous animation from dawn to dark.',
  },
  {
    kicker: 'Tools',
    title: 'Tiny CLIs & UI bits',
    body:
      'A growing collection of small developer tools — design tokens, a markdown linter, a colour-palette generator that thinks in moods.',
  },
];

export function GardenScene({ id, label }) {
  return (
    <SceneSection id={id} label={label}>
      <RevealText as="h2" className="scene__title" split="words" stagger={0.06} yFrom="100%">
        The garden.
      </RevealText>
      <RevealText as="p" className="scene__lede" split="words" stagger={0.014}>
        A few of the things I've been growing. Some are weeded and pruned;
        some are still wild — all of them taught me something.
      </RevealText>

      <div className="cards">
        {PROJECTS.map((p, idx) => (
          <ProjectCard key={p.title} project={p} idx={idx} />
        ))}
      </div>
    </SceneSection>
  );
}

function ProjectCard({ project, idx }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      gsap.set(el, { opacity: 1, y: 0 });
      return undefined;
    }
    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
        delay: idx * 0.12,
        scrollTrigger: {
          trigger: el,
          start: 'top 92%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [idx]);

  return (
    <article ref={ref} className="card" data-magnetic>
      <div className="card__kicker">{project.kicker}</div>
      {project.title ? <h3 className="card__title">{project.title}</h3> : null}
      <p className="card__body">{project.body}</p>
    </article>
  );
}

// =============================================================================
// Storm — Skills (with lightning + flash)
// =============================================================================

function makeBoltPath(startX, startY, endX, endY, segments = 8) {
  const dx = (endX - startX) / segments;
  const dy = (endY - startY) / segments;
  let d = `M ${startX} ${startY}`;
  for (let i = 1; i <= segments; i += 1) {
    const jitterX = i === segments ? 0 : (Math.random() - 0.5) * 40;
    const jitterY = i === segments ? 0 : (Math.random() - 0.5) * 14;
    d += ` L ${startX + dx * i + jitterX} ${startY + dy * i + jitterY}`;
  }
  return d;
}

const SKILLS = [
  { kicker: 'Languages', body: 'TypeScript · JavaScript · Lua · Python · a little Rust' },
  { kicker: 'Frontend',  body: 'React · Vite · GSAP · framer-motion · SCSS · canvas / WebGL' },
  { kicker: 'Roblox',    body: 'Luau · ProfileService · UI frameworks · experience design' },
  { kicker: 'Tooling',   body: 'Vite · Webpack · Figma · GitHub Actions · Vercel · Cloudflare' },
];

export function StormScene({ id, label }) {
  const sectionRef = useRef(null);
  const flashRef = useRef(null);
  const boltLayerRef = useRef(null);
  const stateRef = useRef({ visible: false, mounted: true });

  useEffect(() => {
    const section = sectionRef.current;
    const flash = flashRef.current;
    const boltLayer = boltLayerRef.current;
    if (!section || !flash || !boltLayer) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      end: 'bottom 20%',
      onToggle: (self) => { stateRef.current.visible = self.isActive; },
    });

    if (reduce) {
      return () => trigger.kill();
    }

    const fire = () => {
      if (!stateRef.current.visible || !stateRef.current.mounted) return;

      const startX = 60 + Math.random() * (window.innerWidth - 120);
      const startY = 40 + Math.random() * 80;
      const endY = window.innerHeight * (0.55 + Math.random() * 0.25);
      const endX = startX + (Math.random() - 0.5) * 200;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', makeBoltPath(startX, startY, endX, endY));
      path.setAttribute('stroke', '#f8fbff');
      path.setAttribute('stroke-width', '2.6');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      path.style.filter = 'drop-shadow(0 0 14px rgba(220, 230, 255, 0.9))';
      boltLayer.appendChild(path);

      gsap.fromTo(
        path,
        { opacity: 0 },
        {
          keyframes: [{ opacity: 1, duration: 0.05 }, { opacity: 0.4, duration: 0.08 }, { opacity: 1, duration: 0.06 }, { opacity: 0, duration: 0.25 }],
          onComplete: () => path.remove(),
        }
      );

      gsap.fromTo(
        flash,
        { backgroundColor: 'rgba(255, 255, 255, 0)' },
        {
          keyframes: [
            { backgroundColor: 'rgba(245, 247, 255, 0.55)', duration: 0.05 },
            { backgroundColor: 'rgba(255, 255, 255, 0)', duration: 0.18 },
            { backgroundColor: 'rgba(220, 230, 255, 0.25)', duration: 0.05 },
            { backgroundColor: 'rgba(255, 255, 255, 0)', duration: 0.35 },
          ],
        }
      );
    };

    let cancelled = false;
    const loop = () => {
      if (cancelled) return;
      fire();
      const next = 3000 + Math.random() * 5000;
      setTimeout(loop, next);
    };
    const start = setTimeout(loop, 1800);

    return () => {
      cancelled = true;
      stateRef.current.mounted = false;
      clearTimeout(start);
      trigger.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} id={id} className="scene" aria-label={label}>
      <div className="scene__deck" aria-hidden="true">
        <div ref={flashRef} className="storm-flash" />
        <svg
          ref={boltLayerRef}
          className="storm-bolts"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          aria-hidden="true"
        />
      </div>
      <div className="scene__content scene__content--left">
        <span className="scene__eyebrow">{label}</span>
        <RevealText as="h2" className="scene__title" split="words" stagger={0.06} yFrom="100%">
          A storm in the toolbox.
        </RevealText>
        <RevealText as="p" className="scene__lede" split="words" stagger={0.014}>
          A mix of comfortable old friends and shiny new toys. Move your
          cursor around — the rain is listening.
        </RevealText>

        <div className="cards">
          {SKILLS.map((s, idx) => (
            <ProjectCard key={s.kicker} project={{ ...s, title: '' }} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// Night — Contact (with star field)
// =============================================================================

function StarField({ count = 90 }) {
  const stars = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 80,
      size: Math.random() < 0.85 ? 1.2 : 2.4,
    }));
  }, [count]);

  const rootRef = useRef(null);
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll('.night-star') || [];
    if (!els.length) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;
    const tweens = [];
    els.forEach((el) => {
      const t = gsap.fromTo(
        el,
        { opacity: 0.25 },
        {
          opacity: 1,
          duration: 1.6 + Math.random() * 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: Math.random() * 4,
        }
      );
      tweens.push(t);
    });
    return () => tweens.forEach((t) => t.kill());
  }, []);

  return (
    <div ref={rootRef} className="night-stars" aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className="night-star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
          }}
        />
      ))}
    </div>
  );
}

export function NightScene({ id, label }) {
  return (
    <SceneSection
      id={id}
      label={label}
      decorations={<StarField count={120} />}
    >
      <RevealText as="h2" className="scene__title" split="words" stagger={0.06} yFrom="100%">
        Catch me after dark.
      </RevealText>
      <RevealText as="p" className="scene__lede" split="words" stagger={0.014}>
        Want to collaborate, ask a question, or trade plant clippings? I'd
        love to hear from you.
      </RevealText>
      <div className="contact-links">
        <a className="contact-link" data-magnetic href="mailto:hi@bitwiseandrea.com">email</a>
        <a className="contact-link" data-magnetic href="https://github.com/bitwiseandrea" target="_blank" rel="noreferrer">github</a>
        <a className="contact-link" data-magnetic href="https://www.linkedin.com/" target="_blank" rel="noreferrer">linkedin</a>
        <a className="contact-link" data-magnetic href="https://www.roblox.com/" target="_blank" rel="noreferrer">roblox · soon</a>
      </div>
    </SceneSection>
  );
}
