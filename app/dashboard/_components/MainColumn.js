"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { PremierLeagueMain } from "./PremierLeagueSection";
import { ChampionsLeagueTable, ChampionsLeagueMatches } from "./UCLSection";

const OperatorRoot = dynamic(
  () => import("@/app/dashboard/operator/_components/OperatorRoot"),
  {
    ssr: false,
    loading: () => (
      <div className="text-sm text-slate-400">
        Memuat panel operator...
      </div>
    ),
  }
);

const DreamElevenBuilder = dynamic(
  () => import("./DreamElevenBuilder"),
  {
    ssr: false,
    loading: () => (
      <div className="text-sm text-slate-400">
        Memuat Dream Eleven...
      </div>
    ),
  }
);

export function MainColumn({
  active,
  user,
  roomId,
  matches,
  loadingMatches,
  fullWidth,
  theme,
  standings,
  loadingStandings,
  uclStandings,
  loadingUclStandings,
  uclMatches,
  loadingUclMatches,
  isAdmin,
  onRefreshStandings,
  onRefreshUclStandings,
}) {
  const isDark = theme === "dark";
  const username = useMemo(
    () => user?.email?.split("@")[0] || "Operator",
    [user]
  );

  const titleClass = isDark
    ? "text-3xl text-white font-bold"
    : "text-3xl text-slate-900 font-bold";

  const subtitleClass = isDark
    ? "text-gray-500"
    : "text-slate-600";

  const [plMode, setPlMode] = useState(
    active === "pl-table" ? "table" : "matches"
  ); // "matches" | "table"
  const [uclMode, setUclMode] = useState("table"); // "table" | "matches"

  return (
    <main className={`${fullWidth ? "flex-1" : "w-full lg:w-1/2"} p-4 md:p-8`}>
      {active === "operator" ? (
        <>
          <header className="mb-4">
            <h1 className={titleClass}>Scoreboard Operator</h1>
            <p className={subtitleClass}>
              Today is match control day. Kelola scoreboard kamu di sini.
            </p>
          </header>
          <div className="pr-2">
            {user ? (
              <OperatorRoot initialRoomId={roomId} requireAuth={false} />
            ) : (
              <div
                className={`rounded-xl border-2 border-dashed p-6 text-sm ${isDark
                  ? "border-slate-700 bg-black/40 text-slate-200"
                  : "border-slate-200 bg-white text-slate-700"
                  }`}
              >
                <p className="font-semibold mb-1">
                  Scoreboard terkunci untuk pengguna belum login.
                </p>
                <p className="text-xs">
                  Silakan login terlebih dahulu melalui tombol{" "}
                  <span className="font-semibold">Login</span> di kanan atas
                  untuk mengontrol scoreboard.
                </p>
              </div>
            )}
          </div>
        </>
      ) : active === "dream-eleven" ? (
        <>
          <header className="mb-8">
            <h1 className={titleClass}>Dream Eleven</h1>
            <p className={subtitleClass}>
              Susun tim impian Premier League kamu di sini.
            </p>
          </header>
          {user ? (
            <DreamElevenBuilder />
          ) : (
            <div
              className={`rounded-xl border-2 border-dashed p-6 text-sm ${isDark
                  ? "border-slate-700 bg-black/40 text-slate-200"
                  : "border-slate-200 bg-white text-slate-700"
                }`}
            >
              <p className="font-semibold mb-1">
                Fitur ini terkunci untuk pengguna belum login.
              </p>
              <p className="text-xs">
                Silakan login terlebih dahulu melalui tombol{" "}
                <span className="font-semibold">Login</span> di kanan atas untuk
                mengakses Dream Eleven.
              </p>
            </div>
          )}
        </>
      ) : active === "ucl-table" ? (
        <>
          <header className="mb-8">
            <h1 className={titleClass}>UEFA Champions League Table</h1>
            <p className={subtitleClass}>
              Lihat klasemen fase grup Liga Champions.
            </p>
            <div className="mt-4 inline-flex rounded-full bg-slate-900/60 border border-slate-700 p-1 text-xs">
              <button
                type="button"
                onClick={() => setUclMode("table")}
                className={`px-3 py-1 rounded-full font-semibold transition-colors ${uclMode === "table"
                  ? "bg-purple-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-100"
                  }`}
              >
                Table
              </button>
              <button
                type="button"
                onClick={() => setUclMode("matches")}
                className={`px-3 py-1 rounded-full font-semibold transition-colors ${uclMode === "matches"
                  ? "bg-purple-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-100"
                  }`}
              >
                Jadwal &amp; Hasil
              </button>
            </div>
          </header>
          {uclMode === "table" ? (
            <ChampionsLeagueTable
              standings={uclStandings}
              loadingStandings={loadingUclStandings}
              theme={theme}
              isAdmin={isAdmin}
              onRefreshStandings={onRefreshUclStandings}
            />
          ) : (
            <ChampionsLeagueMatches
              matches={uclMatches}
              loadingMatches={loadingUclMatches}
              theme={theme}
            />
          )}
        </>
      ) : active === "pl-matches" || active === "pl-table" ? (
        <>
          <header className="mb-8">
            <h1 className={titleClass}>Premier League</h1>
            <p className={subtitleClass}>
              Lihat jadwal, hasil, dan klasemen Premier League.
            </p>
            <div className="mt-4 inline-flex rounded-full bg-slate-900/60 border border-slate-700 p-1 text-xs">
              <button
                type="button"
                onClick={() => setPlMode("matches")}
                className={`px-3 py-1 rounded-full font-semibold transition-colors ${plMode === "matches"
                  ? "bg-purple-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-100"
                  }`}
              >
                Jadwal &amp; Hasil
              </button>
              <button
                type="button"
                onClick={() => setPlMode("table")}
                className={`px-3 py-1 rounded-full font-semibold transition-colors ${plMode === "table"
                  ? "bg-purple-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-100"
                  }`}
              >
                Premier League Table
              </button>
            </div>
          </header>
          <PremierLeagueMain
            matches={matches}
            loading={loadingMatches}
            theme={theme}
            standings={standings}
            loadingStandings={loadingStandings}
            mode={plMode}
            isAdmin={isAdmin}
            onRefreshStandings={onRefreshStandings}
          />
        </>
      ) : (
        <>
          <header className="mb-8">
            <h1 className={titleClass}>Welcome, {username}!</h1>
            <p className={subtitleClass}>Today is sports day</p>
          </header>
          <PremierLeagueMain
            matches={matches}
            loading={loadingMatches}
            theme={theme}
            standings={standings}
            loadingStandings={loadingStandings}
            mode="matches"
            isAdmin={isAdmin}
            onRefreshStandings={onRefreshStandings}
          />
        </>
      )}
    </main>
  );
}
