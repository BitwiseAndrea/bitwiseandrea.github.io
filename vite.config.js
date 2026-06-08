import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// https://vitejs.dev/config/
//
// Multi-page setup:
//   /                                      -> index.html                                       (the painterly home)
//   /projects/super-chess/                 -> projects/super-chess/index.html                  (short landing)
//   /projects/stickers-from-roblox/        -> projects/stickers-from-roblox/index.html         (long-form landing)
//   /projects/working-with-coding-agents/  -> projects/working-with-coding-agents/index.html   (short opinion piece)
//
// Every project landing — short, long-form, or opinion-piece — shares
// src/projects/main.jsx + ProjectLanding.jsx. ProjectLanding picks its
// renderer based on whether the project entry in data.js has
// `content: ContentBlock[]` (long-form) or `body: string[]` + `screenshots`
// (short).
//
// Adding a new project = "copy a projects/<slug>/ folder, add a data.js
// entry, add an input here".
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'projects-super-chess': resolve(__dirname, 'projects/super-chess/index.html'),
        'projects-stickers-from-roblox': resolve(__dirname, 'projects/stickers-from-roblox/index.html'),
        'projects-working-with-coding-agents': resolve(__dirname, 'projects/working-with-coding-agents/index.html'),
        'projects-privacy': resolve(__dirname, 'projects/privacy/index.html'),
        'projects-terms': resolve(__dirname, 'projects/terms/index.html'),
      },
    },
  },
});
