import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { UserSearchResult } from '@/lib/types';

interface UserCardProps {
  user: UserSearchResult;
}

export default function UserCard({ user }: UserCardProps) {
  return (
    <Link href={`/profile/${user.id}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full border-2 border-border bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-primary">
                {(user.firstName || user.email || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground truncate">
                  {user.firstName} {user.lastName}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              {user.bio && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {user.bio}
                </p>
              )}
              {user.location && (
                <p className="text-xs text-muted-foreground mt-1">
                  📍 {user.location}
                </p>
              )}
            </div>
          </div>
          {user.skills && user.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {user.skills.slice(0, 3).map((skill: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {user.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{user.skills.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}