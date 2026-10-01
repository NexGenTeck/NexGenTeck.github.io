export const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s'-]*$/u;
export const PHONE_PATTERN = /^\+?[0-9][0-9\s()-]{6,19}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Keep names readable while rejecting numbers and unsupported characters. */
export const normalizeNameInput = (value: string): string =>
    value.replace(/[^\p{L}\p{M}\s'-]/gu, '');

/** Keep international phone-number punctuation, while rejecting letters. */
export const normalizePhoneInput = (value: string): string =>
    value
        .replace(/[^0-9+\s()-]/g, '')
        .replace(/(?!^)\+/g, '');
