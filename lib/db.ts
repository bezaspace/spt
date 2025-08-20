import { init } from '@instantdb/react';
import schema from '../instant.schema';

// You'll need to get this from https://instantdb.com/dash
const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;

export const db = init({
  appId: APP_ID,
  schema,
});