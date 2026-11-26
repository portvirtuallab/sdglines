/**
 * Placing the fleet's namesakes on a time axis.
 *
 * The spirit page has always claimed that the fleet, read in order, is a
 * timeline. It then rendered that timeline as fourteen identical cards, which
 * is a list. This module is what lets the page keep its promise.
 *
 * Two problems have to be solved honestly before anything can be drawn.
 *
 * The first is that the dates are not all the same kind of fact. 1910-1994 is
 * a record. "c. 4th century BCE" is a scholarly placement with a century of
 * slack in it, and drawing it as a crisp bar would assert a precision the
 * sources do not have. So a parsed span carries how it was expressed, and the
 * drawing is expected to show the difference.
 *
 * The second is the gap. Four of the namesakes lived before the common era and
 * nine were born between 1873 and 1932; the nearest thing to a bridge is
 * Caroline Herschel in 1750. On a single linear axis the modern ten collapse
 * into a smear at the right-hand edge. So the axis is broken, with the break
 * drawn and declared rather than hidden, and the two segments run at different
 * scales.
 *
 * What the gap is NOT is a claim about history. Hypatia, Trotula of Salerno,
 * Hildegard of Bingen and Emilie du Chatelet all lived inside it. The gap is a
 * property of a list of fourteen names chosen by the operator, and the page
 * says so in those words.
 */

/** A namesake's dates, resolved to numbers. BCE years are negative. */
export interface LifeSpan {
  /** First year of the span. Negative for BCE. */
  start: number;
  /** Last year of the span. Negative for BCE. */
  end: number;
  /**
   * How the source expressed it.
   *
   * `recorded` is a year or a pair of years. `century` is a placement within
   * one or more centuries, and is an order of magnitude looser.
   */
  precision: 'recorded' | 'century';
  /** True when the source itself hedges, with "c." or "circa". */
  circa: boolean;
}

const ORDINALS: Record<string, number> = {
  '1st': 1,
  '2nd': 2,
  '3rd': 3,
  '4th': 4,
  '5th': 5,
  '6th': 6,
  '7th': 7,
  '8th': 8,
  '9th': 9,
};

/** First and last year of the nth century, BCE or CE. */
function centuryBounds(n: number, bce: boolean): { start: number; end: number } {
  if (bce) return { start: -(n * 100), end: -(n * 100 - 99) };
  return { start: (n - 1) * 100 + 1, end: n * 100 };
}

/**
 * Read a lifespan string from the vessel data into numbers.
 *
 * Handles the four shapes the data actually uses, and throws on anything else
 * rather than guessing. A namesake whose dates silently parsed to zero would
 * sit on the axis at the start of the common era and nobody would notice.
 */
export function parseLifespan(lifespan: string): LifeSpan {
  const text = lifespan.replace(/[–—]/g, '-').trim();
  const circa = /\bc\.|\bcirca\b/i.test(text);
  const bce = /\bBCE?\b/i.test(text);

  /* "2nd-1st century BCE". */
  const centuryRange = text.match(/(\d(?:st|nd|rd|th))\s*-\s*(\d(?:st|nd|rd|th))\s+centur/i);
  if (centuryRange) {
    const first = ORDINALS[centuryRange[1].toLowerCase()];
    const second = ORDINALS[centuryRange[2].toLowerCase()];
    if (first === undefined || second === undefined) {
      throw new Error(`Unparseable century range: ${lifespan}`);
    }
    const a = centuryBounds(first, bce);
    const b = centuryBounds(second, bce);
    return {
      start: Math.min(a.start, b.start),
      end: Math.max(a.end, b.end),
      precision: 'century',
      circa,
    };
  }

  /* "6th century BCE". */
  const singleCentury = text.match(/(\d(?:st|nd|rd|th))\s+centur/i);
  if (singleCentury) {
    const n = ORDINALS[singleCentury[1].toLowerCase()];
    if (n === undefined) throw new Error(`Unparseable century: ${lifespan}`);
    const bounds = centuryBounds(n, bce);
    return { ...bounds, precision: 'century', circa };
  }

  /* "1750-1848" and "c. 630-570 BCE". A BCE range counts downwards, so the
     larger number is the earlier year. */
  const yearRange = text.match(/(\d{1,4})\s*-\s*(\d{1,4})/);
  if (yearRange) {
    const a = Number(yearRange[1]);
    const b = Number(yearRange[2]);
    const [start, end] = bce ? [-a, -b] : [a, b];
    return { start: Math.min(start, end), end: Math.max(start, end), precision: 'recorded', circa };
  }

  const singleYear = text.match(/(\d{1,4})/);
  if (singleYear) {
    const y = Number(singleYear[1]) * (bce ? -1 : 1);
    return { start: y, end: y, precision: 'recorded', circa };
  }

  throw new Error(`Unparseable lifespan: ${lifespan}`);
}

/* -------------------------------------------------------------------------
   The broken axis.
   ---------------------------------------------------------------------- */

/** One continuous stretch of the axis, and the slice of the drawing it owns. */
export interface AxisSegment {
  id: 'ancient' | 'modern';
  label: string;
  fromYear: number;
  toYear: number;
  /** Left and right edge in viewBox units. */
  x0: number;
  x1: number;
}

/** Width of the drawing in viewBox units. Every track shares it. */
export const AXIS_WIDTH = 1000;

/**
 * The two stretches of time the fleet occupies, and the gap between them.
 *
 * The segments are deliberately not to a common scale: a year of antiquity is
 * narrower than a year of the twentieth century, because the alternative is
 * ten namesakes stacked on one pixel. The page states this under the figure.
 */
export const AXIS_SEGMENTS: AxisSegment[] = [
  { id: 'ancient', label: 'Antiquity', fromYear: -700, toYear: 0, x0: 0, x1: 288 },
  { id: 'modern', label: 'Modern era', fromYear: 1740, toYear: 2040, x0: 352, x1: AXIS_WIDTH },
];

/** The slice between the segments, where the axis is cut. */
export const AXIS_BREAK = { x0: 288, x1: 352 };

/**
 * Place a year on the axis.
 *
 * A year inside a segment maps linearly within it. A year in the gap maps into
 * the break, which no namesake uses but which keeps the function total.
 */
export function yearToX(year: number): number {
  for (const segment of AXIS_SEGMENTS) {
    if (year >= segment.fromYear && year <= segment.toYear) {
      const t = (year - segment.fromYear) / (segment.toYear - segment.fromYear);
      return segment.x0 + t * (segment.x1 - segment.x0);
    }
  }
  if (year < AXIS_SEGMENTS[0].fromYear) return AXIS_SEGMENTS[0].x0;
  if (year > AXIS_SEGMENTS[AXIS_SEGMENTS.length - 1].toYear) return AXIS_WIDTH;

  const [a, b] = AXIS_SEGMENTS;
  const t = (year - a.toYear) / (b.fromYear - a.toYear);
  return AXIS_BREAK.x0 + t * (AXIS_BREAK.x1 - AXIS_BREAK.x0);
}

/** Tick years to label under each segment. */
export function axisTicks(segment: AxisSegment): number[] {
  if (segment.id === 'ancient') return [-600, -400, -200];
  return [1800, 1900, 2000];
}

/**
 * Chronological order, earliest first.
 *
 * Sorts on the parsed start year, so a century placement and a recorded year
 * are compared as years rather than as the strings they came from. The regex
 * this replaces compared the 6 of "6th century BCE" against the 630 of
 * "c. 630-570 BCE" and happened to come out right; it would not have stayed
 * right for a namesake dated "c. 300 BCE".
 */
export function byLifespan(a: string, b: string): number {
  const first = parseLifespan(a);
  const second = parseLifespan(b);
  return first.start - second.start || first.end - second.end;
}
