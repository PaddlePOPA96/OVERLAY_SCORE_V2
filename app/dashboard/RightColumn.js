"use client";

import { PremierLeagueRight } from "./PremierLeagueSidebar";

export function RightColumn({
  active,
  user,
  matches,
  loadingMatches,
  news,
  loadingNews,
  theme,
  onToggleTheme,
}) {
  const isDark = theme === "dark";
  const asideClass = [
    "w-[30%] p-8 border-l flex flex-col gap-8",
    isDark ? "bg-gray-900 border-gray-800" : "bg-slate-50 border-gray-200",
  ].join(" ");

  return (
    <aside className={asideClass}>
      <div className="flex justify-end items-center gap-4">
        <button
          type="button"
          onClick={onToggleTheme}
          className="cursor-pointer hover:bg-gray-800/40 text-lg rounded-full p-2"
          aria-label="Toggle theme"
        >
          {isDark ? "🌞" : "🌙"}
        </button>
        <div
          className={`flex items-center gap-3 text-right border-l pl-4 ${
            isDark ? "border-gray-700" : "border-gray-300"
          }`}
        >
          <div>
            <div
              className={`text-sm font-bold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {user?.email || "Operator"}
            </div>
            <div className="text-xs text-purple-400">Premium User</div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full border-2 border-gray-800" />
        </div>
      </div>

      {active === "operator" ? null : (
        <PremierLeagueRight
          matches={matches}
          loading={loadingMatches}
          news={news}
          loadingNews={loadingNews}
          theme={theme}
        />
      )}
    </aside>
  );
}
