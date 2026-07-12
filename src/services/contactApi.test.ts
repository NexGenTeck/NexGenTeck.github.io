import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    CONTACT_API_ERROR_MESSAGE,
    submitContact,
} from './contactApi';

const payload = {
    name: 'Example User',
    email: 'example@example.com',
    message: 'Example message',
};

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
});

describe('submitContact', () => {
    it('does not call fetch when the API URL is missing', async () => {
        vi.stubEnv('VITE_CONTACT_API_URL', '');
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);

        await expect(submitContact(payload)).resolves.toEqual({
            success: false,
            error: CONTACT_API_ERROR_MESSAGE,
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('uses a generic error for empty and non-JSON responses', async () => {
        vi.stubEnv('VITE_CONTACT_API_URL', 'https://example.test/contact');
        vi.stubGlobal(
            'fetch',
            vi
                .fn()
                .mockResolvedValueOnce(new Response('', { status: 503 }))
                .mockResolvedValueOnce(
                    new Response('<html>unavailable</html>', { status: 503 }),
                ),
        );

        await expect(submitContact(payload)).resolves.toEqual({
            success: false,
            error: CONTACT_API_ERROR_MESSAGE,
        });
        await expect(submitContact(payload)).resolves.toEqual({
            success: false,
            error: CONTACT_API_ERROR_MESSAGE,
        });
    });

    it('returns the typed success response after a JSON POST', async () => {
        vi.stubEnv('VITE_CONTACT_API_URL', 'https://example.test/contact');
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({
                    success: true,
                    message: 'Message received successfully.',
                }),
                { status: 201 },
            ),
        );
        vi.stubGlobal('fetch', fetchMock);

        await expect(submitContact(payload)).resolves.toEqual({
            success: true,
            message: 'Message received successfully.',
        });
        expect(fetchMock).toHaveBeenCalledWith(
            'https://example.test/contact',
            expect.objectContaining({ method: 'POST' }),
        );
    });
});
