/**
 * The itinerary, shown as soon as a route can be resolved.
 *
 * It appears on the route step and again on the confirmation, because a learner
 * comparing two destinations needs it while choosing, not only afterwards.
 */

import { getPort, getService, getVessel } from '@/lib/quote/network';
import type { Journey } from '@/lib/quote/routing';
import { number } from '../format';

export function JourneyPanel({ journey }: { journey: Journey }) {
  const transshipments = journey.legs.length - 1;

  return (
    <div className="rounded-xl border border-sea-200 bg-sea-50/60 p-5" aria-live="polite">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-sea-800">
        {transshipments === 0
          ? 'Direct service'
          : `Connecting service, ${transshipments} transshipment${transshipments > 1 ? 's' : ''}`}
      </h3>
      <ol className="mt-3 space-y-2.5">
        {journey.legs.map((leg, index) => {
          const service = getService(leg.serviceId);
          const vessel = leg.vesselId ? getVessel(leg.vesselId) : null;
          return (
            <li key={`${leg.serviceId}-${index}`} className="text-sm text-navy-800">
              <span className="font-semibold">{getPort(leg.fromPortId)?.displayName}</span>
              {' → '}
              <span className="font-semibold">{getPort(leg.toPortId)?.displayName}</span>
              <span className="text-navy-600">
                {' '}
                on {service?.displayName ?? leg.serviceId}
                {vessel ? `, ${vessel.name}` : ''} &middot; {number.format(leg.distanceNm)} NM
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-sm text-navy-700">
        Indicative transit time{' '}
        <strong className="font-semibold">{Math.round(journey.transitDays)} days</strong>, sailing{' '}
        {number.format(journey.sailedDistanceNm)} NM.
      </p>
      <p className="mt-2 text-xs text-navy-500">
        Sailing time only. SDG Lines publishes no sailing frequency, so no wait for a connecting
        vessel is included.
      </p>
    </div>
  );
}
