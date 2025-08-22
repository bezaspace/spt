import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebaseAdmin';

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

    // Search profiles by multiple fields using Firestore and in-memory filtering
    const searchTerm = query.toLowerCase().trim();

    // Initialize Firestore
    const adminFirestore = getAdminFirestore();

    // Fetch profiles (limit to 100 for safety)
    const profilesSnap = await adminFirestore.collection('profiles').limit(100).get();
    if (profilesSnap.empty) return NextResponse.json([]);

    const profiles = profilesSnap.docs.map((d) => {
      const p = d.data() as Record<string, unknown>;
      // Attempt to find associated user email from users collection if stored
      // Our schema stores userId on profile; fetch user email from Firebase Auth (not available here),
      // so rely on profile.email if present.
      return {
        id: d.id,
        ...p
      };
    });

    const matchingProfiles = profiles.filter((profile: Record<string, unknown>) => {
      const fullName = `${String(profile.firstName || '')} ${String(profile.lastName || '')}`.toLowerCase();
      const email = String(profile.email || '').toLowerCase();
      const bio = String(profile.bio || '').toLowerCase();
      const location = String(profile.location || '').toLowerCase();
      const skills = Array.isArray(profile.skills) ? (profile.skills as string[]).join(' ').toLowerCase() : '';

      return fullName.includes(searchTerm) ||
             email.includes(searchTerm) ||
             bio.includes(searchTerm) ||
             location.includes(searchTerm) ||
             skills.includes(searchTerm);
    });

    const users = matchingProfiles.slice(0, 10).map((profile: Record<string, unknown>) => ({
      id: profile.id,
      userId: profile.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
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