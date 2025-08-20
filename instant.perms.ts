import type { InstantRules } from '@instantdb/react';

const rules = {
  attrs: {
    allow: {
      $default: 'false',
    },
  },
  profiles: {
    allow: {
      create: 'auth.id != null',
      update: 'auth.id != null && auth.id == data.ref("$user.id")',
      delete: 'auth.id != null && auth.id == data.ref("$user.id")',
    },
  },
  projects: {
    allow: {
      create: 'auth.id != null',
      update: 'auth.id != null && auth.id == data.ref("owner.$user.id")',
      delete: 'auth.id != null && auth.id == data.ref("owner.$user.id")',
    },
  },
} satisfies InstantRules;

export default rules;