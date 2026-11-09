import { test, expect } from '@playwright/test';
import { path } from './helpers';
import { SITE } from '../../src/lib/site';

/**
 * The hand-off to the Quotation Desk.
 *
 * This file used to drive the quotation wizard through every step and check
 * the price it produced. The wizard is no longer on the page: quotations are
 * produced by the Quotation Desk, a separate application that can read live
 * tariffs, issue a number and file a PDF, none of which a static bundle can
 * do. The old tests are in the history, and if the wizard is ever restored
 * they should come back with it.
 *
 * What is worth testing now is smaller but not trivial. A hand-off that points
 * at the wrong place, or that a keyboard cannot reach, fails silently: the
 * page still looks right, and the learner simply cannot be quoted. Ten places
 * across the site send people here, so this is the one link whose breaking
 * matters most.
 *
 * The pricing rules themselves are covered by the unit suite, which does not
 * need a browser.
 */

const QUOTE = path('/request-a-quote');

test.describe('handing over to the Quotation Desk', () => {
  test('sends the learner to the Desk, at the address the site configures', async ({ page }) => {
    await page.goto(QUOTE);

    const link = page.getByRole('link', { name: /open the quotation desk/i });
    await expect(link).toBeVisible();

    /* Against SITE rather than a literal, so moving the Desk is one edit and
       this test follows it. What it still catches is the link losing its
       target, or pointing at a page of this site by mistake. */
    await expect(link).toHaveAttribute('href', SITE.quotationDeskUrl);
    expect(SITE.quotationDeskUrl).toMatch(/^https:\/\//);
  });

  test('can be reached and followed by keyboard alone', async ({ page }) => {
    await page.goto(QUOTE);

    const link = page.getByRole('link', { name: /open the quotation desk/i });
    await link.focus();
    await expect(link).toBeFocused();

    /* A focus ring that is only a colour change fails for anyone who cannot
       see it, so check the element is genuinely focusable rather than styled
       to look it. */
    const tag = await link.evaluate((el) => el.tagName.toLowerCase());
    expect(tag).toBe('a');
  });

  test('still says what the quotation is built from', async ({ page }) => {
    await page.goto(QUOTE);

    /* The page kept this when it lost the wizard, and that was the point of
       keeping the page at all rather than redirecting. If these disappear, the
       page has become a redirect with extra steps and should just be one. */
    await expect(
      page.getByRole('heading', { name: /what the quotation is built from/i }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: /before you start/i })).toBeVisible();
  });

  test('no longer asks for a PIN that was withdrawn', async ({ page }) => {
    await page.goto(QUOTE);

    /* PINs were taken out of the quotation flow and this page went on asking
       for one for weeks, because nothing checked. Now something does. */
    const body = (await page.locator('main').innerText()).toLowerCase();
    expect(body).not.toContain('pin your trainer');
    expect(body).not.toContain('four-digit');
  });
});
