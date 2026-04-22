import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import clientPromise from '../../../../lib/db';
import { signToken } from '../../../../lib/auth';
import { sendLoginEmail } from '../../../../lib/email';

export async function POST(request) {
    console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);
    console.log("EMAIL_FROM_ADDRESS:", process.env.EMAIL_FROM_ADDRESS);
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email and password are required' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db('findmyclicks_db');
        const users = db.collection('users');

        const user = await users.findOne({ email });

        if (!user) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        // Fire login notification email - truly non-blocking
        setImmediate(() => {
            sendLoginEmail(user.email, user.name).catch(() => {});
        });

        return NextResponse.json({
            token,
            user: {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
