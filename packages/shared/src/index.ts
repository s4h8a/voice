export const LEAD_OUTCOMES = [
  'converted',
  'payment_link_sent',
  'payment_completed',
  'interested_callback',
  'not_interested',
  'wrong_number',
  'no_answer',
  'busy',
  'do_not_call',
  'failed',
] as const;

export const CAMPAIGN_STATUSES = ['draft', 'scheduled', 'running', 'paused', 'completed', 'failed'] as const;

export const INDIAN_LANGUAGES = [
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'en-IN', label: 'English India' },
  { code: 'bn-IN', label: 'Bengali' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'mr-IN', label: 'Marathi' },
  { code: 'gu-IN', label: 'Gujarati' },
  { code: 'kn-IN', label: 'Kannada' },
  { code: 'ml-IN', label: 'Malayalam' },
] as const;

export function normalizeIndianMobile(input: string) {
  const digits = input.replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
}

export function isValidIndianMobile(input: string) {
  return /^[6-9]\d{9}$/.test(normalizeIndianMobile(input));
}
