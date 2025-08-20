import { NextRequest, NextResponse } from 'next/server';
import { init } from '@instantdb/admin';
import schema from '../../../instant.schema';
import { profileSchema } from '@/lib/validations/profile';

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

    const db = init({
      appId: APP_ID,
      adminToken: ADMIN_TOKEN,
      schema
    });

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

    // Get the user's profile
    const profileResult = await db.query({
      profiles: {
        $: {
          where: { '$user.id': userId }
        }
      }
    });

    if (!profileResult.profiles || profileResult.profiles.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = profileResult.profiles[0];

    // Only include fields that are not empty/undefined
    const updateData: any = {};
    Object.keys(validatedData).forEach(key => {
      const value = (validatedData as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        updateData[key] = value;
      }
    });

    console.log('Update data:', updateData);

    // Try a simpler approach - just update firstName and lastName first
    const simpleUpdate = {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
    };

    // Update the profile
    await db.transact([
      db.tx.profiles[profile.id].update(simpleUpdate)
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}