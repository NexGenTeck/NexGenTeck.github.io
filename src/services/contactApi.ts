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
    console.log("CONTACT API URL:", import.meta.env.VITE_CONTACT_API_URL);
    const body = JSON.stringify(payload);
    console.log("REQUEST BODY:", body);

    if (!endpoint) {
        if (import.meta.env.DEV) {
            console.warn('VITE_CONTACT_API_URL is not configured.');
        }

        return { success: false, error: CONTACT_API_ERROR_MESSAGE };
    }

    try {
        console.log("STEP A: about to fetch");
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
        });
        console.log("STEP B: response received", response.status);
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
