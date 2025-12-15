import { NextResponse } from "next/server";

export default function proxy(request) {
    // Hanya jalankan logic ini untuk route /api/
    if (request.nextUrl.pathname.startsWith("/api/")) {
        const origin = request.headers.get("origin");

        // Daftar domain yang diizinkan
        const allowedOrigins = [
            "http://localhost:3000",
            "https://overlay-score-v2.vercel.app",
            // Tambahkan domain lain jika ada custom domain
        ];

        // Logika Validasi:
        // 1. Jika ada Origin (Request dari Browser), harus ada di allowedOrigins
        // 2. Jika tidak ada Origin (Server-to-Server / Postman / Bot), defaultnya kita BLOK
        //    kecuali jika ada "API Secret" (opsional, bisa ditambahkan nanti)

        // Namun, untuk keamanan dasar agar tidak bisa di-hit public:
        // Kita cek apakah Origin ada dan valid.

        // NOTE: Request server-side next.js (internal) terkadang tidak mengirim Origin.
        // Jika fetch dilakukan dari Server Component ke API Route sendiri (bad practice di Nextjs 13+), 
        // sebaiknya gunakan direct function call. Tapi jika harus fetch, pastikan kirim header.

        // Skenario aman:
        // - Izinkan jika Origin ada di list.
        // - Blok jika Origin ada tapi TIDAK di list (Cross-site request forgery / malformed).
        // - Blok jika tidak ada Origin (Direct CURL/Postman), KECUALI jika route /api/cron (karena Vercel Cron).

        const referer = request.headers.get("referer");

        // Daftar domain yang diizinkan (Normalkan tanpa trailling slash)
        const allowedDomains = [
            "http://localhost:3000",
            "https://overlay-score-v2.vercel.app",
        ];

        const isCron = request.nextUrl.pathname.startsWith("/api/cron");
        if (isCron) return NextResponse.next();

        // 1. Cek Origin (Fetch standard)
        if (origin) {
            if (!allowedDomains.includes(origin)) {
                return new NextResponse("Forbidden: Invalid Origin", { status: 403 });
            }
            return NextResponse.next();
        }

        // 2. Jika Origin kosong, Cek Referer (Navigasi browser / Same-origin)
        // Pastikan referer dimulai dengan salah satu allowed domain
        if (referer) {
            const isAllowedReferer = allowedDomains.some((domain) =>
                referer.startsWith(domain)
            );

            if (!isAllowedReferer) {
                return new NextResponse("Forbidden: Invalid Referer", { status: 403 });
            }
            return NextResponse.next();
        }

        // 3. Jika Origin & Referer kosong (Direct access via browser bar / Tools)
        return new NextResponse("Forbidden: No Origin/Referer", { status: 403 });
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/api/:path*",
};
