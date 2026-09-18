import type { CargoCapability, VerificationMeta } from '@/types/content';

/**
 * Arrival charges.
 *
 * Audit finding (2026-09-18): the Arrival Charges link on the legacy site
 * redirects to the home page. The charges themselves are not published
 * anywhere, so there is nothing to migrate and no amounts to carry over.
 *
 * The brief forbids inventing prices, and a charge schedule with made up
 * amounts would be worse than none: a learner would quote it in an assessed
 * exercise as though it were real. So what is published here is the part that
 * can be published honestly and that carries the actual teaching value - what
 * each charge is, who pays it, what it is calculated on, and when it applies.
 *
 * Amounts are deliberately absent. In the simulation they are set by the
 * trainer for each exercise, which is also how a real tariff works: it is
 * negotiated and dated, not a fixed property of a port. When the product owner
 * supplies a schedule, add an `amount` field to `ArrivalCharge` and the tables
 * will carry it without any other change.
 */

/** What the charge is calculated on. */
export type ChargeBasis =
  | 'per container'
  | 'per bill of lading'
  | 'per shipment'
  | 'per roll trailer'
  | 'per tonne'
  | 'per day';

/** Who normally settles the charge. */
export type ChargePayer = 'Consignee' | 'Shipper' | 'Either, by agreement';

export interface ArrivalCharge {
  id: string;
  /** Industry abbreviation, e.g. "THC". */
  code: string;
  name: string;
  basis: ChargeBasis;
  payer: ChargePayer;
  /** What the charge covers, in plain language. */
  description: string;
  /** What a learner most often gets wrong about it. */
  note?: string;
  /** Cargo types the charge applies to. Empty means it applies to everything. */
  appliesTo: CargoCapability[];
  /** True when the charge only arises in particular circumstances. */
  conditional?: boolean;
}

const CHARGE_META: VerificationMeta = {
  source: 'simulation-design',
  status: 'needs-review',
  lastReviewed: '2026-09-18',
  reviewNote:
    'Charge definitions written for this site from standard industry practice. No amounts are published: the legacy Arrival Charges page redirects to the home page and publishes no schedule. The product owner must supply the tariff to be used in exercises, including currency, validity dates and any port-specific variation.',
};

export const arrivalChargesMeta = CHARGE_META;

export const arrivalCharges: ArrivalCharge[] = [
  {
    id: 'thc',
    code: 'THC',
    name: 'Terminal handling charge',
    basis: 'per container',
    payer: 'Consignee',
    description:
      'Covers moving the container between the vessel and the terminal stack: the crane lift, the internal transport and the time in the yard before collection.',
    note: 'THC is charged at both ends of the voyage, once on loading and once on discharge. Quoting only the destination THC understates the cost of the shipment.',
    appliesTo: ['containers', 'reefer'],
  },
  {
    id: 'doc',
    code: 'DOC',
    name: 'Documentation fee',
    basis: 'per bill of lading',
    payer: 'Consignee',
    description:
      'Covers issuing and releasing the transport document and the associated administration at the destination office.',
    note: 'Charged per bill of lading, not per container. Consolidating a shipment onto one bill of lading changes this cost; splitting it across several multiplies it.',
    appliesTo: [],
  },
  {
    id: 'isps',
    code: 'ISPS',
    name: 'Security charge',
    basis: 'per container',
    payer: 'Consignee',
    description:
      'Covers the port facility security measures required under the International Ship and Port Facility Security Code.',
    appliesTo: [],
  },
  {
    id: 'reefer-monitoring',
    code: 'RMS',
    name: 'Reefer monitoring and plug-in',
    basis: 'per container',
    payer: 'Consignee',
    description:
      'Covers connecting the unit to terminal power, monitoring the set point and recording the temperature history while the container is in the yard.',
    note: 'Applies for as long as the unit is in the terminal, so it interacts directly with demurrage: a delay in collection increases both.',
    appliesTo: ['reefer'],
  },
  {
    id: 'imdg',
    code: 'DGS',
    name: 'Dangerous goods surcharge',
    basis: 'per container',
    payer: 'Shipper',
    description:
      'Covers the additional handling, segregation and documentation required for cargo classified under the IMDG Code.',
    note: 'The surcharge depends on the IMDG class, not simply on whether the cargo is classified. Class 1 and class 7 are handled differently from class 9.',
    appliesTo: ['dangerous-goods'],
  },
  {
    id: 'oog',
    code: 'OOG',
    name: 'Out of gauge surcharge',
    basis: 'per shipment',
    payer: 'Shipper',
    description:
      'Covers the slots lost around cargo that overhangs its unit, and the additional lashing and planning it requires.',
    note: 'Calculated from the slots the cargo blocks rather than from its own dimensions, which is why a small overhang can cost as much as a large one.',
    appliesTo: ['project-cargo'],
  },
  {
    id: 'roro-handling',
    code: 'RTH',
    name: 'Roll trailer handling',
    basis: 'per roll trailer',
    payer: 'Consignee',
    description:
      'Covers towing the trailer on and off the vessel and positioning it within the terminal.',
    appliesTo: ['roro'],
  },
  {
    id: 'demurrage',
    code: 'DEM',
    name: 'Demurrage',
    basis: 'per day',
    payer: 'Consignee',
    description:
      'Applies once the free time for collecting the container from the terminal has expired. It compensates for the container being unavailable for reuse.',
    note: 'Demurrage and detention are not the same charge. Demurrage runs while the unit is still inside the terminal; detention runs once it has left and has not yet been returned.',
    appliesTo: [],
    conditional: true,
  },
  {
    id: 'detention',
    code: 'DET',
    name: 'Detention',
    basis: 'per day',
    payer: 'Consignee',
    description:
      'Applies once the free time for returning the empty container after unpacking has expired.',
    appliesTo: [],
    conditional: true,
  },
  {
    id: 'storage',
    code: 'STO',
    name: 'Terminal storage',
    basis: 'per day',
    payer: 'Consignee',
    description:
      'Charged by the terminal, not by the carrier, for occupying yard space beyond the free period.',
    note: 'Storage is a terminal charge and demurrage is a carrier charge. They run over the same days and are billed separately, which is why the two together are often larger than expected.',
    appliesTo: [],
    conditional: true,
  },
  {
    id: 'customs-inspection',
    code: 'INS',
    name: 'Customs inspection',
    basis: 'per container',
    payer: 'Consignee',
    description:
      'Covers moving the unit to the inspection area, opening it and restowing the cargo when customs select the shipment for examination.',
    note: 'Arises only if the shipment is selected. It cannot be predicted, which is exactly why it belongs in a landed cost estimate as a contingency.',
    appliesTo: [],
    conditional: true,
  },
];

export function getChargesForCargo(capability: CargoCapability | null): ArrivalCharge[] {
  if (!capability) return arrivalCharges;
  return arrivalCharges.filter(
    (charge) => charge.appliesTo.length === 0 || charge.appliesTo.includes(capability),
  );
}
