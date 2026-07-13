import { Resend } from 'resend';

type RequestHeaders = Record<string, string | string[] | undefined>;

interface VercelRequest {
    method?: string;
    body?: unknown;
    headers: RequestHeaders;
    socket?: { remoteAddress?: string };
}

interface VercelResponse {
    status: (statusCode: number) => VercelResponse;
    json: (body: unknown) => void;
    setHeader: (name: string, value: string) => void;
}

interface ContactPayload {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    website?: string;
}

const GENERIC_ERROR =
    'Unable to send message right now. Please try again later.';
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 50;
const MAX_SUBJECT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 10_000;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const parseJsonBody = (body: unknown): Record<string, unknown> | null => {
    if (isRecord(body)) {
        return body;
    }

    if (typeof body !== 'string') {
        return null;
    }

    try {
        const parsed: unknown = JSON.parse(body);
        return isRecord(parsed) ? parsed : null;
    } catch {
        return null;
    }
};

const readRequiredString = (
    body: Record<string, unknown>,
    key: 'name' | 'email' | 'message',
    maxLength: number,
): string | null => {
    const value = body[key];

    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null;
};

const readOptionalString = (
    body: Record<string, unknown>,
    key: 'phone' | 'subject' | 'website',
    maxLength: number,
): string | null => {
    const value = body[key];

    if (value === undefined || value === null) {
        return '';
    }

    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length <= maxLength ? trimmed : null;
};

const validatePayload = (body: Record<string, unknown>): ContactPayload | null => {
    const name = readRequiredString(body, 'name', MAX_NAME_LENGTH);
    const email = readRequiredString(body, 'email', MAX_EMAIL_LENGTH);
    const message = readRequiredString(body, 'message', MAX_MESSAGE_LENGTH);
    const phone = readOptionalString(body, 'phone', MAX_PHONE_LENGTH);
    const subject = readOptionalString(body, 'subject', MAX_SUBJECT_LENGTH);
    const website = readOptionalString(body, 'website', MAX_SUBJECT_LENGTH);

    if (
        !name ||
        !email ||
        !message ||
        phone === null ||
        subject === null ||
        website === null ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        return null;
    }

    return { name, email, message, phone, subject, website };
};

const escapeHtml = (value: string): string =>
    value.replace(/[&<>'"]/g, (character) => {
        const entities: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;',
        };
        return entities[character];
    });

const formatMultilineText = (value: string): string =>
    escapeHtml(value).replace(/\r?\n/g, '<br />');

const getClientIp = (request: VercelRequest): string => {
    const forwardedFor = request.headers['x-forwarded-for'];
    const forwardedValue = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor;

    return forwardedValue?.split(',')[0]?.trim() || request.socket?.remoteAddress || 'Unavailable';
};

const companyEmailHtml = (payload: ContactPayload, submittedAt: string, ip: string): string => `
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr><td style="padding:24px 32px;background:#f97316;color:#ffffff;"><h1 style="margin:0;font-size:24px;">New contact form submission</h1></td></tr>
          <tr><td style="padding:32px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
              <tr><td style="padding:10px 0;border-bottom:1px solid #e4e4e7;width:150px;font-weight:bold;">Name</td><td style="padding:10px 0;border-bottom:1px solid #e4e4e7;">${escapeHtml(payload.name)}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #e4e4e7;font-weight:bold;">Email</td><td style="padding:10px 0;border-bottom:1px solid #e4e4e7;"><a href="mailto:${escapeHtml(payload.email)}" style="color:#ea580c;">${escapeHtml(payload.email)}</a></td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #e4e4e7;font-weight:bold;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #e4e4e7;">${escapeHtml(payload.phone || 'Not provided')}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #e4e4e7;font-weight:bold;">Subject</td><td style="padding:10px 0;border-bottom:1px solid #e4e4e7;">${escapeHtml(payload.subject || 'Not provided')}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #e4e4e7;font-weight:bold;vertical-align:top;">Message</td><td style="padding:10px 0;border-bottom:1px solid #e4e4e7;line-height:1.6;">${formatMultilineText(payload.message)}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #e4e4e7;font-weight:bold;">Submitted</td><td style="padding:10px 0;border-bottom:1px solid #e4e4e7;">${escapeHtml(submittedAt)}</td></tr>
              <tr><td style="padding:10px 0;font-weight:bold;">IP address</td><td style="padding:10px 0;">${escapeHtml(ip)}</td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

const autoReplyHtml = (name: string): string => `
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr><td style="padding:24px 32px;background:#f97316;color:#ffffff;"><h1 style="margin:0;font-size:24px;">Thank you for contacting NexGenTeck</h1></td></tr>
          <tr><td style="padding:32px;font-size:16px;line-height:1.6;">
            <p>Dear ${escapeHtml(name)},</p>
            <p>Thank you for contacting NexGenTeck.</p>
            <p>We have successfully received your message.</p>
            <p>Our team will review your request and contact you shortly.</p>
            <p style="margin-top:28px;">Best Regards,<br /><strong>NexGenTeck Team</strong><br /><a href="https://nexgenteck.com" style="color:#ea580c;">https://nexgenteck.com</a></p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
): Promise<void> {
    response.setHeader('Allow', 'POST');

    if (request.method !== 'POST') {
        response.status(405).json({ success: false, error: 'Method not allowed.' });
        return;
    }

    const parsedBody = parseJsonBody(request.body);
    const payload = parsedBody ? validatePayload(parsedBody) : null;

    if (!payload || payload.website) {
        response.status(400).json({ success: false, error: 'Invalid request.' });
        return;
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.TO_EMAIL;

    if (!apiKey || !toEmail) {
        console.error('Contact email service is not configured.');
        response.status(500).json({ success: false, error: GENERIC_ERROR });
        return;
    }

    const submittedAt = new Date().toISOString();
    const ip = getClientIp(request);
    const resend = new Resend(apiKey);

    try {
        const [companyResult, autoReplyResult] = await Promise.all([
            resend.emails.send({
                from: 'NexGenTeck <info@nexgenteck.com>',
                to: [toEmail],
                replyTo: payload.email,
                subject: 'New Contact Form Submission',
                html: companyEmailHtml(payload, submittedAt, ip),
            }),
            resend.emails.send({
                from: 'NexGenTeck <info@nexgenteck.com>',
                to: [payload.email],
                subject: 'Thank You for Contacting NexGenTeck',
                html: autoReplyHtml(payload.name),
            }),
        ]);

        if (companyResult.error || autoReplyResult.error) {
            throw new Error(
                companyResult.error?.message || autoReplyResult.error?.message,
            );
        }

        response.status(200).json({
            success: true,
            message: 'We have received your message successfully.',
        });
    } catch (error) {
        console.error('Unable to send contact form email.', error);
        response.status(500).json({ success: false, error: GENERIC_ERROR });
    }
}
