import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebaseAdmin';

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

    // Initialize firebase admin and get instances
    const adminAuth = getAdminAuth();
    const adminFirestore = getAdminFirestore();

    // Check if user already exists in Firebase
    try {
      const existingUser = await adminAuth.getUserByEmail(email);
      if (existingUser) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
      }
    } catch (e) {
      // user does not exist - continue
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create Firebase Auth user
    const created = await adminAuth.createUser({ email, password });

    // Store credentials and profile in Firestore
    await adminFirestore.collection('credentials').doc(created.uid).set({
      email,
      password: hashedPassword,
      userId: created.uid,
    });

    await adminFirestore.collection('profiles').add({
      firstName: email.split('@')[0],
      lastName: '',
      createdAt: new Date(),
      userId: created.uid,
    });

    // Create custom token
    const token = await adminAuth.createCustomToken(created.uid);

    return NextResponse.json({ success: true, message: 'Account created successfully!', token });

  } catch (error: unknown) {
    console.error('Signup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Signup failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}