import { NextResponse } from 'next/server'

import admin from 'firebase-admin'

import { verifyIdToken } from '@/services/firebase/admin'
import { doc, getDoc } from 'firebase/firestore'
import { dbFirestore } from '@/services/firebase/firestore'

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

    const uid = decodedToken.uid

    // Check if the caller is admin/superadmin
    const userDoc = await getDoc(doc(dbFirestore, 'users', uid))
    const role = userDoc.exists() ? userDoc.data().role : 'user'

    if (!['superadmin', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }
    
    const body = await req.json()
    const { targetUid } = body

    if (!targetUid) {
      return NextResponse.json({ error: 'Missing targetUid' }, { status: 400 })
    }

    if (targetUid === uid) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Delete the user from Firebase Auth
    await admin.auth().deleteUser(targetUid)

    return NextResponse.json({ success: true, message: 'User deleted successfully from Auth' })
  } catch (error) {
    console.error('Error deleting user:', error)
    
return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
