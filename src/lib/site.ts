/**
 * Site-wide constants and the navigation model.
 *
 * The legacy site put every route, every vessel and all 36 ports directly into
 * the primary navigation, which produced a menu with more than seventy items.
 * The structure below is deliberately capped at seven sections; the long lists
 * live behind searchable directories instead.
 */

export const SITE = {
  name: 'SDG Lines',
  /** Used in the <title> suffix and in structured data. */
  legalName: 'SDG Lines',
  tagline: 'The simulated shipping line of Port Virtual Lab',
  description:
    'SDG Lines is the simulated shipping company of Port Virtual Lab, created by Escola Europea - Intermodal Transport for education and professional training. Explore routes, vessels, ports and cargo services in a safe digital learning environment.',
  operator: 'Escola Europea - Intermodal Transport',
  operatorUrl: 'https://escolaeuropea.eu',
  pvlUrl: 'https://pvl.one',
  contactEmail: 'info@escolaeuropea.eu',
  address: {
    street: 'Moll de Barcelona - Terminal Drassanes',
    postalCode: '08039',
    city: 'Barcelona',
    country: 'Spain',
  },
  linkedIn: 'https://www.linkedin.com/company/escola-europea-intermodal-transport/',
  /** Language of the published site. Additional locales are not yet enabled. */
  locale: 'en',
  /** Shown wherever the simulated nature of the site has to be unambiguous. */
  simulationNotice:
    'SDG Lines is an educational simulation. It does not provide real transport services.',
} as const;

export interface NavChild {
  label: string;
  href: string;
  /** One line shown under the label in the desktop mega menu. */
  description?: string;
}

export interface NavSection {
  label: string;
  href: string;
  children?: NavChild[];
}

/**
 * Primary navigation. Seven sections, each one a real destination in its own
 * right rather than a folder that only exists to hold children.
 */
export const PRIMARY_NAV: NavSection[] = [
  {
    label: 'Services',
    href: '/services',
    children: [
      {
        label: 'Container services',
        href: '/services/containers',
        description: 'Standard, high cube and open top equipment across the network',
      },
      {
        label: 'Ro-Ro services',
        href: '/services/roro',
        description: 'Accompanied and unaccompanied rolling cargo',
      },
      {
        label: 'Cold chain',
        href: '/services/cold-chain',
        description: 'Reefer containers and temperature controlled cargo',
      },
      {
        label: 'Dangerous goods',
        href: '/services/dangerous-goods',
        description: 'IMDG classified cargo and declaration requirements',
      },
      {
        label: 'Project cargo',
        href: '/services/project-cargo',
        description: 'Out of gauge, heavy lift and breakbulk shipments',
      },
      {
        label: 'Motorways of the Sea',
        href: '/services/motorways-of-the-sea',
        description: 'Road to sea modal shift on short sea relations',
      },
    ],
  },
  {
    label: 'Routes',
    href: '/routes',
    children: [
      {
        label: 'Westmed',
        href: '/routes/westmed',
        description: 'Western Mediterranean and Maghreb',
      },
      { label: 'Eastmed', href: '/routes/eastmed', description: 'Aegean, Levant and Nile delta' },
      {
        label: 'Optimed',
        href: '/routes/optimed',
        description: 'Central Mediterranean and Adriatic',
      },
      { label: 'EurAsia', href: '/routes/eurasia', description: 'North Europe to the Far East' },
      { label: 'Gimnesias', href: '/routes/gimnesias', description: 'Barcelona to the Balearics' },
    ],
  },
  {
    label: 'Fleet',
    href: '/fleet',
    children: [
      {
        label: 'All vessels',
        href: '/fleet',
        description: 'Search and filter the fourteen vessels',
      },
      {
        label: 'The spirit of the vessels',
        href: '/fleet/spirit',
        description: 'The women the fleet is named after',
      },
    ],
  },
  {
    label: 'Ports',
    href: '/ports',
    children: [
      {
        label: 'Port directory',
        href: '/ports',
        description: 'All 36 ports, searchable and filterable',
      },
      {
        label: 'Network map',
        href: '/ports/map',
        description: 'Interactive map of services and calls',
      },
      {
        label: 'Agency network',
        href: '/ports/agencies',
        description: 'Local offices and representatives',
      },
    ],
  },
  {
    label: 'Equipment',
    href: '/equipment',
    children: [
      {
        label: 'Containers',
        href: '/equipment/containers',
        description: 'Dry, high cube and open top',
      },
      { label: 'Reefers', href: '/equipment/reefers', description: 'Temperature controlled units' },
      {
        label: 'Flat racks',
        href: '/equipment/flat-racks',
        description: 'Out of gauge and heavy cargo',
      },
      {
        label: 'Roll trailers',
        href: '/equipment/roll-trailers',
        description: 'Ro-Ro cargo carriers',
      },
      {
        label: 'Packing guidance',
        href: '/equipment/packing',
        description: 'How to pack and secure a unit',
      },
    ],
  },
  {
    label: 'Resources',
    href: '/resources',
    children: [
      {
        label: 'Arrival charges',
        href: '/resources/arrival-charges',
        description: 'Local charges by port',
      },
      {
        label: 'Documentation',
        href: '/resources/documentation',
        description: 'Transport documents explained',
      },
      {
        label: 'Downloads',
        href: '/resources/downloads',
        description: 'Data sheets and reference files',
      },
      {
        label: 'Track a shipment',
        href: '/resources/tracking',
        description: 'Simulated tracking for exercises',
      },
      {
        label: 'News and updates',
        href: '/resources/news',
        description: 'What has changed in the simulation',
      },
    ],
  },
  {
    label: 'About',
    href: '/about',
    children: [
      {
        label: 'About SDG Lines',
        href: '/about',
        description: 'What the simulation is and how to use it',
      },
      {
        label: 'Port Virtual Lab',
        href: '/about/port-virtual-lab',
        description: 'The wider learning environment',
      },
      {
        label: 'Sustainability',
        href: '/about/sustainability',
        description: 'The SDGs in the simulation',
      },
      {
        label: 'Digitalisation',
        href: '/about/digitalisation',
        description: 'Digital operations in the simulation',
      },
      { label: 'Quality', href: '/about/quality', description: 'How the content is reviewed' },
      { label: 'Legal notice', href: '/legal', description: 'Copyright, trademarks and licence' },
    ],
  },
];

/** Actions that stay reachable from every page. */
export const UTILITY_NAV = {
  quote: { label: 'Request a quote', href: '/request-a-quote' },
  arrivalCharges: { label: 'Arrival charges', href: '/resources/arrival-charges' },
  search: { label: 'Search', href: '/search' },
  pvl: { label: 'Access PVL.ONE', href: SITE.pvlUrl, external: true },
} as const;

export const FOOTER_NAV: { heading: string; links: NavChild[] }[] = [
  {
    heading: 'Operations',
    links: [
      { label: 'Request a quotation', href: '/request-a-quote' },
      { label: 'Arrival charges', href: '/resources/arrival-charges' },
      { label: 'Track a shipment', href: '/resources/tracking' },
      { label: 'Documentation', href: '/resources/documentation' },
      { label: 'Customer service', href: '/resources/customer-service' },
    ],
  },
  {
    heading: 'Network',
    links: [
      { label: 'All routes', href: '/routes' },
      { label: 'Port directory', href: '/ports' },
      { label: 'Network map', href: '/ports/map' },
      { label: 'The fleet', href: '/fleet' },
      { label: 'Agency network', href: '/ports/agencies' },
    ],
  },
  {
    heading: 'Cargo',
    links: [
      { label: 'Containers', href: '/equipment/containers' },
      { label: 'Reefers and cold chain', href: '/equipment/reefers' },
      { label: 'Flat racks', href: '/equipment/flat-racks' },
      { label: 'Roll trailers', href: '/equipment/roll-trailers' },
      { label: 'Dangerous goods', href: '/services/dangerous-goods' },
    ],
  },
  {
    heading: 'About the simulation',
    links: [
      { label: 'About SDG Lines', href: '/about' },
      { label: 'Port Virtual Lab', href: '/about/port-virtual-lab' },
      { label: 'Sustainability', href: '/about/sustainability' },
      { label: 'Accessibility', href: '/accessibility' },
      { label: 'Legal notice', href: '/legal' },
    ],
  },
];

/**
 * Prefix an internal path with the deployment base path.
 *
 * On GitHub Pages the site is served from `/sdglines/`, on the custom domain it
 * will be served from `/`. Every internal link goes through here so that the
 * move between the two is a configuration change and not a find and replace.
 */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalisedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalisedPath = path.startsWith('/') ? path : `/${path}`;
  if (normalisedPath === '/') {
    return `${normalisedBase}/`;
  }
  return `${normalisedBase}${normalisedPath}`;
}

/** True when `href` points outside the site. */
export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}
