import { NextResponse } from 'next/server';
import { init } from '@instantdb/admin';
import schema from '../../../../instant.schema';

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

    // Fetch specific project with owner info
    const result = await db.query({
      projects: {
        $: { where: { id } },
        owner: {}
      }
    });

    if (!result.projects || result.projects.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const project = result.projects[0];

    // Transform the data to match the Project interface
    let createdAt: Date;
    try {
      const dateValue = project.createdAt;
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

    const transformedProject = {
      id: project.id,
      title: project.title,
      description: project.description || '',
      author: project.owner?.firstName
        ? `${project.owner.firstName} ${project.owner.lastName || ''}`.trim()
        : 'Unknown Author',
      tags: Array.isArray(project.tags) ? project.tags : [],
      createdAt,
      status: project.status || 'planning',
      maxMembers: project.maxMembers,
      currentMembers: project.currentMembers || 1,
      repositoryUrl: project.repositoryUrl,
      contactInfo: project.contactInfo || ''
    };

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