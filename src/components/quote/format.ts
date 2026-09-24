/**
 * How the quotation tool writes numbers and dates.
 *
 * One place, because a price shown as `1695.89` in one panel and `€1,695.89` in
 * another reads as two different figures.
 */

export const money = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
});

export const number = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });

/** `15 October 2026`, from an ISO date. */
export const longDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
