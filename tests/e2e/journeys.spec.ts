import { test, expect } from '@playwright/test';
import { path } from './helpers';

/**
 * The critical user journeys.
 *
 * These are the tasks the site exists to support, taken from the project
 * objectives: find a route, find a port, view a vessel, check arrival charges
 * and complete a simulated quotation. If one of these breaks, the site has
 * failed at its job regardless of what else still works.
 */

test.describe('finding a route', () => {
  test('reaches a rotation from the home page', async ({ page }) => {
    await page.goto(path('/'));

    await page.getByRole('link', { name: 'Explore the routes' }).click();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Routes and services' }),
    ).toBeVisible();

    await page.getByRole('link', { name: 'Open Eastmed' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Eastmed' })).toBeVisible();

    // The rotation must be readable as a table, not only drawn on the chart.
    const rotation = page.getByRole('table', { name: /Eastmed rotation/i });
    await expect(rotation).toBeVisible();
    await expect(rotation.getByRole('link', { name: 'Port of Beirut' })).toBeVisible();
  });

  test('says when a transit time is not published rather than inventing one', async ({ page }) => {
    await page.goto(path('/routes/eastmed'));
    await expect(page.getByText('To be confirmed').first()).toBeVisible();
  });
});

test.describe('finding a port', () => {
  test('filters the directory and reaches a port page', async ({ page }) => {
    await page.goto(path('/ports'));

    const status = page.getByRole('status');
    await expect(status).toContainText('Showing all 36 ports');

    await page.getByLabel('Search by port or country').fill('tunisia');
    await expect(status).toContainText('Showing 1 of 36 ports');

    await page.getByRole('link', { name: /Port of Rad/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Rad');
    await expect(page.getByText('Tunisia').first()).toBeVisible();
  });

  test('shows a useful empty state when nothing matches', async ({ page }) => {
    await page.goto(path('/ports'));
    await page.getByLabel('Search by port or country').fill('shanghai');

    await expect(page.getByText('No ports match those filters')).toBeVisible();

    await page.getByRole('button', { name: 'Clear all filters' }).click();
    await expect(page.getByRole('status')).toContainText('Showing all 36 ports');
  });

  test('works without JavaScript', async ({ browser }) => {
    // The directory is rendered on the server, so disabling scripts should
    // leave every port reachable even though the filters stop working.
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    await page.goto(path('/ports'));
    await expect(page.getByRole('link', { name: 'Port of Barcelona' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Port of Busan' })).toBeVisible();

    await context.close();
  });
});

test.describe('viewing a vessel', () => {
  test('shows the register and a vessel page', async ({ page }) => {
    await page.goto(path('/fleet'));

    const register = page.getByRole('table', { name: /fleet register/i });
    await expect(register).toBeVisible();

    await page.goto(path('/fleet/rosa-sensat'));
    await expect(page.getByRole('heading', { level: 1, name: 'Rosa Sensat' })).toBeVisible();

    // Rosa Sensat is the pilot vessel and has no service. The page has to say
    // so rather than showing an empty deployment section.
    await expect(page.getByText('is recorded as a pilot vessel')).toBeVisible();
  });

  test('declines to invent technical particulars', async ({ page }) => {
    await page.goto(path('/fleet/sappho'));
    await expect(page.getByText('No technical particulars have been published')).toBeVisible();
  });
});

test.describe('checking arrival charges', () => {
  test('explains the charges and filters them by cargo type', async ({ page }) => {
    await page.goto(path('/resources/arrival-charges'));

    await expect(page.getByRole('heading', { level: 1, name: 'Arrival charges' })).toBeVisible();
    await expect(page.getByText('THC', { exact: true })).toBeVisible();

    await page.getByLabel('Cargo type').selectOption('reefer');
    await expect(page.getByRole('status')).toContainText('charges for this cargo type');
    await expect(page.getByText('Reefer monitoring and plug-in')).toBeVisible();
  });
});

// The quotation tool has a suite of its own: see tests/e2e/quote.spec.ts.

test.describe('search', () => {
  test('finds a port, a vessel and a charge code', async ({ page }) => {
    await page.goto(path('/search'));

    await page.getByLabel('What are you looking for?').fill('beirut');
    await expect(page.getByRole('link', { name: /Port of Beirut/ })).toBeVisible();

    await page.getByLabel('What are you looking for?').fill('hodgkin');
    await expect(page.getByRole('link', { name: /Dorothy Hodgkin/ })).toBeVisible();

    await page.getByLabel('What are you looking for?').fill('THC');
    await expect(page.getByRole('link', { name: /Terminal handling charge/ })).toBeVisible();
  });

  test('ignores accents, so Durres finds the port', async ({ page }) => {
    await page.goto(path('/search'));
    await page.getByLabel('What are you looking for?').fill('durres');
    await expect(page.getByRole('link', { name: /Durr/ })).toBeVisible();
  });

  test('offers a way out when nothing matches', async ({ page }) => {
    await page.goto(path('/search'));
    await page.getByLabel('What are you looking for?').fill('zzzzzzz');
    await expect(page.getByText('Nothing matched that')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Browse the ports' })).toBeVisible();
  });
});

test.describe('navigation', () => {
  test('opens a section menu from the keyboard and closes it with Escape', async ({ page }) => {
    await page.goto(path('/'));

    const routesTrigger = page.getByRole('button', { name: 'Routes' });
    // Skipped on the mobile project, where the menu is a different control.
    if (!(await routesTrigger.isVisible())) test.skip();

    await routesTrigger.click();
    await expect(routesTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('link', { name: 'Westmed', exact: false }).first()).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(routesTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('sends an unknown address to a useful 404 page', async ({ page }) => {
    const response = await page.goto(path('/this-page-does-not-exist'));
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('not on the chart');
  });
});
