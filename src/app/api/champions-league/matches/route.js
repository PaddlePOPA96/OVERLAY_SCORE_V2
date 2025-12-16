import { NextResponse } from "next/server";
import { ref, set } from "firebase/database";
import { db } from "@/lib/firebaseDb";

const API_KEY =
  process.env.FOOTBALL_DATA_API_KEY || "0ea6f9faf31246dcb907c52fa33062b6";
const BASE_URL = "https://api.football-data.org/v4";

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

export async function GET() {
  try {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 7);
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 60);

    const url = `${BASE_URL}/competitions/CL/matches?dateFrom=${formatDate(
      pastDate
    )}&dateTo=${formatDate(futureDate)}`;

    const res = await fetch(url, {
      headers: { "X-Auth-Token": API_KEY },
      cache: "no-store",
    });

    if (res.status === 429) {
      // Rate limited by upstream API: kembalikan payload kosong dengan status 200
      return NextResponse.json(
        { matches: [], rateLimited: true },
        { status: 200 },
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch UCL matches" },
        { status: res.status }
      );
    }

    const data = await res.json();

    try {
      await set(ref(db, "ucl_data/matches"), {
        lastUpdated: Date.now(),
        data,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[UCL] Gagal menyimpan matches ke Firebase:", e);
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
