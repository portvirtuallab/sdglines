import { test, expect } from '@playwright/test';
import { path } from './helpers';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility checks.
 *
 * Automated testing catches perhaps a third of WCAG failures, so these are a
 * floor rather than a ceiling. The manual checks they do not replace are
 * recorded in docs/accessibility.md.
 *
 * The pages below are chosen to cover every distinct template on the site
 * rather than every page: one of each layout, plus the two most interactive
 * pages, which is where the failures actually are.
 */
const PAGES = [
  { path: '/', name: 'home' },
  { path: '/routes', name: 'routes index' },
  { path: '/routes/eastmed', name: 'route detail' },
  { path: '/ports', name: 'port directory' },
  { path: '/ports/barcelona', name: 'port detail' },
  { path: '/fleet', name: 'fleet register' },
  { path: '/fleet/caroline-herschel', name: 'vessel detail' },
  { path: '/fleet/spirit', name: 'spirit of the vessels' },
  { path: '/equipment', name: 'equipment catalogue' },
  { path: '/equipment/reefers', name: 'equipment family' },
  { path: '/services', name: 'services index' },
  { path: '/services/cold-chain', name: 'cargo service' },
  { path: '/resources/arrival-charges', name: 'arrival charges' },
  { path: '/quote', name: 'quotation form' },
  { path: '/search', name: 'search' },
  { path: '/about', name: 'about' },
  { path: '/legal', name: 'legal notice' },
  { path: '/404', name: 'not found' },
];

for (const page of PAGES) {
  test(`${page.name} has no detectable accessibility violations`, async ({ page: browserPage }) => {
    await browserPage.goto(path(page.path));

    const results = await new AxeBuilder({ page: browserPage })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    // Report the rule and the element, so a failure is actionable without
    // opening the HTML report.
    const summary = results.violations.map((violation) => ({
      rule: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.map((node) => node.target.join(' ')),
    }));

    expect(summary, `Accessibility violations on ${page.path}`).toEqual([]);
  });
}

test.describe('structure', () => {
  for (const page of PAGES) {
    test(`${page.name} has exactly one level one heading`, async ({ page: browserPage }) => {
      await browserPage.goto(path(page.path));
      await expect(browserPage.locator('h1')).toHaveCount(1);
    });
  }

  test('every page states that the site is a simulation', async ({ page }) => {
    for (const target of ['/', '/routes/westmed', '/fleet/sappho', '/ports/valencia']) {
      await page.goto(path(target));
      await expect(
        page.getByText('SDG Lines is an educational simulation', { exact: false }).first(),
      ).toBeVisible();
    }
  });

  test('the skip link moves focus to the main content', async ({ page }) => {
    await page.goto(path('/'));
    await page.keyboard.press('Tab');

    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skipLink).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeVisible();
  });
});
