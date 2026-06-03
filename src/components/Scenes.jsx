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
import { PROJECTS } from '../projects/data.js';

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
// No foreground flora here — dawn is intentionally bare, just sky, sun,
// mountains. Cacti sprout later (desert), then lush garden trees (garden).
// Both are handled by ForegroundFloraLayer, which keeps them rooted to the
// viewport bottom as you scroll through the rest of the page.

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
// Daylight — About / Experience
// =============================================================================
// Resume-style vertical list. Each company is a card; companies with multiple
// roles (Roblox) nest the roles inside a single card so the progression reads
// as a single timeline rather than three separate jobs.

const EXPERIENCE = [
  {
    company: 'Roblox',
    location: 'San Mateo, CA',
    period: '2018 — Present',
    roles: [
      {
        title: 'Engineering Manager',
        team: 'Design Systems & Accessibility · Luau UI Ecosystem',
        period: 'Sept 2024 — Present',
        body:
          'Lead the team behind Foundation — Roblox\u2019s cross-product design system spanning App, In-Experience UI, and Studio, along with its critical tooling. Defined the vision, roadmap, and quality bar; shipped 40+ components with ~20% combined adoption across the company. Conceived and orchestrated 5+ major accessibility features with full app-wide support, acting as the strategic product lead across every frontend-facing team at Roblox.',
      },
      {
        title: 'Senior Software Engineer & Tech Lead',
        team: 'Creator · Social · Design Systems & Accessibility',
        period: 'July 2021 — Sept 2024',
        body:
          'Architected 5+ foundational user journeys as the inaugural feature developer on create.roblox.com — now serving millions of creators per day. Returned to Social to lead full-stack initiatives for Groups, then became the founding member of Design Systems & Accessibility, conducting the audit and overhaul of the legacy component library that led to the new system and additional staffing.',
      },
      {
        title: 'Software Engineer',
        team: 'Social · Avatar',
        period: 'July 2018 — July 2021',
        body:
          'Joined as one of fewer than 10 frontend-leaning full-stack engineers at a 300-person company. Lead frontend engineer for 10+ consumer-facing surfaces on roblox.com; self-directed UI design and prototyping for several core pages to accelerate the product lifecycle. Built primarily in AngularJS while touching every part of the stack — including C# services and iOS/Android native code — to ensure 100% feature parity.',
      },
    ],
  },
  {
    company: 'Apple',
    location: 'Cupertino, CA',
    period: 'July 2016 — March 2018',
    roles: [
      {
        title: 'Software Engineer',
        team: 'Accessibility',
        period: 'July 2016 — March 2018',
        body:
          'Contributed to Apple\u2019s award-winning accessibility features — including VoiceOver, System Zoom, and platform-wide app accessibility — and designed innovative new solutions to deliver the best possible experience to users with disabilities.',
      },
    ],
  },
  {
    company: 'Google',
    location: 'Mountain View, CA',
    period: 'May 2015 — Aug 2015',
    roles: [
      {
        title: 'Software Engineering Intern',
        team: 'Accessibility',
        period: 'May 2015 — Aug 2015',
        body:
          'Implemented analytics into the Accessibility Checker Android application, modified existing checks to fit a new UI element representation, contributed additional checks to the testing framework, and wrote Robolectric tests.',
      },
    ],
  },
  {
    company: 'Google',
    location: 'Mountain View, CA',
    period: 'TODO — earlier internship',
    roles: [
      {
        title: 'Software Engineering Intern',
        team: 'TODO — team',
        period: 'TODO',
        body:
          'TODO — fill in the second Google internship: team, project, and a sentence on impact.',
      },
    ],
  },
];

function ExperienceCard({ entry, idx }) {
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
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'power3.out',
        delay: idx * 0.10,
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
    <article ref={ref} className="experience">
      <header className="experience__head">
        <h3 className="experience__company">{entry.company}</h3>
        <div className="experience__meta">
          <span>{entry.location}</span>
          <span aria-hidden="true">·</span>
          <span>{entry.period}</span>
        </div>
      </header>
      <ul className="experience__roles">
        {entry.roles.map((role) => (
          <li key={role.title + role.period} className="role">
            <div className="role__head">
              <span className="role__title">{role.title}</span>
              <span className="role__period">{role.period}</span>
            </div>
            {role.team ? <div className="role__team">{role.team}</div> : null}
            <p className="role__body">{role.body}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function DaylightScene({ id, label }) {
  return (
    <SceneSection id={id} label={label}>
      <RevealText as="h2" className="scene__title" split="words" stagger={0.06} yFrom="100%">
        Designing the daylight hours.
      </RevealText>
      <RevealText as="p" className="scene__lede" split="words" stagger={0.014}>
        I'm an engineering manager at Roblox, leading the team behind
        Foundation — our cross-product design system and the accessibility
        platform underneath it. Over a decade in, I'm still quietly obsessed
        with craft, accessibility, and the small details that make an
        interface feel like a place.
      </RevealText>

      <div className="experience-list">
        {EXPERIENCE.map((entry, idx) => (
          <ExperienceCard key={entry.company + entry.period} entry={entry} idx={idx} />
        ))}
      </div>
    </SceneSection>
  );
}

// =============================================================================
// Desert — Tooling
// =============================================================================
// Sandy, sun-baked landscape between Daylight and Garden. Hosts the "tools"
// gallery — things I build *for* projects rather than the projects themselves.
// Cacti grown from ForegroundFloraLayer's CACTUS group sprout in here and
// wither away into the Garden scene.
//
// PLACEHOLDER copy: the two tool entries below are intentionally lightweight
// (kicker / title / body — no full landing pages). Andrea can rewrite them in
// place when each tool has a story worth telling. The "Tiny CLIs & UI bits"
// entry that previously lived in Garden moved here because it's tooling, not
// a project.

const TOOLS = [
  {
    kicker: 'Roblox · plugins',
    title: 'Studio plugins',
    body:
      'A small fleet of Roblox Studio plugins I build to make my own day-to-day faster — token sync, layout audits, FACS pose authoring. Tools for me first; everyone else welcome.',
  },
  {
    kicker: 'Web · embed',
    title: 'Form embedder',
    body:
      'A no-fuss way to drop a styled form into any static site without standing up a backend. Validates client-side, POSTs through a tiny Worker, and inherits the host page\u2019s typography.',
  },
  {
    kicker: 'Tools · ongoing',
    title: 'Tiny CLIs & UI bits',
    body:
      'A growing collection of small developer tools — design tokens, a markdown linter, a colour-palette generator that thinks in moods.',
  },
];

export function DesertScene({ id, label }) {
  return (
    <SceneSection id={id} label={label}>
      <RevealText as="h2" className="scene__title" split="words" stagger={0.06} yFrom="100%">
        Tools for desolate places.
      </RevealText>
      <RevealText as="p" className="scene__lede" split="words" stagger={0.014}>
        Not every patch of land grows a project. Some of it grows *tooling* —
        the small, sharp things I build to make the next project easier. A
        cactus garden of utilities, plugins, and embedders.
      </RevealText>

      <div className="cards">
        {TOOLS.map((t, idx) => (
          <ProjectCard key={t.title} project={t} idx={idx} />
        ))}
      </div>
    </SceneSection>
  );
}

// =============================================================================
// Garden — Projects
// =============================================================================
// Lush garden trees growing up from the ground are handled by
// ForegroundFloraLayer.
//
// Project content is sourced from src/projects/data.js so the home cards and
// the standalone /projects/<slug>/ pages stay in sync. Cards with an `href`
// link to their landing page; otherwise they're rendered as inert articles.

const GARDEN_PLACEHOLDERS = [
  {
    kicker: 'Roblox · soon',
    title: 'A world worth wandering',
    body:
      'An ambient social space exploring what makes a virtual place feel inhabited — light, sound, and the slow rhythms of weather.',
  },
];

const GARDEN_PROJECTS = [
  ...PROJECTS.map((p) => ({
    kicker: p.kicker,
    title: p.title,
    body: p.tagline,
    href: p.href,
  })),
  ...GARDEN_PLACEHOLDERS,
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
        {GARDEN_PROJECTS.map((p, idx) => (
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

  const inner = (
    <>
      <div className="card__kicker">{project.kicker}</div>
      {project.title ? <h3 className="card__title">{project.title}</h3> : null}
      <p className="card__body">{project.body}</p>
      {project.href ? (
        <span className="card__more" aria-hidden="true">read more →</span>
      ) : null}
    </>
  );

  if (project.href) {
    return (
      <a ref={ref} className="card card--link" href={project.href} data-magnetic>
        {inner}
      </a>
    );
  }
  return (
    <article ref={ref} className="card" data-magnetic>
      {inner}
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
  { kicker: 'Languages',     body: 'TypeScript · JavaScript · Lua · Luau · C# · HTML · CSS' },
  { kicker: 'Frontend',      body: 'React · AngularJS · SCSS · GSAP · canvas / WebGL' },
  { kicker: 'Design systems', body: 'component libraries · design tokens · cross-product UI · adoption at scale' },
  { kicker: 'Accessibility', body: 'WCAG · keyboard nav · screen readers · platform-level a11y features' },
  { kicker: 'Roblox',        body: 'Luau · Roblox Studio · ProfileService · UI frameworks · experience design' },
  { kicker: 'Leadership',    body: 'team building · roadmap & vision · technical strategy · cross-functional partnership' },
  { kicker: 'Tools',         body: 'Cursor · Git · VS Code · Figma · Jira · Docker · GitHub Actions' },
  { kicker: 'Spoken',        body: 'English · Spanish · ASL' },
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

    // Reset mount flag on every effect run. In React 18 StrictMode the
    // first effect's cleanup sets `mounted = false` before the second
    // effect runs — without this re-initialization the loop would
    // silently bail out forever in dev.
    stateRef.current.mounted = true;
    stateRef.current.visible = false;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Visibility is tracked with an IntersectionObserver instead of a
    // GSAP ScrollTrigger. ScrollTrigger caches the section's measured
    // pixel position when the trigger is created, and was missing
    // re-measurement when sibling sections (DesertScene, the longer
    // resume in DaylightScene, etc.) reflowed the page after first
    // paint — leaving `visible` stuck at `false` and silently
    // swallowing every lightning tick. IntersectionObserver always
    // reflects the live viewport, so adding/removing scenes can never
    // strand it.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const wasVisible = stateRef.current.visible;
          stateRef.current.visible = entry.isIntersecting;
          // First-strike: when the storm crosses INTO view, kick off
          // a bolt almost immediately so the user doesn't have to
          // wait out the random interval before the first flash.
          if (!wasVisible && entry.isIntersecting && !reduce) {
            window.setTimeout(() => {
              if (stateRef.current.visible && stateRef.current.mounted) {
                stateRef.current.fire?.();
              }
            }, 220);
          }
        }
      },
      // Activate as soon as any of the section is showing; fire even
      // a little before the section is fully in view so the storm
      // mood is announced as you approach.
      { threshold: 0, rootMargin: '0px 0px -10% 0px' }
    );
    io.observe(section);

    if (reduce) {
      return () => io.disconnect();
    }

    const fire = () => {
      if (!stateRef.current.visible || !stateRef.current.mounted) return;

      // Bolts live in an SVG that fills the storm scene (which can be
      // taller than the viewport). Spawn coordinates need to be in
      // the section's local space, but the bolt should *visually*
      // appear in the upper portion of the viewport — so we offset
      // by the section's current viewport top. As the user scrolls
      // through the scene, bolts keep flashing where they're
      // actually visible instead of stranding off-screen above.
      const rect = section.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const offsetY = -rect.top;

      // Each "strike" is 1-3 forks within ~80px of each other, so it
      // reads as a real lightning bolt rather than a single hairline.
      const forks = 1 + Math.floor(Math.random() * 3);
      const baseStartX = 60 + Math.random() * (vw - 120);
      const baseStartY = offsetY + 20 + Math.random() * 80;
      const baseEndY = offsetY + vh * (0.55 + Math.random() * 0.30);

      for (let i = 0; i < forks; i++) {
        const startX = baseStartX + (Math.random() - 0.5) * 90;
        const startY = baseStartY + (Math.random() - 0.5) * 30;
        const endY = baseEndY + (Math.random() - 0.5) * 80;
        const endX = startX + (Math.random() - 0.5) * 220;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', makeBoltPath(startX, startY, endX, endY));
        path.setAttribute('stroke', '#f8fbff');
        path.setAttribute('stroke-width', i === 0 ? '3.4' : '2.0');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.style.filter =
          'drop-shadow(0 0 22px rgba(220, 230, 255, 1)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.9))';
        boltLayer.appendChild(path);

        gsap.fromTo(
          path,
          { opacity: 0 },
          {
            keyframes: [
              { opacity: 1,    duration: 0.04 },
              { opacity: 0.6,  duration: 0.06 },
              { opacity: 1,    duration: 0.05 },
              { opacity: 0.85, duration: 0.20 },
              { opacity: 0,    duration: 0.55 },
            ],
            delay: i * 0.04,
            onComplete: () => path.remove(),
          }
        );
      }

      gsap.fromTo(
        flash,
        { backgroundColor: 'rgba(255, 255, 255, 0)' },
        {
          keyframes: [
            { backgroundColor: 'rgba(245, 247, 255, 0.85)', duration: 0.05 },
            { backgroundColor: 'rgba(255, 255, 255, 0)',    duration: 0.18 },
            { backgroundColor: 'rgba(220, 230, 255, 0.45)', duration: 0.05 },
            { backgroundColor: 'rgba(255, 255, 255, 0)',    duration: 0.45 },
          ],
        }
      );
    };

    let cancelled = false;
    stateRef.current.fire = fire;
    const loop = () => {
      if (cancelled) return;
      fire();
      // Tighter cadence so the user reliably sees at least one bolt
      // while scrolling through the storm; still randomized for a
      // natural feel.
      const next = 1500 + Math.random() * 3000;
      setTimeout(loop, next);
    };
    const start = setTimeout(loop, 900);

    return () => {
      cancelled = true;
      stateRef.current.mounted = false;
      clearTimeout(start);
      io.disconnect();
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
          The forecast.
        </RevealText>
        <RevealText as="p" className="scene__lede" split="words" stagger={0.014}>
          Over a decade of frontend, design systems, and accessibility —
          comfortable old friends I've shipped at scale, and the shiny new
          toys I'm playing with after hours.
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
        <a className="contact-link" data-magnetic href="mailto:bitwiseandrea@gmail.com">email</a>
        <a className="contact-link" data-magnetic href="https://github.com/bitwiseandrea" target="_blank" rel="noreferrer">github</a>
        <a className="contact-link" data-magnetic href="https://www.linkedin.com/in/bitwiseandrea/" target="_blank" rel="noreferrer">linkedin</a>
        <a className="contact-link" data-magnetic href="https://www.instagram.com/bitwiseandrea/" target="_blank" rel="noreferrer">instagram</a>
        <a className="contact-link" data-magnetic href="https://www.roblox.com/users/671440392/profile" target="_blank" rel="noreferrer">roblox</a>
      </div>
      <p className="moon-hint">psst — the moon is listening.</p>
    </SceneSection>
  );
}
