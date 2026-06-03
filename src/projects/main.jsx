// projects/main.jsx
// -----------------------------------------------------------------------------
// Single shared entry point for every /projects/<slug>/ page. The HTML for
// each project sets <body data-project-slug="..."> and this script looks up
// the matching entry in data.js and renders the ProjectLanding template.
//
// This keeps adding a new project to ~3 things: an entry in data.js, a copy
// of projects/<slug>/index.html with the new slug, and an input added to
// vite.config.js.

import React from 'react';
import ReactDOM from 'react-dom/client';

import '../styles/projects.scss';

import ProjectLanding from './ProjectLanding.jsx';
import { getProject } from './data.js';

const slug = document.body.dataset.projectSlug;
const project = slug ? getProject(slug) : null;
const root = document.getElementById('root');

if (!root) {
  console.error('[projects] missing #root element');
} else if (!project) {
  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;
                color:#fff;background:#04050f;font-family:serif;text-align:center;padding:24px;">
      <div>
        <h1 style="font-weight:400;font-size:48px;margin:0 0 12px;">project not found</h1>
        <p style="opacity:.7;margin:0 0 24px;">slug: <code>${slug ?? '(none)'}</code></p>
        <a href="/" style="color:#ffefc4;">← back to bitwiseandrea</a>
      </div>
    </div>
  `;
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ProjectLanding project={project} />
    </React.StrictMode>
  );
}
