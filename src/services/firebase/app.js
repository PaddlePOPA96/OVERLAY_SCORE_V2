import { initializeApp, getApps } from 'firebase/app'

import { clientEnv } from '@/shared/configs/envConfig'

const firebaseConfig = {
  apiKey: clientEnv.FIREBASE_API_KEY,
  authDomain: clientEnv.FIREBASE_AUTH_DOMAIN,
  projectId: clientEnv.FIREBASE_PROJECT_ID,
  storageBucket: clientEnv.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: clientEnv.FIREBASE_MESSAGING_SENDER_ID,
  appId: clientEnv.FIREBASE_APP_ID,
  databaseURL: clientEnv.FIREBASE_DATABASE_URL
}

if (!firebaseConfig.apiKey || !firebaseConfig.databaseURL) {
  // eslint-disable-next-line no-console
  console.warn('[Firebase] Environment variables belum lengkap. Cek file .env.local / Vercel env.')
}

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
