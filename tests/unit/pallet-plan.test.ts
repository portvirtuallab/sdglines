import { describe, expect, it } from 'vitest';
import { planPallets, breakEvenDensity, PALLET_KINDS } from '@/lib/palletPlan';
import { equipment } from '@/data/equipment';

/**
 * The pallet plan is drawn on the equipment pages, so a packing bug would not
 * look like a bug: it would look like a number, and a learner would plan a
 * shipment on it.
 */
const euro = PALLET_KINDS.find((p) => p.id === 'euro')!;
const iso = PALLET_KINDS.find((p) => p.id === 'iso')!;

/** The real internal floor of a 20 foot and a 40 foot dry container. */
const TWENTY = { length: 5.898, width: 2.352 };
const FORTY = { length: 12.032, width: 2.352 };

describe('pallets never overlap or hang out of the unit', () => {
  for (const unit of equipment) {
    const { internalLengthM: l, internalWidthM: w } = unit.dimensions;
    if (!l || !w) continue;

    for (const kind of PALLET_KINDS) {
      it(`${unit.name}, ${kind.label}: stays inside the floor`, () => {
        const plan = planPallets(l, w, kind);
        for (const p of plan.pallets) {
          expect(p.x).toBeGreaterThanOrEqual(-1e-9);
          expect(p.y).toBeGreaterThanOrEqual(-1e-9);
          expect(p.x + p.w).toBeLessThanOrEqual(l + 1e-9);
          expect(p.y + p.h).toBeLessThanOrEqual(w + 1e-9);
        }
      });

      it(`${unit.name}, ${kind.label}: no two pallets overlap`, () => {
        const plan = planPallets(l, w, kind);
        for (let i = 0; i < plan.pallets.length; i += 1) {
          for (let j = i + 1; j < plan.pallets.length; j += 1) {
            const a = plan.pallets[i];
            const b = plan.pallets[j];
            const apart =
              a.x + a.w <= b.x + 1e-9 ||
              b.x + b.w <= a.x + 1e-9 ||
              a.y + a.h <= b.y + 1e-9 ||
              b.y + b.h <= a.y + 1e-9;
            expect(apart, `${unit.name}: two pallets overlap`).toBe(true);
          }
        }
      });
    }
  }
});

describe('the counts are in the right territory', () => {
  /**
   * Industry quotes 11 europallets in a 20 foot and 25 in a 40 foot. Those
   * figures need orientations mixed within a row and the pallets pushed right
   * up to the walls. This packs in clean bands, so it lands below them — nine
   * and twenty — and the page says so rather than printing a number that
   * contradicts every stowage table a trainer has ever seen.
   *
   * The bound that matters is the upper one. A plan a learner cannot actually
   * load is worse than a conservative one.
   */
  it('a 20 foot takes 10 or 11 europallets, and never more', () => {
    const plan = planPallets(TWENTY.length, TWENTY.width, euro);
    expect(plan.count).toBeLessThanOrEqual(11);
    expect(plan.count).toBeGreaterThanOrEqual(9);
  });

  it('a 40 foot takes roughly twice a 20 foot, and never more than 25', () => {
    const twenty = planPallets(TWENTY.length, TWENTY.width, euro).count;
    const forty = planPallets(FORTY.length, FORTY.width, euro).count;
    expect(forty).toBeLessThanOrEqual(25);
    expect(forty).toBeGreaterThanOrEqual(twenty * 2 - 2);
  });

  it('fits fewer ISO pallets than europallets, because they are wider', () => {
    const e = planPallets(TWENTY.length, TWENTY.width, euro).count;
    const i = planPallets(TWENTY.length, TWENTY.width, iso).count;
    expect(i).toBeLessThanOrEqual(e);
  });

  it('never claims to use more floor than there is', () => {
    for (const unit of equipment) {
      const { internalLengthM: l, internalWidthM: w } = unit.dimensions;
      if (!l || !w) continue;
      const plan = planPallets(l, w, euro);
      expect(plan.floorUsed, `${unit.name} overfills its floor`).toBeLessThanOrEqual(1 + 1e-9);
    }
  });

  it('returns nothing for a floor smaller than one pallet', () => {
    expect(planPallets(0.5, 0.5, euro).count).toBe(0);
    expect(planPallets(0, 0, euro).count).toBe(0);
  });
});

describe('the weight-or-volume threshold', () => {
  it('is payload over capacity, in kilograms per cubic metre', () => {
    // A 20 foot: 28,200 kg over 33.2 m³ is a little under 850 kg/m³.
    expect(breakEvenDensity(28200, 33.2)).toBeCloseTo(849.4, 0);
  });

  it('is undefined when either figure is missing', () => {
    expect(breakEvenDensity(undefined, 33.2)).toBeUndefined();
    expect(breakEvenDensity(28200, undefined)).toBeUndefined();
  });
});
