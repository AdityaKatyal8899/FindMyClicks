import { Resend } from 'resend';

// Hard validation of environment variables on the server
if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY is missing from environment variables.');
}

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM_ADDRESS || 'FindMyClicks <onboarding@resend.dev>';

/**
 * Sends a login notification email to the user.
 * Returns the Resend response for debugging.
 */
export async function sendLoginEmail(to, name) {
    console.log(`[Resend] Attempting to send login email to: ${to}`);
    console.log(`[Resend] From address: ${FROM}`);

    if (!process.env.RESEND_API_KEY) {
        console.error('[Resend] Error: RESEND_API_KEY is not configured.');
        return { error: 'Missing API Key' };
    }

    try {
        const response = await resend.emails.send({
            from: FROM,
            to,
            subject: 'New Login Detected — FindMyClicks.Ai',
            html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#000;font-family:system-ui,sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:40px auto;padding:40px;background:#0a0a0a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;">
    <tr>
      <td style="padding-bottom:24px;border-bottom:1px solid rgba(255,255,255,0.06);">
        <span style="font-size:1.1rem;font-weight:700;letter-spacing:-0.02em;">FindMyClicks<span style="color:#7c3aed;">.Ai</span></span>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 0 8px;">
        <h2 style="margin:0;font-size:1.4rem;font-weight:600;">New login detected</h2>
      </td>
    </tr>
    <tr>
      <td style="padding-bottom:24px;color:rgba(255,255,255,0.55);font-size:0.9rem;line-height:1.6;">
        <p style="margin:0 0 12px;">Hi${name ? ` ${name}` : ''},</p>
        <p style="margin:0 0 12px;">We noticed a new sign-in to your FindMyClicks.Ai account.</p>
        <p style="margin:0;color:rgba(255,255,255,0.35);font-size:0.8rem;">If this was you, no action is needed. If you didn't sign in, please secure your account immediately.</p>
      </td>
    </tr>
    <tr>
      <td style="padding-top:24px;border-top:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.25);font-size:0.75rem;">
        © ${new Date().getFullYear()} FindMyClicks.Ai · You're receiving this because you have an account with us.
      </td>
    </tr>
  </table>
</body>
</html>
            `.trim(),
        });

        if (response.error) {
            console.error('[Resend] Response error:', response.error);
        } else {
            console.log('[Resend] Success response:', response);
        }

        return response;
    } catch (err) {
        console.error('[Resend] Unexpected catch error:', err);
        return { error: err.message };
    }
}
