/**
 * Step 6: the quotation.
 *
 * The breakdown marks which lines follow the container and which follow the
 * shipment. That is not decoration: the spreadsheet this replaces charged the
 * freight once however many containers were booked, and showing the basis of
 * every line is what makes that class of mistake visible instead of buried.
 */

import { getEquipment, getPort } from '@/lib/quote/network';
import { freightNeedsMention } from '@/lib/quote/pricing';
import { acrossEquipment, acrossQuantities, type PriceVariant } from '@/lib/quote/comparisons';
import type { Journey } from '@/lib/quote/routing';
import type { Quotation } from '@/types/quote';
import type { QuoteDraft } from '../model';
import { longDate, money, number } from '../format';
import { JourneyPanel } from './JourneyPanel';

/** One of the three figures a shipper reads first. */
function Headline({
  term,
  value,
  detail,
  emphasis,
}: {
  term: string;
  value: string;
  detail?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={
        'rounded-xl border p-4 ' +
        (emphasis ? 'border-navy-800 bg-navy-800 text-white' : 'border-navy-200 bg-white')
      }
    >
      <dt className={emphasis ? 'text-sm text-navy-100' : 'text-sm text-navy-600'}>{term}</dt>
      <dd className="mt-1 font-mono text-xl font-semibold">{value}</dd>
      {detail && (
        <dd className={'mt-1 text-xs ' + (emphasis ? 'text-navy-200' : 'text-navy-500')}>
          {detail}
        </dd>
      )}
    </div>
  );
}

/**
 * A comparison table, collapsed by default.
 *
 * Collapsed because the quotation is the answer and these are the reasoning
 * behind it; a learner who wants to know why opens them, and one who does not
 * is not made to scroll past two tables to reach the buttons.
 */
function Comparison({
  summary,
  caption,
  explanation,
  variants,
  firstColumn,
  firstCell,
}: {
  summary: string;
  caption: string;
  explanation: string;
  variants: PriceVariant[];
  firstColumn: string;
  firstCell: (variant: PriceVariant) => string;
}) {
  return (
    <details className="mt-4 rounded-xl border border-navy-200 bg-white">
      <summary className="cursor-pointer px-5 py-3 text-sm font-semibold text-navy-800">
        {summary}
      </summary>
      <div className="border-t border-navy-100 px-5 py-4">
        <p className="text-sm leading-relaxed text-navy-600">{explanation}</p>
        <table className="mt-4 w-full border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-navy-200 text-left text-xs uppercase tracking-wide text-navy-500">
              <th scope="col" className="py-2 pr-4 font-semibold">
                {firstColumn}
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-semibold">
                Total
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-semibold">
                Per unit
              </th>
              <th scope="col" className="py-2 text-right font-semibold">
                Per TEU
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50">
            {variants.map((variant) => (
              <tr
                key={`${variant.equipmentId}-${variant.quantity}`}
                className={variant.isChosen ? 'bg-sea-50 font-semibold text-sea-900' : ''}
              >
                <th scope="row" className="py-2 pr-4 text-left font-normal">
                  {firstCell(variant)}
                  {variant.isChosen && <span className="sr-only"> (your quotation)</span>}
                </th>
                <td className="py-2 pr-4 text-right font-mono">{money.format(variant.totalEur)}</td>
                <td className="py-2 pr-4 text-right font-mono">
                  {money.format(variant.perUnitEur)}
                </td>
                <td className="py-2 text-right font-mono">
                  {variant.perTeuEur == null ? '—' : money.format(variant.perTeuEur)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

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

  const perUnit = quotation.totalEur / quantity;
  const perTeu = item?.teuEquivalent ? perUnit / item.teuEquivalent : null;

  // The comparisons hold the shipment fixed and move one thing at a time.
  const basis = {
    portClass: origin?.portClass ?? 'C',
    equipmentId: quotation.request.equipmentId,
    quantity,
    distanceNm: quotation.distanceNm,
    vgmSolas: quotation.request.vgmSolas,
    dangerousGoods: quotation.request.dangerousGoods,
  } as const;

  // Almost every lane is interpolated, so saying so every time would teach
  // people to ignore it. Mentioned only when it could move the figure.
  const freightIsUncertain = freightNeedsMention({
    eur: quotation.seaFreightBaseFeuEur,
    status: quotation.seaFreightStatus,
    maxErrorEur: quotation.seaFreightMaxErrorEur,
  });
  const needsReview =
    freightIsUncertain || quotation.charges.some((charge) => charge.status === 'needs-review');
  const blocked = quotation.charges.filter((charge) => charge.status === 'blocked');

  // The power a hull needs goes with the cube of its speed and the time at sea
  // with the inverse, so fuel per mile goes with the square. A learner reading
  // a slow feeder against a fast ocean service should see why they differ.
  const vesselFactor = quotation.vesselEmissionsFactor;
  const difference = Math.round(Math.abs(vesselFactor - 1) * 100);
  const vesselComparison =
    difference < 2
      ? 'The vessels carrying this shipment sail at about the network average speed, so their emissions per mile are typical of the fleet.'
      : `The vessels carrying this shipment sail ${vesselFactor > 1 ? 'faster' : 'slower'} than the network average, which puts their emissions per mile about ${difference} % ${vesselFactor > 1 ? 'above' : 'below'} it. Fuel burnt per mile rises with the square of speed.`;

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
              <th
                scope="row"
                colSpan={2}
                className="px-5 py-4 text-left font-display font-semibold"
              >
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
            {freightIsUncertain && (
              <>
                The sea freight for this distance was interpolated between two published rates that
                sit far apart, so it could be out by up to{' '}
                {money.format(quotation.seaFreightMaxErrorEur)}.{' '}
              </>
            )}
            Charges marked <em>under review</em> are reproduced from the current quotation
            spreadsheet but their derivation has not yet been confirmed by the operator.
          </p>
        )}

        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <Headline term="Total" value={money.format(quotation.totalEur)} emphasis />
          <Headline
            term={`Per unit × ${quantity}`}
            value={money.format(perUnit)}
            detail={item?.name}
          />
          <Headline
            term="Per TEU equivalent"
            value={perTeu == null ? 'Not derivable' : money.format(perTeu)}
            detail={
              item?.teuEquivalent
                ? `${item.teuEquivalent} TEU per unit, from ${item.linearMetres} linear metres`
                : 'The workbook gives no length for this unit'
            }
          />
        </dl>
      </section>

      <section>
        <h3 className="font-display text-lg font-semibold text-navy-900">
          How the price would change
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-navy-700">
          The same shipment on the same lane, with one thing altered. Both tables are priced by the
          same engine as the quotation above, so they cannot disagree with it.
        </p>

        <Comparison
          summary={`Ordering a different number of ${item?.name ?? 'units'}`}
          caption="Price by order size"
          explanation="Documentation, logistic management and customs clearance are charged once per shipment. Everything else follows the container, so the price per unit falls only as those three spread over a larger order."
          variants={acrossQuantities(basis)}
          firstColumn="Units"
          firstCell={(variant) => String(variant.quantity)}
        />

        <Comparison
          summary="Using a different unit type"
          caption="Price by unit type, cheapest per TEU first"
          explanation="The freight factor runs from 0.80 for a 20' dry container to 1.60 for project cargo, and the terminal handling tariff moves with the unit type as well. A reefer also carries the plug-in charge."
          variants={acrossEquipment(basis)}
          firstColumn="Unit type"
          firstCell={(variant) => variant.label}
        />
      </section>

      <section>
        <h3 className="font-display text-lg font-semibold text-navy-900">Emissions</h3>
        <p className="mt-3 text-sm leading-relaxed text-navy-700">
          This shipment is estimated at{' '}
          <strong className="font-semibold">
            {number.format(quotation.emissionsKgCo2e)} kg CO<sub>2</sub>e
          </strong>{' '}
          over {number.format(quotation.distanceNm)} nautical miles, using the emissions factor the
          fleet's intensity for the slots this unit occupies.
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
        <p className="mt-3 text-sm leading-relaxed text-navy-600">{vesselComparison}</p>
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
