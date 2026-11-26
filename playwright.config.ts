import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration.
 *
 * The suite runs against the PRODUCTION build served by `astro preview`, not
 * against the dev server. That matters: the dev server serves unbundled modules
 * and does not apply the base path the way the built site does, so a test
 * passing against it would not prove the deployed site works.
 *
 * The base path is empty, matching the custom domain the site is served from.
 * It is kept as a constant rather than inlined so that the suite follows the
 * deployment if it ever moves back under a path.
 */
const PORT = 4322;
const BASE_PATH = '';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  // Two everywhere, not just in CI. The axe sweeps run a full rule set inside
  // the page and are CPU bound; left to Playwright's default worker count they
  // starve each other on a busy machine and time out, and a different page
  // fails on each run. A suite that cries wolf locally stops being read.
  workers: 2,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  timeout: 30_000,

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      // A phone in a classroom is the device this site has to work on, so it is
      // a first class target rather than an afterthought.
      use: { ...devices['Pixel 7'] },
    },
  ],

  webServer: {
    command: `npm run build:pages && npx astro preview --port ${PORT}`,
    url: `http://localhost:${PORT}${BASE_PATH}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      SITE_URL: 'https://sdglines.com',
      BASE_PATH,
    },
  },
});
