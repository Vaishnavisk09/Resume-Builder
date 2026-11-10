import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Extract configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

/**
 * Validate whether real Firebase configuration credentials are provided
 */
export function checkFirebaseConfig() {
  const apiKey = firebaseConfig.apiKey;
  const projectId = firebaseConfig.projectId;

  if (!apiKey || !projectId) {
    return {
      isConfigured: false,
      reason: 'Missing VITE_FIREBASE_API_KEY or VITE_FIREBASE_PROJECT_ID in environment variables.'
    };
  }

  if (
    apiKey.includes('your_firebase_api_key') ||
    apiKey.includes('placeholder') ||
    projectId.includes('your_project_id')
  ) {
    return {
      isConfigured: false,
      reason: 'Environment variables contain placeholder values. Please update .env with your real Firebase credentials.'
    };
  }

  return { isConfigured: true, reason: null };
}

const configStatus = checkFirebaseConfig();
export const isFirebaseConfigured = configStatus.isConfigured;
export const firebaseConfigError = configStatus.reason;

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error('Failed to initialize Firebase SDK:', error);
  }
} else {
  console.warn(
    'Finora: Firebase configuration not detected. Please create a .env file with your Firebase credentials. See .env.example for details.'
  );
}

export { app, auth, db, firebaseConfig };
