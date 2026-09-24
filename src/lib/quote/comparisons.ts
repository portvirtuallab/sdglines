/**
 * The same shipment, priced differently.
 *
 * A total on its own teaches nothing. What a learner is actually deciding is
 * whether to use a reefer or a dry box, and whether to send ten units or
 * twenty, and those decisions only become legible when the alternatives sit
 * next to each other.
 *
 * Two comparisons, because two things move the price for reasons worth
 * understanding:
 *
 *   - **Equipment.** The freight factor runs from 0.80 for a 20' dry to 1.60
 *     for project cargo, and the handling tariff moves with it. Seeing the
 *     catalogue priced on your own lane is the tariff made concrete.
 *   - **Quantity.** Three charges are per shipment, so the price per unit falls
 *     as the order grows. That is the whole of the economy of scale here, and
 *     it is small - which is itself worth knowing.
 *
 * Everything is derived from `calculatePrice`, so a comparison can never
 * disagree with the quotation it sits beneath.
 */

import { calculatePrice, type PriceInput } from './pricing';
import { equipment, getEquipment } from './network';

export interface PriceVariant {
  equipmentId: number;
  label: string;
  quantity: number;
  totalEur: number;
  perUnitEur: number;
  /** `null` for a unit whose slot equivalent could not be derived. */
  perTeuEur: number | null;
  /** True for the variant the learner actually asked for. */
  isChosen: boolean;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

function variant(input: PriceInput, chosen: PriceInput): PriceVariant | null {
  const item = getEquipment(input.equipmentId);
  if (!item) return null;

  const quantity = Math.max(1, Math.trunc(input.quantity));
  const total = calculatePrice(input).totalEur;
  const teu = item.teuEquivalent;

  return {
    equipmentId: item.id,
    label: item.name,
    quantity,
    totalEur: total,
    perUnitEur: round2(total / quantity),
    perTeuEur: teu ? round2(total / quantity / teu) : null,
    isChosen: input.equipmentId === chosen.equipmentId && quantity === chosen.quantity,
  };
}

/**
 * The whole equipment catalogue on this lane, at the quantity asked for.
 *
 * Sorted by price per TEU, so that the comparison answers the question a
 * shipper actually asks - what is the cheapest way to move this volume - rather
 * than repeating the catalogue's own order.
 */
export function acrossEquipment(chosen: PriceInput): PriceVariant[] {
  return equipment
    .map((item) => variant({ ...chosen, equipmentId: item.id }, chosen))
    .filter((entry): entry is PriceVariant => entry !== null)
    .sort((a, b) => (a.perTeuEur ?? a.perUnitEur) - (b.perTeuEur ?? b.perUnitEur));
}

/**
 * The same equipment at a spread of order sizes, including the one asked for.
 *
 * The spread is fixed rather than relative so that the shape of the curve is
 * comparable between quotations, and the chosen quantity is always in it.
 */
export function acrossQuantities(
  chosen: PriceInput,
  spread: number[] = [1, 2, 5, 10, 20, 50],
): PriceVariant[] {
  const quantities = [...new Set([...spread, Math.max(1, Math.trunc(chosen.quantity))])].sort(
    (a, b) => a - b,
  );

  return quantities
    .map((quantity) => variant({ ...chosen, quantity }, chosen))
    .filter((entry): entry is PriceVariant => entry !== null);
}
