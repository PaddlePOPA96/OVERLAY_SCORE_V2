"use client";

import { useState } from "react";

import Button from "@mui/material/Button";

import ButtonGroup from "@mui/material/ButtonGroup";

import Grid from "@mui/material/Grid";

import {
  usePremierLeagueMatches,
  usePremierLeagueStandings,
  usePremierLeagueNews,
} from "@/features/premier-league/hooks/usePremierLeagueData";
import { PremierLeagueMain } from "@/features/premier-league/components/PremierLeagueSection";
import { PremierLeagueRight } from "@/features/premier-league/components/PremierLeagueSidebar";

// MUI Imports

export default function PremierLeaguePage() {
  const { matches, loadingMatches, reloadMatches } = usePremierLeagueMatches();
  const { standings, loadingStandings, reloadStandings } = usePremierLeagueStandings();
  const { news, loadingNews, reloadNews } = usePremierLeagueNews();

  const [plMode, setPlMode] = useState("matches"); // "matches" | "table"

  const handleRefresh = () => {
    reloadMatches();
    reloadStandings();
    if (reloadNews) reloadNews();
  };

  return (
    <div className="p-4 w-full">
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Premier League</h1>
          <p className="text-textSecondary text-sm">View schedules, scores, standings, and update soccer results.</p>
        </div>
        <div className="flex gap-2 items-center">
          <ButtonGroup variant="outlined" size="small" aria-label="Premier League Display Mode">
            <Button
              onClick={() => setPlMode("matches")}
              variant={plMode === "matches" ? "contained" : "outlined"}
              className="normal-case font-semibold text-xs"
            >
              Schedules & Results
            </Button>
            <Button
              onClick={() => setPlMode("table")}
              variant={plMode === "table" ? "contained" : "outlined"}
              className="normal-case font-semibold text-xs"
            >
              Standings Table
            </Button>
          </ButtonGroup>
          <Button
            onClick={handleRefresh}
            variant="text"
            color="secondary"
            size="small"
            className="normal-case font-semibold text-xs"
          >
            🔄 Refresh
          </Button>
        </div>
      </header>

      <Grid container spacing={6}>
        {/* Left Column: Matches or Table */}
        <Grid item xs={12} lg={8}>
          <div className="bg-slate-50 border border-slate-700/10 rounded-xl p-4 md:p-6 shadow-sm w-full h-full">
            <PremierLeagueMain
              matches={matches}
              loading={loadingMatches}
              theme="light"
              standings={standings}
              loadingStandings={loadingStandings}
              mode={plMode}
              isAdmin={false} // operator admin handles updates via operator page, this is view-only for users
              onRefreshStandings={reloadStandings}
              onRefreshMatches={reloadMatches}
            />
          </div>
        </Grid>

        {/* Right Column: Latest News & Live Match */}
        <Grid item xs={12} lg={4}>
          <div className="bg-slate-50 border border-slate-700/10 rounded-xl p-5 shadow-sm w-full h-full flex flex-col gap-6">
            <PremierLeagueRight
              matches={matches}
              loading={loadingMatches}
              news={news}
              loadingNews={loadingNews}
              theme="light"
            />
          </div>
        </Grid>
      </Grid>
    </div>
  );
}
