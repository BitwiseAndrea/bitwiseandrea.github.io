// ProjectLanding.jsx
// -----------------------------------------------------------------------------
// Reusable project landing-page template. Renders a painterly single-screen
// page that matches the bitwiseandrea.com aesthetic but doesn't run the heavy
// scroll choreography of the home page.
//
// Supports two project shapes:
//
//   1. Short landing (e.g. Super Chess) — uses `tagline`, `highlights`,
//      `body: string[]` (plain paragraphs), `stack`, `screenshots`.
//
//   2. Long-form write-up (e.g. Stickers from Roblox) — uses `tagline`,
//      `highlights`, `stack`, AND `content: ContentBlock[]` for the body.
//      When `content` is present, the typed-block renderer takes over; the
//      old paragraph + screenshot-grid pair is skipped.
//
// A single project entry can be either; the template picks based on which
// fields are present. This keeps short overviews short while letting longer
// stories run as long as they need to without a second template.
//
// Slots (the unified surface):
//   project = {
//     slug, kicker, title, tagline,
//     palette,                // 'dusk' | 'noon' | 'garden' | 'night'
//     demoUrl, demoLabel?,    // demoLabel overrides the default 'Open the demo' CTA text
//     githubUrl,
//     stack:        [string],
//     highlights:   [{ label, value }],
//     // --- short shape ---
//     body?:        [paragraph],
//     screenshots?: [{ src, alt, caption? }],
//     // --- long-form shape ---
//     content?:     [ContentBlock],
//   }
//
// ContentBlock types:
//   { type: 'paragraph', text }                  // supports inline markdown
//   { type: 'heading',   level: 2|3, text }
//   { type: 'quote',     text, attribution? }
//   { type: 'callout',   variant: 'aside'|'tip'|'aside-stark', title?, body }
//   { type: 'image',     src, alt, caption? }
//   { type: 'gallery',   columns, shots: [{ src, alt, caption? }] }
//   { type: 'code',      language?, code }
//   { type: 'list',      ordered?: false, items: [string] }
//   { type: 'table',     caption?, columns: [{ key, label }], rows: [{ [key]: text }] }
//   { type: 'details',   summary, body: [ContentBlock] }   // collapsible <details> element
//   { type: 'rule' }
//
// Inline markdown supported inside `text`/`caption`/list items:
//   **bold**   *italic*   `code`   [label](url)

import React, { useEffect, useState } from 'react';
import PaintedSky from './components/PaintedSky.jsx';
import SilhouetteMountains from './components/SilhouetteMountains.jsx';
import GentleFireflies from './components/GentleFireflies.jsx';

// -----------------------------------------------------------------------------
// Shiki highlighter (lazy, singleton, narrow bundle)
// -----------------------------------------------------------------------------
// Imports go through `shiki/core` + explicit `@shikijs/langs/*` + `@shikijs/themes/*`
// so the bundler ships ONLY the grammars and themes we actually use. Using
// `shiki` directly statically pulls in every supported language (~3MB).
//
// Engine: the pure-JS regex engine (no WASM). Smaller bundle, fast enough for
// blog-post-sized snippets. The Oniguruma engine is only worth it for complex
// grammars where JS regex differs from RE2 (we don't have those here).
//
// Theme: vitesse-dark — warm dusk palette that plays well with the painterly
// site aesthetic. Background is provided by .post__code; only the per-token
// colors come from shiki.
//
// Languages: add to LANG_LOADERS below when a new post needs a new language.

const SHIKI_THEME_NAME = 'vitesse-dark';

// Add to this map when a new post needs a new language. Each entry is its own
// chunk — only loaded on demand. Keep this list narrow so we don't preload
// grammars no post is using.
const LANG_LOADERS = {
  luau: () => import('@shikijs/langs/luau').then((m) => m.default),
  typescript: () => import('@shikijs/langs/typescript').then((m) => m.default),
  bash: () => import('@shikijs/langs/bash').then((m) => m.default),
};

let highlighterPromise = null;
function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = (async () => {
      const [{ createHighlighterCore }, { createJavaScriptRegexEngine }, vitesseDark] =
        await Promise.all([
          import('shiki/core'),
          import('@shikijs/engine-javascript'),
          import('@shikijs/themes/vitesse-dark').then((m) => m.default),
        ]);
      const langs = await Promise.all(Object.values(LANG_LOADERS).map((load) => load()));
      return createHighlighterCore({
        themes: [vitesseDark],
        langs,
        engine: createJavaScriptRegexEngine(),
      });
    })();
  }
  return highlighterPromise;
}

function CodeBlock({ language, code }) {
  const [innerHtml, setInnerHtml] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getHighlighter()
      .then((highlighter) => {
        if (cancelled) return;
        const loaded = highlighter.getLoadedLanguages();
        const lang = loaded.includes(language) ? language : 'text';
        const html = highlighter.codeToHtml(code, {
          lang,
          theme: SHIKI_THEME_NAME,
        });
        // Shiki returns <pre class="shiki ..." style="background-color:..."><code>…</code></pre>.
        // We only want the tokenized <code> contents — our own .post__code <pre>
        // already supplies the painterly chrome.
        const match = html.match(/<code[^>]*>([\s\S]*?)<\/code>/);
        if (match) setInnerHtml(match[1]);
      })
      .catch(() => {
        /* fall back to plain text below */
      });
    return () => {
      cancelled = true;
    };
  }, [language, code]);

  return (
    <pre
      className={`post__code language-${language || 'text'}`}
      data-highlighted={innerHtml ? 'true' : 'false'}
    >
      {innerHtml ? (
        <code dangerouslySetInnerHTML={{ __html: innerHtml }} />
      ) : (
        <code>{code}</code>
      )}
    </pre>
  );
}

export default function ProjectLanding({ project }) {
  useEffect(() => {
    document.title = `${project.title} · bitwiseandrea`;
  }, [project.title]);

  const isLongForm = Array.isArray(project.content) && project.content.length > 0;

  return (
    <div className={`project project--${project.palette || 'dusk'}`}>
      <PaintedSky palette={project.palette || 'dusk'} />
      <SilhouetteMountains />
      <GentleFireflies />

      <header className="project__top">
        <a className="project__back" href="/" data-magnetic>
          <span className="project__back-arrow" aria-hidden="true">←</span>
          bitwiseandrea
        </a>
        <span className="project__crumb">projects / {project.slug}</span>
      </header>

      <main className="project__main">
        <section className="project__hero">
          <span className="project__kicker">{project.kicker}</span>
          <h1 className="project__title">{project.title}</h1>
          <p className="project__tagline">{project.tagline}</p>

          <div className="project__ctas">
            {project.demoUrl ? (
              <a
                className="project__cta project__cta--primary"
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                data-magnetic
              >
                {project.demoLabel ?? 'Open the demo'}
                <span aria-hidden="true">→</span>
              </a>
            ) : null}
            {project.githubUrl ? (
              <a
                className="project__cta project__cta--ghost"
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                data-magnetic
              >
                View on GitHub
              </a>
            ) : null}
          </div>
        </section>

        {project.highlights?.length ? (
          <section className="project__highlights" aria-label="Project highlights">
            {project.highlights.map((h) => (
              <div key={h.label} className="project__highlight">
                <span className="project__highlight-label">{h.label}</span>
                <span className="project__highlight-value">{h.value}</span>
              </div>
            ))}
          </section>
        ) : null}

        {project.stack?.length ? (
          <section className="project__stack" aria-label="Tech stack">
            <span className="project__stack-label">Built with</span>
            <ul className="project__stack-list">
              {project.stack.map((s) => (
                <li key={s} className="project__stack-chip">{s}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {isLongForm ? (
          <article className="project__longform">
            {project.content.map((block, i) => (
              <ContentBlock key={i} block={block} />
            ))}
          </article>
        ) : (
          <>
            {project.body?.length ? (
              <section className="project__body" aria-label="About this project">
                {project.body.map((paragraph, i) => (
                  <p key={i} className="project__paragraph">{paragraph}</p>
                ))}
              </section>
            ) : null}

            <section className="project__shots" aria-label="Screenshots">
              {project.screenshots?.length ? (
                <div className="project__shot-grid">
                  {project.screenshots.map((shot, i) => (
                    <figure key={shot.src || i} className="project__shot">
                      <img src={shot.src} alt={shot.alt} loading="lazy" />
                      {shot.caption ? (
                        <figcaption>{shot.caption}</figcaption>
                      ) : null}
                    </figure>
                  ))}
                </div>
              ) : (
                <ScreenshotPlaceholder demoUrl={project.demoUrl} />
              )}
            </section>
          </>
        )}
      </main>

      <footer className="project__footer">
        <span>© {new Date().getFullYear()} Andrea Fletcher</span>
        <span className="project__footer-sep" aria-hidden="true">·</span>
        <a href="/" data-magnetic>back to the garden</a>
      </footer>
    </div>
  );
}

function ScreenshotPlaceholder({ demoUrl }) {
  return (
    <div className="project__shot-placeholder">
      <div className="project__shot-placeholder-frame">
        <div className="project__shot-placeholder-grid" aria-hidden="true" />
        <span className="project__shot-placeholder-label">screenshots coming soon</span>
        {demoUrl ? (
          <a
            className="project__shot-placeholder-cta"
            href={demoUrl}
            target="_blank"
            rel="noreferrer"
            data-magnetic
          >
            try it live →
          </a>
        ) : null}
      </div>
    </div>
  );
}

// =============================================================================
// Long-form content blocks
// =============================================================================

// Stable, deterministic anchor slug for heading text. Strips markdown chrome
// (**bold**, `code`, etc), normalizes accents, drops punctuation, collapses
// whitespace into single hyphens. Used as the `id` on rendered <h2>/<h3> so
// other blocks (and external links) can `#`-jump straight to a section.
function slugifyHeading(text) {
  return String(text)
    .replace(/[`*_~]/g, '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function ContentBlock({ block }) {
  switch (block.type) {
    case 'heading': {
      const level = block.level === 3 ? 3 : 2;
      const className = level === 2 ? 'post__h2' : 'post__h3';
      const id = slugifyHeading(block.text);
      return level === 2
        ? <h2 id={id} className={className}><InlineMarkdown text={block.text} /></h2>
        : <h3 id={id} className={className}><InlineMarkdown text={block.text} /></h3>;
    }
    case 'paragraph':
      return <p className="post__p"><InlineMarkdown text={block.text} /></p>;
    case 'quote':
      return (
        <blockquote className="post__quote">
          <InlineMarkdown text={block.text} />
          {block.attribution ? (
            <cite className="post__quote-attr">— {block.attribution}</cite>
          ) : null}
        </blockquote>
      );
    case 'callout':
      return (
        <aside className={`post__callout post__callout--${block.variant || 'aside'}`}>
          {block.title ? <h4 className="post__callout-title">{block.title}</h4> : null}
          {block.body.map((para, i) => (
            <p key={i} className="post__callout-body"><InlineMarkdown text={para} /></p>
          ))}
        </aside>
      );
    case 'image':
      return (
        <figure className="post__figure">
          <img src={block.src} alt={block.alt} loading="lazy" />
          {block.caption ? (
            <figcaption><InlineMarkdown text={block.caption} /></figcaption>
          ) : null}
        </figure>
      );
    case 'gallery': {
      const cols = Math.max(1, Math.min(6, block.columns || 3));
      return (
        <div className="post__gallery" style={{ '--post-gallery-cols': cols }}>
          {block.shots.map((shot, i) => (
            <figure key={shot.src || i} className="post__gallery-shot">
              <img src={shot.src} alt={shot.alt} loading="lazy" />
              {shot.caption ? (
                <figcaption><InlineMarkdown text={shot.caption} /></figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      );
    }
    case 'code':
      return <CodeBlock language={block.language} code={block.code} />;
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <Tag className="post__list">
          {block.items.map((item, i) => (
            <li key={i}><InlineMarkdown text={item} /></li>
          ))}
        </Tag>
      );
    }
    case 'table': {
      return (
        <div className="post__table-wrap">
          <table className="post__table">
            {block.caption ? (
              <caption className="post__table-caption">
                <InlineMarkdown text={block.caption} />
              </caption>
            ) : null}
            <thead>
              <tr>
                {block.columns.map((col) => (
                  <th key={col.key} scope="col" className="post__table-th">
                    <InlineMarkdown text={col.label} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {block.columns.map((col, j) => {
                    const cell = row[col.key] ?? '';
                    return (
                      <td
                        key={col.key}
                        className={`post__table-td${j === 0 ? ' post__table-td--head' : ''}`}
                      >
                        <InlineMarkdown text={cell} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'details':
      return (
        <details className="post__details">
          <summary className="post__details-summary">
            <InlineMarkdown text={block.summary} />
          </summary>
          <div className="post__details-body">
            {(block.body ?? []).map((child, i) => (
              <ContentBlock key={i} block={child} />
            ))}
          </div>
        </details>
      );
    case 'rule':
      return <hr className="post__rule" aria-hidden="true" />;
    default:
      return null;
  }
}

// -----------------------------------------------------------------------------
// InlineMarkdown — tiny renderer for **bold**, *italic*, `code`, [label](url)
// in a single tokenizer pass. No nested formatting, no regex backreferences.
// -----------------------------------------------------------------------------

const INLINE_PATTERN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function InlineMarkdown({ text }) {
  if (!text) return null;
  const parts = text.split(INLINE_PATTERN);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="post__inline-code">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('[') && part.includes('](')) {
      const closeBracket = part.indexOf(']');
      const label = part.slice(1, closeBracket);
      const url = part.slice(closeBracket + 2, -1);
      const external = /^https?:/i.test(url);
      return (
        <a
          key={i}
          href={url}
          className="post__inline-link"
          target={external ? '_blank' : undefined}
          rel={external ? 'noreferrer' : undefined}
          data-magnetic
        >
          {label}
        </a>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
