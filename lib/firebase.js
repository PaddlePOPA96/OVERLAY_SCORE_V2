import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

// Konfigurasi Firebase dibaca dari environment variable
// Agar aman untuk deploy ke Vercel dan mudah diganti tanpa ubah kode.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Optional: sedikit guard supaya kalau env belum di-set, kelihatan di console
if (!firebaseConfig.apiKey || !firebaseConfig.databaseURL) {
  // eslint-disable-next-line no-console
  console.warn("[Firebase] Environment variables belum lengkap. Cek file .env.local / Vercel env.");
}

// Singleton Pattern: Mencegah error "App already initialized" saat hot-reload Next.js
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

export { db };
