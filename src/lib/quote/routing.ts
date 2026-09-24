/**
 * Routing across the SDG Lines network.
 *
 * A service is a fixed rotation: a ring of legs a vessel sails in order and
 * repeats. Getting from one port to another therefore means riding one service
 * from the port it calls at to a later call on the same rotation, and changing
 * service at a port where two rotations meet.
 *
 * The current process solves this in a spreadsheet and publishes the answers in
 * `BOOKINGS!Routes`. This module solves it directly, and `tests/unit/routing`
 * checks it against those published answers so that the two agree.
 *
 * Two rules come from the published routes and are worth stating:
 *
 *   - At most two transshipments, so at most three vessels.
 *   - A journey with fewer vessels is preferred, and only then the faster one.
 *
 * That second rule is the important one, and it is not the obvious choice. The
 * transit times here are sailing times: they count the days at sea and the days
 * alongside at the ports a rotation passes through, because that is what the
 * workbook states. They cannot count the wait for a connecting vessel, because
 * SDG Lines publishes no sailing frequency for anything to be waited for.
 *
 * Ranking on time alone therefore flatters transshipment - Barcelona to
 * Damietta comes out a day quicker over three vessels than on the direct
 * Optimed service, which no operator would offer and which the current process
 * does not. Until a schedule exists, the number of vessels is the honest
 * tie-breaker, and it agrees with every routing the workbook publishes.
 */

import { ports, services } from './network';
import type { QuotedLeg, Service, ServiceLeg } from '@/types/quote';

/** The most vessels a single quotation may use. */
const MAX_LEGS = 3;

export interface Journey {
  legs: QuotedLeg[];
  /** Total sailing time including the time spent alongside at intermediate ports. */
  transitDays: number;
  /** Distance actually sailed, which is not what the price is based on. */
  sailedDistanceNm: number;
}

/**
 * Ride one service from `fromPortId` as far as `toPortId`, following the
 * rotation in order and wrapping around its end at most once.
 *
 * Returns `null` when the service calls at the origin but never reaches the
 * destination before coming back round to where it started.
 */
function ride(
  service: Service,
  fromPortId: string,
  toPortId: string,
): { legs: ServiceLeg[]; transitDays: number; distanceNm: number } | null {
  const start = service.legs.findIndex((leg) => leg.fromPortId === fromPortId);
  if (start < 0) return null;

  const legs: ServiceLeg[] = [];
  let transitDays = 0;
  let distanceNm = 0;

  for (let step = 0; step < service.legs.length; step++) {
    const leg = service.legs[(start + step) % service.legs.length];
    legs.push(leg);
    distanceNm += leg.distanceNm;
    transitDays += leg.transitDays;

    if (leg.toPortId === toPortId) return { legs, transitDays, distanceNm };

    // Time alongside only counts at ports the vessel passes through, not at the
    // one where the cargo is discharged.
    transitDays += leg.timeInPortDays;
  }

  return null;
}

/** Every port a service calls at, in rotation order from a given port. */
function callsAfter(service: Service, fromPortId: string): string[] {
  const start = service.legs.findIndex((leg) => leg.fromPortId === fromPortId);
  if (start < 0) return [];
  return service.legs.map((_, step) => service.legs[(start + step) % service.legs.length].toPortId);
}

/** Collapse a run of rotation legs into the single vessel movement it is. */
function toQuotedLeg(service: Service, legs: ServiceLeg[], transitDays: number): QuotedLeg {
  return {
    serviceId: service.id,
    fromPortId: legs[0].fromPortId,
    toPortId: legs[legs.length - 1].toPortId,
    vesselId: service.vessels[0] ?? null,
    distanceNm: legs.reduce((sum, leg) => sum + leg.distanceNm, 0),
    transitDays: round(transitDays),
  };
}

/**
 * Find every reasonable way to move cargo between two ports.
 *
 * The search is deliberately exhaustive rather than clever: the network has five
 * services and 57 legs, so enumerating journeys of up to three vessels costs
 * nothing and avoids the subtle wrong answers a heuristic would give.
 *
 * Results are sorted with the fewest vessels first, then fastest.
 */
export function findJourneys(originPortId: string, destinationPortId: string): Journey[] {
  if (originPortId === destinationPortId) return [];

  const key = `${originPortId}>${destinationPortId}`;
  const remembered = journeyCache.get(key);
  if (remembered) return remembered;

  const found: Journey[] = [];

  const search = (
    currentPortId: string,
    legs: QuotedLeg[],
    transitDays: number,
    sailedDistanceNm: number,
    usedServices: string[],
  ) => {
    for (const service of services) {
      // Riding the same service twice in a row is never an improvement: the
      // rotation would simply have carried the cargo further the first time.
      if (usedServices[usedServices.length - 1] === service.id) continue;

      const direct = ride(service, currentPortId, destinationPortId);
      if (direct) {
        found.push({
          legs: [...legs, toQuotedLeg(service, direct.legs, direct.transitDays)],
          transitDays: round(transitDays + direct.transitDays),
          sailedDistanceNm: sailedDistanceNm + direct.distanceNm,
        });
      }

      if (legs.length + 1 >= MAX_LEGS) continue;

      // Otherwise change service somewhere this rotation calls.
      for (const callPortId of callsAfter(service, currentPortId)) {
        if (callPortId === destinationPortId || callPortId === currentPortId) continue;
        if (legs.some((leg) => leg.fromPortId === callPortId)) continue;

        const hop = ride(service, currentPortId, callPortId);
        if (!hop) continue;

        search(
          callPortId,
          [...legs, toQuotedLeg(service, hop.legs, hop.transitDays)],
          // Changing vessel costs the time the next one spends alongside, which
          // the rotation already accounts for in the leg that follows.
          transitDays + hop.transitDays,
          sailedDistanceNm + hop.distanceNm,
          [...usedServices, service.id],
        );
      }
    }
  };

  search(originPortId, [], 0, 0, []);

  const journeys = dedupe(found).sort(
    (a, b) => a.legs.length - b.legs.length || a.transitDays - b.transitDays,
  );
  journeyCache.set(key, journeys);
  return journeys;
}

/**
 * The network is fixed at build time, so a pair only ever has one answer.
 *
 * Without this the form re-solves the whole network on every keystroke: picking
 * an origin asks `reachableFrom`, which asks for a journey to each of the other
 * 36 ports, and React re-runs that on each render.
 */
const journeyCache = new Map<string, Journey[]>();

/**
 * The journey a quotation uses: the most direct one, and the fastest among
 * those. `null` when the network does not connect the two ports at all.
 */
export function bestJourney(originPortId: string, destinationPortId: string): Journey | null {
  return findJourneys(originPortId, destinationPortId)[0] ?? null;
}

/**
 * Destinations reachable from a port, so the form can narrow its second select.
 *
 * This asks the journey search rather than reasoning about the rotations a
 * second time. An earlier version walked the services itself, which was faster
 * and wrong in the way that matters: it could offer a destination the search
 * then refused, so a learner picked a port and was told it could not be served.
 * One question, one answer, even where the answer costs more to get.
 */
export function reachableFrom(originPortId: string): Set<string> {
  const remembered = reachableCache.get(originPortId);
  if (remembered) return remembered;

  const reachable = new Set<string>();
  for (const port of ports) {
    if (port.id === originPortId) continue;
    if (bestJourney(originPortId, port.id)) reachable.add(port.id);
  }

  reachableCache.set(originPortId, reachable);
  return reachable;
}

const reachableCache = new Map<string, Set<string>>();

const round = (value: number) => Math.round(value * 1e6) / 1e6;

function dedupe(journeys: Journey[]): Journey[] {
  const seen = new Map<string, Journey>();
  for (const journey of journeys) {
    const key = journey.legs.map((leg) => `${leg.serviceId}:${leg.fromPortId}>${leg.toPortId}`).join('|');
    const existing = seen.get(key);
    if (!existing || journey.transitDays < existing.transitDays) seen.set(key, journey);
  }
  return [...seen.values()];
}
