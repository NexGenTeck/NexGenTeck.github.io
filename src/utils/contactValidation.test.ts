import { describe, expect, it } from 'vitest';
import {
    EMAIL_PATTERN,
    NAME_PATTERN,
    PHONE_PATTERN,
    normalizeNameInput,
    normalizePhoneInput,
} from './contactValidation';

describe('contact validation', () => {
    it('removes numbers from names while preserving common name punctuation', () => {
        expect(normalizeNameInput("Aisha-2 O'Neil")).toBe("Aisha- O'Neil");
        expect(NAME_PATTERN.test("Aisha- O'Neil")).toBe(true);
        expect(NAME_PATTERN.test('Aisha 2')).toBe(false);
    });

    it('removes letters from phone numbers while keeping valid punctuation', () => {
        expect(normalizePhoneInput('+92 abc (300) 927-0131')).toBe(
            '+92  (300) 927-0131',
        );
        expect(PHONE_PATTERN.test('+92 300 927 0131')).toBe(true);
        expect(PHONE_PATTERN.test('phone 300')).toBe(false);
    });

    it('accepts valid email syntax and rejects incomplete addresses', () => {
        expect(EMAIL_PATTERN.test('name@example.com')).toBe(true);
        expect(EMAIL_PATTERN.test('name@example')).toBe(false);
    });
});
