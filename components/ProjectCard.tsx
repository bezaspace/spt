import { Project } from '@/lib/types';
import { Calendar, Users, Mail, Code } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ProjectCardProps {
  project: Project;
}

const statusColors = {
  planning: 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30',
  'in-progress': 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30',
  completed: 'bg-green-500/20 text-green-300 hover:bg-green-500/30',
  'looking-for-members': 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30',
};

const statusLabels = {
  planning: 'Planning',
  'in-progress': 'In Progress',
  completed: 'Completed',
  'looking-for-members': 'Looking for Members',
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  };

  const handleCardClick = () => {
    router.push(`/projects/${project.id}`);
  };

  return (
    <Card
      className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-2 leading-tight">
            {project.title}
          </CardTitle>
          <Badge 
            variant="secondary" 
            className={`${statusColors[project.status]} border-0`}
          >
            {statusLabels[project.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>
                {project.currentMembers}
                {project.maxMembers && `/${project.maxMembers}`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(project.createdAt)}</span>
            </div>
          </div>
          <span className="font-medium text-foreground">
            {project.author}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <div className="flex gap-2 w-full">
          {project.repositoryUrl && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              asChild
            >
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <Code className="w-3 h-3" />
                Repository
              </a>
            </Button>
          )}
          <Button
            size="sm"
            className="flex-1"
            asChild
          >
            <a
              href={`mailto:${project.contactInfo}`}
              className="flex items-center gap-1"
            >
              <Mail className="w-3 h-3" />
              Contact
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
