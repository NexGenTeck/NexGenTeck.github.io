import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    CONTACT_API_ERROR_MESSAGE,
    CONTACT_ENDPOINT,
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
    it('uses a generic error for empty and non-JSON responses', async () => {
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
            CONTACT_ENDPOINT,
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: payload.name,
                    email: payload.email,
                    phone: '',
                    subject: '',
                    message: payload.message,
                }),
            }),
        );
    });
});
