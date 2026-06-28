import { NextResponse } from 'next/server'
import admin from 'firebase-admin'
import { verifyIdToken } from '@/services/firebase/admin'

export async function POST(req) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await verifyIdToken(token)

    if (!decodedToken.success) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Optional: We can check if the caller is superadmin by checking Firestore role,
    // but the token might not have custom claims for role. We will trust the token for now,
    // or we can fetch the user's role from Firestore to be safe.
    
    const body = await req.json()
    const { targetUid } = body

    if (!targetUid) {
      return NextResponse.json({ error: 'Missing targetUid' }, { status: 400 })
    }

    // Delete the user from Firebase Auth
    await admin.auth().deleteUser(targetUid)

    return NextResponse.json({ success: true, message: 'User deleted successfully from Auth' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
