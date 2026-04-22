import { NextResponse } from 'next/server';
import { sendLoginEmail } from '../../../lib/email';

/**
 * GET /api/test-email?to=your-email@example.com
 * A utility route to test Resend integration outside of the login flow.
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const to = searchParams.get('to');

    if (!to) {
        return NextResponse.json({
            error: 'Missing "to" query parameter. Use /api/test-email?to=your@email.com'
        }, { status: 400 });
    }

    console.log(`[Test] Triggering manual test email for: ${to}`);
    const result = await sendLoginEmail(to, 'Test User');

    return NextResponse.json({
        message: 'Test email triggered',
        result
    });
}
