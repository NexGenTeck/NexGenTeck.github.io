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
    const endpoint = import.meta.env.VITE_CONTACT_API_URL?.trim();

    if (!endpoint) {
        if (import.meta.env.DEV) {
            console.warn('VITE_CONTACT_API_URL is not configured.');
        }

        return { success: false, error: CONTACT_API_ERROR_MESSAGE };
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
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
    } catch {
        // Network details are intentionally not sent to the UI.
    }

    return { success: false, error: CONTACT_API_ERROR_MESSAGE };
};
