export interface Project {
  id: string;
  title: string;
  description: string;
  author: string;
  tags: string[];
  createdAt: Date;
  status: 'planning' | 'in-progress' | 'completed' | 'looking-for-members';
  maxMembers?: number;
  currentMembers: number;
  repositoryUrl?: string;
  contactInfo: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  author: string;
  tags: string;
  status: Project['status'];
  maxMembers?: number;
  repositoryUrl?: string;
  contactInfo: string;
}