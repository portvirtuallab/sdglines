/**
 * Quotation references.
 *
 * A learner needs a code to carry into the rest of the exercise, and two
 * learners working side by side must not be handed the same one. The site is
 * static and has no counter, so the reference is derived from the shipment
 * itself plus the moment it was produced.
 *
 * The format is the one the brief asks for, `SDGL-Q-XXXXXX`, and the six
 * characters use an alphabet with no `I`, `O`, `0` or `1`, because these get
 * read aloud across a classroom and written down by hand.
 */

import type { QuotationRequest } from '@/types/quote';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * A small, fast, well-mixed hash. Not a cryptographic one, and it does not need
 * to be: the reference identifies a quotation inside a training exercise.
 */
function hash(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/**
 * Build the reference for a quotation.
 *
 * @param request The shipment, so that the same request in the same second
 *   produces the same reference and a learner who reloads is not confused.
 * @param at The moment the quotation was produced.
 */
export function quotationReference(request: QuotationRequest, at: Date = new Date()): string {
  const seed = [
    request.originPortId,
    request.destinationPortId,
    request.desiredDeparture,
    request.equipmentId,
    request.quantity,
    request.dangerousGoods ? 'dg' : '',
    request.vgmSolas ? 'vgm' : '',
    Math.floor(at.getTime() / 1000),
  ].join('|');

  let value = hash(seed);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += ALPHABET[value % ALPHABET.length];
    value = Math.floor(value / ALPHABET.length) + hash(`${seed}${i}`) % 997;
  }

  return `SDGL-Q-${code}`;
}
