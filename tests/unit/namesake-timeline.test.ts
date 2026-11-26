import { describe, expect, it } from 'vitest';
import {
  parseLifespan,
  yearToX,
  byLifespan,
  formatYear,
  AXIS_SEGMENTS,
  AXIS_BREAK,
  AXIS_WIDTH,
} from '@/lib/namesakeTimeline';
import { vessels } from '@/data/vessels';

/**
 * The timeline is drawn from these numbers. A parse that silently returns the
 * wrong year does not look like a bug on the page: it looks like a bar, and a
 * learner reads it as a fact about when someone lived.
 */
describe('reading the dates', () => {
  it('reads a plain year range', () => {
    expect(parseLifespan('1750–1848')).toEqual({
      start: 1750,
      end: 1848,
      precision: 'recorded',
      circa: false,
    });
  });

  it('reads a BCE year range downwards, so the larger number is earlier', () => {
    expect(parseLifespan('c. 630–570 BCE')).toEqual({
      start: -630,
      end: -570,
      precision: 'recorded',
      circa: true,
    });
  });

  it('expands a single BCE century to its hundred years', () => {
    // The 6th century BCE runs from 600 to 501 BCE.
    expect(parseLifespan('c. 6th century BCE')).toEqual({
      start: -600,
      end: -501,
      precision: 'century',
      circa: true,
    });
  });

  it('spans a range of BCE centuries end to end', () => {
    // 2nd through 1st century BCE: 200 BCE to 1 BCE.
    expect(parseLifespan('c. 2nd–1st century BCE')).toEqual({
      start: -200,
      end: -1,
      precision: 'century',
      circa: true,
    });
  });

  it('marks a recorded span as recorded and a century as a century', () => {
    expect(parseLifespan('1909–2012').precision).toBe('recorded');
    expect(parseLifespan('c. 4th century BCE').precision).toBe('century');
  });

  it('notices whether the source hedges', () => {
    expect(parseLifespan('1884–1964').circa).toBe(false);
    expect(parseLifespan('c. 630–570 BCE').circa).toBe(true);
  });

  it('refuses to guess at something it cannot read', () => {
    expect(() => parseLifespan('sometime in the past')).toThrow();
  });
});

describe('every namesake in the fleet can be placed', () => {
  const named = vessels.filter((v) => v.namesake !== null);

  it('there are namesakes to place', () => {
    expect(named.length).toBeGreaterThan(0);
  });

  for (const vessel of named) {
    const { fullName, lifespan } = vessel.namesake!;

    it(`${fullName}: parses, and starts no later than it ends`, () => {
      const span = parseLifespan(lifespan);
      expect(Number.isFinite(span.start)).toBe(true);
      expect(Number.isFinite(span.end)).toBe(true);
      expect(span.start).toBeLessThanOrEqual(span.end);
    });

    it(`${fullName}: lands inside a drawn segment, never in the break`, () => {
      const span = parseLifespan(lifespan);
      for (const year of [span.start, span.end]) {
        const inSegment = AXIS_SEGMENTS.some((s) => year >= s.fromYear && year <= s.toYear);
        expect(inSegment, `${fullName}: ${year} falls in the gap the axis cuts out`).toBe(true);
      }
    });

    it(`${fullName}: is drawn within the figure`, () => {
      const span = parseLifespan(lifespan);
      const x0 = yearToX(span.start);
      const x1 = yearToX(span.end);
      expect(x0).toBeGreaterThanOrEqual(0);
      expect(x1).toBeLessThanOrEqual(AXIS_WIDTH);
      expect(x1).toBeGreaterThanOrEqual(x0);
    });
  }
});

describe('the broken axis', () => {
  it('puts the start of each segment at its own left edge', () => {
    for (const segment of AXIS_SEGMENTS) {
      expect(yearToX(segment.fromYear)).toBeCloseTo(segment.x0, 6);
      expect(yearToX(segment.toYear)).toBeCloseTo(segment.x1, 6);
    }
  });

  it('runs the full width of the figure', () => {
    expect(AXIS_SEGMENTS[0].x0).toBe(0);
    expect(AXIS_SEGMENTS[AXIS_SEGMENTS.length - 1].x1).toBe(AXIS_WIDTH);
  });

  it('leaves exactly the break between the segments, with no overlap', () => {
    expect(AXIS_SEGMENTS[0].x1).toBe(AXIS_BREAK.x0);
    expect(AXIS_SEGMENTS[1].x0).toBe(AXIS_BREAK.x1);
    expect(AXIS_BREAK.x1).toBeGreaterThan(AXIS_BREAK.x0);
  });

  it('is monotonic: a later year is never drawn to the left of an earlier one', () => {
    let previous = -Infinity;
    for (let year = -800; year <= 2100; year += 7) {
      const x = yearToX(year);
      expect(x, `${year} went backwards`).toBeGreaterThanOrEqual(previous - 1e-9);
      previous = x;
    }
  });

  it('clamps years outside the drawn range rather than escaping the figure', () => {
    expect(yearToX(-5000)).toBe(0);
    expect(yearToX(5000)).toBe(AXIS_WIDTH);
  });

  it('gives the gap its own slice, so the cut is visible', () => {
    const x = yearToX(800);
    expect(x).toBeGreaterThanOrEqual(AXIS_BREAK.x0);
    expect(x).toBeLessThanOrEqual(AXIS_BREAK.x1);
  });
});

describe('chronological order', () => {
  it('puts the earliest namesake first, comparing years not strings', () => {
    const sorted = ['1750–1848', 'c. 6th century BCE', 'c. 630–570 BCE'].sort(byLifespan);
    expect(sorted).toEqual(['c. 630–570 BCE', 'c. 6th century BCE', '1750–1848']);
  });

  it('orders a bare BCE year correctly against a century, which the old regex did not', () => {
    // "c. 300 BCE" is later than the 6th century BCE. Comparing the leading
    // digits of the two strings, 300 against 6, reverses them.
    expect(byLifespan('c. 300 BCE', 'c. 6th century BCE')).toBeGreaterThan(0);
  });
});

describe('year labels', () => {
  it('spells out BCE and leaves CE years bare', () => {
    expect(formatYear(-600)).toBe('600 BCE');
    expect(formatYear(1900)).toBe('1900');
  });
});
