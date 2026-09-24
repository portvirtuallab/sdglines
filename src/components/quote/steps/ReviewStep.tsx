/**
 * Step 5: check it before it is priced.
 *
 * Each section links back to the step that owns it, because "Edit" that drops
 * you at the top of a six-step form is not an edit.
 */

import { getEquipment, getPort, getService } from '@/lib/quote/network';
import type { Journey } from '@/lib/quote/routing';
import type { QuoteDraft } from '../model';
import { longDate } from '../format';

export function ReviewStep({
  draft,
  journey,
  onEdit,
}: {
  draft: QuoteDraft;
  journey: Journey | null;
  onEdit: (index: number) => void;
}) {
  const origin = getPort(draft.originPortId);
  const destination = getPort(draft.destinationPortId);
  const item = getEquipment(Number(draft.equipmentId));
  const service = journey ? getService(journey.legs[0].serviceId) : null;

  const sections: Array<{ step: number; title: string; rows: Array<[string, string]> }> = [
    {
      step: 0,
      title: 'Route',
      rows: [
        ['Route', `${origin?.displayName ?? '-'} → ${destination?.displayName ?? '-'}`],
        [
          'Service',
          journey && journey.legs.length > 1
            ? `Connecting service, ${journey.legs.length} vessels`
            : (service?.displayName ?? '-'),
        ],
        ['Requested departure', draft.desiredDeparture ? longDate(draft.desiredDeparture) : '-'],
        ['Indicative transit', journey ? `${Math.round(journey.transitDays)} days` : '-'],
      ],
    },
    {
      step: 1,
      title: 'Cargo and equipment',
      rows: [
        ['Equipment', item ? `${item.name} × ${draft.quantity}` : '-'],
        [
          'Dangerous goods',
          draft.dangerousGoods === 'yes'
            ? `Yes — UN ${draft.unNumber}, ${draft.imoClass}`
            : 'No',
        ],
      ],
    },
    {
      step: 2,
      title: 'Additional services',
      rows: [['VGM SOLAS', draft.vgmSolas === 'yes' ? 'Included' : 'Not included']],
    },
    {
      step: 3,
      title: 'Contact',
      rows: [
        ['Name', draft.name || '-'],
        ['Email', draft.email || '-'],
        ['Company or institution', draft.organisation || '-'],
        ['Country', draft.country || '-'],
        ['Activity code', draft.pin || '-'],
      ],
    },
  ];

  return (
    <>
      <p className="text-sm leading-relaxed text-navy-700">
        Check the shipment before the quotation is produced. Anything can still be changed.
      </p>
      {sections.map((section) => (
        <section key={section.title} className="rounded-xl border border-navy-200 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-navy-100 px-5 py-3">
            <h3 className="font-display text-base font-semibold text-navy-900">{section.title}</h3>
            <button
              type="button"
              onClick={() => onEdit(section.step)}
              className="text-sm font-semibold text-sea-700 underline underline-offset-2"
            >
              Edit<span className="sr-only"> {section.title.toLowerCase()}</span>
            </button>
          </div>
          <dl className="divide-y divide-navy-50">
            {section.rows.map(([term, value]) => (
              <div key={term} className="flex flex-wrap justify-between gap-2 px-5 py-3 text-sm">
                <dt className="text-navy-600">{term}</dt>
                <dd className="font-medium text-navy-900">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </>
  );
}
