import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:    process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId:     process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export default app;
