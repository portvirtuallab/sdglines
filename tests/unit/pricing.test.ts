/**
 * The pricing engine, tested twice over.
 *
 * `legacy` rules must agree with the quotations SDG Lines has already issued.
 * That is the only evidence that the reverse-engineering was right: the Google
 * Sheets formulas did not survive the export, so the tariff tables, the freight
 * curve and every surcharge lookup were recovered from results. If those stop
 * reproducing, the recovery was wrong and nothing built on it can be trusted.
 *
 * `corrected` rules are what the site charges. They cannot be checked against
 * history, because they deliberately differ from it, so they are checked
 * against the property that was broken: a booking of twenty containers costs
 * twenty containers.
 *
 * Each charge is asserted on its own rather than only the total, so that a
 * failure names the line that moved instead of leaving someone to work it out.
 */

import { describe, expect, it } from 'vitest';
import corpus from '../fixtures/worked-quotations.json';
import { QuotationError, calculatePrice, seaFreightBaseFeu } from '@/lib/quote/pricing';
import { equipment } from '@/data/quote/equipment';
import { tariffs } from '@/data/quote/tariffs';
import type { PortClass } from '@/types/quote';

const byName = new Map(equipment.map((item) => [item.name, item]));

/** Cents, not euros. */
const TOLERANCE = 0.005;

interface WorkedQuotation {
  source: string;
  portClass: string;
  unit: string;
  quantity: number;
  distanceNm: number;
  baseEur: number;
  freightEur: number;
  terminalHandling: number | null;
  terminalHandlingTotal: number | null;
  portAdditional: number | null;
  portTaxes: number | null;
  vgm: number | null;
  documentation: number | null;
  isps: number | null;
  logisticManagement: number | null;
  control: number | null;
  customsClearance: number | null;
  seal: number | null;
  imo: number | null;
  ets: number | null;
  plugIn: number | null;
  emissions: number | null;
  truckComparison: number | null;
  totalSurcharges: number | null;
  totalFreight: number | null;
  total: number | null;
}

const worked = corpus as WorkedQuotation[];

/** Price one worked row the way the spreadsheet did. */
function replayLegacy(row: WorkedQuotation) {
  const item = byName.get(row.unit);
  if (!item) throw new Error(`Unit type "${row.unit}" is not in the imported tariff`);

  return calculatePrice({
    portClass: row.portClass as PortClass,
    equipmentId: item.id,
    quantity: row.quantity,
    distanceNm: row.distanceNm,
    // The corpus records charges rather than answers, so the options are read
    // back from the charges they produced.
    vgmSolas: row.vgm != null,
    dangerousGoods: row.imo != null,
    rules: 'legacy',
  });
}

const charge = (result: { charges: Array<{ key: string; amountEur: number }> }, key: string) =>
  result.charges.find((entry) => entry.key === key)?.amountEur ?? 0;

/* -------------------------------------------------------------------------- */
/* The corpus                                                                 */
/* -------------------------------------------------------------------------- */

describe('the corpus of worked quotations', () => {
  it('is present and large enough to be worth trusting', () => {
    expect(worked.length).toBeGreaterThanOrEqual(200);
  });

  it('only uses unit types the tariff knows', () => {
    const unknown = [...new Set(worked.map((row) => row.unit))].filter((name) => !byName.has(name));
    expect(unknown).toEqual([]);
  });
});

describe('sea freight base', () => {
  it('is exact at every distance the workbook ever quoted', () => {
    for (const row of worked) {
      const { eur, status } = seaFreightBaseFeu(row.distanceNm);
      expect(status, `${row.source} at ${row.distanceNm} NM`).toBe('verified');
      expect(Math.abs(eur - row.baseEur), `${row.source}`).toBeLessThan(TOLERANCE);
    }
  });

  it('is a pure function of distance, as the audit claims', () => {
    const seen = new Map<number, number>();
    for (const row of worked) {
      const previous = seen.get(row.distanceNm);
      if (previous != null) {
        expect(Math.abs(previous - row.baseEur), `${row.distanceNm} NM`).toBeLessThan(TOLERANCE);
      }
      seen.set(row.distanceNm, row.baseEur);
    }
  });

  it('says so when a distance falls between two anchors', () => {
    // 1897 and 1898 NM are both anchors; 1897.5 is not a distance the matrix
    // produces, but if one ever appeared the figure must not look confirmed.
    expect(seaFreightBaseFeu(1897.5).status).toBe('needs-review');
    expect(seaFreightBaseFeu(50).status).toBe('needs-review');
    expect(seaFreightBaseFeu(99_999).status).toBe('needs-review');
  });
});

/* -------------------------------------------------------------------------- */
/* Legacy parity                                                              */
/* -------------------------------------------------------------------------- */

describe.each([
  ['sea freight', (r: WorkedQuotation) => r.totalFreight, (p: ReturnType<typeof replayLegacy>) => charge(p, 'sea-freight')],
  ['terminal handling', (r) => r.terminalHandlingTotal, (p) => charge(p, 'terminal-handling')],
  ['port additional', (r) => r.portAdditional, (p) => charge(p, 'port-additional')],
  ['port taxes', (r) => r.portTaxes, (p) => charge(p, 'port-taxes')],
  ['VGM', (r) => r.vgm, (p) => charge(p, 'vgm')],
  ['documentation', (r) => r.documentation, (p) => charge(p, 'documentation')],
  ['ISPS', (r) => r.isps, (p) => charge(p, 'isps')],
  ['logistic management', (r) => r.logisticManagement, (p) => charge(p, 'logistic-management')],
  ['control', (r) => r.control, (p) => charge(p, 'control')],
  ['customs clearance', (r) => r.customsClearance, (p) => charge(p, 'customs-clearance')],
  ['seal', (r) => r.seal, (p) => charge(p, 'seal')],
  ['dangerous goods (IMO)', (r) => r.imo, (p) => charge(p, 'imo')],
  ['reefer plug-in', (r) => r.plugIn, (p) => charge(p, 'plug-in')],
  ['emissions', (r) => r.emissions, (p) => p.emissionsKgCo2e],
  ['road comparison', (r) => r.truckComparison, (p) => p.roadComparisonKgCo2e ?? 0],
] as Array<
  [string, (r: WorkedQuotation) => number | null, (p: ReturnType<typeof replayLegacy>) => number]
>)('legacy rules: %s', (_label, expected, actual) => {
  it('matches every worked quotation to the cent', () => {
    const wrong: string[] = [];
    for (const row of worked) {
      const target = expected(row);
      if (target == null) continue;
      const got = actual(replayLegacy(row));
      if (Math.abs(got - target) >= TOLERANCE) {
        wrong.push(
          `${row.source} (${row.unit} x${row.quantity}, ${row.distanceNm} NM): expected ${target}, got ${got}`,
        );
      }
    }
    expect(wrong.slice(0, 10)).toEqual([]);
  });
});

describe('legacy rules: the discarded equipment factor', () => {
  it('reproduces the column the spreadsheet computes and then ignores', () => {
    const wrong: string[] = [];
    for (const row of worked) {
      const item = byName.get(row.unit)!;
      const computed = row.baseEur * item.freightFactor;
      if (Math.abs(computed - row.freightEur) >= TOLERANCE) {
        wrong.push(`${row.source}: expected ${row.freightEur}, got ${computed}`);
      }
    }
    expect(wrong.slice(0, 5)).toEqual([]);
  });
});

/**
 * The total is exact everywhere except for one unexplained 20 EUR.
 *
 * The workbook adds it to the emissions surcharge of 180 of its 202 worked
 * quotations and omits it from the other 22. Nothing in the data separates the
 * two groups. The engine always adds it, so those 22 totals come out 20 EUR
 * high and every other total is exact.
 *
 * Asserting that - rather than widening the tolerance to 20 EUR - keeps the
 * suite able to catch a real regression: any other difference, of any size, is
 * a failure, and the count of affected rows is pinned so the exception cannot
 * quietly grow.
 */
describe('legacy rules: the total', () => {
  const differences = worked
    .filter((row) => row.total != null)
    .map((row) => ({ row, difference: replayLegacy(row).totalEur - (row.total as number) }));

  /**
   * A cent of slack on the exception alone. The workbook rounds its own
   * intermediate sums, so on the largest quotation in the corpus - 25 units,
   * 46 432.95 EUR - the same 20 EUR lands a cent apart.
   */
  const EXCEPTION_TOLERANCE = 0.02;

  it('is exact, or high by exactly the unexplained ETS component', () => {
    const unexplained = differences.filter(
      ({ difference }) =>
        Math.abs(difference) >= TOLERANCE && Math.abs(difference - 20) >= EXCEPTION_TOLERANCE,
    );
    expect(
      unexplained
        .slice(0, 10)
        .map(
          ({ row, difference }) =>
            `${row.source} (${row.unit} x${row.quantity}, ${row.distanceNm} NM): off by ${difference.toFixed(2)}`,
        ),
    ).toEqual([]);
  });

  it('is exact on the 180 quotations that carry that component', () => {
    expect(differences.filter(({ difference }) => Math.abs(difference) < TOLERANCE).length).toBe(180);
  });

  it('leaves exactly the 22 known exceptions', () => {
    expect(
      differences.filter(({ difference }) => Math.abs(difference - 20) < EXCEPTION_TOLERANCE).length,
    ).toBe(22);
  });
});

/* -------------------------------------------------------------------------- */
/* Corrected rules                                                            */
/* -------------------------------------------------------------------------- */

/** Barcelona, class C, 20' reefer, 1 898 NM: the lane used throughout the docs. */
const LANE = { portClass: 'C' as PortClass, distanceNm: 1898, vgmSolas: true };
const REEFER_20 = 3;
const DRY_20 = 1;
const DRY_40 = 2;

describe('corrected rules', () => {
  it('charges the freight for every container, not just the first', () => {
    const one = calculatePrice({ ...LANE, equipmentId: DRY_40, quantity: 1 });
    const twenty = calculatePrice({ ...LANE, equipmentId: DRY_40, quantity: 20 });

    expect(charge(twenty, 'sea-freight')).toBeCloseTo(charge(one, 'sea-freight') * 20, 6);
  });

  it('applies the equipment factor the spreadsheet computed and threw away', () => {
    const dry = calculatePrice({ ...LANE, equipmentId: DRY_20, quantity: 1 });
    const reefer = calculatePrice({ ...LANE, equipmentId: REEFER_20, quantity: 1 });

    // A 20' dry is 0.80 of the FEU reference and a 20' reefer is 1.25 of it.
    expect(charge(dry, 'sea-freight')).toBeCloseTo(dry.seaFreightBaseFeuEur * 0.8, 6);
    expect(charge(reefer, 'sea-freight')).toBeCloseTo(reefer.seaFreightBaseFeuEur * 1.25, 6);
    expect(charge(reefer, 'sea-freight')).toBeGreaterThan(charge(dry, 'sea-freight'));
  });

  it('grows the port additional in step with the order, not with its square', () => {
    const one = calculatePrice({ ...LANE, equipmentId: DRY_40, quantity: 1 });
    const twentyFive = calculatePrice({ ...LANE, equipmentId: DRY_40, quantity: 25 });

    expect(charge(twentyFive, 'port-additional')).toBeCloseTo(
      charge(one, 'port-additional') * 25,
      6,
    );
  });

  it('counts the emissions of every container', () => {
    const one = calculatePrice({ ...LANE, equipmentId: DRY_40, quantity: 1 });
    const ten = calculatePrice({ ...LANE, equipmentId: DRY_40, quantity: 10 });

    expect(ten.emissionsKgCo2e).toBeCloseTo(one.emissionsKgCo2e * 10, 6);
    expect(ten.roadComparisonKgCo2e!).toBeCloseTo(one.roadComparisonKgCo2e! * 10, 6);
  });

  it('does not apply the quantity twice to the emissions surcharge', () => {
    const one = calculatePrice({ ...LANE, equipmentId: DRY_40, quantity: 1 });
    const ten = calculatePrice({ ...LANE, equipmentId: DRY_40, quantity: 10 });

    expect(charge(ten, 'ets')).toBeCloseTo(charge(one, 'ets') * 10, 6);
  });

  it('charges the ETS administration once per booking, not per container', () => {
    const one = calculatePrice({ ...LANE, equipmentId: DRY_40, quantity: 1 });
    const ten = calculatePrice({ ...LANE, equipmentId: DRY_40, quantity: 10 });

    expect(charge(ten, 'ets-administration')).toBe(charge(one, 'ets-administration'));
  });

  it('covers half the emissions when one end of the voyage is outside the EU scheme', () => {
    const intraEu = calculatePrice({ ...LANE, equipmentId: DRY_40, quantity: 2, etsScope: 'full' });
    const leaving = calculatePrice({ ...LANE, equipmentId: DRY_40, quantity: 2, etsScope: 'half' });

    expect(charge(leaving, 'ets')).toBeCloseTo(charge(intraEu, 'ets') / 2, 6);
    // The administration is unaffected: the paperwork is the same either way.
    expect(charge(leaving, 'ets-administration')).toBe(charge(intraEu, 'ets-administration'));
  });

  it('says on the line which scope was applied', () => {
    const full = calculatePrice({ ...LANE, equipmentId: DRY_40, quantity: 1, etsScope: 'full' });
    const half = calculatePrice({ ...LANE, equipmentId: DRY_40, quantity: 1, etsScope: 'half' });

    expect(full.charges.find((entry) => entry.key === 'ets')?.label).toContain('full scope');
    expect(half.charges.find((entry) => entry.key === 'ets')?.label).toContain('half scope');
  });

  it('covers a voyage in full by default', () => {
    const chosen = calculatePrice({ ...LANE, equipmentId: DRY_40, quantity: 1 });
    const full = calculatePrice({ ...LANE, equipmentId: DRY_40, quantity: 1, etsScope: 'full' });
    expect(charge(chosen, 'ets')).toBe(charge(full, 'ets'));
  });

  it('charges the paperwork once however many containers are on it', () => {
    const one = calculatePrice({ ...LANE, equipmentId: DRY_40, quantity: 1 });
    const fifty = calculatePrice({ ...LANE, equipmentId: DRY_40, quantity: 50 });

    for (const key of ['documentation', 'logistic-management', 'customs-clearance']) {
      expect(charge(fifty, key), key).toBe(charge(one, key));
    }
  });

  it('labels every line as per unit or per shipment', () => {
    const quotation = calculatePrice({ ...LANE, equipmentId: REEFER_20, quantity: 3 });
    const perShipment = quotation.charges.filter((entry) => !entry.perUnit).map((entry) => entry.key);
    expect(perShipment.sort()).toEqual(
      ['customs-clearance', 'documentation', 'ets-administration', 'logistic-management'].sort(),
    );
  });

  it('makes the total the sum of the lines and nothing else', () => {
    for (const quantity of [1, 2, 7, 25]) {
      const quotation = calculatePrice({ ...LANE, equipmentId: REEFER_20, quantity });
      const sum = quotation.charges.reduce((total, entry) => total + entry.amountEur, 0);
      expect(quotation.totalEur).toBeCloseTo(sum, 2);
    }
  });

  it('costs more per container than the spreadsheet did, and says so', () => {
    // The point of the correction: twenty containers used to cost barely more
    // than one, because only the handling scaled.
    const legacy = calculatePrice({ ...LANE, equipmentId: REEFER_20, quantity: 20, rules: 'legacy' });
    const corrected = calculatePrice({ ...LANE, equipmentId: REEFER_20, quantity: 20 });

    expect(corrected.totalEur).toBeGreaterThan(legacy.totalEur);
    expect(corrected.rules).toBe('corrected');
    expect(legacy.rules).toBe('legacy');
  });

  it('defaults to the corrected rules, so the site cannot use the old ones by accident', () => {
    expect(calculatePrice({ ...LANE, equipmentId: DRY_40, quantity: 5 }).rules).toBe('corrected');
  });
});

/* -------------------------------------------------------------------------- */
/* Refusals                                                                   */
/* -------------------------------------------------------------------------- */

describe('when it cannot price something', () => {
  it('refuses a unit type that is not in the tariff', () => {
    expect(() => calculatePrice({ ...LANE, equipmentId: 999, quantity: 1 })).toThrow(QuotationError);
  });

  it('treats a fractional or negative quantity as one unit', () => {
    const one = calculatePrice({ ...LANE, equipmentId: DRY_40, quantity: 1 });
    for (const quantity of [0, -3, 0.4, 1.9]) {
      expect(calculatePrice({ ...LANE, equipmentId: DRY_40, quantity }).totalEur).toBe(one.totalEur);
    }
  });

  it('has a dangerous goods rate for every port class', () => {
    // Two of the four were never published: no worked quotation carried
    // dangerous goods from a class A or B port. They were completed by
    // continuing the workbook's own five-euro step down the ladder. If a class
    // ever loses its rate, the engine marks the charge blocked rather than
    // charging nothing, and this is the test that would notice.
    const ladder = tariffs.perUnitSurcharges.dangerousGoods;
    expect([ladder.A, ladder.B, ladder.C, ladder.D]).toEqual([55, 60, 65, 70]);

    for (const portClass of ['A', 'B', 'C', 'D'] as PortClass[]) {
      const quotation = calculatePrice({
        ...LANE,
        portClass,
        equipmentId: DRY_40,
        quantity: 2,
        dangerousGoods: true,
      });
      const imo = quotation.charges.find((entry) => entry.key === 'imo');
      expect(imo?.status, portClass).toBeUndefined();
      expect(imo?.amountEur, portClass).toBe(ladder[portClass]! * 2);
    }
  });

  it('charges nothing for dangerous goods that were not declared', () => {
    const quotation = calculatePrice({ ...LANE, equipmentId: DRY_40, quantity: 1 });
    expect(quotation.charges.some((entry) => entry.key === 'imo')).toBe(false);
  });
});
