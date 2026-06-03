import { NextResponse } from 'next/server'

import { ref, get, set } from 'firebase/database'

import { db } from '@/lib/firebaseDb'
import { verifyIdToken } from '@/lib/firebaseAdmin'

const NEWS_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/news'

export async function GET(request) {
  try {
    // News is public data - no authentication required
    // This allows the dashboard to load news even before user logs in

    // Read cached news from Firebase
    const snapshot = await get(ref(db, 'pl_data/news/articles'))

    if (!snapshot.exists()) {
      // Fallback logic if empty? or return empty array.
      // User asked to schedule twice a day, so it might be empty initially.
      return NextResponse.json({ articles: [] })
    }

    const articles = snapshot.val()

    return NextResponse.json({ articles: Array.isArray(articles) ? articles : [] })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

export async function POST(request) {
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

    // 2. Fetch News from ESPN
    const res = await fetch(NEWS_URL, { cache: 'no-store' })

    if (!res.ok) {
      throw new Error(`Failed to fetch news: ${res.status}`)
    }

    const data = await res.json()

    const articles = (data.articles || []).slice(0, 8).map(a => ({
      id: a.id ?? a.headline,
      title: a.headline,
      description: a.description,
      published: a.published,
      image: a.images?.[0]?.url ?? null,
      url: a.links?.web?.href ?? data.link?.href ?? 'https://www.espn.com/football/league/_/name/eng.1'
    }))

    // 3. Save to Firebase
    await set(ref(db, 'pl_data/news'), {
      lastUpdated: Date.now(),
      articles
    })

    return NextResponse.json({ success: true, articles })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
