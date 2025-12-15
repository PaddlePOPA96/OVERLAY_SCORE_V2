import { NextResponse } from "next/server";
import { ref, set } from "firebase/database";
import { db } from "@/lib/firebaseDb";

const NEWS_URL =
    "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/news";

export async function GET(request) {
    // Verifikasi Cron Secret (Vercel Cron otomatis mengirim header ini)
    // Untuk testing manual lokal, kita bisa skip atau set dummy di .env
    const authHeader = request.headers.get("authorization");
    if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const res = await fetch(NEWS_URL, { cache: "no-store" });
        if (!res.ok) {
            throw new Error(`Failed to fetch news: ${res.status}`);
        }

        const data = await res.json();
        const articles = (data.articles || []).slice(0, 8).map((a) => ({
            id: a.id ?? a.headline,
            title: a.headline,
            description: a.description,
            published: a.published,
            image: a.images?.[0]?.url ?? null,
            url:
                a.links?.web?.href ??
                data.link?.href ??
                "https://www.espn.com/football/league/_/name/eng.1",
        }));

        // Simpan ke Firebase
        await set(ref(db, "pl_data/news"), {
            lastUpdated: Date.now(),
            articles,
        });

        return NextResponse.json({ success: true, articlesSaved: articles.length });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
