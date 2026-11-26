/**
 * How many pallets fit on the floor of a unit, and where they sit.
 *
 * The usual way to publish this is a number: "eleven europallets in a twenty
 * foot". That number is correct and completely opaque — a learner cannot check
 * it, and cannot see why a 40 foot holds roughly twice as many but a 45 foot
 * holds more than its extra length suggests.
 *
 * So this returns positions rather than a count, and the page draws them. The
 * figure then justifies itself: you can see the row that had to be turned
 * sideways, and the strip of floor left over at the end.
 *
 * The packing is deliberately simple and conservative:
 *
 *   - One layer. Stacking depends on the cargo, not on the box.
 *   - Rectangular bands across the width of the unit. Within a band every
 *     pallet has the same orientation; between bands the orientation can
 *     change, which is what gets a twenty foot past eight.
 *   - No overhang and no rotation off the axes.
 *
 * Real stowage can beat this, because a loader can mix orientations within a
 * band and shunt pallets into gaps. Under-promising is the right way round: a
 * learner who plans on this figure will fit their cargo.
 */

/** A pallet standard, in metres. */
export interface PalletKind {
  id: string;
  label: string;
  /** Long side, in metres. */
  length: number;
  /** Short side, in metres. */
  width: number;
}

/** The two standards that cover almost all European containerised cargo. */
export const PALLET_KINDS: PalletKind[] = [
  { id: 'euro', label: 'Euro pallet', length: 1.2, width: 0.8 },
  { id: 'iso', label: 'ISO pallet', length: 1.2, width: 1.0 },
];

export interface PlacedPallet {
  /** Distance from the door end, in metres. */
  x: number;
  /** Distance from the left wall, in metres. */
  y: number;
  /** Footprint as laid, in metres. */
  w: number;
  h: number;
}

export interface PalletPlan {
  pallets: PlacedPallet[];
  count: number;
  /** Floor area the pallets cover, as a share of the usable floor. */
  floorUsed: number;
  /** Unused length at the far end, in metres. */
  lengthLeftOver: number;
}

/**
 * Lay pallets into a floor of `length` by `width`, both in metres.
 *
 * Bands run across the width. For each band the two orientations are tried and
 * the one that carries more pallets per metre of length is taken; ties go to
 * the one that uses less length, which leaves more for the bands behind it.
 */
export function planPallets(length: number, width: number, pallet: PalletKind): PalletPlan {
  const pallets: PlacedPallet[] = [];
  let x = 0;

  // A guard rather than a condition: every band consumes length, so this cannot
  // spin, but a malformed unit should not be able to hang a build either.
  for (let band = 0; band < 200; band += 1) {
    const remaining = length - x;

    /** How a band performs in one orientation. */
    const option = (depth: number, across: number) => {
      if (depth > remaining + 1e-9) return null;
      const perBand = Math.floor((width + 1e-9) / across);
      if (perBand < 1) return null;
      return { depth, across, perBand, density: perBand / depth };
    };

    const candidates = [
      option(pallet.length, pallet.width), // long side along the unit
      option(pallet.width, pallet.length), // turned sideways
    ].filter((c): c is NonNullable<typeof c> => c !== null);

    if (candidates.length === 0) break;

    candidates.sort((a, b) => b.density - a.density || a.depth - b.depth);
    const best = candidates[0];

    for (let i = 0; i < best.perBand; i += 1) {
      pallets.push({ x, y: i * best.across, w: best.depth, h: best.across });
    }
    x += best.depth;
  }

  const floorArea = length * width;
  const used = pallets.reduce((sum, p) => sum + p.w * p.h, 0);

  return {
    pallets,
    count: pallets.length,
    floorUsed: floorArea > 0 ? used / floorArea : 0,
    lengthLeftOver: Math.max(0, length - x),
  };
}

/**
 * Which limit a shipment hits first in this unit, weight or volume.
 *
 * This is the question behind choosing a container, and the one learners most
 * often get the wrong way round. A unit full of dense cargo reaches its payload
 * with the box half empty; a unit full of light cargo fills up long before the
 * payload matters.
 *
 * The threshold is the density at which the two run out together.
 */
export function breakEvenDensity(
  maxPayloadKg: number | undefined,
  capacityM3: number | undefined,
): number | undefined {
  if (!maxPayloadKg || !capacityM3) return undefined;
  return maxPayloadKg / capacityM3;
}
