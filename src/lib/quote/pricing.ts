/**
 * The SDG Lines quotation price.
 *
 * Every rule was recovered from the supplied workbooks and checked against the
 * 202 worked quotations they carry. `docs/quote/pricing-model.md` records where
 * each one came from.
 *
 * Two sets of rules live here, and the difference between them matters:
 *
 *   `corrected`  what the site charges. The four arithmetic faults in the live
 *                spreadsheet are fixed, so a booking of twenty containers costs
 *                twenty containers.
 *
 *   `legacy`     the live spreadsheet's own arithmetic, faults included. It is
 *                not used by the site. It exists so that
 *                `tests/unit/pricing.test.ts` can keep replaying the 202
 *                historical quotations and proving that the reverse-engineering
 *                was right - which is the only evidence that the shared parts,
 *                the tariff tables and the freight curve, were read correctly.
 *
 * Delete `legacy` and that evidence goes with it.
 */

import { tariffs } from '@/data/quote/tariffs';
import { directDistanceNm, getEquipment, getPort } from './network';
import type {
  PortClass,
  Quotation,
  QuotationCharge,
  QuotationRequest,
  QuoteVerificationStatus,
} from '@/types/quote';
import { vesselEmissionsFactor, type Journey } from './routing';

/** Bunker recovery steps up by 7 % for every class the origin sits below A. */
const BRAF_CLASS_STEP = 1.07;
const CLASS_ORDER: PortClass[] = ['A', 'B', 'C', 'D'];

/**
 * Price of a tonne of CO2 equivalent under the emissions trading surcharge, in
 * euros. The value sits unlabelled in `BOOKINGS!Tariffs` and reproduces all 202
 * worked quotations exactly.
 */
const ETS_EUR_PER_TONNE = 73.5899;

/**
 * A flat 20 EUR the workbook adds to the emissions surcharge of 180 of its 202
 * worked quotations and omits from the other 22. Nothing in the data separates
 * the two groups.
 *
 * Read as an emissions charge it makes no sense. Read as what carriers actually
 * bill alongside one - the administrative cost of monitoring, reporting and
 * surrendering allowances, which is per booking rather than per tonne - it does,
 * and that is how it is now labelled. Setting it to 0 is the whole of the change
 * if the operator decides otherwise.
 */
const ETS_ADMINISTRATION_EUR = 20;

/**
 * The share of a voyage's emissions the EU scheme covers.
 *
 * A voyage between two ports inside the scheme is covered in full; one with a
 * single end inside is covered at half. The phase-in that applied on
 * introduction - 40 % of the covered share in 2024, 70 % in 2025 - has run its
 * course, so the covered share is charged in full.
 *
 * The workbook does not make this distinction: it has an `ETSSTATUS` column
 * reading `EUM` for every port and never uses it. Applying the scheme's own
 * scope is both more accurate and the more useful thing for a learner to meet.
 */
export const ETS_SCOPE = { full: 1, half: 0.5 } as const;
export type EtsScope = keyof typeof ETS_SCOPE;

/** A quotation is valid for 30 days, as the current process publishes it. */
const VALIDITY_DAYS = 30;

const round2 = (value: number) => Math.round(value * 100) / 100;

export type PricingRules = 'corrected' | 'legacy';

export class QuotationError extends Error {
  constructor(
    message: string,
    readonly reason:
      | 'unknown-port'
      | 'not-quotable'
      | 'no-distance'
      | 'no-route'
      | 'unknown-equipment',
  ) {
    super(message);
    this.name = 'QuotationError';
  }
}

/* -------------------------------------------------------------------------- */
/* The freight curve                                                          */
/* -------------------------------------------------------------------------- */

/**
 * The largest error worth telling a learner about, in euros.
 *
 * Below this the interpolation is closer than the rounding on the page, and
 * warning about it on 93 % of quotations would teach people to ignore the
 * warning, which is worse than not showing one.
 */
const FREIGHT_ERROR_THRESHOLD_EUR = 1;

export interface FreightBase {
  eur: number;
  /** `verified` at a published anchor, `needs-review` when interpolated. */
  status: QuoteVerificationStatus;
  /**
   * An upper bound on how far the interpolation can be from the lost formula,
   * from the curvature of the neighbouring anchors. Zero at an anchor.
   */
  maxErrorEur: number;
}

/**
 * Estimate the second derivative of the freight curve around an interval.
 *
 * Linear interpolation on an interval of width h is wrong by at most
 * |f''| h² / 8, so bounding the curvature bounds the error. The curvature is
 * taken as the largest of the divided second differences available around the
 * interval, which errs towards overstating it.
 */
function curvatureAround(anchors: typeof tariffs.freightAnchors, index: number): number {
  let worst = 0;
  for (const i of [index - 1, index, index + 1]) {
    const a = anchors[i - 1];
    const b = anchors[i];
    const c = anchors[i + 1];
    if (!a || !b || !c) continue;
    const left = (b.baseEur - a.baseEur) / (b.distanceNm - a.distanceNm);
    const right = (c.baseEur - b.baseEur) / (c.distanceNm - b.distanceNm);
    worst = Math.max(worst, Math.abs((2 * (right - left)) / (c.distanceNm - a.distanceNm)));
  }
  return worst;
}

/**
 * Interpolate the sea freight base for a FEU.
 *
 * The base is a pure function of the direct distance, but the function itself
 * was lost with the spreadsheet formulas. What survived is 36 exact points
 * spanning 163 to 10 000 nautical miles, recovered from the worked quotations.
 *
 * Only 6.8 % of the network's 1 332 lanes land on one of those points, so
 * almost every quotation is interpolated and the honest question is not whether
 * but by how much. Dropping an anchor entirely and rebuilding it from its
 * neighbours misses by 2 cents at the median, so the curve between anchors is
 * very nearly straight. Each result therefore carries a bound on its own error,
 * and the page only says anything when that bound is worth saying.
 */
export function seaFreightBaseFeu(distanceNm: number): FreightBase {
  const anchors = tariffs.freightAnchors;
  const first = anchors[0];
  const last = anchors[anchors.length - 1];

  if (distanceNm <= first.distanceNm) {
    // Below the shortest lane the workbook ever quoted. Held flat rather than
    // extrapolated towards zero, and always flagged.
    return {
      eur: first.baseEur,
      status: distanceNm === first.distanceNm ? 'verified' : 'needs-review',
      maxErrorEur: distanceNm === first.distanceNm ? 0 : Infinity,
    };
  }

  if (distanceNm >= last.distanceNm) {
    if (distanceNm === last.distanceNm) {
      return { eur: last.baseEur, status: 'verified', maxErrorEur: 0 };
    }
    // Above about 4 000 NM the recovered curve is exactly linear, so extending
    // the last segment is sound rather than a guess.
    const previous = anchors[anchors.length - 2];
    const slope = (last.baseEur - previous.baseEur) / (last.distanceNm - previous.distanceNm);
    return {
      eur: last.baseEur + slope * (distanceNm - last.distanceNm),
      status: 'needs-review',
      maxErrorEur: 0,
    };
  }

  for (let i = 1; i < anchors.length; i++) {
    const low = anchors[i - 1];
    const high = anchors[i];
    if (distanceNm > high.distanceNm) continue;
    if (distanceNm === high.distanceNm) {
      return { eur: high.baseEur, status: 'verified', maxErrorEur: 0 };
    }
    if (distanceNm === low.distanceNm) {
      return { eur: low.baseEur, status: 'verified', maxErrorEur: 0 };
    }

    const width = high.distanceNm - low.distanceNm;
    const ratio = (distanceNm - low.distanceNm) / width;
    return {
      eur: low.baseEur + ratio * (high.baseEur - low.baseEur),
      status: 'needs-review',
      maxErrorEur: (curvatureAround(anchors, i) * width ** 2) / 8,
    };
  }

  /* c8 ignore next 2 - unreachable: the loop covers every interval. */
  return { eur: last.baseEur, status: 'needs-review', maxErrorEur: Infinity };
}

/** True when an interpolated rate is far enough out to be worth mentioning. */
export const freightNeedsMention = (base: FreightBase) =>
  base.maxErrorEur >= FREIGHT_ERROR_THRESHOLD_EUR;

/**
 * Emissions for a shipment, in kilograms of CO2 equivalent.
 *
 * Intensity times slots times units times how hard the vessels are working.
 * Falls back to the workbook's own per-unit figure when the intensity could not
 * be recovered, so a broken import degrades to the old behaviour rather than to
 * zero.
 */
function correctedEmissions(
  item: { teuEquivalent: number | null; requiresPlug: boolean; emissionsTonnesPerTeu: number | null },
  distanceNm: number,
  quantity: number,
  vesselFactor: number,
): number {
  const intensity = tariffs.emissionsIntensity;
  if (!intensity || item.teuEquivalent == null) {
    return item.emissionsTonnesPerTeu == null
      ? 0
      : (item.emissionsTonnesPerTeu / 1000) * distanceNm * quantity;
  }

  const perTeuNm = item.requiresPlug
    ? intensity.refrigeratedKgPerTeuNm
    : intensity.dryKgPerTeuNm;

  return (perTeuNm / 1000) * item.teuEquivalent * distanceNm * quantity * vesselFactor;
}

/* -------------------------------------------------------------------------- */
/* The calculation                                                            */
/* -------------------------------------------------------------------------- */

export interface PriceInput {
  /** Class of the port of origin, which every tariff is looked up by. */
  portClass: PortClass;
  equipmentId: number;
  quantity: number;
  /** Direct origin-to-destination distance in nautical miles. */
  distanceNm: number;
  vgmSolas: boolean;
  dangerousGoods?: boolean;
  /**
   * How much of the voyage the EU emissions scheme covers. Defaults to `full`.
   * Ignored by `legacy` rules, which predate the distinction.
   */
  etsScope?: EtsScope;
  /**
   * How the vessels carrying the cargo compare with the network average, from
   * `vesselEmissionsFactor`. Defaults to 1, the average. Ignored by `legacy`.
   */
  vesselEmissionsFactor?: number;
  /** Defaults to `corrected`. Only the test suite asks for `legacy`. */
  rules?: PricingRules;
}

export interface PriceBreakdown {
  /** The FEU reference rate for the lane, before equipment or quantity. */
  seaFreightBaseFeuEur: number;
  /** Set when the base was interpolated rather than taken from an anchor. */
  seaFreightStatus: QuoteVerificationStatus;
  /** How far that interpolation can be out. Zero at a published anchor. */
  seaFreightMaxErrorEur: number;
  /** Every line of the quotation. The total is their sum and nothing else. */
  charges: QuotationCharge[];
  totalEur: number;
  emissionsKgCo2e: number;
  roadComparisonKgCo2e: number | null;
  co2SavedKgCo2e: number | null;
  rules: PricingRules;
}

/**
 * Work out every line of a price from the four things it depends on.
 *
 * Kept separate from `priceQuotation` so that the regression suite can replay
 * the worked quotations, which record a port class rather than a port.
 */
export function calculatePrice(input: PriceInput): PriceBreakdown {
  const item = getEquipment(input.equipmentId);
  if (!item) {
    throw new QuotationError(
      `Unit type ${input.equipmentId} is not in the tariff`,
      'unknown-equipment',
    );
  }

  const rules = input.rules ?? 'corrected';
  const legacy = rules === 'legacy';
  const { portClass, distanceNm } = input;
  const quantity = Math.max(1, Math.trunc(input.quantity));

  const charges: QuotationCharge[] = [];

  /**
   * Add a line. An amount that is not a finite number is a bug in a rule, not a
   * charge of zero, so it throws rather than quietly vanishing from the total.
   * A genuine zero is dropped, because a quotation listing `Seal 0.00` reads as
   * though something went wrong.
   */
  const add = (
    key: string,
    label: string,
    amountEur: number,
    options: { perUnit?: boolean; status?: QuoteVerificationStatus } = {},
  ) => {
    if (!Number.isFinite(amountEur)) {
      throw new QuotationError(`The ${label} charge came out as ${amountEur}`, 'unknown-equipment');
    }
    if (amountEur === 0) return;
    charges.push({
      key,
      label,
      amountEur,
      perUnit: options.perUnit ?? false,
      ...(options.status ? { status: options.status } : {}),
    });
  };

  /* ---- sea freight ------------------------------------------------------ */

  const base = seaFreightBaseFeu(distanceNm);

  // CORRECTED: the freight is per container and scaled by the equipment type.
  // LEGACY: the spreadsheet puts the bare FEU base in the total, so a 20-unit
  // booking pays one unit's freight and a 20' reefer pays a 40' dry's rate.
  const freight = legacy ? base.eur : base.eur * item.freightFactor * quantity;
  add('sea-freight', 'Sea freight', freight, {
    perUnit: !legacy,
    // Only flagged when the interpolation could actually move the figure.
    ...(freightNeedsMention(base) ? { status: base.status } : {}),
  });

  /* ---- terminal handling ------------------------------------------------ */

  const handling = tariffs.terminalHandling[item.id]?.[portClass] ?? 0;
  add('terminal-handling', 'Terminal handling', handling * quantity, { perUnit: true });

  // CORRECTED: a fifth of the handling charge, per container.
  // LEGACY: the quantity is applied twice, so 25 units cost 25 times too much.
  add(
    'port-additional',
    'Port additional',
    tariffs.portAdditionalRate * handling * (legacy ? quantity ** 2 : quantity),
    { perUnit: true },
  );

  /* ---- charges that follow the container -------------------------------- */

  const perUnit = tariffs.perUnitSurcharges;
  add('port-taxes', 'Port taxes', perUnit.portTaxes[portClass] * quantity, { perUnit: true });
  if (input.vgmSolas) {
    add('vgm', 'VGM SOLAS', perUnit.vgmSolas[portClass] * quantity, { perUnit: true });
  }
  add('isps', 'ISPS', perUnit.isps[portClass] * quantity, { perUnit: true });
  add('control', 'Control', perUnit.control[portClass] * quantity, { perUnit: true });
  add('seal', 'Seal', perUnit.seal[portClass] * quantity, { perUnit: true });

  if (input.dangerousGoods) {
    const imo = perUnit.dangerousGoods[portClass];
    if (imo == null) {
      // No worked quotation ever carried dangerous goods from a class A or B
      // port, so the rate is genuinely unknown and is not invented.
      charges.push({
        key: 'imo',
        label: 'Dangerous goods (IMO)',
        amountEur: 0,
        perUnit: true,
        status: 'blocked',
      });
    } else {
      add('imo', 'Dangerous goods (IMO)', imo * quantity, { perUnit: true });
    }
  }

  // CORRECTED: a reefer plug is per container. LEGACY: charged once.
  const plugIn = tariffs.plugInEur[item.id];
  if (item.requiresPlug && plugIn != null) {
    add('plug-in', 'Reefer plug-in', plugIn * (legacy ? 1 : quantity), { perUnit: !legacy });
  }

  // CORRECTED: bunker recovery follows the freight, so it is per container.
  // LEGACY: charged once.
  const brafBase = (tariffs.bunkerRecovery[item.id] ?? 0) * BRAF_CLASS_STEP ** CLASS_ORDER.indexOf(portClass);
  add('bunker-recovery', 'Bunker recovery (BRAF)', brafBase * (legacy ? 1 : quantity), {
    perUnit: !legacy,
  });

  /* ---- charges that follow the shipment --------------------------------- */

  // One bill of lading, one booking, one customs declaration, however many
  // containers are on it.
  const fixed = tariffs.fixedSurcharges;
  add('documentation', 'Documentation', fixed.documentation[portClass]);
  add('logistic-management', 'Logistic management', fixed.logisticManagement[portClass]);
  add('customs-clearance', 'Customs clearance', fixed.customsClearance[portClass]);
  // The AMS manifest applies to US routes only and SDG Lines serves none, so it
  // is deliberately never charged.

  /* ---- emissions -------------------------------------------------------- */

  // LEGACY: the workbook's own per-unit figure, quantity left out.
  //
  // CORRECTED: the fleet intensity times the slots the unit occupies, times the
  // quantity, times how hard the vessels carrying it are actually working.
  // Eight of the workbook's sixteen per-unit figures cannot be intensities - a
  // 20' flatrack is recorded at nine times a 20' dry box of the same size - so
  // the corrected rules price every type from the two that are credible.
  const emissionsKgCo2e = legacy
    ? item.emissionsTonnesPerTeu == null
      ? 0
      : (item.emissionsTonnesPerTeu / 1000) * distanceNm
    : correctedEmissions(item, distanceNm, quantity, input.vesselEmissionsFactor ?? 1);

  // The emissions figure already carries the quantity under the corrected
  // rules, so the surcharge must not apply it again.
  const tonnes = (legacy ? emissionsKgCo2e * quantity : emissionsKgCo2e) / 1000;
  const scope = legacy ? 1 : ETS_SCOPE[input.etsScope ?? 'full'];

  add(
    'ets',
    legacy
      ? 'Emissions trading (ETS)'
      : `Emissions trading (ETS), ${scope === 1 ? 'full' : 'half'} scope`,
    tonnes * ETS_EUR_PER_TONNE * scope,
    { perUnit: !legacy },
  );
  add('ets-administration', 'ETS administration', ETS_ADMINISTRATION_EUR, {
    status: 'needs-review',
  });

  const road = tariffs.truckEmissionsPerNm[item.id];
  const roadComparison = road == null ? null : road * distanceNm * (legacy ? 1 : quantity);

  return {
    seaFreightBaseFeuEur: base.eur,
    seaFreightStatus: base.status,
    seaFreightMaxErrorEur: base.maxErrorEur,
    charges,
    totalEur: round2(charges.reduce((sum, charge) => sum + charge.amountEur, 0)),
    emissionsKgCo2e,
    roadComparisonKgCo2e: roadComparison,
    co2SavedKgCo2e: roadComparison == null ? null : roadComparison - emissionsKgCo2e,
    rules,
  };
}

/* -------------------------------------------------------------------------- */
/* The quotation a learner receives                                           */
/* -------------------------------------------------------------------------- */

/**
 * Price a quotation.
 *
 * @param request What the learner asked for.
 * @param journey The routing already chosen, so that the price and the itinerary
 *   the learner sees cannot drift apart.
 */
export function priceQuotation(
  request: QuotationRequest,
  journey: Journey,
  reference: string,
  now = new Date(),
): Quotation {
  const origin = getPort(request.originPortId);
  const destination = getPort(request.destinationPortId);

  if (!origin || !destination) {
    throw new QuotationError('The quotation names a port that is not on the network', 'unknown-port');
  }
  if (!origin.portClass || origin.baseIndex == null) {
    throw new QuotationError(
      `${origin.displayName} cannot be quoted: the workbook gives it no class or no rate`,
      'not-quotable',
    );
  }

  const distanceNm = directDistanceNm(origin.id, destination.id);
  if (distanceNm == null) {
    throw new QuotationError(
      `The workbook has no distance between ${origin.displayName} and ${destination.displayName}`,
      'no-distance',
    );
  }

  const quantity = Math.max(1, Math.trunc(request.quantity));
  const vesselFactor = vesselEmissionsFactor(journey);

  const breakdown = calculatePrice({
    portClass: origin.portClass,
    equipmentId: request.equipmentId,
    quantity,
    distanceNm,
    vgmSolas: request.vgmSolas,
    dangerousGoods: request.dangerousGoods,
    // Both ends inside the scheme means the whole voyage is covered.
    etsScope: origin.inEuEts && destination.inEuEts ? 'full' : 'half',
    vesselEmissionsFactor: vesselFactor,
  });

  const validFrom = new Date(now);
  const validTo = new Date(now);
  validTo.setDate(validTo.getDate() + VALIDITY_DAYS);

  return {
    reference,
    request: { ...request, quantity },
    legs: journey.legs,
    distanceNm,
    transitDays: Math.round(journey.transitDays),
    vesselEmissionsFactor: vesselFactor,
    seaFreightBaseFeuEur: breakdown.seaFreightBaseFeuEur,
    seaFreightStatus: breakdown.seaFreightStatus,
    seaFreightMaxErrorEur: breakdown.seaFreightMaxErrorEur,
    charges: breakdown.charges,
    totalEur: breakdown.totalEur,
    emissionsKgCo2e: breakdown.emissionsKgCo2e,
    roadComparisonKgCo2e: breakdown.roadComparisonKgCo2e,
    co2SavedKgCo2e: breakdown.co2SavedKgCo2e,
    validFrom: validFrom.toISOString().slice(0, 10),
    validTo: validTo.toISOString().slice(0, 10),
  };
}
