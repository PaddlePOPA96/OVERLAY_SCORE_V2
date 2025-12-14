import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
    // Simple security check using CRON_SECRET if available
    // Vercel automatically sends this header for Cron jobs
    const authHeader = request.headers.get("authorization");
    if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Determine the base URL
    // On Vercel, VERCEL_URL is set (e.g. "my-site.vercel.app") but without protocol
    // Locally, we might use localhost:3000
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const host = process.env.VERCEL_URL || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    const endpoints = [
        "/api/pertandingan",
        "/api/klasemen",
        "/api/ucl-matches",
        "/api/ucl-standings",
        "/api/teams/sync", // In case we need to sync teams too, but maybe not regularly. Excluding for now if not needed.
    ];

    const results = {};

    // Execute sequentially or in parallel. Parallel is faster but might hit rate limits.
    // Given user concern about rate limits, sequential might be safer for "football-data.org"
    // but Vercel fetches might be fast.
    // The rate limit on football-data.org is by IP/Token.

    for (const path of endpoints) {
        // Only include the main data endpoints
        if (path.includes("sync")) continue;

        try {
            // Use full URL
            const res = await fetch(`${baseUrl}${path}`);
            if (res.ok) {
                const data = await res.json();
                results[path] = { status: "ok", count: Array.isArray(data) ? data.length : "object" };
            } else {
                results[path] = { status: "error", code: res.status };
            }
        } catch (e) {
            results[path] = { status: "error", message: e.message };
        }
    }

    return NextResponse.json({
        timestamp: new Date().toISOString(),
        results,
    });
}
