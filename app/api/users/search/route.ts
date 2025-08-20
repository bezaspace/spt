import { NextRequest, NextResponse } from 'next/server';
import { init } from '@instantdb/admin';
import schema from '../../../../instant.schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    // Initialize admin DB inside the request handler
    const APP_ID = process.env.NEXT_PUBLIC_INSTANTDB_APP_ID || process.env.INSTANTDB_APP_ID;
    const ADMIN_TOKEN = process.env.INSTANTDB_ADMIN_TOKEN;

    if (!APP_ID || !ADMIN_TOKEN) {
      return NextResponse.json(
        { error: 'Missing environment variables' },
        { status: 500 }
      );
    }

    const db = init({
      appId: APP_ID,
      adminToken: ADMIN_TOKEN,
      schema
    });

    // Search profiles by multiple fields
    const searchTerm = query.toLowerCase().trim();

    const result = await db.query({
      profiles: {
        $user: {}
      }
    });

    if (!result.profiles) {
      return NextResponse.json([]);
    }

    // Filter profiles based on search term
    const matchingProfiles = result.profiles.filter((profile: any) => {
      const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.toLowerCase();
      const email = profile.$user?.email?.toLowerCase() || '';
      const bio = profile.bio?.toLowerCase() || '';
      const location = profile.location?.toLowerCase() || '';
      const skills = Array.isArray(profile.skills)
        ? profile.skills.join(' ').toLowerCase()
        : '';

      return fullName.includes(searchTerm) ||
             email.includes(searchTerm) ||
             bio.includes(searchTerm) ||
             location.includes(searchTerm) ||
             skills.includes(searchTerm);
    });

    // Transform and limit results
    const users = matchingProfiles.slice(0, 10).map((profile: any) => ({
      id: profile.id,
      userId: profile.$user?.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.$user?.email,
      bio: profile.bio,
      location: profile.location,
      avatar: profile.avatar,
      skills: profile.skills || []
    }));

    return NextResponse.json(users);

  } catch (error: unknown) {
    console.error('User search error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Search failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}