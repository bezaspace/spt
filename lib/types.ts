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

// Authentication types
export interface SignupData {
  email: string;
  password: string;
}

export interface SigninData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  authMethod?: 'magic' | 'credentials';
}