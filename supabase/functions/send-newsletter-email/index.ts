// =============================================================
// Supabase Edge Function: send-newsletter-email
// Runtime: Deno (deployed on Supabase)
// Secrets required (set via Supabase Dashboard > Edge Functions > Secrets):
//   RESEND_API_KEY  — from resend.com
//   SUPABASE_URL    — auto-injected by Supabase
//   SUPABASE_SERVICE_ROLE_KEY — auto-injected by Supabase
// =============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY   = Deno.env.get('RESEND_API_KEY') ?? '';
const SUPABASE_URL     = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const FROM_EMAIL       = 'NexGenTeck <info@nexgenteck.com>';
const ADMIN_EMAILS     = ['waizhussain9955@gmail.com', 'info@nexgenteck.com'];
const BRAND_COLOR      = '#f97316';
const CURRENT_YEAR     = new Date().getFullYear();

// Supabase admin client (service role — used for email_logs inserts)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Types ───────────────────────────────────────────────────
interface EmailPayload {
  subscriberEmail: string;
  subscribedAt: string;
  recordId: number;
}

interface ResendResponse {
  id?: string;
  error?: { message: string };
}

// ─── Helper: log email attempt ────────────────────────────────
async function logEmail(
  recipient: string,
  type: 'subscriber' | 'admin',
  status: 'sent' | 'failed',
  errorMessage?: string
): Promise<void> {
  await supabaseAdmin.from('email_logs').insert({
    recipient,
    type,
    status,
    provider: 'resend',
    error_message: errorMessage ?? null,
  });
}

// ─── Helper: send one email via Resend ───────────────────────
async function sendViaResend(payload: {
  from: string;
  to: string[];
  subject: string;
  html: string;
}): Promise<ResendResponse> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return res.json() as Promise<ResendResponse>;
}

// ─── Email Templates ─────────────────────────────────────────

function subscriberHtml(email: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Welcome to NexGenTeck Newsletter</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111111;border-radius:16px;overflow:hidden;border:1px solid #222;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a 0%,#0d0d0d 100%);padding:40px 40px 30px;text-align:center;border-bottom:3px solid ${BRAND_COLOR};">
              <div style="display:inline-block;">
                <span style="font-size:28px;font-weight:900;letter-spacing:-0.5px;">
                  <span style="color:${BRAND_COLOR};">NexGen</span><span style="color:#ffffff;">Teck</span>
                </span>
              </div>
              <p style="color:#666;font-size:13px;margin:8px 0 0;">nexgenteck.com</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 30px;">
              <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 16px;">Welcome to Our Newsletter! 🎉</h1>
              <p style="color:#aaa;font-size:15px;line-height:1.7;margin:0 0 24px;">
                Hello,<br/><br/>
                Thank you for subscribing to the <strong style="color:#fff;">NexGenTeck Newsletter</strong>.
                We're excited to welcome you to our growing community.
              </p>
              <p style="color:#aaa;font-size:15px;line-height:1.7;margin:0 0 8px;">You'll now receive updates about:</p>

              <!-- Topics Grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 32px;">
                ${[
                  ['🤖', 'Artificial Intelligence'],
                  ['💻', 'Web Development'],
                  ['📱', 'Mobile Development'],
                  ['📦', 'New Products & Services'],
                  ['📚', 'Tutorials & Guides'],
                  ['🌐', 'Technology News'],
                  ['🎁', 'Exclusive Offers'],
                ].map(([icon, label]) => `
                <tr>
                  <td style="padding:6px 0;">
                    <span style="display:inline-block;background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:8px 16px;color:#ddd;font-size:14px;">
                      ${icon} &nbsp;${label}
                    </span>
                  </td>
                </tr>`).join('')}
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:${BRAND_COLOR};border-radius:8px;">
                    <a href="https://nexgenteck.com" style="display:inline-block;padding:14px 32px;color:#fff;font-weight:700;font-size:15px;text-decoration:none;">Visit NexGenTeck →</a>
                  </td>
                </tr>
              </table>

              <p style="color:#888;font-size:14px;line-height:1.7;margin:0;">
                Thank you for joining us.<br/>
                <strong style="color:#ccc;">NexGenTeck Team</strong>
              </p>
            </td>
          </tr>

          <!-- Social Links -->
          <tr>
            <td style="padding:20px 40px;background:#0d0d0d;text-align:center;border-top:1px solid #222;">
              <a href="https://www.facebook.com/profile.php?id=61585558202243" style="color:${BRAND_COLOR};text-decoration:none;margin:0 10px;font-size:13px;">Facebook</a>
              <a href="https://www.linkedin.com/company/nexgenteck" style="color:${BRAND_COLOR};text-decoration:none;margin:0 10px;font-size:13px;">LinkedIn</a>
              <a href="https://www.instagram.com/nexgenteck" style="color:${BRAND_COLOR};text-decoration:none;margin:0 10px;font-size:13px;">Instagram</a>
              <a href="https://www.youtube.com/@NexGenTeckcom" style="color:${BRAND_COLOR};text-decoration:none;margin:0 10px;font-size:13px;">YouTube</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;background:#080808;text-align:center;">
              <p style="color:#444;font-size:12px;margin:0 0 6px;">
                © ${CURRENT_YEAR} NexGenTeck. All rights reserved.
              </p>
              <p style="color:#333;font-size:11px;margin:0;">
                Shahra-e-Faisal, Karachi, Pakistan &nbsp;|&nbsp;
                <a href="mailto:info@nexgenteck.com" style="color:#444;text-decoration:none;">info@nexgenteck.com</a>
              </p>
              <p style="color:#2a2a2a;font-size:11px;margin:8px 0 0;">
                You received this email because ${email} subscribed on nexgenteck.com.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function adminHtml(subscriberEmail: string, subscribedAt: string, recordId: number): string {
  const date = new Date(subscribedAt);
  const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>New Newsletter Subscriber</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">

          <!-- Header -->
          <tr>
            <td style="background:#111;padding:24px 32px;border-bottom:4px solid ${BRAND_COLOR};">
              <span style="font-size:22px;font-weight:900;">
                <span style="color:${BRAND_COLOR};">NexGen</span><span style="color:#fff;">Teck</span>
              </span>
              <span style="color:#666;font-size:13px;margin-left:12px;">Admin Notification</span>
            </td>
          </tr>

          <!-- Alert Banner -->
          <tr>
            <td style="background:#fff8f2;padding:16px 32px;border-bottom:1px solid #ffe5cc;">
              <p style="margin:0;color:#c2410c;font-weight:700;font-size:15px;">🔔 New Newsletter Subscriber</p>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding:28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${[
                  ['Subscriber Email', subscriberEmail],
                  ['Date', formattedDate],
                  ['Time', formattedTime],
                  ['Source', 'Newsletter (Footer Form)'],
                  ['Website', 'nexgenteck.com'],
                  ['Supabase Record ID', `#${recordId}`],
                ].map(([label, value]) => `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#666;font-size:13px;width:160px;vertical-align:top;">${label}</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#111;font-size:14px;font-weight:600;">${value}</td>
                </tr>`).join('')}
              </table>

              <div style="margin-top:24px;padding:16px;background:#fafafa;border-radius:8px;border-left:4px solid ${BRAND_COLOR};">
                <p style="margin:0;color:#555;font-size:13px;">
                  View all subscribers in
                  <a href="https://supabase.com/dashboard/project/owmgcguwmqdxerorgzje/editor" style="color:${BRAND_COLOR};text-decoration:none;font-weight:600;">Supabase Dashboard →</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;background:#f8f8f8;text-align:center;border-top:1px solid #eee;">
              <p style="color:#aaa;font-size:11px;margin:0;">© ${CURRENT_YEAR} NexGenTeck — Automated Admin Notification</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Main Handler ─────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  let payload: EmailPayload;
  try {
    payload = (await req.json()) as EmailPayload;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { subscriberEmail, subscribedAt, recordId } = payload;

  if (!subscriberEmail || !subscribedAt || recordId == null) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  // ── Send subscriber confirmation email ──────────────────────
  try {
    const subResult = await sendViaResend({
      from: FROM_EMAIL,
      to: [subscriberEmail],
      subject: 'Welcome to NexGenTeck Newsletter 🎉',
      html: subscriberHtml(subscriberEmail),
    });

    if (subResult.error) {
      await logEmail(subscriberEmail, 'subscriber', 'failed', subResult.error.message);
    } else {
      await logEmail(subscriberEmail, 'subscriber', 'sent');
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logEmail(subscriberEmail, 'subscriber', 'failed', msg);
  }

  // ── Send admin notification emails (independent — one failure won't stop the other) ──
  for (const adminEmail of ADMIN_EMAILS) {
    try {
      const adminResult = await sendViaResend({
        from: FROM_EMAIL,
        to: [adminEmail],
        subject: 'New Newsletter Subscriber — NexGenTeck',
        html: adminHtml(subscriberEmail, subscribedAt, recordId),
      });

      if (adminResult.error) {
        await logEmail(adminEmail, 'admin', 'failed', adminResult.error.message);
      } else {
        await logEmail(adminEmail, 'admin', 'sent');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await logEmail(adminEmail, 'admin', 'failed', msg);
    }
  }

  // Always return 200 — email failures are logged but never block the subscription
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
});
