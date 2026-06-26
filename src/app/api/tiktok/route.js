export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import { resolveInstagram, resolveTiktok } from '@/services/streams/tiktokResolver'

export async function POST(request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const targetUrl = url.trim()

    // Route to Instagram resolver if it matches instagram domains
    const isInstagram = targetUrl.includes('instagram.com') || targetUrl.includes('instagr.am')

    if (isInstagram) {
      const igResult = await resolveInstagram(targetUrl)
      return NextResponse.json(igResult)
    }

    try {
      const tiktokResult = await resolveTiktok(targetUrl)
      return NextResponse.json(tiktokResult)
    } catch (e) {
      if (e.message.includes('Could not extract')) {
        return NextResponse.json({ error: e.message }, { status: 400 })
      }
      throw e
    }
  } catch (error) {
    console.error('TikTok API error:', error)
    return NextResponse.json({ error: error.message || 'Server error resolving TikTok URL' }, { status: 500 })
  }
}
