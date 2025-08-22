import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, admin } from '@/lib/firebaseAdmin';

export async function GET() {
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

    // Initialize Firestore
    const adminFirestore = getAdminFirestore();

    // Fetch projects from Firestore and join owner profile
    const projSnap = await adminFirestore.collection('projects').orderBy('createdAt', 'desc').get();
    const projects = await Promise.all(projSnap.docs.map(async (d: any) => {
      const p = d.data() as Record<string, unknown>;
      let author = 'Unknown Author';
      if (p.ownerId) {
        const ownerId = String(p.ownerId);
        const profSnap = await adminFirestore.collection('profiles').doc(ownerId).get().catch(() => null);
        if (profSnap && profSnap.exists) {
          const prof = profSnap.data() as Record<string, unknown>;
          const fn = prof.firstName as string | undefined;
          const ln = prof.lastName as string | undefined;
          const em = prof.email as string | undefined;
          author = fn ? `${fn} ${ln || ''}`.trim() : em || 'Unknown Author';
        }
      }

      return {
        id: d.id,
        title: p.title,
        description: p.description || '',
        author,
        tags: Array.isArray(p.tags) ? p.tags : [],
  createdAt: (p.createdAt && typeof p.createdAt === 'object' && 'toDate' in p.createdAt) ? (p.createdAt as any).toDate() : (p.createdAt || new Date()),
        status: p.status || 'planning',
        maxMembers: p.maxMembers,
        currentMembers: p.currentMembers || 1,
        repositoryUrl: p.repositoryUrl,
        contactInfo: p.contactInfo || ''
      };
    }));

    return NextResponse.json(projects);

  } catch (error: unknown) {
    console.error('Projects fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch projects';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
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

    // Initialize Firestore
    const adminFirestore = getAdminFirestore();

    const {
      title,
      description,
      userId,
      status,
      tags,
      maxMembers,
      currentMembers,
      repositoryUrl,
      contactInfo
    } = await request.json();

    if (!title || !userId) {
      return NextResponse.json(
        { error: 'Title and userId are required' },
        { status: 400 }
      );
    }

    // Get user's profile (expects profile doc id or userId)
    const profilesSnap = await adminFirestore.collection('profiles').where('userId', '==', userId).get();
    if (profilesSnap.empty) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const profileDoc = profilesSnap.docs[0];

    const projectData: Record<string, unknown> = {
      title,
      description: description || '',
      createdAt: admin.firestore.FieldValue ? admin.firestore.FieldValue.serverTimestamp() : new Date(),
      ownerId: profileDoc.id,
    };

    if (status) projectData.status = status;
    if (tags && Array.isArray(tags)) projectData.tags = tags;
    if (maxMembers !== undefined) projectData.maxMembers = maxMembers;
    if (currentMembers !== undefined) projectData.currentMembers = currentMembers;
    if (repositoryUrl) projectData.repositoryUrl = repositoryUrl;
    if (contactInfo) projectData.contactInfo = contactInfo;

    await adminFirestore.collection('projects').add(projectData);

    return NextResponse.json({ success: true, message: 'Project created successfully!' });

  } catch (error: unknown) {
    console.error('Project creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Project creation failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}