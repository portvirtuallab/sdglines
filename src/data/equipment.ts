import type { Equipment } from '@/types/content';

/**
 * Equipment catalogue.
 *
 * The legacy site listed container types with nominal sizes only ("20' x 8' x
 * 8'6\"") and published no tare, payload or internal dimensions, which are the
 * three figures a learner actually needs to decide whether a cargo fits.
 *
 * The values here are the nominal ISO 668 / ISO 1496 figures used across the
 * industry, so they are real world facts rather than simulation design. They
 * are marked `verified` on that basis, with one caveat recorded on every
 * record: real units vary by builder and by age, so an exercise that turns on
 * a few centimetres or a hundred kilograms should use the actual unit data.
 *
 * Roll trailers are the exception. They are not standardised the way containers
 * are, so those records carry a review note.
 */

const REVIEW_DATE = '2026-09-18';

const ISO_NOTE =
  'Nominal ISO dimensions and weights. Individual units vary by builder and by age; use the data plate on the actual unit where a few centimetres or kilograms decide the case.';

export const equipment: Equipment[] = [
  {
    id: 'dry-20',
    slug: 'dry-20',
    name: "20' standard container",
    category: 'container',
    isoCode: '22G1',
    summary:
      'The base unit of container shipping and the reference against which capacity is counted: one 20 foot unit is one TEU.',
    typicalUse: [
      'Dense cargo that reaches the weight limit before it fills the volume',
      'General palletised goods on short sea relations',
      'The default choice when an exercise does not specify equipment',
    ],
    dimensions: {
      nominalLengthFt: 20,
      externalLengthM: 6.058,
      externalWidthM: 2.438,
      externalHeightM: 2.591,
      internalLengthM: 5.898,
      internalWidthM: 2.352,
      internalHeightM: 2.393,
      tareKg: 2230,
      maxPayloadKg: 28200,
      capacityM3: 33.2,
    },
    meta: { source: 'real-world', status: 'verified', lastReviewed: REVIEW_DATE, reviewNote: ISO_NOTE },
  },
  {
    id: 'dry-40',
    slug: 'dry-40',
    name: "40' standard container",
    category: 'container',
    isoCode: '42G1',
    summary:
      'Twice the length of a 20 foot unit for only a little more tare, which makes it the cheaper option per cubic metre for light cargo.',
    typicalUse: [
      'Volume cargo that fills the box before it reaches the weight limit',
      'Consumer goods, textiles and packaging',
      'Long haul relations where slot cost per cubic metre matters most',
    ],
    dimensions: {
      nominalLengthFt: 40,
      externalLengthM: 12.192,
      externalWidthM: 2.438,
      externalHeightM: 2.591,
      internalLengthM: 12.032,
      internalWidthM: 2.352,
      internalHeightM: 2.393,
      tareKg: 3740,
      maxPayloadKg: 26740,
      capacityM3: 67.7,
    },
    meta: { source: 'real-world', status: 'verified', lastReviewed: REVIEW_DATE, reviewNote: ISO_NOTE },
  },
  {
    id: 'high-cube-40',
    slug: 'high-cube-40',
    name: "40' high cube container",
    category: 'container',
    isoCode: '45G1',
    summary:
      'A 40 foot unit with roughly 30 centimetres of extra internal height, giving about nine cubic metres more volume.',
    typicalUse: [
      'Light, bulky cargo where volume runs out before weight',
      'Cargo stacked one pallet higher than a standard box allows',
      'Machinery that is just too tall for a standard container',
    ],
    dimensions: {
      nominalLengthFt: 40,
      externalLengthM: 12.192,
      externalWidthM: 2.438,
      externalHeightM: 2.896,
      internalLengthM: 12.032,
      internalWidthM: 2.352,
      internalHeightM: 2.698,
      tareKg: 3980,
      maxPayloadKg: 26500,
      capacityM3: 76.3,
    },
    meta: { source: 'real-world', status: 'verified', lastReviewed: REVIEW_DATE, reviewNote: ISO_NOTE },
  },
  {
    id: 'high-cube-45',
    slug: 'high-cube-45',
    name: "45' high cube container",
    category: 'container',
    isoCode: 'L5G1',
    summary:
      'The longest standard box in common use, sized so that European road pallets load without the waste a 40 foot unit leaves.',
    typicalUse: [
      'European pallet loads on short sea and intermodal relations',
      'Cargo where the extra five feet removes a second unit from the shipment',
    ],
    dimensions: {
      nominalLengthFt: 45,
      externalLengthM: 13.716,
      externalWidthM: 2.438,
      externalHeightM: 2.896,
      internalLengthM: 13.556,
      internalWidthM: 2.352,
      internalHeightM: 2.698,
      tareKg: 4800,
      maxPayloadKg: 25600,
      capacityM3: 86.0,
    },
    meta: { source: 'real-world', status: 'verified', lastReviewed: REVIEW_DATE, reviewNote: ISO_NOTE },
  },
  {
    id: 'reefer-20',
    slug: 'reefer-20',
    name: "20' reefer container",
    category: 'reefer',
    isoCode: '22R1',
    summary:
      'An insulated 20 foot unit with an integral refrigeration machine. The machinery takes internal length, so a reefer holds noticeably less than a dry box of the same size.',
    typicalUse: [
      'Fruit, vegetables and fresh produce',
      'Pharmaceuticals under controlled temperature',
      'Any cargo needing a recorded temperature history',
    ],
    dimensions: {
      nominalLengthFt: 20,
      externalLengthM: 6.058,
      externalWidthM: 2.438,
      externalHeightM: 2.591,
      internalLengthM: 5.449,
      internalWidthM: 2.294,
      internalHeightM: 2.273,
      tareKg: 3000,
      maxPayloadKg: 27400,
      capacityM3: 28.3,
    },
    meta: { source: 'real-world', status: 'verified', lastReviewed: REVIEW_DATE, reviewNote: ISO_NOTE },
  },
  {
    id: 'reefer-40-hc',
    slug: 'reefer-40-hc',
    name: "40' high cube reefer container",
    category: 'reefer',
    isoCode: '45R1',
    summary:
      'The standard unit of the cold chain on long haul relations, using bottom air delivery to hold an even temperature through the stow.',
    typicalUse: [
      'Long haul fresh and frozen cargo',
      'Meat, fish and dairy',
      'Temperature sensitive cargo on the EurAsia service',
    ],
    dimensions: {
      nominalLengthFt: 40,
      externalLengthM: 12.192,
      externalWidthM: 2.438,
      externalHeightM: 2.896,
      internalLengthM: 11.577,
      internalWidthM: 2.294,
      internalHeightM: 2.547,
      tareKg: 4200,
      maxPayloadKg: 29000,
      capacityM3: 67.3,
    },
    meta: { source: 'real-world', status: 'verified', lastReviewed: REVIEW_DATE, reviewNote: ISO_NOTE },
  },
  {
    id: 'open-top-20',
    slug: 'open-top-20',
    name: "20' open top container",
    category: 'open-top',
    isoCode: '22U1',
    summary:
      'A 20 foot unit with a removable tarpaulin roof, so that cargo can be craned in from above rather than driven in through the doors.',
    typicalUse: [
      'Cargo loaded by overhead crane',
      'Items slightly over standard height, carried under tarpaulin',
      'Machinery that cannot be manoeuvred through an end door',
    ],
    dimensions: {
      nominalLengthFt: 20,
      externalLengthM: 6.058,
      externalWidthM: 2.438,
      externalHeightM: 2.591,
      internalLengthM: 5.894,
      internalWidthM: 2.342,
      internalHeightM: 2.311,
      tareKg: 2350,
      maxPayloadKg: 28130,
      capacityM3: 32.0,
    },
    meta: { source: 'real-world', status: 'verified', lastReviewed: REVIEW_DATE, reviewNote: ISO_NOTE },
  },
  {
    id: 'flat-rack-20',
    slug: 'flat-rack-20',
    name: "20' flat rack",
    category: 'flat-rack',
    isoCode: '22P1',
    summary:
      'A container floor with end walls and no sides or roof, for cargo that is wider or taller than any closed box.',
    typicalUse: [
      'Out of gauge machinery and vehicles',
      'Pipes, steel sections and timber',
      'Heavy concentrated loads within the floor rating',
    ],
    dimensions: {
      nominalLengthFt: 20,
      externalLengthM: 6.058,
      externalWidthM: 2.438,
      externalHeightM: 2.591,
      internalLengthM: 5.618,
      internalWidthM: 2.208,
      internalHeightM: 2.213,
      tareKg: 2900,
      maxPayloadKg: 30100,
    },
    meta: { source: 'real-world', status: 'verified', lastReviewed: REVIEW_DATE, reviewNote: ISO_NOTE },
  },
  {
    id: 'flat-rack-40',
    slug: 'flat-rack-40',
    name: "40' flat rack",
    category: 'flat-rack',
    isoCode: '42P1',
    summary:
      'The 40 foot version, rated for the heaviest project cargo SDG Lines accepts on a container service.',
    typicalUse: [
      'Long out of gauge cargo such as boats and blades',
      'Transformers and industrial plant',
      'Project shipments that would otherwise need breakbulk handling',
    ],
    dimensions: {
      nominalLengthFt: 40,
      externalLengthM: 12.192,
      externalWidthM: 2.438,
      externalHeightM: 2.591,
      internalLengthM: 11.832,
      internalWidthM: 2.228,
      internalHeightM: 1.955,
      tareKg: 5700,
      maxPayloadKg: 39300,
    },
    meta: { source: 'real-world', status: 'verified', lastReviewed: REVIEW_DATE, reviewNote: ISO_NOTE },
  },
  {
    id: 'roll-trailer-40',
    slug: 'roll-trailer-40',
    name: "40' roll trailer",
    category: 'roll-trailer',
    summary:
      'A low, heavy duty platform towed on and off the vessel by a terminal tractor. The unit never leaves the port: cargo is loaded onto it at the terminal.',
    typicalUse: [
      'Cargo too heavy or awkward for a container',
      'Breakbulk consolidated onto one platform',
      'Ro-Ro shipments on the Optimed and Westmed services',
    ],
    dimensions: {
      nominalLengthFt: 40,
      externalLengthM: 12.2,
      externalWidthM: 2.5,
      maxPayloadKg: 60000,
    },
    meta: {
      source: 'simulation-design',
      status: 'needs-review',
      lastReviewed: REVIEW_DATE,
      reviewNote:
        'Roll trailers are not standardised the way ISO containers are; length, deck height and rating vary widely between terminals and operators. The figures here are typical rather than specified. Product owner to confirm the units used in the simulation.',
    },
  },
  {
    id: 'roll-trailer-62',
    slug: 'roll-trailer-62',
    name: "62' roll trailer",
    category: 'roll-trailer',
    summary:
      'The long platform used for project cargo that will not fit on a 40 foot trailer, and for consolidating several units into one lift.',
    typicalUse: [
      'Long project cargo such as pipes and structural steel',
      'Two 20 foot units carried as one movement',
      'Heavy lift cargo within the deck rating',
    ],
    dimensions: {
      nominalLengthFt: 62,
      externalLengthM: 18.9,
      externalWidthM: 2.5,
      maxPayloadKg: 80000,
    },
    meta: {
      source: 'simulation-design',
      status: 'needs-review',
      lastReviewed: REVIEW_DATE,
      reviewNote:
        'As for the 40 foot roll trailer: dimensions and rating are typical rather than specified. Product owner to confirm.',
    },
  },
];

export function getEquipmentById(id: string): Equipment | undefined {
  return equipment.find((item) => item.id === id);
}

export function getEquipmentByCategory(category: Equipment['category']): Equipment[] {
  return equipment.filter((item) => item.category === category);
}
