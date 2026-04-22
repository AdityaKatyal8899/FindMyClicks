import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import clientPromise from '../../../../lib/db';

export async function POST(request) {
    try {
        const { email, password, role } = await request.json();

        if (!email || !password || !role) {
            return NextResponse.json(
                { message: 'Email, password, and role are required' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db('findmyclicks_db');
        const users = db.collection('users');

        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: 'User already exists' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await users.insertOne({
            email,
            password: hashedPassword,
            role,
            createdAt: new Date(),
        });

        return NextResponse.json({
            message: 'User registered successfully',
            userId: result.insertedId,
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
