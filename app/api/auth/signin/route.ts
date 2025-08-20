import { NextRequest, NextResponse } from 'next/server';
import { init } from '@instantdb/admin';
import bcrypt from 'bcryptjs';
import schema from '../../../../instant.schema';

// Verify password
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function POST(request: NextRequest) {
  try {
    // Initialize admin DB inside the request handler
    const APP_ID = process.env.NEXT_PUBLIC_INSTANTDB_APP_ID || process.env.INSTANTDB_APP_ID;
    const ADMIN_TOKEN = process.env.INSTANTDB_ADMIN_TOKEN;

    if (!APP_ID || !ADMIN_TOKEN) {
      return NextResponse.json(
        { error: `Missing environment variables. APP_ID: ${!!APP_ID}, ADMIN_TOKEN: ${!!ADMIN_TOKEN}` },
        { status: 500 }
      );
    }

    const db = init({
      appId: APP_ID,
      adminToken: ADMIN_TOKEN,
      schema
    });

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get user from InstantDB
    const user = await db.auth.getUser({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get user credentials
    const credentialsResult = await db.query({
      credentials: {
        $: { where: { userId: user.id } }
      }
    });

    const credentials = credentialsResult.credentials[0];
    if (!credentials) {
      return NextResponse.json(
        { error: 'This account was not created with credentials. Please use magic code authentication.' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, credentials.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create a new token for the user
    const token = await db.auth.createToken(email);

    return NextResponse.json({
      success: true,
      message: 'Sign in successful!',
      token,
      user
    });

  } catch (error: unknown) {
    console.error('Signin error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}