import { NextResponse } from 'next/server'

import { ref, set, get } from 'firebase/database'

import { db } from '@/lib/firebaseDb'
import { verifyIdToken } from '@/lib/firebaseAdmin'
import { dbFirestore } from '@/lib/firebaseFirestore'
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

    // 3. Main Logic
    const today = new Date()
    const pastDate = new Date()

    pastDate.setDate(today.getDate() - 7)
    const futureDate = new Date()

    futureDate.setDate(today.getDate() + 60)

    const url = `${BASE_URL}/competitions/CL/matches?dateFrom=${formatDate(pastDate)}&dateTo=${formatDate(futureDate)}`

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'Configuration Error: Missing FOOTBALL_DATA_API_KEY in server environment' },
        { status: 500 }
      )
    }

    let data

    try {
      const res = await fetch(url, {
        headers: { 'X-Auth-Token': API_KEY },
        cache: 'no-store'
      })

      if (res.status === 429) {
        return NextResponse.json({ matches: [], rateLimited: true }, { status: 200 })
      }

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}))
        const errorMessage = errorBody.message || res.statusText

        return NextResponse.json({ error: `Upstream API Error (${res.status}): ${errorMessage}` }, { status: res.status })
      }

      data = await res.json()

      // Simpan ke Firebase RTDB — client onValue listener akan otomatis update
      try {
        await set(ref(db, 'ucl_data/matches'), {
          lastUpdated: Date.now(),
          data
        })
      } catch (e) {
        console.warn('[UCL] Gagal menyimpan matches ke Firebase:', e)
      }
    } catch (fetchError) {
      console.warn('[UCL] External API failed, attempting fallback to Firebase:', fetchError)

      try {
        const snapshot = await get(ref(db, 'ucl_data/matches'))

        if (snapshot.exists()) {
          data = snapshot.val().data
        } else {
          throw fetchError
        }
      } catch {
        throw fetchError
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
