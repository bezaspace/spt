import { i } from '@instantdb/react';

const _schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed(),
      password: i.string().optional(),
      authMethod: i.string().optional(),
    }),
    credentials: i.entity({
      email: i.string().unique().indexed(),
      password: i.string(),
      userId: i.string(),
    }),
    profiles: i.entity({
      firstName: i.string(),
      lastName: i.string(),
      createdAt: i.date(),
    }),
    projects: i.entity({
      title: i.string(),
      description: i.string().optional(),
      createdAt: i.date(),
      status: i.string().optional(),
      tags: i.json().optional(),
      maxMembers: i.number().optional(),
      currentMembers: i.number().optional(),
      repositoryUrl: i.string().optional(),
      contactInfo: i.string().optional(),
    }),
  },
  links: {
    profileUser: {
      forward: { on: 'profiles', has: 'one', label: '$user' },
      reverse: { on: '$users', has: 'one', label: 'profile' },
    },
    projectOwner: {
      forward: { on: 'projects', has: 'one', label: 'owner' },
      reverse: { on: 'profiles', has: 'many', label: 'ownedProjects' },
    },
    credentialUser: {
      forward: { on: 'credentials', has: 'one', label: 'user' },
      reverse: { on: '$users', has: 'one', label: 'credential' },
    },
  },
});

// This helps TypeScript display better intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;