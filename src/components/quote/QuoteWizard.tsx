/**
 * The SDG Lines simulated quotation tool.
 *
 * Six steps, one draft, no submission. The site is static and the brief forbids
 * sending a learner's details anywhere, so the quotation is produced in the
 * browser from the same operational data the route pages and the map read. That
 * is not a workaround: what the exercise teaches is deciding what a shipment
 * needs and reading back what was asked for, and the tool now answers the
 * question the old Google Form could only forward.
 *
 * This file holds the state machine and nothing else. Each step renders itself
 * from `steps/`, the controls come from `fields.tsx`, and the rules live in
 * `model.ts`, so that adding a field is a change in one place.
 *
 * Three things here are deliberate and easy to undo by accident:
 *
 *   - The destination list comes from the routing engine, so a pair the network
 *     cannot serve can never be selected in the first place.
 *   - Moving backwards never clears an answer. A learner comparing two options
 *     goes back and forth constantly.
 *   - Every failed step focuses an error summary before anything else, so that
 *     someone using a screen reader hears what went wrong rather than landing
 *     back at the top of a form with no explanation.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  STEPS,
  emptyDraft,
  validateStep,
  type FieldError,
  type QuoteDraft,
} from './model';
import { equipment as allEquipment, quotablePorts } from '@/lib/quote/network';
import { bestJourney, reachableFrom, type Journey } from '@/lib/quote/routing';
import { priceQuotation } from '@/lib/quote/pricing';
import { quotationReference } from '@/lib/quote/reference';
import { validatePin } from '@/lib/quote/pin';
import type { Quotation } from '@/types/quote';
import { CargoStep } from './steps/CargoStep';
import { Confirmation } from './steps/Confirmation';
import { ContactStep } from './steps/ContactStep';
import { ReviewStep } from './steps/ReviewStep';
import { RouteStep } from './steps/RouteStep';
import { ServicesStep } from './steps/ServicesStep';

export default function QuoteWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<QuoteDraft>(emptyDraft);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [journey, setJourney] = useState<Journey | null>(null);

  const summaryRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shouldFocusSummary = useRef(false);

  const step = STEPS[stepIndex];
  const set = useCallback(<K extends keyof QuoteDraft>(field: K, value: QuoteDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  }, []);

  const errorFor = useCallback(
    (field: keyof QuoteDraft) => errors.find((error) => error.field === field)?.message,
    [errors],
  );

  /**
   * A port page links here as `?origin=barcelona`, so that someone reading
   * about a port and deciding to quote from it does not have to find it again
   * in a list of 36. An unknown or unquotable slug is ignored rather than
   * reported: the learner did not type it, so there is nothing for them to fix.
   */
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('origin');
    if (requested && quotablePorts.some((port) => port.id === requested)) {
      setDraft((current) => ({ ...current, originPortId: requested }));
    }
  }, []);

  /* ---- derived data ----------------------------------------------------- */

  const destinations = useMemo(() => {
    if (!draft.originPortId) return [];
    const reachable = reachableFrom(draft.originPortId);
    return quotablePorts.filter((port) => reachable.has(port.id));
  }, [draft.originPortId]);

  const preview = useMemo(
    () =>
      draft.originPortId && draft.destinationPortId
        ? bestJourney(draft.originPortId, draft.destinationPortId)
        : null,
    [draft.originPortId, draft.destinationPortId],
  );

  const families = useMemo(() => [...new Set(allEquipment.map((item) => item.family))], []);

  const unitTypes = useMemo(
    () => allEquipment.filter((item) => item.family === draft.equipmentFamily),
    [draft.equipmentFamily],
  );

  /* ---- navigation ------------------------------------------------------- */

  useEffect(() => {
    if (shouldFocusSummary.current && errors.length) {
      summaryRef.current?.focus();
      shouldFocusSummary.current = false;
    } else if (!errors.length) {
      headingRef.current?.focus();
    }
  }, [stepIndex, errors]);

  const goTo = (target: number) => {
    setErrors([]);
    setStepIndex(target);
  };

  const fail = (found: FieldError[]) => {
    shouldFocusSummary.current = true;
    setErrors(found);
  };

  const advance = async () => {
    const found = validateStep(step.id, draft);
    if (found.length) return fail(found);

    // Asked through the same interface a real check would use, so that wiring
    // one in later touches nothing else. See docs/quote/pin-validation.md.
    if (step.id === 'contact') {
      const result = await validatePin(draft.pin);
      if (result.state !== 'valid') return fail([{ field: 'pin', message: result.message }]);
    }

    if (step.id === 'review') return produce();

    setErrors([]);
    setStepIndex((index) => index + 1);
  };

  const produce = () => {
    const found = bestJourney(draft.originPortId, draft.destinationPortId);
    if (!found) {
      return fail([
        {
          field: 'destinationPortId',
          message:
            'No SDG Lines service connects those two ports any more. Go back and choose another.',
        },
      ]);
    }

    const request = {
      originPortId: draft.originPortId,
      destinationPortId: draft.destinationPortId,
      desiredDeparture: draft.desiredDeparture,
      equipmentId: Number(draft.equipmentId),
      quantity: Number(draft.quantity),
      dangerousGoods: draft.dangerousGoods === 'yes',
      vgmSolas: draft.vgmSolas === 'yes',
    };

    setJourney(found);
    setQuotation(priceQuotation(request, found, quotationReference(request)));
    setErrors([]);
    setStepIndex(STEPS.length - 1);
  };

  /* ---- rendering -------------------------------------------------------- */

  const isConfirmation = step.id === 'confirmation';

  return (
    <div>
      <Progress
        current={stepIndex}
        furthest={quotation ? STEPS.length - 1 : stepIndex}
        onJump={goTo}
      />

      {errors.length > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="mt-8 rounded-xl border border-alert-300 bg-alert-50 p-5"
        >
          <h2 className="font-display text-base font-semibold text-alert-800">
            {errors.length === 1
              ? 'There is one thing to fix before you continue'
              : `There are ${errors.length} things to fix before you continue`}
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm text-alert-800">
            {errors.map((error) => (
              <li key={`${error.field}-${error.message}`}>
                <a className="underline underline-offset-2" href={`#${error.field}`}>
                  {error.message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-2xl font-semibold text-navy-900 outline-none"
        >
          <span className="font-mono text-base text-sea-600">{step.number}</span> {step.title}
        </h2>

        <div className="mt-6 space-y-8">
          {step.id === 'route' && (
            <RouteStep
              draft={draft}
              set={set}
              errorFor={errorFor}
              destinations={destinations}
              preview={preview}
            />
          )}
          {step.id === 'cargo' && (
            <CargoStep
              draft={draft}
              set={set}
              errorFor={errorFor}
              families={families}
              unitTypes={unitTypes}
            />
          )}
          {step.id === 'services' && <ServicesStep draft={draft} set={set} errorFor={errorFor} />}
          {step.id === 'contact' && <ContactStep draft={draft} set={set} errorFor={errorFor} />}
          {step.id === 'review' && <ReviewStep draft={draft} journey={preview} onEdit={goTo} />}
          {isConfirmation && quotation && journey && (
            <Confirmation quotation={quotation} journey={journey} draft={draft} />
          )}
        </div>
      </div>

      {!isConfirmation && (
        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-navy-100 pt-6">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={() => goTo(stepIndex - 1)}
              className="rounded-lg border border-navy-200 px-5 py-2.5 text-sm font-semibold text-navy-700 transition hover:border-navy-400"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={advance}
            className="rounded-lg bg-signal-500 px-6 py-2.5 text-sm font-semibold text-navy-950 shadow-sm transition hover:bg-signal-400"
          >
            {step.id === 'review' ? 'Produce the simulated quotation' : 'Continue'}
          </button>
        </div>
      )}
    </div>
  );
}

function Progress({
  current,
  furthest,
  onJump,
}: {
  current: number;
  furthest: number;
  onJump: (index: number) => void;
}) {
  return (
    <nav aria-label="Quotation steps">
      <ol className="flex flex-wrap gap-x-2 gap-y-2 text-sm">
        {STEPS.map((step, index) => {
          const state = index === current ? 'current' : index < furthest ? 'done' : 'upcoming';
          const content = (
            <>
              <span className="font-mono text-xs">{step.number}</span>
              <span>{step.title}</span>
            </>
          );
          const className =
            'flex items-center gap-2 rounded-full px-3.5 py-1.5 font-medium transition ' +
            (state === 'current'
              ? 'bg-navy-800 text-white'
              : state === 'done'
                ? 'bg-sea-50 text-sea-800 hover:bg-sea-100'
                : 'bg-navy-50 text-navy-500');

          return (
            <li key={step.id}>
              {state === 'done' ? (
                <button type="button" className={className} onClick={() => onJump(index)}>
                  {content}
                  <span className="sr-only">, completed. Return to this step.</span>
                </button>
              ) : (
                <span className={className} aria-current={state === 'current' ? 'step' : undefined}>
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
