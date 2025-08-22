import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// analytics is optional and not required during SSR; we'll dynamic-import it in the browser

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

if (!getApps().length) {
  const app = initializeApp(firebaseConfig);

  // Initialize analytics only in browser, dynamically import to avoid SSR/type issues
  if (typeof window !== 'undefined') {
    (async () => {
      try {
        const analyticsMod = await import('firebase/analytics');
        if (analyticsMod && typeof analyticsMod.isSupported === 'function') {
          const supported = await analyticsMod.isSupported();
          if (supported) analyticsMod.getAnalytics(app);
        }
      } catch (e) {
        // ignore analytics init errors
      }
    })();
  }
}

export const auth = getAuth();
export const firestore = getFirestore();

// Note: In dev you can set NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST
if (process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST) {
  // e.g. http://localhost:9099
  connectAuthEmulator(auth, process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST);
}

export async function sendEmailSignInLink(email: string, url: string) {
  const actionCodeSettings = {
    url,
    handleCodeInApp: true,
  };
  return sendSignInLinkToEmail(auth, email, actionCodeSettings);
}

export async function completeSignInWithEmailLink(email: string, link: string) {
  if (!isSignInWithEmailLink(auth, link)) throw new Error('Invalid email sign-in link');
  return signInWithEmailLink(auth, email, link);
}

export function onAuth(cb: (user: unknown | null) => void) {
  return onAuthStateChanged(auth, (user: unknown) => cb(user));
}
