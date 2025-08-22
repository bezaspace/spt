import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebaseAdmin';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Remove unused request parameter warning
  void request;
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Initialize Firestore
    const adminFirestore = getAdminFirestore();

    const projDoc = await adminFirestore.collection('projects').doc(id).get();

    if (!projDoc.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

  const p = projDoc.data() as Record<string, unknown>;
  const project = { id: projDoc.id, ...p };

  // Transform the data to match the Project interface
    let createdAt: Date;
    try {
  const dateValue = p.createdAt as unknown;
      if (dateValue && typeof dateValue === 'object' && 'getTime' in dateValue) {
        createdAt = dateValue as Date;
      } else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
        createdAt = new Date(dateValue);
      } else {
        createdAt = new Date();
      }

      if (isNaN(createdAt.getTime())) {
        createdAt = new Date();
      }
    } catch (error) {
      createdAt = new Date();
    }

    const transformedProject: Record<string, unknown> = {
  id: project.id,
  title: p.title as string | undefined,
  description: (p.description as string) || '',
      author: 'Unknown Author',
  tags: Array.isArray(p.tags) ? (p.tags as string[]) : [],
      createdAt,
      status: (project as any).status || 'planning',
      maxMembers: (project as any).maxMembers,
      currentMembers: (project as any).currentMembers || 1,
      repositoryUrl: (project as any).repositoryUrl,
      contactInfo: (project as any).contactInfo || ''
    };

    // If ownerId present, try fetching profile for author
    if ((project as any).ownerId) {
      const profSnap = await adminFirestore.collection('profiles').doc((project as any).ownerId).get().catch(() => null);
      if (profSnap && profSnap.exists) {
    const prof = profSnap.data() as Record<string, unknown>;
    const firstName = prof.firstName as string | undefined;
    const lastName = prof.lastName as string | undefined;
    const email = prof.email as string | undefined;
    transformedProject.author = firstName ? `${firstName} ${lastName || ''}`.trim() : email || 'Unknown Author';
      }
    }

    return NextResponse.json(transformedProject);

  } catch (error: unknown) {
    console.error('Project fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch project';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}