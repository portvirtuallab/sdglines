import { test, expect } from '@playwright/test';
import { path } from './helpers';
import AxeBuilder from '@axe-core/playwright';

/**
 * The quotation tool, end to end.
 *
 * This is the one page on the site where a learner does something rather than
 * reads something, and the one place where a wrong answer is worse than a
 * missing one. So these tests check three separate things:
 *
 *   - that a complete quotation produces the price the workbook produces,
 *   - that an impossible shipment cannot be asked for in the first place,
 *   - and that the wizard is usable by keyboard and by screen reader at every
 *     step, not only on the page as first rendered.
 *
 * The Barcelona to Damietta figures below are the corrected price for the
 * shipment the spreadsheet records as `BOOKINGS!Studio` row 2. They are
 * hard-coded on purpose: if a pricing rule drifts, this fails with the number
 * that moved. `tests/unit/pricing.test.ts` holds the legacy figures the
 * spreadsheet itself produced, and proves the two differ only where intended.
 */

const QUOTE = path('/request-a-quote');

/** Fill in step one and move to the cargo step. */
async function chooseRoute(
  page: import('@playwright/test').Page,
  origin = 'barcelona',
  destination = 'damietta',
) {
  await page.getByLabel('Port of origin').selectOption(origin);
  await page.getByLabel('Port of destination').selectOption(destination);

  // Any date far enough ahead to stay valid whenever the suite runs.
  const departure = new Date();
  departure.setDate(departure.getDate() + 21);
  await page.getByLabel('Desired departure date').fill(departure.toISOString().slice(0, 10));
}

test.describe('producing a quotation', () => {
  test('prices Barcelona to Damietta exactly as the operational data does', async ({ page }) => {
    await page.goto(QUOTE);

    await chooseRoute(page);
    await expect(page.getByText('Direct service')).toBeVisible();
    await expect(page.getByText(/on Optimed, Aglahonike Of Thessaly/)).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByRole('radio', { name: 'No' }).check();
    await page.getByLabel('Type of service').selectOption('reefer');
    await page.getByLabel('Unit type').selectOption('3');
    await page.getByLabel('Number of units').fill('1');
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByRole('radio', { name: 'Yes, weigh and declare' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByLabel('Name').fill('Ada Pujol');
    await page.getByLabel('Email address').fill('ada@example.org');
    await page.getByLabel('Company or institution').fill('Escola Europea');
    await page.getByLabel('Country').fill('Spain');
    await page.getByLabel('Port Virtual Lab activity code').fill('1234');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByRole('heading', { name: /Review/ })).toBeVisible();
    await page.getByRole('button', { name: 'Produce the simulated quotation' }).click();

    await expect(page.getByRole('heading', { name: 'Simulated quotation produced' })).toBeVisible();
    await expect(page.getByText(/^SDGL-Q-[A-Z2-9]{6}$/)).toBeVisible();

    const charges = page.getByRole('table');
    // Sea freight is the 912.15 FEU rate for this lane scaled by 1.25, the
    // factor a 20' reefer carries. The spreadsheet computed that factor and
    // then charged the bare rate; this is the difference.
    await expect(charges).toContainText('€1,140.19');
    await expect(charges).toContainText('€304.00');
    await expect(charges).toContainText('€60.80');
    await expect(charges).toContainText('€58.39');
    await expect(charges).toContainText('€1,923.93');

    // Every line says whether it follows the container or the shipment.
    await expect(charges).toContainText('per unit');
    await expect(charges).toContainText('per shipment');
  });

  test('carries the origin through from a port page', async ({ page }) => {
    await page.goto(path('/ports/valencia'));
    await page.getByRole('link', { name: /Quote from/ }).click();
    await expect(page.getByLabel('Port of origin')).toHaveValue('valencia');
  });
});

test.describe('refusing what the network cannot do', () => {
  test('offers only destinations the network can reach', async ({ page }) => {
    await page.goto(QUOTE);

    const destination = page.getByLabel('Port of destination');
    await expect(destination).toBeDisabled();

    await page.getByLabel('Port of origin').selectOption('barcelona');
    await expect(destination).toBeEnabled();

    const fromBarcelona = await destination.locator('option').allTextContents();
    expect(fromBarcelona.length).toBeGreaterThan(1);
    // A port is never offered as a destination from itself.
    expect(fromBarcelona.some((option) => option.startsWith('Barcelona'))).toBe(false);

    // Changing the origin rebuilds the list rather than leaving a stale one.
    await page.getByLabel('Port of origin').selectOption('mumbai');
    await expect(destination).toHaveValue('');
    const fromMumbai = await destination.locator('option').allTextContents();
    expect(fromMumbai.some((option) => option.startsWith('Mumbai'))).toBe(false);
    expect(fromMumbai.some((option) => option.startsWith('Barcelona'))).toBe(true);
  });

  test('reports every problem at once, and says what each one is', async ({ page }) => {
    await page.goto(QUOTE);
    await page.getByRole('button', { name: 'Continue' }).click();

    const summary = page.getByRole('alert');
    await expect(summary).toBeVisible();
    await expect(summary).toContainText('3 things to fix');
    await expect(summary).toContainText('Choose the port the shipment starts from.');
    await expect(summary).toContainText('Choose the date you would like to sail on.');
  });

  test('only offers origins it can actually price', async ({ page }) => {
    await page.goto(QUOTE);

    // Every port in the select must survive the whole flow. Palma is the one
    // that used to fail this: the workbook gives it no freight rate, so it was
    // withheld until the product owner supplied one.
    const origins = await page
      .getByLabel('Port of origin')
      .locator('option')
      .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value).filter(Boolean));

    expect(origins.length).toBeGreaterThan(30);
    expect(origins).toContain('palma');

    for (const origin of origins) {
      await page.getByLabel('Port of origin').selectOption(origin);
      await expect(page.getByLabel('Port of destination')).toBeEnabled();
      const destinations = await page
        .getByLabel('Port of destination')
        .locator('option')
        .count();
      expect(destinations, `${origin} has no reachable destination`).toBeGreaterThan(1);
    }
  });

  test('rejects an activity code that is not four digits', async ({ page }) => {
    await page.goto(QUOTE);
    await chooseRoute(page);
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByRole('radio', { name: 'No' }).check();
    await page.getByLabel('Type of service').selectOption('container');
    await page.getByLabel('Unit type').selectOption('1');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('radio', { name: /^No/ }).check();
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByLabel('Name').fill('Ada Pujol');
    await page.getByLabel('Email address').fill('not-an-address');
    await page.getByLabel('Company or institution').fill('Escola Europea');
    await page.getByLabel('Country').fill('Spain');
    await page.getByLabel('Port Virtual Lab activity code').fill('12');
    await page.getByRole('button', { name: 'Continue' }).click();

    const summary = page.getByRole('alert');
    await expect(summary).toContainText('does not look like an email address');
    await expect(summary).toContainText('four digits');
    await expect(summary).toContainText('Confirm you have read');
  });
});

test.describe('moving through the wizard', () => {
  test('keeps every answer when you go back', async ({ page }) => {
    await page.goto(QUOTE);
    await chooseRoute(page);
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByRole('radio', { name: 'No' }).check();
    await page.getByRole('button', { name: 'Back', exact: true }).click();

    await expect(page.getByLabel('Port of origin')).toHaveValue('barcelona');
    await expect(page.getByLabel('Port of destination')).toHaveValue('damietta');
  });

  test('sends focus to the error summary when a step fails', async ({ page }) => {
    await page.goto(QUOTE);
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('alert')).toBeFocused();
  });

  test('marks the current step for assistive technology', async ({ page }) => {
    await page.goto(QUOTE);
    await expect(page.locator('[aria-current="step"]')).toContainText('Route');
  });
});

test.describe('accessibility', () => {
  /**
   * The page-level sweep in `accessibility.spec.ts` only ever sees step one.
   * The later steps introduce a conditional fieldset, a table and a summary
   * that it never reaches, so they are checked here where they are on screen.
   */
  test('every step passes an automated audit', async ({ page }) => {
    await page.goto(QUOTE);

    const audit = async (label: string) => {
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        results.violations.map((violation) => `${label}: ${violation.id} - ${violation.help}`),
      ).toEqual([]);
    };

    await audit('step 1');

    await chooseRoute(page);
    await page.getByRole('button', { name: 'Continue' }).click();

    // With the dangerous goods panel open, which is the densest state.
    await page.getByRole('radio', { name: 'Yes' }).check();
    await audit('step 2 with dangerous goods');

    await page.getByLabel('UN number').fill('1203');
    await page.getByLabel('IMO class').selectOption({ index: 3 });
    await page.getByLabel('Proper shipping name').fill('Petrol');
    await page.getByLabel('Type of service').selectOption('container');
    await page.getByLabel('Unit type').selectOption('1');
    await page.getByRole('button', { name: 'Continue' }).click();
    await audit('step 3');

    await page.getByRole('radio', { name: /^No/ }).check();
    await page.getByRole('button', { name: 'Continue' }).click();
    await audit('step 4');

    await page.getByLabel('Name').fill('Ada Pujol');
    await page.getByLabel('Email address').fill('ada@example.org');
    await page.getByLabel('Company or institution').fill('Escola Europea');
    await page.getByLabel('Country').fill('Spain');
    await page.getByLabel('Port Virtual Lab activity code').fill('1234');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Continue' }).click();
    await audit('step 5');

    await page.getByRole('button', { name: 'Produce the simulated quotation' }).click();
    await expect(page.getByRole('heading', { name: 'Simulated quotation produced' })).toBeVisible();
    await audit('step 6');
  });

  test('the error summary is announced, not merely shown', async ({ page }) => {
    await page.goto(QUOTE);
    await page.getByRole('button', { name: 'Continue' }).click();

    const summary = page.getByRole('alert');
    await expect(summary).toHaveAttribute('tabindex', '-1');
    await expect(summary.getByRole('link').first()).toBeVisible();
  });
});
