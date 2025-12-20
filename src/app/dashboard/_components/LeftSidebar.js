"use client";

export function LeftSidebar({ active, setActive, theme, user, streamActive, isOpen, onClose }) {
  const isDark = theme === "dark";

  // Base classes always apply
  // Mobile: fixed inset, transform based on isOpen
  // Desktop (lg): relative, always visible (translate-0), width 1/5
  const asideClass = [
    "fixed inset-y-0 left-0 z-50 w-64 lg:w-1/5 p-6 flex flex-col justify-between border-r transition-transform duration-300 lg:relative lg:translate-x-0",
    isOpen ? "translate-x-0" : "-translate-x-full",
    isDark
      ? "bg-black border-gray-800 text-gray-100"
      : "bg-white border-gray-200 text-gray-900",
  ].join(" ");

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={asideClass}>
        <div>
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <span className="font-bold text-lg">Menu</span>
            <button onClick={onClose} className="text-xl px-2">×</button>
          </div>
          <nav className="space-y-2" aria-label="Dashboard sections">
            <div className="text-xs text-gray-300 uppercase tracking-wider mb-2">
              Main Menu
            </div>

            {user && (
              <NavItem
                icon="🏠"
                label="Scoreboard Operator"
                active={active === "operator"}
                isDark={isDark}
                onClick={() => {
                  setActive("operator");
                  if (onClose) onClose();
                }}
              />
            )}

            {/* Show Stream Control if User is logged in OR Stream is active */}
            {(user || streamActive) && (
              <NavItem
                icon="📺"
                label="Stream Control"
                active={active === "nonton-control"}
                isDark={isDark}
                onClick={() => {
                  setActive("nonton-control");
                  if (onClose) onClose();
                }}
              />
            )}

            <div className="text-xs text-gray-300 uppercase tracking-wider mt-4 mb-1">
              Premier League
            </div>
            <NavItem
              icon="🏆"
              label="Premier League"
              active={active === "pl-matches" || active === "pl-table"}
              isDark={isDark}
              onClick={() => {
                setActive("pl-matches");
                if (onClose) onClose();
              }}
            />
            <NavItem
              icon="🏆"
              label="UCL Table"
              active={active === "ucl-table"}
              isDark={isDark}
              onClick={() => {
                setActive("ucl-table");
                if (onClose) onClose();
              }}
            />

            <div className="text-xs text-gray-300 uppercase tracking-wider mt-4 mb-1">
              Dream Eleven
            </div>
            <NavItem
              icon="⭐"
              label="Dream Eleven"
              active={active === "dream-eleven"}
              isDark={isDark}
              onClick={() => {
                setActive("dream-eleven");
                if (onClose) onClose();
              }}
            />
          </nav>
        </div>

        <div className="space-y-2 mt-auto" />
      </aside>
    </>
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
