import { NextRequest, NextResponse } from 'next/server';
import { init, id } from '@instantdb/admin';
import schema from '../../../instant.schema';

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

    const db = init({
      appId: APP_ID,
      adminToken: ADMIN_TOKEN,
      schema
    });

    // Fetch all projects with their owners
    const result = await db.query({
      projects: {
        owner: {}
      }
    });

    if (!result.projects) {
      return NextResponse.json([]);
    }

    // Transform the data to match the Project interface
    const projects = result.projects.map((project: any) => {
      // Safely handle date conversion
      let createdAt: Date;
      try {
        if (project.createdAt instanceof Date) {
          createdAt = project.createdAt;
        } else if (typeof project.createdAt === 'string' || typeof project.createdAt === 'number') {
          createdAt = new Date(project.createdAt);
        } else {
          createdAt = new Date(); // Fallback to current date
        }

        // Check if the date is valid
        if (isNaN(createdAt.getTime())) {
          createdAt = new Date(); // Fallback to current date if invalid
        }
      } catch (error) {
        createdAt = new Date(); // Fallback to current date on error
      }

      return {
        id: project.id,
        title: project.title,
        description: project.description || '',
        author: project.owner?.firstName
          ? `${project.owner.firstName} ${project.owner.lastName || ''}`.trim()
          : project.owner?.email || 'Unknown Author',
        tags: Array.isArray(project.tags) ? project.tags : [],
        createdAt,
        status: project.status || 'planning',
        maxMembers: project.maxMembers,
        currentMembers: project.currentMembers || 1,
        repositoryUrl: project.repositoryUrl,
        contactInfo: project.contactInfo || project.owner?.email || ''
      };
    });

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

    const db = init({
      appId: APP_ID,
      adminToken: ADMIN_TOKEN,
      schema
    });

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

    // Get user's profile
    const profileResult = await db.query({
      profiles: {
        $: { where: { '$user.id': userId } }
      }
    });

    if (!profileResult.profiles || profileResult.profiles.length === 0) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const profile = profileResult.profiles[0];

    // Create the project linked to the profile
    const projectData: any = {
      title,
      description: description || '',
      createdAt: new Date()
    };

    // Add optional fields if provided
    if (status) projectData.status = status;
    if (tags && Array.isArray(tags)) projectData.tags = tags;
    if (maxMembers !== undefined) projectData.maxMembers = maxMembers;
    if (currentMembers !== undefined) projectData.currentMembers = currentMembers;
    if (repositoryUrl) projectData.repositoryUrl = repositoryUrl;
    if (contactInfo) projectData.contactInfo = contactInfo;

    await db.transact([
      db.tx.projects[id()].update(projectData).link({ owner: profile.id })
    ]);

    return NextResponse.json({
      success: true,
      message: 'Project created successfully!'
    });

  } catch (error: unknown) {
    console.error('Project creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Project creation failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}