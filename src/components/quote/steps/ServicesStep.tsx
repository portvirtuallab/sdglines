/**
 * Step 3: the services that sit alongside the carriage.
 *
 * Only VGM today. The step exists as its own thing rather than as two fields on
 * the cargo step because the tariff has room for more of these, and a learner
 * deciding what to add should not be doing it halfway through describing cargo.
 */

import { RadioGroup } from '../fields';
import type { QuoteDraft } from '../model';
import type { StepProps } from './types';

export function ServicesStep({ draft, set, errorFor }: StepProps) {
  return (
    <>
      <div className="rounded-xl border border-navy-200 bg-white p-5">
        <h3 className="font-display text-base font-semibold text-navy-900">What VGM SOLAS means</h3>
        <p className="mt-2 text-sm leading-relaxed text-navy-700">
          Under the SOLAS convention, a packed container may not be loaded aboard a ship until its
          verified gross mass - the weight of the cargo, the packing and the container itself - has
          been declared to the carrier and the terminal. The duty sits with the shipper. Carriers
          offer to weigh the container and file the declaration on the shipper&rsquo;s behalf, which
          is the service being offered here.
        </p>
      </div>

      <RadioGroup
        name="vgmSolas"
        legend="Include VGM SOLAS in this simulated quotation?"
        hint="Charged per container."
        value={draft.vgmSolas}
        onChange={(value) => set('vgmSolas', value as QuoteDraft['vgmSolas'])}
        error={errorFor('vgmSolas')}
        options={[
          { value: 'yes', label: 'Yes, weigh and declare' },
          { value: 'no', label: 'No, I will declare it myself' },
        ]}
      />
    </>
  );
}
