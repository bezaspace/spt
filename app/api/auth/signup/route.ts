import { NextRequest, NextResponse } from 'next/server';
import { init, id } from '@instantdb/admin';
import bcrypt from 'bcryptjs';
import schema from '../../../../instant.schema';

// Password validation
async function validatePassword(password: string): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Hash password
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function POST(request: NextRequest) {
  try {
    // Initialize admin DB inside the request handler
    const APP_ID = process.env.NEXT_PUBLIC_INSTANTDB_APP_ID || process.env.INSTANTDB_APP_ID;
    const ADMIN_TOKEN = process.env.INSTANTDB_ADMIN_TOKEN;

    console.log('Environment check:', {
      APP_ID: APP_ID ? 'Present' : 'Missing',
      ADMIN_TOKEN: ADMIN_TOKEN ? 'Present' : 'Missing',
      allEnv: Object.keys(process.env).filter(key => key.includes('INSTANT')),
      raw_APP_ID: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID,
      raw_APP_ID_alt: process.env.INSTANTDB_APP_ID
    });

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

    // Validate password
    const validation = await validatePassword(password);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Check if user already exists
    try {
      const existingUser = await db.auth.getUser({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }
    } catch (error) {
      // User doesn't exist, which is what we want
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with InstantDB auth system
    const token = await db.auth.createToken(email);

    // Get the created user
    const user = await db.auth.getUser({ email });

    if (user) {
      // Store credentials and create profile in a single transaction
      await db.transact([
        db.tx.credentials[user.id].update({
          email,
          password: hashedPassword,
          userId: user.id
        }),
        db.tx.profiles[id()].update({
          firstName: email.split('@')[0], // Use email prefix as default name
          lastName: '',
          createdAt: new Date()
        }).link({ $user: user.id })
      ]);
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      token
    });

  } catch (error: unknown) {
    console.error('Signup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Signup failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}