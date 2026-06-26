import { NextResponse } from 'next/server'

export function middleware(request) {
  const host = request.headers.get('host')

  // Redirect domain bawaan Vercel
  if (host === 'overlay-score-v2.vercel.app') {
    const url = request.nextUrl.clone()

    return NextResponse.redirect(
      `https://scoreboss.my.id${url.pathname}${url.search}`,
      308
    )
  }

  // Proteksi API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')

    const allowedDomains = [
      'https://scoreboss.my.id',
      'https://www.scoreboss.my.id',
    ]

    const isAllowed = (url) => {
      if (!url) return false

      if (
        url.startsWith('http://localhost') ||
        url.startsWith('http://127.0.0.1')
      ) {
        return true
      }

      return allowedDomains.some(domain =>
        url.startsWith(domain)
      )
    }

    if (request.nextUrl.pathname.startsWith('/api/cron')) {
      return NextResponse.next()
    }

    if (origin && !isAllowed(origin)) {
      return new NextResponse('Forbidden: Invalid Origin', {
        status: 403,
      })
    }

    if (!origin && referer && !isAllowed(referer)) {
      return new NextResponse('Forbidden: Invalid Referer', {
        status: 403,
      })
    }

    if (!origin && !referer) {
      return new NextResponse(
        'Forbidden: No Origin/Referer',
        { status: 403 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
