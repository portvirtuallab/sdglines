/**
 * The quotation form's own state, kept apart from the rendering.
 *
 * The form is a six-step wizard and a learner is expected to move backwards
 * through it, so every answer lives in one object from the first step to the
 * last. Nothing is submitted anywhere: the site is static, the exercise happens
 * in the browser, and the quotation is produced here.
 *
 * Validation is per step and returns the same shape the error summary renders,
 * so a rule is written once and the wording a learner reads is the wording the
 * rule carries.
 */

import { getEquipment, getPort, isQuotable } from '@/lib/quote/network';
import { bestJourney } from '@/lib/quote/routing';
import { isWellFormedPin } from '@/lib/quote/pin';

export const STEPS = [
  { id: 'route', number: '01', title: 'Route' },
  { id: 'cargo', number: '02', title: 'Cargo & equipment' },
  { id: 'services', number: '03', title: 'Additional services' },
  { id: 'contact', number: '04', title: 'Contact' },
  { id: 'review', number: '05', title: 'Review' },
  { id: 'confirmation', number: '06', title: 'Confirmation' },
] as const;

export type StepId = (typeof STEPS)[number]['id'];

export interface QuoteDraft {
  /* Step 1 */
  originPortId: string;
  destinationPortId: string;
  desiredDeparture: string;

  /* Step 2 */
  dangerousGoods: 'yes' | 'no' | '';
  unNumber: string;
  properShippingName: string;
  imoClass: string;
  packingGroup: string;
  equipmentFamily: string;
  equipmentId: string;
  quantity: string;

  /* Step 3 */
  vgmSolas: 'yes' | 'no' | '';

  /* Step 4 */
  name: string;
  email: string;
  organisation: string;
  department: string;
  position: string;
  city: string;
  country: string;
  pin: string;
  privacyAccepted: boolean;
}

export const emptyDraft: QuoteDraft = {
  originPortId: '',
  destinationPortId: '',
  desiredDeparture: '',
  dangerousGoods: '',
  unNumber: '',
  properShippingName: '',
  imoClass: '',
  packingGroup: '',
  equipmentFamily: '',
  equipmentId: '',
  quantity: '1',
  vgmSolas: '',
  name: '',
  email: '',
  organisation: '',
  department: '',
  position: '',
  city: '',
  country: '',
  pin: '',
  privacyAccepted: false,
};

/** One problem with the draft, addressed to the learner and to a field. */
export interface FieldError {
  field: keyof QuoteDraft;
  message: string;
}

/** The most units a single simulated booking may carry. */
export const MAX_UNITS = 200;

/**
 * An address is only checked for the shape that makes it an address at all.
 * Anything stricter rejects real addresses, and nothing is sent anyway.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStep(step: StepId, draft: QuoteDraft): FieldError[] {
  const errors: FieldError[] = [];

  /**
   * Text fields only. A boolean would stringify to `"false"`, which is not
   * empty, so a required checkbox would silently pass; the type keeps that
   * mistake from being made rather than leaving a comment warning about it.
   */
  const needed = <K extends keyof QuoteDraft>(
    field: QuoteDraft[K] extends string ? K : never,
    message: string,
  ) => {
    if (!String(draft[field]).trim()) errors.push({ field, message });
  };

  if (step === 'route') {
    needed('originPortId', 'Choose the port the shipment starts from.');
    needed('destinationPortId', 'Choose the port the shipment is going to.');
    needed('desiredDeparture', 'Choose the date you would like to sail on.');

    const origin = getPort(draft.originPortId);
    const originName = origin?.displayName ?? 'That port';
    if (draft.originPortId && !isQuotable(origin)) {
      errors.push({
        field: 'originPortId',
        message: `${originName} cannot be quoted yet: the operational data has no rate for it.`,
      });
    }
    if (draft.originPortId && draft.originPortId === draft.destinationPortId) {
      errors.push({
        field: 'destinationPortId',
        message: 'The destination has to be a different port from the origin.',
      });
    }
    if (
      draft.originPortId &&
      draft.destinationPortId &&
      draft.originPortId !== draft.destinationPortId &&
      !bestJourney(draft.originPortId, draft.destinationPortId)
    ) {
      errors.push({
        field: 'destinationPortId',
        message: 'No SDG Lines service connects those two ports. Choose another destination.',
      });
    }
    if (draft.desiredDeparture) {
      const chosen = new Date(`${draft.desiredDeparture}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(chosen.getTime())) {
        errors.push({ field: 'desiredDeparture', message: 'Enter the date as a calendar date.' });
      } else if (chosen < today) {
        errors.push({ field: 'desiredDeparture', message: 'Choose a date that has not passed.' });
      }
    }
  }

  if (step === 'cargo') {
    if (!draft.dangerousGoods) {
      errors.push({
        field: 'dangerousGoods',
        message: 'Say whether the shipment contains dangerous goods.',
      });
    }
    if (draft.dangerousGoods === 'yes') {
      needed('unNumber', 'Give the UN number of the dangerous goods.');
      needed('properShippingName', 'Give the proper shipping name.');
      needed('imoClass', 'Choose the IMO class.');
    }
    needed('equipmentFamily', 'Choose the kind of service the shipment needs.');
    needed('equipmentId', 'Choose the unit type.');

    const quantity = Number(draft.quantity);
    if (!draft.quantity.trim()) {
      errors.push({ field: 'quantity', message: 'Say how many units you are shipping.' });
    } else if (!Number.isInteger(quantity) || quantity < 1) {
      errors.push({ field: 'quantity', message: 'The number of units is a whole number, one or more.' });
    } else if (quantity > MAX_UNITS) {
      errors.push({
        field: 'quantity',
        message: `A simulated booking is limited to ${MAX_UNITS} units.`,
      });
    }
    if (draft.equipmentId && !getEquipment(Number(draft.equipmentId))) {
      errors.push({ field: 'equipmentId', message: 'Choose a unit type from the list.' });
    }
  }

  if (step === 'services') {
    if (!draft.vgmSolas) {
      errors.push({ field: 'vgmSolas', message: 'Say whether to include the VGM SOLAS service.' });
    }
  }

  if (step === 'contact') {
    needed('name', 'Give the name the quotation should be addressed to.');
    needed('email', 'Give an email address.');
    needed('organisation', 'Give the company or institution you are taking part as.');
    needed('country', 'Choose the country you are taking part from.');
    if (draft.email.trim() && !EMAIL_PATTERN.test(draft.email.trim())) {
      errors.push({ field: 'email', message: 'That does not look like an email address.' });
    }
    if (!draft.pin.trim()) {
      errors.push({ field: 'pin', message: 'Enter the Port Virtual Lab activity code.' });
    } else if (!isWellFormedPin(draft.pin)) {
      errors.push({
        field: 'pin',
        message: 'A Port Virtual Lab activity code is four digits, for example 1234.',
      });
    }
    if (!draft.privacyAccepted) {
      errors.push({
        field: 'privacyAccepted',
        message: 'Confirm you have read how Escola Europea handles your details.',
      });
    }
  }

  return errors;
}
