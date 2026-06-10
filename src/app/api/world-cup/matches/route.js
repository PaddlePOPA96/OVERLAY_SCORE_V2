import { NextResponse } from 'next/server'

import { ref, set, get } from 'firebase/database'

import { db } from '@/lib/firebase/db'
import { verifyIdToken } from '@/lib/firebase/admin'
import { dbFirestore } from '@/lib/firebase/firestore'
import { doc, getDoc } from 'firebase/firestore'

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

    if (role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden: Superadmin only' }, { status: 403 })
    }

    // 3. Fetch all matches of the tournament
    const url = `${BASE_URL}/competitions/WC/matches`

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
        // Rate limited
        return NextResponse.json({ matches: [], rateLimited: true }, { status: 200 })
      }

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}))
        const errorMessage = errorBody.message || res.statusText

        throw new Error(`Upstream API Error (${res.status}): ${errorMessage}`)
      }

      data = await res.json()

      // Simpan snapshot jadwal & hasil ke Firebase di node ucl_data/wc_matches (karena ucl_data memiliki izin akses baca untuk client)
      try {
        await set(ref(db, 'ucl_data/wc_matches'), {
          lastUpdated: Date.now(),
          data
        })
      } catch (e) {
        console.warn('[World Cup] Gagal menyimpan matches ke Firebase:', e)
      }
    } catch (fetchError) {
      console.warn('[World Cup] External API failed, attempting fallback to Firebase:', fetchError)

      try {
        const snapshot = await get(ref(db, 'ucl_data/wc_matches'))

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
