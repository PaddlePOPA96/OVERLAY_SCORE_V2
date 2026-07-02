import 'server-only'
import admin from 'firebase-admin'

import { getParsedServiceAccount, clientEnv, serverEnv } from '@/shared/configs/envConfig'

const serviceAccount = getParsedServiceAccount()

if (!admin.apps.length) {
  try {
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: clientEnv.FIREBASE_DATABASE_URL
      })
      console.log('✅ Firebase Admin initialized with Service Account')
    } else {
      // console.warn("⚠️ initializing Firebase Admin without Service Account (limited capabilities)");
      admin.initializeApp({
        projectId: clientEnv.FIREBASE_PROJECT_ID,
        databaseURL: clientEnv.FIREBASE_DATABASE_URL
      })
    }
  } catch (e) {
    console.error('❌ Firebase Admin initialization failed:', e)
  }
}

export async function verifyIdToken(token) {
  if (!token) return { success: false, error: 'No token provided' }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token)

    return { success: true, ...decodedToken }
  } catch (error) {
    console.error('verifyIdToken error:', error)

    return { success: false, error: error.message }
  }
}
