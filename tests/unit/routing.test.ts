/**
 * The routing engine must reach the same itineraries the current process does.
 *
 * `tests/fixtures/published-routes.json` holds the distinct origin-destination
 * routings from `BOOKINGS!Routes`, which is what the Google Form resolves
 * against today. Reproducing them is what makes the new tool a replacement
 * rather than a second opinion.
 */

import { describe, expect, it } from 'vitest';
import published from '../fixtures/published-routes.json';
import { bestJourney, findJourneys, reachableFrom } from '@/lib/quote/routing';
import { getPort, quotablePorts, services } from '@/lib/quote/network';

interface PublishedRoute {
  originId: string;
  destinationId: string;
  legs: Array<{ serviceId: string; toPortId: string }>;
}

const routes = published as PublishedRoute[];

/**
 * The shape of an itinerary, with consecutive legs on the same service merged.
 *
 * The published routings sometimes split one continuous ride into two rows at
 * an intermediate call - `eurasia>barcelona | eurasia>yantian` is a single
 * EurAsia voyage that happens to pass through Barcelona, not a transshipment.
 * The routing engine expresses that as one leg. Merging before comparing comes
 * down to asking whether the same cargo sits on the same vessels in the same
 * order, which is the question that matters.
 */
const shapeOf = (legs: Array<{ serviceId: string; toPortId: string }>) => {
  const merged: Array<{ serviceId: string; toPortId: string }> = [];
  for (const leg of legs) {
    const previous = merged[merged.length - 1];
    if (previous?.serviceId === leg.serviceId) previous.toPortId = leg.toPortId;
    else merged.push({ ...leg });
  }
  return merged.map((leg) => `${leg.serviceId}>${leg.toPortId}`).join(' | ');
};

describe('the published routings', () => {
  it('are all between ports the network knows', () => {
    for (const route of routes) {
      expect(getPort(route.originId), route.originId).toBeDefined();
      expect(getPort(route.destinationId), route.destinationId).toBeDefined();
    }
  });
});

describe('journey search', () => {
  it('finds a journey for every published routing', () => {
    const missing = routes
      .filter((route) => !bestJourney(route.originId, route.destinationId))
      .map((route) => `${route.originId} -> ${route.destinationId}`);
    expect(missing).toEqual([]);
  });

  it('offers the published itinerary among its results', () => {
    const notOffered: string[] = [];
    for (const route of routes) {
      const wanted = shapeOf(route.legs);
      const offered = findJourneys(route.originId, route.destinationId).map((journey) =>
        shapeOf(journey.legs.map((leg) => ({ serviceId: leg.serviceId, toPortId: leg.toPortId }))),
      );
      if (!offered.includes(wanted)) {
        notOffered.push(`${route.originId} -> ${route.destinationId}: wanted ${wanted}`);
      }
    }
    expect(notOffered).toEqual([]);
  });

  it('never uses more than three vessels', () => {
    for (const origin of quotablePorts.slice(0, 12)) {
      for (const destination of quotablePorts.slice(0, 12)) {
        if (origin.id === destination.id) continue;
        for (const journey of findJourneys(origin.id, destination.id)) {
          expect(journey.legs.length).toBeLessThanOrEqual(3);
        }
      }
    }
  });

  it('returns the most direct journeys first, and the faster one within each', () => {
    for (const route of routes) {
      const journeys = findJourneys(route.originId, route.destinationId);
      for (let i = 1; i < journeys.length; i++) {
        const previous = journeys[i - 1];
        const current = journeys[i];
        expect(current.legs.length).toBeGreaterThanOrEqual(previous.legs.length);
        if (current.legs.length === previous.legs.length) {
          expect(current.transitDays).toBeGreaterThanOrEqual(previous.transitDays);
        }
      }
    }
  });

  it('never transships where a single service already connects the two ports', () => {
    const unnecessary: string[] = [];
    for (const route of routes) {
      const best = bestJourney(route.originId, route.destinationId);
      if (!best || best.legs.length === 1) continue;
      const direct = findJourneys(route.originId, route.destinationId).find(
        (journey) => journey.legs.length === 1,
      );
      if (direct) unnecessary.push(`${route.originId} -> ${route.destinationId}`);
    }
    expect(unnecessary).toEqual([]);
  });

  it('never routes a port to itself', () => {
    for (const port of quotablePorts) {
      expect(findJourneys(port.id, port.id)).toEqual([]);
    }
  });
});

describe('reachability', () => {
  it('lists a destination if and only if a journey exists', () => {
    // The form builds its destination select from this. If the two ever
    // disagree, a learner picks a port and is then told it cannot be served.
    const disagreements: string[] = [];
    for (const origin of quotablePorts) {
      const reachable = reachableFrom(origin.id);
      for (const destination of quotablePorts) {
        if (origin.id === destination.id) continue;
        const routable = bestJourney(origin.id, destination.id) != null;
        if (routable !== reachable.has(destination.id)) {
          disagreements.push(
            `${origin.id} -> ${destination.id}: routable=${routable}, listed=${reachable.has(destination.id)}`,
          );
        }
      }
    }
    expect(disagreements.slice(0, 10)).toEqual([]);
  });

  it('never lists the origin as its own destination', () => {
    for (const port of quotablePorts) {
      expect(reachableFrom(port.id).has(port.id), port.id).toBe(false);
    }
  });

  it('reaches something from every port on the network', () => {
    for (const port of quotablePorts) {
      expect(reachableFrom(port.id).size, port.id).toBeGreaterThan(0);
    }
  });
});

describe('the rotations themselves', () => {
  it('form closed rings, so a vessel returns to where it started', () => {
    for (const service of services) {
      for (let i = 1; i < service.legs.length; i++) {
        expect(service.legs[i].fromPortId, `${service.name} leg ${i + 1}`).toBe(
          service.legs[i - 1].toPortId,
        );
      }
      expect(service.legs[service.legs.length - 1].toPortId, `${service.name} closes`).toBe(
        service.legs[0].fromPortId,
      );
    }
  });
});
