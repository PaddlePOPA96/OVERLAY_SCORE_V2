import { NextResponse } from 'next/server'

export default function middleware(request) {
  // Hanya jalankan logic ini untuk route /api/
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')

    // Daftar domain dasar yang diizinkan
    const allowedDomains = [
      'http://localhost:3000',
      'https://overlay-score-v2.vercel.app',
      'https://www.scoreboss.my.id',
      'https://scoreboss.my.id'
    ]

    // Helper untuk memvalidasi domain
    const isAllowed = (url) => {
      if (!url) return false

      // Izinkan localhost (port apapun) untuk kemudahan development lokal
      if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
        return true
      }

      // Izinkan domain resmi
      const isOfficialDomain = allowedDomains.some(domain => url.startsWith(domain))

      if (isOfficialDomain) return true

      // Izinkan deployment preview dari Vercel (*.vercel.app)
      try {
        const parsedUrl = new URL(url)


        return parsedUrl.hostname.endsWith('.vercel.app')
      } catch (e) {
        return false
      }
    }

    // Pengecualian khusus untuk API Cron
    const isCron = request.nextUrl.pathname.startsWith('/api/cron')

    if (isCron) return NextResponse.next()

    // 1. Cek Origin (Fetch standard dari browser client)
    if (origin) {
      if (!isAllowed(origin)) {
        return new NextResponse('Forbidden: Invalid Origin', { status: 403 })
      }


      return NextResponse.next()
    }

    // 2. Jika Origin kosong, Cek Referer (Navigasi halaman / Same-origin fetch)
    if (referer) {
      if (!isAllowed(referer)) {
        return new NextResponse('Forbidden: Invalid Referer', { status: 403 })
      }


      return NextResponse.next()
    }

    // 3. Jika Origin & Referer kosong (Direct access via URL bar / curl / Postman)
    return new NextResponse('Forbidden: No Origin/Referer', { status: 403 })
  }

  return NextResponse.next()
}

// Konfigurasi Matcher: hanya jalankan middleware untuk folder /api
export const config = {
  matcher: '/api/:path*'
}
