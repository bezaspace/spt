import admin from 'firebase-admin';

function initAdmin() {
  if (admin.apps.length) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Missing firebase admin env vars. firebase-admin not initialized.');
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export function getAdmin() {
  initAdmin();
  if (!admin.apps.length) {
    throw new Error('Firebase admin not initialized. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY environment variables.');
  }
  return admin;
}

export function getAdminAuth() {
  return getAdmin().auth();
}

export function getAdminFirestore() {
  return getAdmin().firestore();
}

export { admin };
