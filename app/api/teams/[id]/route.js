import { NextResponse } from "next/server";
import { ref, set } from "firebase/database";
import { db } from "@/lib/firebase";

const API_KEY =
  process.env.FOOTBALL_DATA_API_KEY || "0ea6f9faf31246dcb907c52fa33062b6";
const BASE_URL = "https://api.football-data.org/v4";

export async function GET(_req, { params }) {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json(
        { error: "Missing team id" },
        { status: 400 }
      );
    }

    const url = `${BASE_URL}/teams/${encodeURIComponent(id)}`;
    const res = await fetch(url, {
      headers: { "X-Auth-Token": API_KEY },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch team" },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Simpan detail tim ke Firebase pada node pl_data/teams/{id}
    try {
      await set(ref(db, `pl_data/teams/${id}`), {
        lastUpdated: Date.now(),
        data,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[PL] Gagal menyimpan data tim ke Firebase:", e);
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
