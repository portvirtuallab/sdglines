/**
 * The operational model behind the SDG Lines quotation tool.
 *
 * Everything here is imported from the two supplied workbooks by
 * `scripts/workbook/import.mjs`. Nothing is maintained by hand, because a
 * second hand-kept copy of the network is exactly what the quotation tool is
 * meant to remove: the route pages, the map, the port directory and the
 * quotation form all read these records.
 *
 * The verification vocabulary is the one already used by `src/types/content.ts`,
 * extended with the workbook as a source, so that a reader can tell a value the
 * workbook states from a value the build derived from it.
 */

/** Where an operational value came from. */
export type QuoteSourceKind =
  /** Stated by a cell in one of the supplied workbooks. */
  | 'workbook'
  /** Computed from workbook values by a rule documented in docs/quote. */
  | 'derived'
  /** Recovered from the worked quotations because the formula was lost. */
  | 'recovered'
  /** Corrected during import because the workbook value is demonstrably wrong. */
  | 'corrected'
  /** Supplied by the product owner for a value the workbook does not carry. */
  | 'simulation-design';

export type QuoteVerificationStatus = 'verified' | 'needs-review' | 'blocked';

export interface QuoteMeta {
  source: QuoteSourceKind;
  status: QuoteVerificationStatus;
  /** The sheet the value came from, for example `GENERAL!TABLES`. */
  sourceSheet?: string;
  /** ISO 8601 date on which the record was last imported or reviewed. */
  lastReviewed: string;
  /** What a reviewer needs to know: what was changed, or what is missing. */
  note?: string;
}

/* -------------------------------------------------------------------------- */
/* Ports                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Terminal handling and most surcharges are looked up by the class of the port
 * of origin. The workbook assigns the class from annual TEU throughput.
 */
export type PortClass = 'A' | 'B' | 'C' | 'D';

export interface Port {
  /** Stable id, the slugified workbook name. */
  id: string;
  slug: string;
  /** The workbook's own spelling, which is what every other sheet keys on. */
  name: string;
  /** Title case for display. */
  displayName: string;
  locode: string | null;
  country: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
  /** Annual throughput in TEU, as published in the workbook. */
  teu: number | null;
  portClass: PortClass | null;
  /** Index used to scale the freight rate table, 85 to 130. */
  baseIndex: number | null;
  /** Services that call here, by service id. */
  services: string[];
  /** Per-service call details, because a port may be served by several. */
  calls: PortCall[];
  meta: QuoteMeta;
}

export interface PortCall {
  serviceId: string;
  terminal: string | null;
  agency: string | null;
  representative: string | null;
  email: string | null;
  /** Fraction of a day the vessel stays alongside. */
  timeInPortDays: number | null;
  /** Winter offset from UTC, in hours. */
  utcOffsetHours: number | null;
}

/* -------------------------------------------------------------------------- */
/* Services                                                                   */
/* -------------------------------------------------------------------------- */

export interface ServiceLeg {
  fromPortId: string;
  toPortId: string;
  distanceNm: number;
  /** Sailing time in days at the service speed. */
  transitDays: number;
  /** Time alongside at the destination port, in days. */
  timeInPortDays: number;
}

export interface Service {
  id: string;
  slug: string;
  /** The workbook's spelling, used as a key by the other sheets. */
  name: string;
  displayName: string;
  /** Design speed in knots. */
  speedKnots: number;
  /** The rotation, in order. The last leg returns to the first port. */
  legs: ServiceLeg[];
  totalDistanceNm: number;
  roundTripDays: number;
  vessels: string[];
  meta: QuoteMeta;
}

/* -------------------------------------------------------------------------- */
/* Vessels                                                                    */
/* -------------------------------------------------------------------------- */

export interface Vessel {
  id: string;
  slug: string;
  name: string;
  speedKnots: number | null;
  timeInPortDays: number | null;
  /** `null` for the vessels the workbook leaves unassigned. */
  serviceId: string | null;
  meta: QuoteMeta;
}

/* -------------------------------------------------------------------------- */
/* Equipment                                                                  */
/* -------------------------------------------------------------------------- */

/** The families the quotation form offers before narrowing to a unit type. */
export type EquipmentFamily =
  | 'container'
  | 'reefer'
  | 'flat-rack'
  | 'roll-trailer'
  | 'semi-trailer'
  | 'vehicles'
  | 'project';

export interface Equipment {
  /** The workbook's numeric id, which every tariff table keys on. */
  id: number;
  slug: string;
  /** The workbook's own label, shown to the learner unchanged. */
  name: string;
  family: EquipmentFamily;
  /** Multiplier applied to the FEU freight base. */
  freightFactor: number;
  /** Maximum payload in kilograms. */
  maxPayloadKg: number | null;
  /** Linear metres of deck or slot the unit occupies. */
  linearMetres: number;
  /** Tonnes of CO2 equivalent per TEU, used for the emissions estimate. */
  emissionsTonnesPerTeu: number | null;
  /** True when the unit needs a reefer plug. */
  requiresPlug: boolean;
  meta: QuoteMeta;
}

/* -------------------------------------------------------------------------- */
/* Tariffs                                                                    */
/* -------------------------------------------------------------------------- */

/** A value that varies with the class of the port of origin. */
export type ByPortClass = Record<PortClass, number>;

export interface Tariffs {
  /** Terminal handling, by equipment id and then port class. */
  terminalHandling: Record<number, ByPortClass>;
  /**
   * Bunker recovery base by equipment id. The charge is this value stepped up
   * by 7 % for every class the port of origin sits below A.
   */
  bunkerRecovery: Record<number, number>;
  /** Reefer plug charge by equipment id. Absent for equipment needing no plug. */
  plugInEur: Record<number, number>;
  /**
   * Kilograms of CO2 equivalent a lorry would emit per nautical mile, by
   * equipment id, used only for the comparison shown beside the sea figure.
   */
  truckEmissionsPerNm: Record<number, number>;
  /** Charged once per quotation. */
  fixedSurcharges: {
    documentation: ByPortClass;
    logisticManagement: ByPortClass;
    customsClearance: ByPortClass;
    /** US routes only. SDG Lines has none, so this is never added to a total. */
    amsManifest: ByPortClass;
  };
  /** Charged for every unit on the quotation. */
  perUnitSurcharges: {
    portTaxes: ByPortClass;
    vgmSolas: ByPortClass;
    isps: ByPortClass;
    control: ByPortClass;
    seal: ByPortClass;
    /** Charged per unit only when the learner declares dangerous goods. */
    dangerousGoods: Partial<ByPortClass>;
  };
  /** Port additional is this fraction of the terminal handling charge. */
  portAdditionalRate: number;
  /**
   * The sea freight base for a FEU, as a function of distance in nautical
   * miles. Recovered from the worked quotations; see docs/quote/pricing-model.md.
   */
  freightAnchors: Array<{ distanceNm: number; baseEur: number }>;
  meta: QuoteMeta;
}

/* -------------------------------------------------------------------------- */
/* Quotation                                                                  */
/* -------------------------------------------------------------------------- */

/** One vessel movement inside a quoted journey. */
export interface QuotedLeg {
  serviceId: string;
  fromPortId: string;
  toPortId: string;
  vesselId: string | null;
  distanceNm: number;
  transitDays: number;
}

export interface QuotationRequest {
  originPortId: string;
  destinationPortId: string;
  /** ISO 8601 date the learner would like to sail on. */
  desiredDeparture: string;
  equipmentId: number;
  quantity: number;
  dangerousGoods: boolean;
  vgmSolas: boolean;
}

export interface QuotationCharge {
  /** Machine-readable key, for tests and for the printed breakdown. */
  key: string;
  label: string;
  amountEur: number;
  /**
   * True when the amount already carries the number of units, so the breakdown
   * can say which lines a bigger booking moves and which it does not.
   */
  perUnit: boolean;
  /** Set when the amount could not be reproduced from the workbook exactly. */
  status?: QuoteVerificationStatus;
}

export interface Quotation {
  reference: string;
  request: QuotationRequest;
  /** The journey, one entry per vessel. More than one means a transshipment. */
  legs: QuotedLeg[];
  /** Direct origin-to-destination distance, which is what the price uses. */
  distanceNm: number;
  transitDays: number;
  /** The FEU reference rate for the lane, before equipment and quantity. */
  seaFreightBaseFeuEur: number;
  /** `needs-review` when that rate was interpolated rather than anchored. */
  seaFreightStatus: QuoteVerificationStatus;
  /** Every line of the quotation. The total is their sum and nothing else. */
  charges: QuotationCharge[];
  totalEur: number;
  emissionsKgCo2e: number;
  roadComparisonKgCo2e: number | null;
  co2SavedKgCo2e: number | null;
  /** Validity window, as the current process publishes it. */
  validFrom: string;
  validTo: string;
}
