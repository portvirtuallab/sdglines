// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { legacyRedirects } from './redirects.mjs';

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

/** Prefix a site-relative path with the deployment base path. */
function withBase(path) {
  const base = BASE_PATH.endsWith('/') ? BASE_PATH.slice(0, -1) : BASE_PATH;
  return `${base}${path}`;
}

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'ignore',
  output: 'static',
  // Every address the legacy site published maps to its new home. GitHub Pages
  // cannot issue an HTTP 301, so these build to meta refresh pages; see
  // redirects.mjs for what that costs and why it is still worth doing.
  //
  // Astro applies the base path to the SOURCE of a redirect but not to its
  // DESTINATION, so the destinations are prefixed here. Without this, every
  // legacy address on the GitHub Pages preview would redirect to a path outside
  // the project site and 404.
  redirects: Object.fromEntries(
    Object.entries(legacyRedirects).map(([from, to]) => [from, withBase(to)]),
  ),
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
