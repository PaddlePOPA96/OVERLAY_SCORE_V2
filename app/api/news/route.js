import { NextResponse } from "next/server";

const NEWS_URL =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/news";

export async function GET() {
  try {
    const res = await fetch(NEWS_URL, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch news" },
        { status: res.status }
      );
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

    return NextResponse.json({ articles });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
