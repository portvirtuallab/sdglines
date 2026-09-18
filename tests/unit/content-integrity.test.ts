import { describe, expect, it } from 'vitest';
import { ports } from '@/data/ports';
import { services } from '@/data/services';
import { vessels } from '@/data/vessels';
import { equipment } from '@/data/equipment';
import { cargoServices } from '@/data/cargoServices';
import { prosePages } from '@/data/pages';
import { searchIndex } from '@/lib/searchIndex';

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
    expect(new Set(vessels.map((v) => v.id)).size).toBe(vessels.length);
    expect(new Set(vessels.map((v) => v.imo)).size).toBe(vessels.length);
    expect(new Set(vessels.map((v) => v.mmsi)).size).toBe(vessels.length);
    expect(new Set(vessels.map((v) => v.callSign)).size).toBe(vessels.length);
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
