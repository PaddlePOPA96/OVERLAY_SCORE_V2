"use client";

import { Button } from "@/components/ui/button";

export function LeftSidebar({ active, setActive, theme }) {
  const isDark = theme === "dark";
  const asideClass = [
    "w-1/5 p-6 flex flex-col justify-between border-r",
    isDark ? "bg-black border-gray-800 text-gray-100" : "bg-white border-gray-200 text-gray-900",
  ].join(" ");

  return (
    <aside className={asideClass}>
      <div>
       
        <nav className="space-y-2" aria-label="Dashboard sections">
          <div className="text-xs text-gray-300 uppercase tracking-wider mb-2">
            Main Menu
          </div>

          <NavItem
            icon="🏠"
            label="Scoreboard Operator"
            active={active === "operator"}
            isDark={isDark}
            onClick={() => setActive("operator")}
          />

          <div className="text-xs text-gray-300 uppercase tracking-wider mt-4 mb-1">
            Premier League
          </div>
          <NavItem
            icon="🏆"
            label="Premier League"
            active={active === "pl-matches" || active === "pl-table"}
            isDark={isDark}
            onClick={() => setActive("pl-matches")}
          />
          <NavItem
            icon="🏆"
            label="UCL Table"
            active={active === "ucl-table"}
            isDark={isDark}
            onClick={() => setActive("ucl-table")}
          />

          <div className="text-xs text-gray-300 uppercase tracking-wider mt-4 mb-1">
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

      <div className="space-y-2 mt-auto" />
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
