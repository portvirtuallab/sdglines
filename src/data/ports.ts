import type { CargoCapability, Port, Region } from '@/types/content';

/**
 * The SDG Lines port directory.
 *
 * The 36 ports below are the ports of call published on the legacy site and
 * audited on 2026-09-18. Three kinds of data are mixed here, and they are not
 * equally reliable:
 *
 *   - Country, region, UN/LOCODE and coordinates are real world facts. They can
 *     be checked against any public source and are marked `real-world`.
 *   - The service calls follow from the rotations defined in `services.ts`.
 *     Those rotations are a documented proposal awaiting product owner sign-off,
 *     so the service links inherit that status.
 *   - Agency e-mail addresses follow the `city.country@sdglines.com` convention
 *     observed on the legacy Port of Barcelona page. The convention is applied
 *     consistently here so that learners can predict an address; it is
 *     simulation design, not a real mailbox.
 *
 * Throughput figures are only present where the legacy site published one.
 * Nothing is estimated.
 */

const AUDIT_DATE = '2026-09-18';

/** Capability sets used repeatedly, named so the intent is readable. */
const FULL_SERVICE: CargoCapability[] = [
  'containers',
  'roro',
  'reefer',
  'dangerous-goods',
  'project-cargo',
  'motorways-of-the-sea',
  'express-transit',
];
const CONTAINER_AND_RORO: CargoCapability[] = ['containers', 'roro', 'reefer'];
const CONTAINER_HUB: CargoCapability[] = ['containers', 'reefer', 'dangerous-goods'];

interface PortSeed {
  slug: string;
  city: string;
  country: string;
  countryCode: string;
  region: Region;
  locode: string;
  coordinates: [number, number];
  summary: string;
  services: string[];
  capabilities: CargoCapability[];
  /** Agency slug used to build the e-mail address; defaults to the city slug. */
  agencySlug?: string;
  annualThroughputTeu?: number;
  contactName?: string;
  phone?: string;
  reviewNote?: string;
}

const seeds: PortSeed[] = [
  {
    slug: 'barcelona',
    city: 'Barcelona',
    country: 'Spain',
    countryCode: 'ES',
    region: 'Western Mediterranean',
    locode: 'ESBCN',
    coordinates: [41.3497, 2.1589],
    summary:
      'Home port of SDG Lines and the base of the Escola Europea training terminal at Moll de Barcelona. Every published service calls here.',
    services: ['westmed', 'eastmed', 'optimed', 'eurasia', 'gimnesias'],
    capabilities: FULL_SERVICE,
    annualThroughputTeu: 3_000_000,
    contactName: 'Joan Mariné Rodriguez',
    reviewNote:
      'Throughput, agency contact name and capability list copied from the legacy Port of Barcelona page.',
  },
  {
    slug: 'valencia',
    city: 'Valencia',
    country: 'Spain',
    countryCode: 'ES',
    region: 'Western Mediterranean',
    locode: 'ESVLC',
    coordinates: [39.4425, -0.3156],
    summary:
      'The busiest container port on the Spanish Mediterranean coast and the western turning point of the EurAsia service.',
    services: ['westmed', 'eurasia'],
    capabilities: FULL_SERVICE,
  },
  {
    slug: 'palma-de-mallorca',
    city: 'Palma de Mallorca',
    country: 'Spain',
    countryCode: 'ES',
    region: 'Western Mediterranean',
    locode: 'ESPMI',
    coordinates: [39.5622, 2.6283],
    summary:
      'Island port serving the Balearics. The Gimnesias service links it directly to Barcelona.',
    services: ['gimnesias'],
    capabilities: CONTAINER_AND_RORO,
  },
  {
    slug: 'las-palmas',
    city: 'Las Palmas',
    country: 'Spain',
    countryCode: 'ES',
    region: 'Atlantic Europe',
    locode: 'ESLPA',
    coordinates: [28.1408, -15.4163],
    summary:
      'Atlantic hub in the Canary Islands, used on the Westmed Atlantic extension as the transhipment point for West African cargo.',
    services: ['westmed'],
    capabilities: CONTAINER_HUB,
  },
  {
    slug: 'marseille',
    city: 'Marseille',
    country: 'France',
    countryCode: 'FR',
    region: 'Western Mediterranean',
    locode: 'FRMRS',
    coordinates: [43.3417, 5.3542],
    summary:
      'Principal French Mediterranean port and a Motorways of the Sea connection towards the Rhône corridor.',
    services: ['westmed'],
    capabilities: FULL_SERVICE,
  },
  {
    slug: 'le-havre',
    city: 'Le Havre',
    country: 'France',
    countryCode: 'FR',
    region: 'North Europe',
    locode: 'FRLEH',
    coordinates: [49.4839, 0.1072],
    summary: 'Atlantic gateway to the Seine valley and Paris, called on the EurAsia service.',
    services: ['eurasia'],
    capabilities: CONTAINER_HUB,
  },
  {
    slug: 'genoa',
    city: 'Genoa',
    country: 'Italy',
    countryCode: 'IT',
    region: 'Western Mediterranean',
    locode: 'ITGOA',
    coordinates: [44.4056, 8.9083],
    summary:
      'Ligurian port connecting northern Italy and southern Germany to the Mediterranean short sea network.',
    services: ['westmed', 'eastmed'],
    capabilities: FULL_SERVICE,
  },
  {
    slug: 'civitavecchia',
    city: 'Civitavecchia',
    country: 'Italy',
    countryCode: 'IT',
    region: 'Western Mediterranean',
    locode: 'ITCVV',
    coordinates: [42.0939, 11.7892],
    summary: 'Port of Rome and a Ro-Ro call on the Eastmed service.',
    services: ['eastmed'],
    capabilities: CONTAINER_AND_RORO,
  },
  {
    slug: 'palermo',
    city: 'Palermo',
    country: 'Italy',
    countryCode: 'IT',
    region: 'Western Mediterranean',
    locode: 'ITPMO',
    coordinates: [38.1281, 13.3703],
    summary: 'Sicilian port on the Optimed rotation, at the crossing between the two Mediterranean basins.',
    services: ['optimed'],
    capabilities: CONTAINER_AND_RORO,
  },
  {
    slug: 'bari',
    city: 'Bari',
    country: 'Italy',
    countryCode: 'IT',
    region: 'Adriatic',
    locode: 'ITBRI',
    coordinates: [41.1339, 16.8697],
    summary: 'Adriatic Ro-Ro port linking southern Italy with Albania and Montenegro.',
    services: ['optimed'],
    capabilities: CONTAINER_AND_RORO,
  },
  {
    slug: 'durres',
    city: 'Durrës',
    country: 'Albania',
    countryCode: 'AL',
    region: 'Adriatic',
    locode: 'ALDRZ',
    coordinates: [41.3089, 19.4533],
    summary: 'The main Albanian seaport and an Optimed Ro-Ro call.',
    services: ['optimed'],
    capabilities: ['roro', 'containers'],
  },
  {
    slug: 'bar',
    city: 'Bar',
    country: 'Montenegro',
    countryCode: 'ME',
    region: 'Adriatic',
    locode: 'MEBAR',
    coordinates: [42.0939, 19.0904],
    summary: 'Montenegrin port on the Adriatic leg of the Optimed service.',
    services: ['optimed'],
    capabilities: ['roro', 'containers'],
  },
  {
    slug: 'valletta',
    city: 'Valletta',
    country: 'Malta',
    countryCode: 'MT',
    region: 'Western Mediterranean',
    locode: 'MTMLA',
    coordinates: [35.8931, 14.5086],
    summary:
      'Central Mediterranean transhipment point, close to the main east to west shipping lane.',
    services: ['optimed'],
    capabilities: CONTAINER_HUB,
    reviewNote: 'Published on the legacy site as "Port of Valleta". Correct spelling is Valletta.',
  },
  {
    slug: 'piraeus',
    city: 'Piraeus',
    country: 'Greece',
    countryCode: 'GR',
    region: 'Eastern Mediterranean',
    locode: 'GRPIR',
    coordinates: [37.9475, 23.6367],
    summary: 'The port of Athens and the principal Aegean gateway on the Eastmed service.',
    services: ['eastmed'],
    capabilities: FULL_SERVICE,
    reviewNote: 'Published on the legacy site as "Port of Pireaus". Correct spelling is Piraeus.',
  },
  {
    slug: 'izmir',
    city: 'Izmir',
    country: 'Türkiye',
    countryCode: 'TR',
    region: 'Eastern Mediterranean',
    locode: 'TRIZM',
    coordinates: [38.4325, 27.1428],
    summary: 'Aegean port serving western Anatolia, called on the Eastmed service.',
    services: ['eastmed'],
    capabilities: FULL_SERVICE,
  },
  {
    slug: 'beirut',
    city: 'Beirut',
    country: 'Lebanon',
    countryCode: 'LB',
    region: 'Eastern Mediterranean',
    locode: 'LBBEY',
    coordinates: [33.9017, 35.5186],
    summary: 'Levantine port and the eastern turning point of the Eastmed rotation.',
    services: ['eastmed'],
    capabilities: CONTAINER_HUB,
  },
  {
    slug: 'port-said',
    city: 'Port Said',
    country: 'Egypt',
    countryCode: 'EG',
    region: 'Eastern Mediterranean',
    locode: 'EGPSD',
    coordinates: [31.2653, 32.3019],
    summary:
      'At the Mediterranean entrance to the Suez Canal, where the Eastmed and EurAsia services meet.',
    services: ['eastmed', 'eurasia'],
    capabilities: FULL_SERVICE,
  },
  {
    slug: 'damietta',
    city: 'Damietta',
    country: 'Egypt',
    countryCode: 'EG',
    region: 'Eastern Mediterranean',
    locode: 'EGDAM',
    coordinates: [31.4653, 31.7597],
    summary: 'Nile delta container port west of Port Said, called on the Eastmed service.',
    services: ['eastmed'],
    capabilities: CONTAINER_HUB,
    reviewNote: 'Published on the legacy site at the URL /danietta. Correct spelling is Damietta.',
  },
  {
    slug: 'misurata',
    city: 'Misurata',
    country: 'Libya',
    countryCode: 'LY',
    region: 'North Africa',
    locode: 'LYMRA',
    coordinates: [32.3708, 15.2194],
    summary: 'Libyan Ro-Ro and container port on the Optimed rotation.',
    services: ['optimed'],
    capabilities: ['roro', 'containers', 'project-cargo'],
  },
  {
    slug: 'rades-la-goulette',
    city: 'Radès - La Goulette',
    country: 'Tunisia',
    countryCode: 'TN',
    region: 'North Africa',
    locode: 'TNRDS',
    coordinates: [36.7994, 10.2811],
    summary: 'The port complex of Tunis, combining the Radès container terminal and La Goulette.',
    services: ['optimed'],
    capabilities: CONTAINER_AND_RORO,
    agencySlug: 'tunis',
  },
  {
    slug: 'algiers',
    city: 'Algiers',
    country: 'Algeria',
    countryCode: 'DZ',
    region: 'North Africa',
    locode: 'DZALG',
    coordinates: [36.7667, 3.0628],
    summary: 'Capital port of Algeria and a Westmed call for containers and rolling cargo.',
    services: ['westmed'],
    capabilities: CONTAINER_AND_RORO,
    reviewNote: 'Published on the legacy site as "Port of Algier". Correct English name is Algiers.',
  },
  {
    slug: 'oran',
    city: 'Oran',
    country: 'Algeria',
    countryCode: 'DZ',
    region: 'North Africa',
    locode: 'DZORN',
    coordinates: [35.7089, -0.6417],
    summary: 'Western Algerian port on the Westmed rotation.',
    services: ['westmed'],
    capabilities: CONTAINER_AND_RORO,
    reviewNote:
      'The legacy navigation linked this port to the malformed URL /https-//sdglines-com/port-of-oran, which returned an error page.',
  },
  {
    slug: 'tanger-med',
    city: 'Tanger Med',
    country: 'Morocco',
    countryCode: 'MA',
    region: 'North Africa',
    locode: 'MAPTM',
    coordinates: [35.8833, -5.5069],
    summary:
      'Transhipment hub at the Strait of Gibraltar, where Westmed cargo transfers between the Mediterranean and the Atlantic.',
    services: ['westmed'],
    capabilities: FULL_SERVICE,
  },
  {
    slug: 'casablanca',
    city: 'Casablanca',
    country: 'Morocco',
    countryCode: 'MA',
    region: 'North Africa',
    locode: 'MACAS',
    coordinates: [33.6050, -7.6167],
    summary: 'The principal Atlantic port of Morocco, served by the Westmed Atlantic extension.',
    services: ['westmed'],
    capabilities: CONTAINER_AND_RORO,
  },
  {
    slug: 'nouakchott',
    city: 'Nouakchott',
    country: 'Mauritania',
    countryCode: 'MR',
    region: 'West Africa',
    locode: 'MRNKC',
    coordinates: [18.0333, -16.0333],
    summary: 'West African call on the Westmed Atlantic extension, reached via Las Palmas.',
    services: ['westmed'],
    capabilities: ['containers', 'project-cargo'],
    reviewNote:
      'The legacy navigation linked this port to the malformed URL /https-//sdglines-com/port-of-nouakchott, which returned an error page.',
  },
  {
    slug: 'lisbon',
    city: 'Lisbon',
    country: 'Portugal',
    countryCode: 'PT',
    region: 'Atlantic Europe',
    locode: 'PTLIS',
    coordinates: [38.7033, -9.1706],
    summary: 'Atlantic port on the Iberian leg of the EurAsia service.',
    services: ['eurasia'],
    capabilities: CONTAINER_HUB,
  },
  {
    slug: 'antwerp',
    city: 'Antwerp',
    country: 'Belgium',
    countryCode: 'BE',
    region: 'North Europe',
    locode: 'BEANR',
    coordinates: [51.2603, 4.4011],
    summary: 'Major North Sea container and breakbulk port, called on the EurAsia service.',
    services: ['eurasia'],
    capabilities: FULL_SERVICE,
  },
  {
    slug: 'rotterdam',
    city: 'Rotterdam',
    country: 'Netherlands',
    countryCode: 'NL',
    region: 'North Europe',
    locode: 'NLRTM',
    coordinates: [51.9225, 4.4792],
    summary: 'The largest European port and the northern anchor of the EurAsia rotation.',
    services: ['eurasia'],
    capabilities: FULL_SERVICE,
  },
  {
    slug: 'hamburg',
    city: 'Hamburg',
    country: 'Germany',
    countryCode: 'DE',
    region: 'North Europe',
    locode: 'DEHAM',
    coordinates: [53.5403, 9.9678],
    summary: 'German gateway on the Elbe, called on the EurAsia service.',
    services: ['eurasia'],
    capabilities: FULL_SERVICE,
  },
  {
    slug: 'felixstowe',
    city: 'Felixstowe',
    country: 'United Kingdom',
    countryCode: 'GB',
    region: 'North Europe',
    locode: 'GBFXT',
    coordinates: [51.9542, 1.3103],
    summary: 'The principal United Kingdom container port, called on the EurAsia service.',
    services: ['eurasia'],
    capabilities: CONTAINER_HUB,
    reviewNote:
      'Published on the legacy site at the URL /port-of-felixtowe. Correct spelling is Felixstowe.',
  },
  {
    slug: 'aqaba',
    city: 'Aqaba',
    country: 'Jordan',
    countryCode: 'JO',
    region: 'Red Sea',
    locode: 'JOAQJ',
    coordinates: [29.5267, 35.0064],
    summary: 'The only Jordanian seaport, at the head of the Gulf of Aqaba on the EurAsia service.',
    services: ['eurasia'],
    capabilities: CONTAINER_AND_RORO,
  },
  {
    slug: 'jeddah',
    city: 'Jeddah',
    country: 'Saudi Arabia',
    countryCode: 'SA',
    region: 'Red Sea',
    locode: 'SAJED',
    coordinates: [21.4833, 39.1833],
    summary: 'Red Sea hub on the EurAsia service, serving the western Saudi market.',
    services: ['eurasia'],
    capabilities: FULL_SERVICE,
  },
  {
    slug: 'salalah',
    city: 'Salalah',
    country: 'Oman',
    countryCode: 'OM',
    region: 'Indian Ocean',
    locode: 'OMSLL',
    coordinates: [16.9500, 54.0083],
    summary: 'Deep water transhipment hub on the Arabian Sea, on the EurAsia rotation.',
    services: ['eurasia'],
    capabilities: CONTAINER_HUB,
  },
  {
    slug: 'abu-dhabi',
    city: 'Abu Dhabi',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    region: 'Arabian Gulf',
    locode: 'AEAUH',
    coordinates: [24.4667, 54.3667],
    summary: 'Arabian Gulf call on the EurAsia service, serving the Emirates industrial zones.',
    services: ['eurasia'],
    capabilities: FULL_SERVICE,
    reviewNote:
      'Published on the legacy site at the URL /port-of-abu-dahbi. Correct spelling is Abu Dhabi.',
  },
  {
    slug: 'mumbai',
    city: 'Mumbai',
    country: 'India',
    countryCode: 'IN',
    region: 'Indian Ocean',
    locode: 'INBOM',
    coordinates: [18.9500, 72.8400],
    summary: 'Indian west coast call on the EurAsia service.',
    services: ['eurasia'],
    capabilities: CONTAINER_HUB,
  },
  {
    slug: 'busan',
    city: 'Busan',
    country: 'South Korea',
    countryCode: 'KR',
    region: 'Far East',
    locode: 'KRPUS',
    coordinates: [35.1000, 129.0403],
    summary: 'The eastern terminus of the EurAsia service and its Far East transhipment point.',
    services: ['eurasia'],
    capabilities: FULL_SERVICE,
  },
];

/**
 * Build the agency e-mail address for a port.
 *
 * The convention `city.country@sdglines.com` is taken from the legacy Port of
 * Barcelona page (`barcelona.spain@sdglines.com`) and applied consistently so
 * that a learner can work out any office address from the port name alone.
 */
function buildAgencyEmail(seed: PortSeed): string {
  const city = (seed.agencySlug ?? seed.slug).replace(/-/g, '');
  const country = seed.country
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]/g, '');
  return `${city}.${country}@sdglines.com`;
}

export const ports: Port[] = seeds.map((seed) => ({
  id: seed.slug,
  slug: seed.slug,
  name: seed.city,
  displayName: `Port of ${seed.city}`,
  country: seed.country,
  countryCode: seed.countryCode,
  region: seed.region,
  locode: seed.locode,
  coordinates: seed.coordinates,
  summary: seed.summary,
  serviceIds: seed.services,
  capabilities: seed.capabilities,
  annualThroughputTeu: seed.annualThroughputTeu,
  agency: {
    officeName: `SDG Lines Agency ${seed.city}`,
    email: buildAgencyEmail(seed),
    contactName: seed.contactName,
    phone: seed.phone,
  },
  meta: {
    source: 'real-world',
    status: seed.reviewNote ? 'needs-review' : 'verified',
    lastReviewed: AUDIT_DATE,
    reviewNote: seed.reviewNote,
  },
}));

/** Every distinct country in the directory, alphabetically. */
export const portCountries: string[] = [...new Set(ports.map((p) => p.country))].sort((a, b) =>
  a.localeCompare(b),
);

/** Every distinct region in the directory, alphabetically. */
export const portRegions: Region[] = [...new Set(ports.map((p) => p.region))].sort((a, b) =>
  a.localeCompare(b),
) as Region[];

export function getPortById(id: string): Port | undefined {
  return ports.find((port) => port.id === id);
}

/** Ports served by a given service, in directory order. */
export function getPortsByService(serviceId: string): Port[] {
  return ports.filter((port) => port.serviceIds.includes(serviceId));
}
