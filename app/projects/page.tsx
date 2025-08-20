'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Project } from '@/lib/types';
import Navbar from '@/components/Navbar';
import ProjectsList from '@/components/ProjectsList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = db.useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/projects');

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Error Loading Projects</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={fetchProjects} variant="outline">
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Browse Projects</h1>
          <p className="text-muted-foreground">
            Discover amazing projects and find collaborators for your next big idea.
          </p>
        </div>

        {user && (
          <div className="mb-8">
            <Link href="/">
              <Button>
                Create Your Own Project
              </Button>
            </Link>
          </div>
        )}

        <ProjectsList projects={projects} />
      </main>
    </div>
  );
}