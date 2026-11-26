import { describe, expect, it } from 'vitest';
import { ports } from '@/data/ports';
import { services } from '@/data/services';
import { vessels } from '@/data/vessels';
import { equipment } from '@/data/equipment';
import { cargoServices } from '@/data/cargoServices';
import { prosePages } from '@/data/pages';
import { searchIndex } from '@/lib/searchIndex';
import { PRIMARY_NAV, SITE } from '@/lib/site';
import { faq } from '@/data/faq';

/**
 * Content integrity.
 *
 * TypeScript checks that a port id is a string. It cannot check that the string
 * names a port that exists. These tests cover the gap, which is where the real
 * content bugs live: a route referencing a port that was renamed, a vessel
 * assigned to a service that was removed, two records sharing a slug.
 *
 * They run in CI on every pull request, so a data edit that breaks a link is
 * caught before it is merged rather than by a learner mid-exercise.
 */

const portIds = new Set(ports.map((port) => port.id));
const serviceIds = new Set(services.map((service) => service.id));
const vesselIds = new Set(vessels.map((vessel) => vessel.id));

describe('identifiers and slugs', () => {
  it('gives every port a unique id and slug', () => {
    expect(new Set(ports.map((p) => p.id)).size).toBe(ports.length);
    expect(new Set(ports.map((p) => p.slug)).size).toBe(ports.length);
  });

  it('gives every service a unique id, slug and code', () => {
    expect(new Set(services.map((s) => s.id)).size).toBe(services.length);
    expect(new Set(services.map((s) => s.slug)).size).toBe(services.length);
    expect(new Set(services.map((s) => s.code)).size).toBe(services.length);
  });

  it('gives every vessel a unique id, IMO, MMSI and call sign', () => {
    // An id is ours to assign, so every vessel has one and they are all distinct.
    expect(new Set(vessels.map((v) => v.id)).size).toBe(vessels.length);

    // An IMO number, an MMSI and a call sign are issued to a ship, not chosen
    // by us. The American hulls are on the register before they have any, and
    // they all read Pending until the operator supplies them. Uniqueness is
    // still required of every identifier that HAS been assigned - duplicating
    // one would be a real error - so the pending ones are excluded here and
    // held to a different rule below.
    const assigned = (value: string) => value !== 'Pending';
    for (const field of ['imo', 'mmsi', 'callSign'] as const) {
      const values = vessels.map((v) => v[field]).filter(assigned);
      expect(new Set(values).size, `two vessels share a ${field}`).toBe(values.length);
    }
  });

  it('only leaves an identifier pending on a vessel that says it is unconfirmed', () => {
    // So that Pending cannot become a permanent hiding place: a ship without
    // its numbers must be flagged for review, and will fail this the day
    // somebody marks it verified without filling them in.
    for (const vessel of vessels.filter((v) => v.imo === 'Pending')) {
      expect(
        vessel.meta.status,
        `${vessel.name} has no IMO number but is not marked for review`,
      ).not.toBe('verified');
    }
  });

  it('gives every equipment record a unique id and slug', () => {
    expect(new Set(equipment.map((e) => e.id)).size).toBe(equipment.length);
    expect(new Set(equipment.map((e) => e.slug)).size).toBe(equipment.length);
  });

  it('uses URL safe slugs everywhere', () => {
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    for (const record of [...ports, ...services, ...vessels, ...equipment]) {
      expect(record.slug, `${record.name} has an unusable slug`).toMatch(slugPattern);
    }
  });
});

describe('references between records', () => {
  it('only puts real ports in a rotation', () => {
    for (const service of services) {
      for (const call of service.rotation) {
        expect(
          portIds.has(call.portId),
          `${service.name} calls at unknown port ${call.portId}`,
        ).toBe(true);
      }
    }
  });

  it('only deploys real vessels on a service', () => {
    for (const service of services) {
      for (const vesselId of service.vesselIds) {
        expect(vesselIds.has(vesselId), `${service.name} deploys unknown vessel ${vesselId}`).toBe(
          true,
        );
      }
    }
  });

  it('only assigns a vessel to a real service', () => {
    for (const vessel of vessels) {
      if (vessel.serviceId === null) continue;
      expect(
        serviceIds.has(vessel.serviceId),
        `${vessel.name} is assigned to unknown service ${vessel.serviceId}`,
      ).toBe(true);
    }
  });

  it('only lists real services against a port', () => {
    for (const port of ports) {
      for (const serviceId of port.serviceIds) {
        expect(
          serviceIds.has(serviceId),
          `${port.displayName} lists unknown service ${serviceId}`,
        ).toBe(true);
      }
    }
  });

  it('keeps port and service links consistent in both directions', () => {
    // A port that says it is on Eastmed must appear in the Eastmed rotation,
    // and vice versa. Getting this wrong produces a port page and a route page
    // that disagree, which is worse than either being empty.
    for (const service of services) {
      const rotationPortIds = new Set(service.rotation.map((call) => call.portId));

      for (const portId of rotationPortIds) {
        const port = ports.find((candidate) => candidate.id === portId);
        expect(
          port?.serviceIds.includes(service.id),
          `${port?.displayName} is in the ${service.name} rotation but does not list it`,
        ).toBe(true);
      }

      for (const port of ports) {
        if (!port.serviceIds.includes(service.id)) continue;
        expect(
          rotationPortIds.has(port.id),
          `${port.displayName} lists ${service.name} but is not in its rotation`,
        ).toBe(true);
      }
    }
  });

  it('keeps vessel and service deployment consistent in both directions', () => {
    for (const service of services) {
      for (const vesselId of service.vesselIds) {
        const vessel = vessels.find((candidate) => candidate.id === vesselId);
        expect(
          vessel?.serviceId,
          `${vessel?.name} is deployed on ${service.name} but is assigned elsewhere`,
        ).toBe(service.id);
      }
    }

    for (const vessel of vessels) {
      if (vessel.serviceId === null) continue;
      const service = services.find((candidate) => candidate.id === vessel.serviceId);
      expect(
        service?.vesselIds.includes(vessel.id),
        `${vessel.name} is assigned to ${service?.name} but is not in its deployment`,
      ).toBe(true);
    }
  });

  it('only references real equipment from a cargo service', () => {
    const equipmentSlugs = new Set(equipment.map((item) => item.slug));
    for (const service of cargoServices) {
      for (const slug of service.equipmentSlugs) {
        expect(
          equipmentSlugs.has(slug),
          `${service.title} references unknown equipment ${slug}`,
        ).toBe(true);
      }
    }
  });

  it('gives every rotation a sequential order starting at one', () => {
    for (const service of services) {
      const orders = service.rotation.map((call) => call.order);
      expect(orders, `${service.name} rotation is not numbered sequentially`).toEqual(
        Array.from({ length: orders.length }, (_, index) => index + 1),
      );
    }
  });
});

describe('verification metadata', () => {
  it('records a review date on every record', () => {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    for (const record of [...ports, ...services, ...vessels, ...equipment]) {
      expect(record.meta.lastReviewed, `${record.name} has no valid review date`).toMatch(
        datePattern,
      );
    }
  });

  it('explains why a record needs review', () => {
    // A record flagged for review without a note tells a reviewer nothing.
    for (const record of [...ports, ...services, ...vessels, ...equipment]) {
      if (record.meta.status === 'verified') continue;
      expect(
        record.meta.reviewNote,
        `${record.name} is flagged ${record.meta.status} with no explanation`,
      ).toBeTruthy();
    }
  });
});

describe('geography', () => {
  it('places every port at a plausible position', () => {
    for (const port of ports) {
      const [latitude, longitude] = port.coordinates;
      expect(latitude, `${port.displayName} has an impossible latitude`).toBeGreaterThan(-90);
      expect(latitude, `${port.displayName} has an impossible latitude`).toBeLessThan(90);
      expect(longitude, `${port.displayName} has an impossible longitude`).toBeGreaterThan(-180);
      expect(longitude, `${port.displayName} has an impossible longitude`).toBeLessThan(180);
    }
  });

  it('uses a five character UN/LOCODE where one is given', () => {
    for (const port of ports) {
      if (!port.locode) continue;
      expect(port.locode, `${port.displayName} has a malformed LOCODE`).toMatch(/^[A-Z]{5}$/);
    }
  });

  it('starts the LOCODE with the country code', () => {
    for (const port of ports) {
      if (!port.locode) continue;
      expect(
        port.locode.startsWith(port.countryCode),
        `${port.displayName} LOCODE does not match its country code`,
      ).toBe(true);
    }
  });
});

describe('search index', () => {
  it('points every entry at an internal path', () => {
    for (const entry of searchIndex) {
      expect(entry.href, `"${entry.title}" has a malformed href`).toMatch(/^\//);
    }
  });

  it('indexes every port, service, vessel and prose page', () => {
    const hrefs = new Set(searchIndex.map((entry) => entry.href));
    for (const port of ports) expect(hrefs.has(`/ports/${port.slug}`)).toBe(true);
    for (const service of services) expect(hrefs.has(`/routes/${service.slug}`)).toBe(true);
    for (const vessel of vessels) expect(hrefs.has(`/fleet/${vessel.slug}`)).toBe(true);
    for (const page of prosePages) {
      const href = page.group === 'root' ? `/${page.slug}` : `/${page.group}/${page.slug}`;
      expect(hrefs.has(href), `${page.title} is not in the search index`).toBe(true);
    }
  });

  it('gives every entry searchable keywords', () => {
    for (const entry of searchIndex) {
      expect(entry.keywords.length, `"${entry.title}" has no keywords`).toBeGreaterThan(3);
    }
  });
});

describe('editorial rules', () => {
  it('never publishes a fabricated technical particular', () => {
    // The legacy site published no vessel particulars. Any value appearing here
    // must have arrived with a source, not with an estimate.
    for (const vessel of vessels) {
      const hasParticulars = Object.values(vessel.particulars).some((value) => value !== undefined);
      if (!hasParticulars) continue;
      expect(vessel.meta.status, `${vessel.name} publishes particulars but is not verified`).toBe(
        'verified',
      );
    }
  });

  it('never leaves a page without a description for search engines', () => {
    for (const page of prosePages) {
      expect(page.description.length, `${page.title} has no meta description`).toBeGreaterThan(50);
      expect(page.description.length, `${page.title} meta description is too long`).toBeLessThan(
        320,
      );
    }
  });
});

describe('the navigation reaches what exists', () => {
  /* Three services were published with pages, rotations and vessels, and did
     not appear in the Routes menu, because the menu was a list somebody typed
     once. A visitor who did not already know the American services existed had
     no way to find them from the header. */
  it('offers every service in the Routes menu', () => {
    const routes = PRIMARY_NAV.find((section) => section.label === 'Routes');
    expect(routes, 'the header should have a Routes section').toBeTruthy();

    const linked = new Set((routes?.children ?? []).map((child) => child.href));
    for (const service of services) {
      expect(linked, `${service.name} has a page but no menu entry`).toContain(
        `/routes/${service.slug}`,
      );
    }
  });

  /* Every menu entry has to land somewhere real, which is the same rule read
     from the other end. */
  it('points every Routes menu entry at a service that exists', () => {
    const routes = PRIMARY_NAV.find((section) => section.label === 'Routes');
    const slugs = new Set(services.map((service) => service.slug));
    for (const child of routes?.children ?? []) {
      const slug = child.href.replace('/routes/', '');
      expect(slugs, `the menu links to /routes/${slug}, which is not a service`).toContain(slug);
    }
  });
});

describe('what the site says about the Quotation Desk', () => {
  /**
   * Quotations used to be produced on this site, in the browser, sending
   * nothing. They are now produced by the Quotation Desk, a separate
   * application that POSTs the quotation - including name, e-mail address and
   * organisation - to a Google Apps Script endpoint and records it.
   *
   * When that moved, the privacy page, the FAQ, the digitalisation page and the
   * accessibility statement were all left describing the old arrangement. For a
   * month this site told visitors their details never left their device while a
   * page it linked to was recording them.
   *
   * Nothing caught it, because every one of those sentences is still perfectly
   * grammatical and the tests only checked that pages rendered. These tests
   * check the claim instead.
   */
  const quotationCopy = [
    ...faq.map((item) => ({ where: `FAQ: ${item.question}`, text: item.answer })),
    ...prosePages.flatMap((page) =>
      page.sections.flatMap((section) =>
        section.blocks.flatMap((block) => {
          const text =
            'text' in block
              ? block.text
              : 'items' in block && Array.isArray(block.items)
                ? block.items
                    .map((entry) =>
                      typeof entry === 'string'
                        ? entry
                        : 'definition' in entry
                          ? `${entry.term} ${entry.definition}`
                          : '',
                    )
                    .join(' ')
                : '';
          return text ? [{ where: `${page.title} / ${section.heading}`, text }] : [];
        }),
      ),
    ),
  ];

  /** Sentences that were true of the old in-page wizard and are false now. */
  const FALSE_OF_THE_DESK = [
    'nothing is transmitted or stored',
    'never leaves your device',
    'no request is sent to any server',
    'sends nothing anywhere',
    'nothing you type into a form on this site is transmitted',
  ];

  it('never claims the quotation stays on the visitor device', () => {
    for (const entry of quotationCopy) {
      const haystack = entry.text.toLowerCase();
      if (!haystack.includes('quotation') && !haystack.includes('quote')) continue;

      for (const claim of FALSE_OF_THE_DESK) {
        expect(
          haystack.includes(claim),
          `"${entry.where}" says "${claim}" about the quotation. The Quotation Desk records it.`,
        ).toBe(false);
      }
    }
  });

  it('tells visitors the Quotation Desk records what they enter', () => {
    const privacy = prosePages.find((page) => page.slug === 'privacy');
    expect(privacy, 'there should be a privacy page').toBeTruthy();

    const everything = privacy!.sections
      .flatMap((section) => section.blocks.map((block) => ('text' in block ? block.text : '')))
      .join(' ')
      .toLowerCase();

    expect(everything).toContain('quotation desk');
    expect(
      everything.includes('recorded') || everything.includes('records'),
      'the privacy page should say the Quotation Desk records what is entered',
    ).toBe(true);
  });

  it('points the hand-off at the Quotation Desk and nowhere else', () => {
    // A relative path here would silently send learners to a page that no
    // longer exists, because the wizard it used to open has been removed.
    expect(SITE.quotationDeskUrl).toMatch(/^https:\/\//);
  });
});

describe('godmothers', () => {
  /**
   * These are living people, named on a public site. Everything else on this
   * site is either a verifiable fact or declared simulation; a godmother is
   * neither, and the only source is the product owner's own record.
   *
   * Two of the ten exist in that record as an invitation with no reply. Naming
   * someone as the godmother of a ship on the strength of an invitation she may
   * have declined is a claim about a real person that nobody has checked, so
   * those two are held and not published.
   */
  it('records a date and a status for every godmother', () => {
    for (const vessel of vessels) {
      if (!vessel.godmother) continue;
      expect(
        vessel.godmother.name.trim().length,
        `${vessel.name} has an empty godmother`,
      ).toBeGreaterThan(1);
      expect(vessel.godmother.recorded, `${vessel.name} godmother has no date`).toMatch(
        /^\d{4}-\d{2}-\d{2}$/,
      );
      expect(['confirmed', 'invited']).toContain(vessel.godmother.status);
    }
  });

  it('never gives two ships the same godmother', () => {
    const names = vessels.filter((v) => v.godmother).map((v) => v.godmother!.name);
    expect(new Set(names).size, 'a godmother appears on more than one vessel').toBe(names.length);
  });

  it('only attaches a godmother to a ship that has a name', () => {
    // A hull awaiting its name cannot have been christened.
    for (const vessel of vessels) {
      if (!vessel.godmother) continue;
      expect(vessel.namesake, `${vessel.name} has a godmother but no namesake`).not.toBeNull();
    }
  });
});

/**
 * Where we send people for Port Virtual Lab.
 *
 * The apex pvl.one does not serve the site: it has no certificate, so HTTPS
 * fails at the handshake, and over plain HTTP it answers 404. Only
 * www.pvl.one responds. Every link here pointed at the apex, which meant the
 * header, the hero, the footer and three prose pages all led to a dead end,
 * and nothing in the build complained.
 *
 * Pinning the host is the cheapest guard available. A link that silently
 * stops working is not something a type checker or an accessibility run can
 * see.
 */
describe('the Port Virtual Lab link points at the host that actually serves it', () => {
  const PVL_HOST = 'https://www.pvl.one';

  it('the site-wide URL uses the www host', () => {
    expect(SITE.pvlUrl.startsWith(PVL_HOST)).toBe(true);
  });

  it('no prose page links to the apex, which does not resolve over HTTPS', () => {
    for (const page of prosePages) {
      for (const section of page.sections) {
        for (const block of section.blocks) {
          if (block.type !== 'links') continue;
          for (const link of block.items) {
            if (!/\bpvl\.one/.test(link.href)) continue;
            expect(
              link.href.startsWith(PVL_HOST),
              `${page.slug}: "${link.label}" points at ${link.href}, which does not serve`,
            ).toBe(true);
          }
        }
      }
    }
  });
});
