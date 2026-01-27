import { NextResponse } from "next/server";
import { ref, set, get } from "firebase/database";
import { db } from "@/lib/firebaseDb";
import { verifyIdToken } from "@/lib/firebaseAdmin";

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const BASE_URL = "https://api.football-data.org/v4";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const token = authHeader.split("Bearer ")[1];
    const verification = await verifyIdToken(token);
    if (!verification.success) {
      return NextResponse.json({ error: `Invalid Token: ${verification.error || 'unknown'}` }, { status: 401 });
    }
    // const decodedToken = verification;



    let data;
    try {
      if (!API_KEY) {
        throw new Error("Configuration Error: Missing FOOTBALL_DATA_API_KEY in server environment");
      }

      const res = await fetch(`${BASE_URL}/competitions/PL/standings`, {
        headers: { "X-Auth-Token": API_KEY },
        cache: "no-store",
      });

      if (res.status === 429) {
        // Rate limited by upstream API: kembalikan payload kosong dengan status 200
        return NextResponse.json(
          { standings: [], rateLimited: true },
          { status: 200 }
        );
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch standings: ${res.status} ${res.statusText}`);
      }

      data = await res.json();

      // Simpan snapshot standings ke Firebase di node terpisah dari match_live
      try {
        await set(ref(db, "pl_data/standings"), {
          lastUpdated: Date.now(),
          data,
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("[PL] Gagal menyimpan standings ke Firebase:", e);
      }
    } catch (fetchError) {
      console.warn("[PL] External API failed, attempting fallback to Firebase:", fetchError);
      try {
        const snapshot = await get(ref(db, "pl_data/standings"));
        if (snapshot.exists()) {
          const cached = snapshot.val();
          data = cached.data;
          // You might check cached.lastUpdated here if you want to notify about staleness
        } else {
          throw fetchError; // No cached data, rethrow original error
        }
      } catch (fbError) {
        throw fetchError; // Fallback failed, throw original
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
