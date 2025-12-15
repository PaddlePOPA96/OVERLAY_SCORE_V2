// Shared Firebase config for both Next.js (web) and Expo (mobile).
// Reads from NEXT_PUBLIC_* (web) or EXPO_PUBLIC_* (Expo) environment variables.

const getEnv = (nextKey, expoKey) =>
  process.env[nextKey] || process.env[expoKey] || "";

export const firebaseConfig = {
  apiKey: getEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "EXPO_PUBLIC_FIREBASE_API_KEY"),
  authDomain: getEnv(
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
  ),
  projectId: getEnv(
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
  ),
  storageBucket: getEnv(
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
  ),
  messagingSenderId: getEnv(
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  ),
  appId: getEnv("NEXT_PUBLIC_FIREBASE_APP_ID", "EXPO_PUBLIC_FIREBASE_APP_ID"),
  databaseURL: getEnv(
    "NEXT_PUBLIC_FIREBASE_DATABASE_URL",
    "EXPO_PUBLIC_FIREBASE_DATABASE_URL",
  ),
};

