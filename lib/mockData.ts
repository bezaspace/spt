import { Project } from './types';

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'AI-Powered Code Review Assistant',
    description: 'Building an intelligent code review tool that uses machine learning to identify bugs, suggest improvements, and ensure code quality. Looking for ML engineers and React developers.',
    author: 'Sarah Chen',
    tags: ['AI', 'Machine Learning', 'React', 'TypeScript', 'Python'],
    createdAt: new Date('2024-01-15'),
    status: 'in-progress',
    maxMembers: 5,
    currentMembers: 3,
    repositoryUrl: 'https://github.com/sarahchen/code-review-assistant',
    contactInfo: 'sarah@example.com'
  },
  {
    id: '2',
    title: 'Decentralized Social Media Platform',
    description: 'Creating a privacy-focused social media platform using blockchain technology. No data collection, user-owned content, and crypto rewards for engagement.',
    author: 'Alex Rodriguez',
    tags: ['Blockchain', 'Web3', 'React', 'Solidity', 'IPFS'],
    createdAt: new Date('2024-01-10'),
    status: 'looking-for-members',
    maxMembers: 8,
    currentMembers: 2,
    repositoryUrl: 'https://github.com/alexrod/decentral-social',
    contactInfo: 'alex@decentralsocial.com'
  },
  {
    id: '3',
    title: 'Sustainable Living Mobile App',
    description: 'A comprehensive app to help users track their carbon footprint, find eco-friendly products, and connect with local sustainability communities.',
    author: 'Emma Thompson',
    tags: ['Mobile', 'React Native', 'Sustainability', 'Community'],
    createdAt: new Date('2024-01-08'),
    status: 'planning',
    maxMembers: 6,
    currentMembers: 1,
    contactInfo: 'emma.thompson@example.com'
  },
  {
    id: '4',
    title: 'Real-time Collaborative Whiteboard',
    description: 'Digital whiteboard with real-time collaboration features, vector graphics, and integration with popular design tools. Perfect for remote teams.',
    author: 'Mike Johnson',
    tags: ['WebRTC', 'Canvas', 'React', 'Node.js', 'Real-time'],
    createdAt: new Date('2024-01-12'),
    status: 'in-progress',
    maxMembers: 4,
    currentMembers: 4,
    repositoryUrl: 'https://github.com/mikejohnson/collab-whiteboard',
    contactInfo: 'mike.j@collabtools.com'
  },
  {
    id: '5',
    title: 'Open Source Learning Management System',
    description: 'Building a modern, accessible LMS for educational institutions. Features include course management, student progress tracking, and interactive content.',
    author: 'Dr. Lisa Park',
    tags: ['Education', 'Open Source', 'Vue.js', 'Django', 'Accessibility'],
    createdAt: new Date('2024-01-05'),
    status: 'looking-for-members',
    maxMembers: 10,
    currentMembers: 2,
    repositoryUrl: 'https://github.com/lisapark/open-lms',
    contactInfo: 'lisa.park@openlms.org'
  },
  {
    id: '6',
    title: 'Smart Home Automation Hub',
    description: 'Centralized system to control and monitor all smart home devices. Includes energy optimization, security features, and voice control integration.',
    author: 'David Kim',
    tags: ['IoT', 'Home Automation', 'Python', 'React', 'MQTT'],
    createdAt: new Date('2024-01-18'),
    status: 'planning',
    maxMembers: 7,
    currentMembers: 1,
    contactInfo: 'david.kim@smarthomehub.io'
  }
];
