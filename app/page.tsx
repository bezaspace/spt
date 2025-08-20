'use client';

import { useState } from 'react';
import { Project, ProjectFormData } from '@/lib/types';
import { mockProjects } from '@/lib/mockData';
import ProjectsList from '@/components/ProjectsList';
import ProjectForm from '@/components/ProjectForm';
import { Plus, Sparkles, Users, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const handleProjectSubmit = (formData: ProjectFormData) => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      author: formData.author,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: new Date(),
      status: formData.status,
      maxMembers: formData.maxMembers,
      currentMembers: 1,
      repositoryUrl: formData.repositoryUrl,
      contactInfo: formData.contactInfo,
    };

    setProjects([newProject, ...projects]);
    setShowForm(false);
  };

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => project.status === filter);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">ProjectHub</h1>
                <p className="text-sm text-muted-foreground">Find & Join Amazing Projects</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Post Project
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Build Amazing Things Together
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with developers, designers, and creators. Post your project ideas, 
            find collaborators, and turn your vision into reality.
          </p>
          <div className="flex justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{projects.reduce((acc, p) => acc + p.currentMembers, 0)}+ Members</span>
            </div>
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              <span>{projects.length} Projects</span>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { value: 'all', label: 'All Projects' },
            { value: 'looking-for-members', label: 'Looking for Members' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'planning', label: 'Planning' },
            { value: 'completed', label: 'Completed' },
          ].map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12">
        {showForm ? (
          <ProjectForm
            onSubmit={handleProjectSubmit}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <ProjectsList projects={filteredProjects} />
        )}
      </main>
    </div>
  );
}
