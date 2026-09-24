import type { QuoteDraft } from '../model';

/** What every step needs: the draft, a way to change it, and its errors. */
export interface StepProps {
  draft: QuoteDraft;
  set: <K extends keyof QuoteDraft>(field: K, value: QuoteDraft[K]) => void;
  errorFor: (field: keyof QuoteDraft) => string | undefined;
}
