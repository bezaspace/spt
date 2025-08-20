'use client';

import React, { use } from 'react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface PublicProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { user: currentUser } = db.useAuth();
  const resolvedParams = use(params);

  // Query for the profile by ID
  const { isLoading, error, data } = db.useQuery({
    profiles: {
      $: {
        where: { 'id': resolvedParams.id }
      },
      $user: {}
    }
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <p className="text-red-600">Error loading profile: {error.message}</p>
          </div>
        </main>
      </>
    );
  }

  const profile = data?.profiles?.[0];

  if (!profile) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Profile not found.</p>
          </div>
        </main>
      </>
    );
  }

  const isOwnProfile = currentUser?.id === profile.$user?.id;

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
              <p className="text-muted-foreground">
                {isOwnProfile ? 'Manage your personal information and preferences' : 'View user profile'}
              </p>
            </div>
            {isOwnProfile && (
              <Link href="/profile">
                <Button>Edit Profile</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full border-2 border-border bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {(profile.firstName || profile.$user?.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <p className="text-muted-foreground">{profile.$user?.email}</p>
                  </div>
                </div>

                {profile.bio && (
                  <div>
                    <h3 className="font-medium mb-2">Bio</h3>
                    <p className="text-muted-foreground">{profile.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.location && (
                    <div>
                      <h3 className="font-medium mb-2">Location</h3>
                      <p className="text-muted-foreground">{profile.location}</p>
                    </div>
                  )}

                  {profile.website && (
                    <div>
                      <h3 className="font-medium mb-2">Website</h3>
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.github && (
                    <div>
                      <h3 className="font-medium mb-2">GitHub</h3>
                      <a
                        href={`https://github.com/${profile.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        @{profile.github}
                      </a>
                    </div>
                  )}

                  {profile.linkedin && (
                    <div>
                      <h3 className="font-medium mb-2">LinkedIn</h3>
                      <a
                        href={`https://linkedin.com/in/${profile.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        @{profile.linkedin}
                      </a>
                    </div>
                  )}
                </div>

                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Stats */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Member Since</h3>
                  <p className="text-muted-foreground">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Email</h3>
                  <p className="text-muted-foreground">{profile.$user?.email}</p>
                </div>

                {profile.bio && profile.location && profile.website && profile.github && profile.linkedin && profile.avatar && (
                  <div>
                    <h3 className="font-medium mb-2">Profile Completion</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${Math.round(
                            ([
                              profile.bio,
                              profile.location,
                              profile.website,
                              profile.github,
                              profile.linkedin,
                              profile.avatar,
                            ].filter(Boolean).length /
                              6) *
                              100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {[
                        profile.bio,
                        profile.location,
                        profile.website,
                        profile.github,
                        profile.linkedin,
                        profile.avatar,
                      ].filter(Boolean).length}
                      /6 fields completed
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}