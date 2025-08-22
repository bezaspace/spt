import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebaseAdmin';

// Verify password
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
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

    // Initialize firebase admin and get instances
    const adminAuth = getAdminAuth();
    const adminFirestore = getAdminFirestore();

    // Get user from Firebase Auth
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Get credentials stored in Firestore
    const credSnap = await adminFirestore.collection('credentials').where('userId', '==', userRecord.uid).get();
    const credentials = credSnap.docs[0]?.data();
    if (!credentials) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, credentials.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Ensure profile exists in Firestore
    const profileSnap = await adminFirestore.collection('profiles').where('userId', '==', userRecord.uid).get();
    if (profileSnap.empty) {
      await adminFirestore.collection('profiles').add({
        firstName: email.split('@')[0],
        lastName: '',
        createdAt: new Date(),
        userId: userRecord.uid,
      });
    }

    // Create a custom token for the client to sign in with Firebase client SDK
    const token = await adminAuth.createCustomToken(userRecord.uid);

    return NextResponse.json({ success: true, message: 'Sign in successful!', token, user: { id: userRecord.uid, email: userRecord.email } });

  } catch (error: unknown) {
    console.error('Signin error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}