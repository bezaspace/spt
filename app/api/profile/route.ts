import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebaseAdmin';
import { profileSchema } from '@/lib/validations/profile';

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

    const body = await request.json();

    // For now, we'll need to get the user from the request
    // In a real app, you'd use authentication middleware
    const userId = body.userId;
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    // Check if profile already exists
    const adminFirestore = getAdminFirestore();
    const existingProfiles = await adminFirestore.collection('profiles').where('userId', '==', userId).get();

    if (!existingProfiles.empty) {
      return NextResponse.json({ error: 'Profile already exists' }, { status: 409 });
    }

    // Validate the request body
    const validatedData = profileSchema.parse(body);
    console.log('Creating profile with data:', validatedData);

    // Create new profile
    const profileData = {
      ...validatedData,
      userId,
      createdAt: new Date(),
    };

    const docRef = await adminFirestore.collection('profiles').add(profileData);

    return NextResponse.json({
      success: true,
      profileId: docRef.id,
      message: 'Profile created successfully'
    });
  } catch (error) {
    console.error('Profile creation error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

  const body = await request.json();

    // For now, we'll need to get the user from the request
    // In a real app, you'd use authentication middleware
    const userId = body.userId;
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    // Validate the request body
    const validatedData = profileSchema.parse(body);
    console.log('Validated data:', validatedData);

    // Initialize Firestore
    const adminFirestore = getAdminFirestore();

    // Find profile doc by userId
    const profilesSnap = await adminFirestore.collection('profiles').where('userId', '==', userId).get();
    if (profilesSnap.empty) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profileDoc = profilesSnap.docs[0];

    // Only keep non-empty fields
    const updateData: Record<string, unknown> = {};
    Object.keys(validatedData).forEach((key) => {
      const value = (validatedData as unknown as Record<string, unknown>)[key];
      if (value !== undefined && value !== null && value !== '') {
        updateData[key] = value;
      }
    });

    await adminFirestore.collection('profiles').doc(profileDoc.id).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}