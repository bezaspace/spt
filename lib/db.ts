import React from 'react';
import { firestore, onAuth, auth } from './firebaseClient';
import { collection, query as fsQuery, where, onSnapshot, orderBy } from 'firebase/firestore';
import { signInWithCustomToken, signOut } from 'firebase/auth';

type QueryResult<T> = { isLoading: boolean; error: Error | null; data: T | null };

// Minimal auth hooks used by the app
export function useAuth() {
  const [state, setState] = React.useState<{ isLoading: boolean; user: unknown | null; error: unknown | null }>({ isLoading: true, user: null, error: null });

  React.useEffect(() => {
    const unsub = onAuth((user: unknown) => {
      setState({ isLoading: false, user: user || null, error: null });
    });
    return () => unsub();
  }, []);

  return state;
}

export function useUser() {
  const { user } = useAuth() as { user: unknown | null };
  return user;
}

// Minimal query helper: supports a few simple shapes used by the app
export function useQuery<T = unknown>(shape: unknown): QueryResult<T> {
  const [state, setState] = React.useState<QueryResult<T>>({ isLoading: true, error: null, data: null });

  React.useEffect(() => {
    let unsub = () => {};

    async function setup() {
      try {
        const s = shape as Record<string, any>;

        // Simple supported queries: { profiles: { $: { where: { '$user.id': userId } } } }
        if (s.profiles && s.profiles.$ && s.profiles.$.where && s.profiles.$.where['$user.id']) {
          const userId = String(s.profiles.$.where['$user.id']);
          const q = fsQuery(collection(firestore, 'profiles'), where('userId', '==', userId));
          unsub = onSnapshot(q, (snap) => {
            const docs = snap.docs.map(d => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));
            setState({ isLoading: false, error: null, data: { profiles: docs } as unknown as T });
          }, (err: unknown) => setState({ isLoading: false, error: err as Error, data: null }));

        // projects for owner
        } else if (s.projects && s.projects.$ && s.projects.$.where && s.projects.$.where['owner.$user.id']) {
          const userId = String(s.projects.$.where['owner.$user.id']);
          const q = fsQuery(collection(firestore, 'projects'), where('ownerId', '==', userId), orderBy('createdAt', 'desc'));
          unsub = onSnapshot(q, (snap) => {
            const docs = snap.docs.map(d => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));
            setState({ isLoading: false, error: null, data: { projects: docs } as unknown as T });
          }, (err: unknown) => setState({ isLoading: false, error: err as Error, data: null }));
        } else {
          // unsupported query shape => fallback to empty
          setState({ isLoading: false, error: null, data: null });
        }
      } catch (err: unknown) {
        setState({ isLoading: false, error: err as Error, data: null });
      }
    }

    setup();
    return () => unsub();
  }, [JSON.stringify(shape)]);

  return state as QueryResult<T>;
}

export const db = {
  useAuth: useAuth,
  useUser: useUser,
  useQuery: useQuery,
  auth: {
    signInWithToken: async (token: string) => {
      return signInWithCustomToken(auth, token);
    },
    signOut: async () => {
      return signOut(auth);
    }
  }
};

export default db;