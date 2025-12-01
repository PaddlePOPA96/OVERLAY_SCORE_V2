"use client";

import { Button } from "@/components/ui/button";

export function LeftSidebar({ active, setActive, onLogout, theme }) {
  const isDark = theme === "dark";
  const asideClass = [
    "w-1/5 p-6 flex flex-col justify-between border-r",
    isDark ? "bg-black border-gray-800 text-gray-100" : "bg-white border-gray-200 text-gray-900",
  ].join(" ");

  return (
    <aside className={asideClass}>
      <div>
        <div
          className={`flex items-center gap-2 mb-10 font-bold text-xl ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          <div className="w-6 h-6 bg-purple-600 rounded-full" />
          SCOREBOARD
        </div>

        <nav className="space-y-2">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Main Menu
          </div>

          <NavItem
            icon="🏠"
            label="Scoreboard Operator"
            active={active === "operator"}
            isDark={isDark}
            onClick={() => setActive("operator")}
          />

          <div className="text-xs text-gray-500 uppercase tracking-wider mt-4 mb-1">
            Premier League
          </div>
          <NavItem
            icon="📅"
            label="Jadwal & Hasil"
            active={active === "pl-matches"}
            isDark={isDark}
            onClick={() => setActive("pl-matches")}
          />
          <NavItem
            icon="📊"
            label="Premier League Table"
            active={active === "pl-table"}
            isDark={isDark}
            onClick={() => setActive("pl-table")}
          />

          <div className="text-xs text-gray-500 uppercase tracking-wider mt-4 mb-1">
            Dream Eleven
          </div>
          <NavItem
            icon="⭐"
            label="Dream Eleven"
            active={active === "dream-eleven"}
            isDark={isDark}
            onClick={() => setActive("dream-eleven")}
          />
        </nav>
      </div>

      <div className="space-y-2 mt-auto">
        <Button
          type="button"
          onClick={onLogout}
          className="w-full text-red-400 border border-transparent hover:border-red-400 cursor-pointer pt-2 mt-4 flex items-center justify-center gap-2 text-sm bg-transparent"
          variant="ghost"
        >
          <span>←</span> Log Out
        </Button>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active, isDark, ...props }) {
  const base =
    "w-full p-3 rounded-lg flex gap-3 items-center cursor-pointer transition text-sm";
  const activeClasses =
    "bg-purple-900/50 text-white border-l-4 border-purple-500";
  const inactiveClasses = isDark
    ? "text-gray-300 hover:bg-gray-800 hover:text-white"
    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900";

  return (
    <button
      type="button"
      className={`${base} ${active ? activeClasses : inactiveClasses}`}
      {...props}
    >
      <span>{icon}</span>
      <span className="font-semibold">{label}</span>
    </button>
  );
}
