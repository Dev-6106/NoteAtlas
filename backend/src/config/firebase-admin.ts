import * as admin from 'firebase-admin';
import { env } from './env';

const serviceAccountParams = {
  projectId: env.FIREBASE_PROJECT_ID,
  clientEmail: env.FIREBASE_CLIENT_EMAIL,
  privateKey: env.FIREBASE_PRIVATE_KEY
    ? env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^"|"$/g, '').replace(/\\"/g, '"')
    : undefined, // Handle escaped newlines and quotes
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountParams),
  });
}

export const adminAuth = admin.auth();
