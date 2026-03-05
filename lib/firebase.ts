import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:     process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  projectId:  process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId:      process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db      = getFirestore(app);
export const storage = getStorage(app);
export default app;
