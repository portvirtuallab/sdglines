import type { CargoCapability, EquipmentCategory, VesselType } from '@/types/content';

/**
 * Human readable labels for the enumerated values in the content model.
 *
 * Kept in one place so that a term is worded identically on a route page, a
 * port page and a quotation form. Inconsistent labelling for the same concept
 * was one of the audit findings, and it matters more than it sounds: a learner
 * who sees "Reefer" in one place and "Cold chain" in another cannot tell
 * whether they are the same option.
 */

export const CAPABILITY_LABELS: Record<CargoCapability, string> = {
  containers: 'Containers',
  roro: 'Ro-Ro',
  reefer: 'Reefer and cold chain',
  'dangerous-goods': 'Dangerous goods',
  'project-cargo': 'Project cargo',
  'motorways-of-the-sea': 'Motorways of the Sea',
  'express-transit': 'Express transit',
};

export const CAPABILITY_DESCRIPTIONS: Record<CargoCapability, string> = {
  containers: 'Dry, high cube and open top containers.',
  roro: 'Accompanied and unaccompanied rolling cargo.',
  reefer: 'Temperature controlled units with monitoring.',
  'dangerous-goods': 'IMDG classified cargo, subject to declaration.',
  'project-cargo': 'Out of gauge, heavy lift and breakbulk.',
  'motorways-of-the-sea': 'Short sea relations designed for modal shift.',
  'express-transit': 'Priority handling on selected relations.',
};

export const VESSEL_TYPE_LABELS: Record<VesselType, string> = {
  PCTC: 'Pure car and truck carrier',
  ConRo: 'Container and Ro-Ro vessel',
  'Autonomous electric cargo vessel': 'Autonomous electric cargo vessel',
};

export const EQUIPMENT_CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  container: 'Dry container',
  reefer: 'Reefer container',
  'flat-rack': 'Flat rack',
  'roll-trailer': 'Roll trailer',
  'open-top': 'Open top container',
};

/**
 * The string shown wherever a value exists in the model but has not been
 * confirmed. Using one constant means the phrase never drifts, and a reader
 * learns to recognise it as "nobody has signed this off" rather than reading it
 * as a different kind of unknown each time.
 */
export const TO_BE_CONFIRMED = 'To be confirmed';

/** Format a number with thin spacing for thousands, or the TBC string. */
export function formatNumber(value: number | undefined, unit?: string): string {
  if (value === undefined) return TO_BE_CONFIRMED;
  const formatted = new Intl.NumberFormat('en-GB').format(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

/** Format a measurement in metres to one decimal place, or the TBC string. */
export function formatMetres(value: number | undefined): string {
  if (value === undefined) return TO_BE_CONFIRMED;
  return `${value.toFixed(2).replace(/\.00$/, '')} m`;
}
