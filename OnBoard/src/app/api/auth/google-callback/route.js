import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/db';
import { signToken } from '../../../../lib/auth';
import { sendLoginEmail } from '../../../../lib/email';

/**
 * POST /api/auth/google-callback
 *
 * Called from the frontend after NextAuth Google sign-in succeeds.
 * Receives email + name from the client (already verified by NextAuth),
 * upserts user in MongoDB, and returns our own platform JWT.
 */
export async function POST(request) {
    console.log("[Google Callback] RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);
    console.log("[Google Callback] EMAIL_FROM_ADDRESS:", process.env.EMAIL_FROM_ADDRESS);
    try {
        const body = await request.json();
        const { email, name, role } = body;

        if (!email) {
            return NextResponse.json({ message: 'Missing email from session' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('findmyclicks_db');
        const users = db.collection('users');

        // Upsert: create user if not exists, update lastLogin if already exists
        await users.updateOne(
            { email },
            {
                $setOnInsert: {
                    email,
                    name: name || '',
                    role: role || 'customer',
                    provider: 'google',
                    createdAt: new Date(),
                },
                $set: { lastLogin: new Date() },
            },
            { upsert: true }
        );

        const user = await users.findOne({ email });

        // Issue our own platform JWT
        const platformToken = signToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        // Fire login notification email - truly non-blocking
        setImmediate(() => {
            sendLoginEmail(user.email, user.name).catch(() => { });
        });

        return NextResponse.json({
            token: platformToken,
            user: {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Google OAuth callback error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
