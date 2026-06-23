import { NextResponse } from 'next/server'

import { ref, set, get } from 'firebase/database'

import { db } from '@/services/firebase/db'
import { verifyIdToken } from '@/services/firebase/admin'

const API_KEY = process.env.FOOTBALL_DATA_API_KEY
const BASE_URL = 'https://api.football-data.org/v4'

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

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'Configuration Error: Missing FOOTBALL_DATA_API_KEY in server environment' },
        { status: 500 }
      )
    }

    let data

    try {
      const res = await fetch(`${BASE_URL}/competitions/WC/standings`, {
        headers: { 'X-Auth-Token': API_KEY },
        cache: 'no-store'
      })

      if (res.status === 429) {
        return NextResponse.json({ standings: [], rateLimited: true }, { status: 200 })
      }

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}))
        const errorMessage = errorBody.message || res.statusText

        throw new Error(`Upstream API Error (${res.status}): ${errorMessage}`)
      }

      data = await res.json()

      // Simpan snapshot standings ke Firebase di node ucl_data/wc_standings (karena ucl_data memiliki izin akses baca untuk client)
      try {
        await set(ref(db, 'ucl_data/wc_standings'), {
          lastUpdated: Date.now(),
          data
        })
      } catch (e) {
        console.warn('[World Cup] Gagal menyimpan standings ke Firebase:', e)
      }
    } catch (fetchError) {
      console.warn('[World Cup] External API failed, attempting fallback to Firebase:', fetchError)

      try {
        const snapshot = await get(ref(db, 'ucl_data/wc_standings'))

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
