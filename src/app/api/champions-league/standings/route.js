import { NextResponse } from "next/server";
import { ref, set } from "firebase/database";
import { db } from "@/lib/firebaseDb";

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const BASE_URL = "https://api.football-data.org/v4";

export async function GET() {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: "Configuration Error: Missing FOOTBALL_DATA_API_KEY in server environment" },
        { status: 500 }
      );
    }

    const res = await fetch(`${BASE_URL}/competitions/CL/standings`, {
      headers: { "X-Auth-Token": API_KEY },
      cache: "no-store",
    });

    if (res.status === 429) {
      // Rate limited by upstream API: kembalikan payload kosong dengan status 200
      return NextResponse.json(
        { standings: [], rateLimited: true },
        { status: 200 },
      );
    }

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const errorMessage = errorBody.message || res.statusText;
      return NextResponse.json(
        { error: `Upstream API Error (${res.status}): ${errorMessage}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    try {
      await set(ref(db, "ucl_data/standings"), {
        lastUpdated: Date.now(),
        data,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[UCL] Gagal menyimpan standings ke Firebase:", e);
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
