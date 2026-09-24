/**
 * The Port Virtual Lab activity code.
 *
 * This used to hash the entered code against digests of the 34 PINs the
 * workbook lists, using PBKDF2 over 600 000 rounds. That has been removed.
 *
 * Why: the site is static, so everything it knows the browser knows, and a
 * four-digit code has ten thousand possible values. Any check running in the
 * browser can be defeated by trying all of them, whatever it is built from.
 * The slow hash raised the cost of a sweep from seconds to hours - which is a
 * speed bump, not an access control, and a speed bump that looked like one.
 * Machinery that implies a guarantee it cannot give is worse than no machinery,
 * because someone eventually relies on it.
 *
 * What remains is what the field is actually for: the learner types the code
 * their trainer issued, it goes on the quotation, and it ties the quotation to
 * an activity. The format is checked so that a typo is caught here rather than
 * in a spreadsheet later. Nothing claims the code is valid, because nothing
 * here can know.
 *
 * If the codes ever need to be genuinely checked, that needs a request to a
 * service that holds the list. `validatePin` is the only place in the codebase
 * that judges a code, so that is the one function to change. See
 * `docs/quote/pin-validation.md`.
 */

export type PinResult = { state: 'valid' } | { state: 'malformed'; message: string };

/** Activity codes are four digits. Nothing else is accepted. */
const PIN_PATTERN = /^\d{4}$/;

/** Check the format. Synchronous, so the form can use it as you type. */
export function isWellFormedPin(pin: string): boolean {
  return PIN_PATTERN.test(pin.trim());
}

/**
 * Judge an activity code as far as a static page honestly can, which is its
 * shape and no further.
 *
 * Asynchronous because a real implementation would have to ask a service, and
 * every caller is already written to wait.
 */
export async function validatePin(pin: string): Promise<PinResult> {
  return isWellFormedPin(pin)
    ? { state: 'valid' }
    : {
        state: 'malformed',
        message: 'A Port Virtual Lab activity code is four digits, for example 1234.',
      };
}
