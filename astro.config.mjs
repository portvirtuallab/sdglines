// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * Deployment targets
 * ------------------
 * The site is built as a fully static bundle so that it can be served by GitHub
 * Pages without a server runtime.
 *
 * Two deployment targets are supported and selected with environment variables,
 * so that moving to the custom domain later is a configuration change only and
 * never a code change:
 *
 *   1. GitHub Pages project site (the preview environment, used first):
 *        SITE_URL=https://portvirtuallab.github.io
 *        BASE_PATH=/sdglines
 *
 *   2. Custom domain (production, only after explicit approval):
 *        SITE_URL=https://www.sdglines.com
 *        BASE_PATH=/
 *
 * See docs/deployment.md and docs/custom-domain.md for the migration procedure.
 */
const SITE_URL = process.env.SITE_URL ?? 'https://portvirtuallab.github.io';
const BASE_PATH = process.env.BASE_PATH ?? '/sdglines';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'ignore',
  output: 'static',
  build: {
    // Emit `about/index.html` rather than `about.html` so that directory-style
    // URLs resolve correctly when GitHub Pages serves the files.
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    // GitHub Pages serves pre-built files only, so every image transformation
    // has to happen at build time.
    responsiveStyles: true,
  },
});
