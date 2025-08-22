'use client';

import React from 'react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import UserSearch from './UserSearch';

interface NavbarProps {
  variant?: 'default' | 'auth';
}

export default function Navbar({ variant = 'default' }: NavbarProps) {
  const { user } = db.useAuth() as { user: any };

  const handleSignOut = async () => {
    await db.auth.signOut();
  };

  // Query for user's profile
  const { data } = db.useQuery({
    profiles: {
      $: {
        where: { '$user.id': user?.id }
      }
    }
  }) as { data: any };

  const profile = data?.profiles?.[0];

  if (variant === 'auth') {
    return (
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-foreground">
                ProjectHub
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              Find & Join Amazing Projects
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
              ProjectHub
            </Link>
          </div>

           {/* Navigation Links */}
           <div className="hidden md:flex items-center space-x-8">
             <Link
               href="/"
               className="text-foreground hover:text-primary transition-colors font-medium"
             >
               Dashboard
             </Link>
             <Link
               href="/projects"
               className="text-muted-foreground hover:text-primary transition-colors"
             >
               Browse Projects
             </Link>
             <Link
               href="/profile"
               className="text-muted-foreground hover:text-primary transition-colors"
             >
               Profile
             </Link>
             <UserSearch />
           </div>

          {/* User Profile Section */}
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full border border-border bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {(profile?.firstName || user?.email || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-foreground">
                {profile?.firstName || user?.email}
              </div>
              <div className="text-xs text-muted-foreground">
                {user?.email}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="ml-2"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-border py-2">
          <div className="px-4 pb-2">
            <UserSearch />
          </div>
          <div className="flex justify-around">
            <Link
              href="/"
              className="text-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/projects"
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              Browse
            </Link>
            <Link
              href="/profile"
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}