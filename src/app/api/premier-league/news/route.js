import { NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebaseAdmin";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebaseDb";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    // Strict Mode: Block if no token.
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }

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
