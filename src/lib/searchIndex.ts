import { ports } from '@/data/ports';
import { services } from '@/data/services';
import { vessels } from '@/data/vessels';
import { equipment } from '@/data/equipment';
import { cargoServices } from '@/data/cargoServices';
import { prosePages } from '@/data/pages';
import { arrivalCharges } from '@/data/arrivalCharges';

/**
 * The search index.
 *
 * Built at compile time from the same data the pages render, so a record can
 * never be findable but missing, or present but unfindable. It is small enough
 * (a few hundred entries) that shipping it as JSON and matching in the browser
 * is faster than any server round trip would be, and it works offline.
 */
export interface SearchEntry {
  /** What the entry is, used for grouping and for the type chip. */
  type: 'Port' | 'Route' | 'Vessel' | 'Equipment' | 'Service' | 'Charge' | 'Page';
  title: string;
  /** One line shown under the title. */
  subtitle: string;
  href: string;
  /** Lowercased terms matched against the query. Never shown. */
  keywords: string;
}

/**
 * Which equipment family page a unit is documented on.
 *
 * Open top units live on the containers page rather than having a page of their
 * own, because that is how a learner thinks of them.
 */
const EQUIPMENT_FAMILY_SLUG: Record<string, string> = {
  container: 'containers',
  'open-top': 'containers',
  reefer: 'reefers',
  'flat-rack': 'flat-racks',
  'roll-trailer': 'roll-trailers',
};

function normalise(...parts: (string | undefined)[]): string {
  return parts
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export const searchIndex: SearchEntry[] = [
  ...ports.map<SearchEntry>((port) => ({
    type: 'Port',
    title: port.displayName,
    subtitle: `${port.country} · ${port.region}`,
    href: `/ports/${port.slug}`,
    keywords: normalise(
      port.name,
      port.displayName,
      port.country,
      port.region,
      port.locode,
      port.summary,
      'port call terminal',
    ),
  })),

  ...services.map<SearchEntry>((service) => ({
    type: 'Route',
    title: `${service.name} service`,
    subtitle: service.coverage,
    href: `/routes/${service.slug}`,
    keywords: normalise(
      service.name,
      service.code,
      service.coverage,
      service.summary,
      'route rotation schedule service',
    ),
  })),

  ...vessels.map<SearchEntry>((vessel) => ({
    type: 'Vessel',
    title: vessel.name,
    subtitle: `${vessel.vesselType} · IMO ${vessel.imo}`,
    href: `/fleet/${vessel.slug}`,
    keywords: normalise(
      vessel.name,
      vessel.namesake.fullName,
      vessel.vesselType,
      vessel.className,
      vessel.imo,
      vessel.mmsi,
      vessel.callSign,
      vessel.namesake.field,
      'ship vessel fleet',
    ),
  })),

  ...equipment.map<SearchEntry>((item) => ({
    type: 'Equipment',
    title: item.name,
    subtitle: item.isoCode ? `ISO ${item.isoCode}` : 'Terminal equipment',
    href: `/equipment/${EQUIPMENT_FAMILY_SLUG[item.category]}`,
    keywords: normalise(
      item.name,
      item.isoCode,
      item.category,
      item.summary,
      'container box unit equipment dimensions payload tare',
    ),
  })),

  ...cargoServices.map<SearchEntry>((service) => ({
    type: 'Service',
    title: service.title,
    subtitle: service.summary,
    href: `/services/${service.slug}`,
    keywords: normalise(service.title, service.summary, service.capability, 'cargo service'),
  })),

  ...arrivalCharges.map<SearchEntry>((charge) => ({
    type: 'Charge',
    title: `${charge.code} – ${charge.name}`,
    subtitle: `${charge.basis}, paid by ${charge.payer.toLowerCase()}`,
    href: '/resources/arrival-charges',
    keywords: normalise(
      charge.code,
      charge.name,
      charge.description,
      'arrival charge local charges cost tariff',
    ),
  })),

  ...prosePages.map<SearchEntry>((page) => ({
    type: 'Page',
    title: page.title,
    subtitle: page.intro,
    href: page.group === 'root' ? `/${page.slug}` : `/${page.group}/${page.slug}`,
    keywords: normalise(
      page.title,
      page.intro,
      page.description,
      page.sections.map((section) => section.heading).join(' '),
    ),
  })),

  // Hand written entries for the pages that are not generated from data.
  {
    type: 'Page',
    title: 'Request a simulated quotation',
    subtitle: 'Build a quotation for a shipment in your exercise',
    href: '/quote',
    keywords: normalise('quote quotation rate booking request price shipment'),
  },
  {
    type: 'Page',
    title: 'Port directory',
    subtitle: 'All 36 ports of call, searchable and filterable',
    href: '/ports',
    keywords: normalise('ports directory list countries regions'),
  },
  {
    type: 'Page',
    title: 'Network map',
    subtitle: 'Interactive map of services and ports of call',
    href: '/ports/map',
    keywords: normalise('map interactive network chart geography'),
  },
  {
    type: 'Page',
    title: 'The fleet',
    subtitle: 'Fourteen vessels with their technical register',
    href: '/fleet',
    keywords: normalise('fleet vessels ships register imo'),
  },
  {
    type: 'Page',
    title: 'The spirit of the vessels',
    subtitle: 'The women the fleet is named after',
    href: '/fleet/spirit',
    keywords: normalise('spirit names women scientists namesake biography'),
  },
  {
    type: 'Page',
    title: 'Equipment catalogue',
    subtitle: 'Containers, reefers, flat racks and roll trailers compared',
    href: '/equipment',
    keywords: normalise('equipment containers dimensions payload tare comparison'),
  },
  {
    type: 'Page',
    title: 'Packing guidance',
    subtitle: 'How to pack and secure a container or trailer',
    href: '/equipment/packing',
    keywords: normalise('packing stuffing lashing securing dunnage weight distribution'),
  },
  {
    type: 'Page',
    title: 'Agency network',
    subtitle: 'Local offices across the network',
    href: '/ports/agencies',
    keywords: normalise('agency agencies offices representatives contact'),
  },
];
