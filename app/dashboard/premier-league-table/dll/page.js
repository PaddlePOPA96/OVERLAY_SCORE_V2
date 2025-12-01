"use client";

import {
  usePremierLeagueMatches,
  usePremierLeagueStandings,
} from "@/hooks/pl-data";
import { PremierLeagueMain } from "@/app/dashboard/_components/PremierLeagueSection";

// Halaman lain-lain Premier League (jadwal & hasil) di dalam dashboard
export default function PremierLeagueMiscPage() {
  const { matches, loadingMatches } = usePremierLeagueMatches();
  const { standings, loadingStandings, reloadStandings } =
    usePremierLeagueStandings();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">
        Premier League - Jadwal &amp; Hasil
      </h1>
      <PremierLeagueMain
        matches={matches}
        loading={loadingMatches}
        theme="dark"
        standings={standings}
        loadingStandings={loadingStandings}
        mode="matches"
        isAdmin={false}
        onRefreshStandings={reloadStandings}
      />
    </div>
  );
}
