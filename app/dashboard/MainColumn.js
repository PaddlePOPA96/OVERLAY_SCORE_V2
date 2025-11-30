"use client";

import { useMemo } from "react";
import OperatorRoot from "@/app/operator/OperatorRoot";
import { PremierLeagueMain } from "./PremierLeagueSection";

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
  isAdmin,
  onRefreshStandings,
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

  return (
    <main className={`${fullWidth ? "flex-1" : "w-1/2"} p-8`}>
      {active === "operator" ? (
        <>
          <header className="mb-4">
            <h1 className={titleClass}>Scoreboard Operator</h1>
            <p className={subtitleClass}>
              Today is match control day. Kelola scoreboard kamu di sini.
            </p>
          </header>
          <div className="pr-2">
            <OperatorRoot initialRoomId={roomId} requireAuth={false} />
          </div>
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
            mode={active === "pl-table" ? "table" : "matches"}
            isAdmin={isAdmin}
            onRefreshStandings={onRefreshStandings}
          />
        </>
      )}
    </main>
  );
}
