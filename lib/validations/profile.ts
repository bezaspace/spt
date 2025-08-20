import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  bio: z.string().max(500, 'Bio too long').optional(),
  location: z.string().max(100, 'Location too long').optional(),
  website: z.string().optional(),
  github: z.string().max(100, 'GitHub username too long').optional().or(z.literal('')),
  linkedin: z.string().max(100, 'LinkedIn profile too long').optional().or(z.literal('')),
  skills: z.array(z.string()).optional(),
  avatar: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;