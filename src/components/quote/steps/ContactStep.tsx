/**
 * Step 4: who the quotation is addressed to.
 *
 * Only what appears on the quotation is asked for. No telephone number, no
 * address: nothing in the exercise uses them, and collecting personal data for
 * nothing is the failure mode worth avoiding. Nothing is transmitted.
 */

import { Field, controlClass } from '../fields';
import type { QuoteDraft } from '../model';
import type { StepProps } from './types';

export function ContactStep({ draft, set, errorFor }: StepProps) {
  const text = (
    field: keyof QuoteDraft,
    label: string,
    options: { required?: boolean; type?: string; autoComplete?: string } = {},
  ) => (
    <Field id={field} label={label} required={options.required} error={errorFor(field)}>
      {(props) => (
        <input
          {...props}
          type={options.type ?? 'text'}
          autoComplete={options.autoComplete}
          className={controlClass}
          value={String(draft[field])}
          onChange={(event) => set(field, event.target.value as QuoteDraft[typeof field])}
        />
      )}
    </Field>
  );

  return (
    <>
      <p className="text-sm leading-relaxed text-navy-700">
        These details go on the quotation you are about to produce and nowhere else. The form does
        not send them anywhere: the page has no server to send them to, and closing the tab
        discards them.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {text('name', 'Name', { required: true, autoComplete: 'name' })}
        {text('email', 'Email address', { required: true, type: 'email', autoComplete: 'email' })}
        {text('organisation', 'Company or institution', {
          required: true,
          autoComplete: 'organization',
        })}
        {text('country', 'Country', { required: true, autoComplete: 'country-name' })}
        {text('department', 'Department')}
        {text('position', 'Position')}
        {text('city', 'City', { autoComplete: 'address-level2' })}
      </div>

      <div className="rounded-xl border border-navy-200 bg-navy-50/50 p-5">
        <Field
          id="pin"
          label="Port Virtual Lab activity code"
          required
          hint="The four-digit code your trainer issued. It goes on the quotation so that it can be tied to your activity. This page cannot check it against anything."
          error={errorFor('pin')}
        >
          {(props) => (
            <input
              {...props}
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              className={`${controlClass} font-mono tracking-[0.4em] sm:max-w-[9rem]`}
              value={draft.pin}
              onChange={(event) => set('pin', event.target.value.replace(/\D/g, '').slice(0, 4))}
            />
          )}
        </Field>
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm text-navy-800">
          <input
            id="privacyAccepted"
            type="checkbox"
            checked={draft.privacyAccepted}
            onChange={(event) => set('privacyAccepted', event.target.checked)}
            aria-describedby={errorFor('privacyAccepted') ? 'privacyAccepted-error' : undefined}
            aria-invalid={errorFor('privacyAccepted') ? true : undefined}
            className="mt-0.5 h-5 w-5 shrink-0 accent-sea-600"
          />
          <span>
            I have read how Escola Europea &ndash; Intermodal Transport handles personal data.{' '}
            <a
              className="font-medium text-sea-700 underline underline-offset-2"
              href="https://www.escolaeuropea.eu/privacy-policy/"
              target="_blank"
              rel="noreferrer"
            >
              Privacy policy
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <span className="ml-1 text-alert-600" aria-hidden="true">
              *
            </span>
          </span>
        </label>
        {errorFor('privacyAccepted') && (
          <p className="mt-2 text-sm font-medium text-alert-700" id="privacyAccepted-error">
            {errorFor('privacyAccepted')}
          </p>
        )}
      </div>
    </>
  );
}
