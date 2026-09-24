/**
 * The form controls the quotation wizard is built from.
 *
 * Each one wires up its own label, hint, error and the `aria-describedby` that
 * ties them together, because that association is the part people forget and
 * the part a screen reader depends on. A step that uses these cannot ship an
 * unlabelled field.
 */

import type { ReactNode } from 'react';

export const labelClass = 'block text-sm font-semibold text-navy-800';
export const hintClass = 'mt-1 text-sm text-navy-500';
export const controlClass =
  'mt-2 w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-navy-900 ' +
  'shadow-sm outline-none transition focus:border-sea-500 focus:ring-2 focus:ring-sea-500/40 ' +
  'aria-[invalid=true]:border-alert-500 aria-[invalid=true]:ring-alert-500/30';

/** What a control needs to be described by its own label, hint and error. */
export interface ControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: ControlProps) => ReactNode;
}) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      <label className={labelClass} htmlFor={id}>
        {label}
        {required && (
          <>
            <span className="ml-1 text-alert-600" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>
      {hint && (
        <p className={hintClass} id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {children({
        id,
        'aria-describedby': describedBy || undefined,
        'aria-invalid': error ? true : undefined,
      })}
      {error && (
        <p className="mt-2 text-sm font-medium text-alert-700" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

export function RadioGroup({
  name,
  legend,
  hint,
  error,
  value,
  onChange,
  options,
}: {
  name: string;
  legend: string;
  hint?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const describedBy =
    [hint ? `${name}-hint` : null, error ? `${name}-error` : null].filter(Boolean).join(' ') ||
    undefined;

  return (
    <fieldset aria-describedby={describedBy}>
      <legend className={labelClass}>
        {legend}
        <span className="ml-1 text-alert-600" aria-hidden="true">
          *
        </span>
        <span className="sr-only"> (required)</span>
      </legend>
      {hint && (
        <p className={hintClass} id={`${name}-hint`}>
          {hint}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={
              'flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ' +
              (value === option.value
                ? 'border-sea-500 bg-sea-50 text-sea-900'
                : 'border-navy-200 bg-white text-navy-700 hover:border-navy-300')
            }
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 accent-sea-600"
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm font-medium text-alert-700" id={`${name}-error`}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
