"use client";

import { PremierLeagueRight } from "./PremierLeagueSidebar";

export function RightColumn({
  active,
  matches,
  loadingMatches,
  news,
  loadingNews,
  theme,
}) {
  const isDark = theme === "dark";
  const asideClass = [
    "w-full lg:w-[30%] p-8 lg:border-l flex flex-col gap-8",
    isDark ? "bg-gray-900 border-gray-800" : "bg-slate-50 border-gray-200",
  ].join(" ");

  if (active === "operator") {
    return null;
  }

  return (
    <aside className={asideClass}>
      <PremierLeagueRight
        matches={matches}
        loading={loadingMatches}
        news={news}
        loadingNews={loadingNews}
        theme={theme}
      />
    </aside>
  );
}
