export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'

import { doc, getDoc } from 'firebase/firestore'

import { verifyIdToken, adminDb } from '@/services/firebase/admin'
import { dbFirestore } from '@/services/firebase/firestore'

const API_KEY = process.env.FOOTBALL_DATA_API_KEY
const BASE_URL = 'https://api.football-data.org/v4'

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

export async function GET(request) {
  try {
    // 1. Authorization Header Check
    const authHeader = request.headers.get('Authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    const verification = await verifyIdToken(token)

    if (!verification.success) {
      return NextResponse.json({ error: `Unauthorized: ${verification.error || 'Invalid token'}` }, { status: 401 })
    }

    // 2. Superadmin role check via Firestore
    const uid = verification.uid
    const userDoc = await getDoc(doc(dbFirestore, 'users', uid))
    const role = userDoc.exists() ? userDoc.data().role : 'user'

    if (!['superadmin', 'operator'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden: Admin or Operator only' }, { status: 403 })
    }

    // 3. Main Logic
    const currentYear = new Date().getFullYear()
    const seasonYear = new Date().getMonth() >= 6 ? currentYear : currentYear - 1
    const url = `${BASE_URL}/competitions/PL/matches?season=${seasonYear}`

    if (!API_KEY) {
      throw new Error('Configuration Error: Missing FOOTBALL_DATA_API_KEY in server environment')
    }

    let data

    try {
      const res = await fetch(url, {
        headers: { 'X-Auth-Token': API_KEY },
        cache: 'no-store'
      })

      if (res.status === 429) {
        // Rate limited by upstream API: kembalikan payload kosong dengan status 200
        return NextResponse.json({ matches: [], rateLimited: true }, { status: 200 })
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch matches: ${res.status} ${res.statusText}`)
      }

      data = await res.json()

      // Simpan snapshot jadwal & hasil ke Firebase di node terpisah dari match_live
      try {
        await adminDb.ref('pl_data/matches').set({
          lastUpdated: Date.now(),
          data
        })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[PL] Gagal menyimpan matches ke Firebase:', e)
      }
    } catch (fetchError) {
      console.warn('[PL] External API failed, attempting fallback to Firebase:', fetchError)

      try {
        const snapshot = await adminDb.ref('pl_data/matches').once('value')

        if (snapshot.exists()) {
          const cached = snapshot.val()

          data = cached.data
        } else {
          throw fetchError
        }
      } catch (fbError) {
        throw fetchError
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
