import { NextResponse } from "next/server";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebaseDb";

export async function GET(request) {
  try {
    // News is public data - no authentication required
    // This allows the dashboard to load news even before user logs in

    // Read cached news from Firebase
    const snapshot = await get(ref(db, "pl_data/news/articles"));
    if (!snapshot.exists()) {
      // Fallback logic if empty? or return empty array.
      // User asked to schedule twice a day, so it might be empty initially.
      return NextResponse.json({ articles: [] });
    }

    const articles = snapshot.val();
    return NextResponse.json({ articles: Array.isArray(articles) ? articles : [] });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
