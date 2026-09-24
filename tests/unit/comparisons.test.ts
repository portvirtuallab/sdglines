/**
 * The comparisons shown beneath a quotation.
 *
 * They exist to make a decision legible, so the thing to guard is that they
 * stay honest: they must agree with the quotation they sit beneath, and they
 * must show the economy of scale that actually exists rather than a flattering
 * one.
 */

import { describe, expect, it } from 'vitest';
import { acrossEquipment, acrossQuantities } from '@/lib/quote/comparisons';
import { calculatePrice } from '@/lib/quote/pricing';
import { equipment } from '@/data/quote/equipment';
import type { PortClass } from '@/types/quote';

/** Barcelona, class C, 20' reefer, 1 898 NM: the lane used throughout the docs. */
const CHOSEN = {
  portClass: 'C' as PortClass,
  equipmentId: 3,
  quantity: 3,
  distanceNm: 1898,
  vgmSolas: true,
};

describe('comparison by quantity', () => {
  const variants = acrossQuantities(CHOSEN);

  it('always includes the quantity the learner asked for', () => {
    expect(variants.some((variant) => variant.quantity === CHOSEN.quantity)).toBe(true);
    expect(variants.filter((variant) => variant.isChosen)).toHaveLength(1);
  });

  it('is ordered by order size', () => {
    for (let i = 1; i < variants.length; i++) {
      expect(variants[i].quantity).toBeGreaterThan(variants[i - 1].quantity);
    }
  });

  it('agrees with the quotation it sits beneath', () => {
    const chosen = variants.find((variant) => variant.isChosen)!;
    expect(chosen.totalEur).toBe(calculatePrice(CHOSEN).totalEur);
    expect(chosen.perUnitEur).toBeCloseTo(chosen.totalEur / CHOSEN.quantity, 2);
  });

  it('shows a per-unit price that falls as the order grows, and never rises', () => {
    for (let i = 1; i < variants.length; i++) {
      expect(variants[i].perUnitEur).toBeLessThan(variants[i - 1].perUnitEur);
    }
  });

  it('shows the economy of scale as the small thing it is', () => {
    // Only three charges are per shipment, so going from one unit to fifty
    // takes barely a tenth off the unit price. A learner should be able to read
    // that off the table rather than assume bulk is dramatically cheaper.
    const one = variants.find((variant) => variant.quantity === 1)!;
    const fifty = variants.find((variant) => variant.quantity === 50)!;
    const saving = 1 - fifty.perUnitEur / one.perUnitEur;
    expect(saving).toBeGreaterThan(0);
    expect(saving).toBeLessThan(0.15);
  });
});

describe('comparison by equipment', () => {
  const variants = acrossEquipment(CHOSEN);

  it('covers the whole catalogue', () => {
    expect(variants).toHaveLength(equipment.length);
  });

  it('marks the unit type the learner chose', () => {
    const chosen = variants.filter((variant) => variant.isChosen);
    expect(chosen).toHaveLength(1);
    expect(chosen[0].equipmentId).toBe(CHOSEN.equipmentId);
  });

  it('is ordered cheapest per TEU first', () => {
    for (let i = 1; i < variants.length; i++) {
      const previous = variants[i - 1].perTeuEur ?? variants[i - 1].perUnitEur;
      const current = variants[i].perTeuEur ?? variants[i].perUnitEur;
      expect(current).toBeGreaterThanOrEqual(previous);
    }
  });

  it('keeps every variant at the quantity asked for', () => {
    for (const variant of variants) expect(variant.quantity).toBe(CHOSEN.quantity);
  });

  it('prices a reefer above the dry container it is otherwise identical to', () => {
    const dry = variants.find((variant) => variant.equipmentId === 1)!;
    const reefer = variants.find((variant) => variant.equipmentId === 3)!;
    // Both are 20 feet and one TEU. The difference is the freight factor, the
    // handling tariff and the plug.
    expect(reefer.perTeuEur!).toBeGreaterThan(dry.perTeuEur!);
  });

  it('agrees with pricing each variant directly', () => {
    for (const variant of variants) {
      const direct = calculatePrice({ ...CHOSEN, equipmentId: variant.equipmentId });
      expect(variant.totalEur, variant.label).toBe(direct.totalEur);
    }
  });
});
