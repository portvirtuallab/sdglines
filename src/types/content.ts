/**
 * Content model for the SDG Lines website.
 *
 * Every content type shares a common `VerificationMeta` block. SDG Lines is a
 * simulation, so a reader cannot tell by inspection whether a number is a real
 * world fact (the geographic position of a port), an operational value that the
 * product owner defined for the simulation (a vessel call sign), or a value that
 * nobody has confirmed yet.
 *
 * Recording that distinction in the data - rather than in the memory of whoever
 * happens to maintain the site - is what stops unverified values from being
 * published as if they were facts.
 */

/** Where a value came from, and therefore how much weight it can carry. */
export type SourceKind =
  /** Copied from the existing sdglines.com website during the 2026 audit. */
  | 'legacy-site'
  /** A verifiable real world fact, such as a country or a geographic position. */
  | 'real-world'
  /** Defined by the product owner specifically for the simulation. */
  | 'simulation-design'
  /** Derived from other verified values by a documented rule. */
  | 'derived';

/** How far a value has travelled through review. */
export type VerificationStatus =
  /** Checked against its source and approved for publication. */
  | 'verified'
  /** Carried over from the legacy site but not yet reviewed by the owner. */
  | 'inherited'
  /** Known to be missing or disputed. Must not be presented as fact. */
  | 'needs-review';

export interface VerificationMeta {
  source: SourceKind;
  status: VerificationStatus;
  /** ISO 8601 date (YYYY-MM-DD) on which the record was last reviewed. */
  lastReviewed: string;
  /** Free text for reviewers: what is uncertain and what would settle it. */
  reviewNote?: string;
}

/** Fields that every addressable content record needs. */
export interface ContentRecord {
  /** Stable identifier. Never reuse an id for a different record. */
  id: string;
  /** URL segment. Lowercase, hyphenated, no diacritics. */
  slug: string;
  name: string;
  meta: VerificationMeta;
}

/* -------------------------------------------------------------------------- */
/* Ports                                                                      */
/* -------------------------------------------------------------------------- */

export type Region =
  | 'Western Mediterranean'
  | 'Eastern Mediterranean'
  | 'Adriatic'
  | 'North Africa'
  | 'West Africa'
  | 'Atlantic Europe'
  | 'North Europe'
  | 'Red Sea'
  | 'Arabian Gulf'
  | 'Indian Ocean'
  | 'Far East';

export type CargoCapability =
  | 'containers'
  | 'roro'
  | 'reefer'
  | 'dangerous-goods'
  | 'project-cargo'
  | 'motorways-of-the-sea'
  | 'express-transit';

export interface PortAgency {
  /** Agency office name within the simulation. */
  officeName: string;
  email: string;
  contactName?: string;
  phone?: string;
}

export interface Port extends ContentRecord {
  /** Display name used in running text, e.g. "Port of Barcelona". */
  displayName: string;
  country: string;
  /** ISO 3166-1 alpha-2 country code, used for flags and filtering. */
  countryCode: string;
  region: Region;
  /** UN/LOCODE, e.g. "ESBCN". Real world identifier. */
  locode?: string;
  /** [latitude, longitude] in decimal degrees. */
  coordinates: [number, number];
  /** One or two sentences of context. Written for this site, not copied. */
  summary: string;
  /** Ids of the services calling at this port. */
  serviceIds: string[];
  /** Cargo capabilities available at this port within the simulation. */
  capabilities: CargoCapability[];
  /** Simulated local agency. */
  agency?: PortAgency;
  /** Simulated throughput figure, when the owner has defined one. */
  annualThroughputTeu?: number;
}

/* -------------------------------------------------------------------------- */
/* Services (the commercial routes)                                           */
/* -------------------------------------------------------------------------- */

export interface RotationCall {
  portId: string;
  /** Position in the rotation, starting at 1. */
  order: number;
  /**
   * Transit time in days from the first port of the rotation. Undefined when
   * the product owner has not confirmed the schedule.
   */
  transitDaysFromOrigin?: number;
}

export interface Service extends ContentRecord {
  /** Short code used in schedules and quotations, e.g. "EMED". */
  code: string;
  /** Geographic scope in one line, e.g. "Western Mediterranean to Levant". */
  coverage: string;
  summary: string;
  /** Longer description, rendered as paragraphs. */
  description: string[];
  /** Ports in rotation order. Each entry references a port id. */
  rotation: RotationCall[];
  /** e.g. "Weekly". Undefined when the owner has not confirmed a frequency. */
  frequency?: string;
  /** Ids of the vessels deployed on this service. */
  vesselIds: string[];
  /** Cargo types accepted on this service. */
  capabilities: CargoCapability[];
  /** Accent colour used for this service on maps and schedules. */
  mapColor: string;
}

/* -------------------------------------------------------------------------- */
/* Vessels                                                                    */
/* -------------------------------------------------------------------------- */

export type VesselType = 'PCTC' | 'ConRo' | 'Autonomous electric cargo vessel';

export interface Namesake {
  fullName: string;
  lifespan: string;
  field: string;
  /** Two to four sentences. Written for this site from public biography. */
  biography: string;
}

/** Technical particulars. Every field is optional: unconfirmed stays absent. */
export interface VesselParticulars {
  lengthOverallM?: number;
  beamM?: number;
  draughtM?: number;
  deadweightT?: number;
  teuCapacity?: number;
  laneMetres?: number;
  serviceSpeedKn?: number;
  reeferPlugs?: number;
}

export interface Vessel extends ContentRecord {
  /** Class or design name as recorded on the legacy site, e.g. "Nanjing". */
  className: string;
  vesselType: VesselType;
  /** IMO number within the simulation. */
  imo: string;
  /** MMSI within the simulation. */
  mmsi: string;
  /** International call sign within the simulation. */
  callSign: string;
  yearLaunched: number;
  /** Id of the service the vessel is deployed on, or null when unassigned. */
  serviceId: string | null;
  /** The woman the vessel is named after. */
  namesake: Namesake;
  particulars: VesselParticulars;
}

/* -------------------------------------------------------------------------- */
/* Equipment                                                                  */
/* -------------------------------------------------------------------------- */

export type EquipmentCategory =
  | 'container'
  | 'reefer'
  | 'flat-rack'
  | 'roll-trailer'
  | 'open-top';

export interface EquipmentDimensions {
  /** Nominal length in feet, e.g. 20, 40, 45. */
  nominalLengthFt?: number;
  externalLengthM?: number;
  externalWidthM?: number;
  externalHeightM?: number;
  internalLengthM?: number;
  internalWidthM?: number;
  internalHeightM?: number;
  tareKg?: number;
  maxPayloadKg?: number;
  capacityM3?: number;
}

export interface Equipment extends ContentRecord {
  category: EquipmentCategory;
  /** ISO size/type code where one applies, e.g. "22G1". */
  isoCode?: string;
  summary: string;
  /** What this unit is normally used for, in two or three short points. */
  typicalUse: string[];
  dimensions: EquipmentDimensions;
}
