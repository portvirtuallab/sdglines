/**
 * Step 6: the quotation.
 *
 * The breakdown marks which lines follow the container and which follow the
 * shipment. That is not decoration: the spreadsheet this replaces charged the
 * freight once however many containers were booked, and showing the basis of
 * every line is what makes that class of mistake visible instead of buried.
 */

import { getEquipment, getPort } from '@/lib/quote/network';
import type { Journey } from '@/lib/quote/routing';
import type { Quotation } from '@/types/quote';
import type { QuoteDraft } from '../model';
import { longDate, money, number } from '../format';
import { JourneyPanel } from './JourneyPanel';

export function Confirmation({
  quotation,
  journey,
  draft,
}: {
  quotation: Quotation;
  journey: Journey;
  draft: QuoteDraft;
}) {
  const origin = getPort(quotation.request.originPortId);
  const destination = getPort(quotation.request.destinationPortId);
  const item = getEquipment(quotation.request.equipmentId);
  const quantity = quotation.request.quantity;

  const needsReview =
    quotation.seaFreightStatus === 'needs-review' ||
    quotation.charges.some((charge) => charge.status === 'needs-review');
  const blocked = quotation.charges.filter((charge) => charge.status === 'blocked');

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-eco-300 bg-eco-50 p-6">
        <h3 className="font-display text-xl font-semibold text-eco-900">
          Simulated quotation produced
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-eco-900/90">
          Quote this reference for the rest of your Port Virtual Lab exercise. It forms part of the
          SDG Lines educational simulation and is not a transport booking or a commercial offer.
        </p>
        <p className="mt-4 font-mono text-2xl font-semibold tracking-wide text-navy-900">
          {quotation.reference}
        </p>
        <p className="mt-2 text-sm text-eco-900/80">
          Valid from {longDate(quotation.validFrom)} to {longDate(quotation.validTo)}.
        </p>
      </div>

      <section>
        <h3 className="font-display text-lg font-semibold text-navy-900">The shipment</h3>
        <dl className="mt-4 divide-y divide-navy-100 rounded-xl border border-navy-200 bg-white">
          {(
            [
              ['Route', `${origin?.displayName} → ${destination?.displayName}`],
              ['Distance', `${number.format(quotation.distanceNm)} NM`],
              ['Equipment', item ? `${item.name} × ${quantity}` : '-'],
              ['Requested departure', longDate(quotation.request.desiredDeparture)],
              ['Indicative transit', `${quotation.transitDays} days`],
              ['Dangerous goods', quotation.request.dangerousGoods ? 'Yes' : 'No'],
              ['VGM SOLAS', quotation.request.vgmSolas ? 'Included' : 'Not included'],
              ['Quoted for', `${draft.name}, ${draft.organisation}`],
              ['Activity code', draft.pin],
            ] as Array<[string, string]>
          ).map(([term, value]) => (
            <div key={term} className="flex flex-wrap justify-between gap-2 px-5 py-3 text-sm">
              <dt className="text-navy-600">{term}</dt>
              <dd className="font-medium text-navy-900">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h3 className="font-display text-lg font-semibold text-navy-900">The itinerary</h3>
        <div className="mt-4">
          <JourneyPanel journey={journey} />
        </div>
      </section>

      <section>
        <h3 className="font-display text-lg font-semibold text-navy-900">What it costs</h3>
        <p className="mt-2 text-sm text-navy-600">
          The FEU reference rate for this lane is {money.format(quotation.seaFreightBaseFeuEur)}.
          Every line marked <em>per unit</em> already covers all {quantity}{' '}
          {quantity === 1 ? 'unit' : 'units'}.
        </p>
        <table className="mt-4 w-full border-collapse overflow-hidden rounded-xl border border-navy-200 text-sm">
          <caption className="sr-only">
            Simulated quotation {quotation.reference}, broken down by charge
          </caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">Charge</th>
              <th scope="col">Basis</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100 bg-white">
            {quotation.charges.map((charge) => (
              <tr key={charge.key}>
                <th scope="row" className="px-5 py-3 text-left font-medium text-navy-700">
                  {charge.label}
                  {charge.status === 'needs-review' && (
                    <span className="ml-2 rounded bg-navy-100 px-1.5 py-0.5 text-xs font-normal text-navy-600">
                      under review
                    </span>
                  )}
                  {charge.status === 'blocked' && (
                    <span className="ml-2 rounded bg-alert-100 px-1.5 py-0.5 text-xs font-normal text-alert-800">
                      rate unknown
                    </span>
                  )}
                </th>
                <td className="px-2 py-3 text-right text-xs text-navy-500">
                  {charge.perUnit ? `per unit × ${quantity}` : 'per shipment'}
                </td>
                <td className="px-5 py-3 text-right font-mono text-navy-900">
                  {money.format(charge.amountEur)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-navy-800 text-white">
              <th scope="row" colSpan={2} className="px-5 py-4 text-left font-display font-semibold">
                Total
              </th>
              <td className="px-5 py-4 text-right font-mono text-lg font-semibold">
                {money.format(quotation.totalEur)}
              </td>
            </tr>
          </tfoot>
        </table>

        {blocked.length > 0 && (
          <p className="mt-3 rounded-lg border border-alert-300 bg-alert-50 p-4 text-sm text-alert-900">
            The operational data holds no rate for{' '}
            {blocked.map((charge) => charge.label.toLowerCase()).join(', ')} from a class{' '}
            {getPort(quotation.request.originPortId)?.portClass} port, so it is shown at zero rather
            than guessed. The total is understated by that amount.
          </p>
        )}
        {needsReview && (
          <p className="mt-3 text-sm text-navy-600">
            {quotation.seaFreightStatus === 'needs-review' && (
              <>
                The sea freight for this distance was interpolated between two published rates
                rather than taken from one.{' '}
              </>
            )}
            Charges marked <em>under review</em> are reproduced from the current quotation
            spreadsheet but their derivation has not yet been confirmed by the operator.
          </p>
        )}
      </section>

      <section>
        <h3 className="font-display text-lg font-semibold text-navy-900">Emissions</h3>
        <p className="mt-3 text-sm leading-relaxed text-navy-700">
          This shipment is estimated at{' '}
          <strong className="font-semibold">
            {number.format(quotation.emissionsKgCo2e)} kg CO<sub>2</sub>e
          </strong>{' '}
          over {number.format(quotation.distanceNm)} nautical miles, using the emissions factor the
          operational data records for this unit type.
          {quotation.co2SavedKgCo2e != null && quotation.co2SavedKgCo2e > 0 && (
            <>
              {' '}
              The same cargo by road is estimated at{' '}
              {number.format(quotation.roadComparisonKgCo2e ?? 0)} kg, so the sea leg saves about{' '}
              <strong className="font-semibold">
                {number.format(quotation.co2SavedKgCo2e)} kg CO<sub>2</sub>e
              </strong>
              .
            </>
          )}
        </p>
      </section>

      <div className="flex flex-wrap gap-3 border-t border-navy-100 pt-6">
        <a
          href="/routes"
          className="rounded-lg bg-signal-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition hover:bg-signal-400"
        >
          Explore the route
        </a>
        <a
          href="/request-a-quote"
          className="rounded-lg border border-navy-200 px-5 py-2.5 text-sm font-semibold text-navy-700 transition hover:border-navy-400"
        >
          Start another quotation
        </a>
      </div>
    </div>
  );
}
