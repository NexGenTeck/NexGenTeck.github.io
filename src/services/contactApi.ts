export interface ContactPayload {
    name: string;
    email: string;
    phone?: string | null;
    subject?: string | null;
    message: string;
    website?: string;
}

export interface ContactApiSuccess {
    success: true;
    message: string;
}

export interface ContactApiError {
    success: false;
    error: string;
}

export type ContactApiResponse = ContactApiSuccess | ContactApiError;

export const CONTACT_API_ERROR_MESSAGE =
    'Unable to send message right now. Please try again later.';

// Same-origin Vercel serverless function (api/contact.ts). The previous
// https://api.nexgenteck.com/contact.php endpoint is gone — that domain is
// parked, so requests to it never reach a mail server.
export const CONTACT_ENDPOINT =
    import.meta.env.VITE_CONTACT_API_URL || '/api/contact';

const readResponse = (body: string): unknown => {
    if (!body.trim()) {
        return null;
    }

    try {
        return JSON.parse(body);
    } catch {
        return null;
    }
};

export const submitContact = async (
    payload: ContactPayload,
): Promise<ContactApiResponse> => {
    const body = JSON.stringify({
        name: payload.name,
        email: payload.email,
        phone: payload.phone ?? '',
        subject: payload.subject ?? '',
        message: payload.message,
    });

    try {
        const response = await fetch(CONTACT_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
        });
        const data = readResponse(await response.text());

        if (
            response.ok &&
            data &&
            typeof data === 'object' &&
            'success' in data &&
            data.success === true
        ) {
            return {
                success: true,
                message:
                    'message' in data && typeof data.message === 'string'
                        ? data.message
                        : 'Message received successfully.',
            };
        }
    } catch (error) {
        console.error('Contact API request failed:', error);
        // Network details are intentionally not sent to the UI.
    }

    return { success: false, error: CONTACT_API_ERROR_MESSAGE };
};
