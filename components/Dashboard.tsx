'use client';

import React, { useState } from 'react';
import { db } from '../lib/db';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const user = db.useUser();
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  // Query for user's profile and projects
  const { isLoading, error, data } = db.useQuery({
    profiles: {
      $: {
        where: { '$user.id': user.id }
      }
    },
    projects: {
      $: {
        where: { 'owner.$user.id': user.id }
      }
    }
  });

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error.message}</div>;
  }

  const { profiles, projects } = data;
  const profile = profiles?.[0]; // Should only be one profile per user

  // If no profile exists yet, show a loading state
  if (!profile) {
    return (
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Setting up your profile...</p>
          </div>
        </div>
      </main>
    );
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newProjectTitle,
          description: newProjectDescription,
          userId: user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      // Refresh the page to show the new project
      window.location.reload();

      setNewProjectTitle('');
      setNewProjectDescription('');
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  };



  return (
    <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {profile?.firstName || user.email}!
        </h1>
        <p className="text-muted-foreground">
          Ready to create your next amazing project?
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Project Form */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Create New Project</h2>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Project Title
              </label>
              <input
                type="text"
                id="title"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              />
            </div>
            <Button type="submit" className="w-full">
              Create Project
            </Button>
          </form>
        </div>

        {/* Projects List */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Your Projects</h2>
          {projects.length === 0 ? (
            <p className="text-muted-foreground">No projects yet. Create your first project!</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <h3 className="font-medium text-card-foreground">{project.title}</h3>
                  {project.description && (
                    <p className="text-muted-foreground mt-1">{project.description}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}