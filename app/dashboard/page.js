"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { LeftSidebar } from "@/app/dashboard/_components/LeftSidebar";
import { MainColumn } from "@/app/dashboard/_components/MainColumn";
import { RightColumn } from "@/app/dashboard/_components/RightColumn";
import { TopBar } from "@/app/dashboard/_components/TopBar";
import {
  usePremierLeagueMatches,
  usePremierLeagueNews,
  usePremierLeagueStandings,
  useChampionsLeagueMatches,
  useChampionsLeagueStandings,
} from "@/hooks/pl-data";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  // active: "operator" | "pl-matches" | "pl-table"
  const [active, setActive] = useState("operator");
  const [roomId, setRoomId] = useState("");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (current) => {
      if (!current) {
        router.replace("/login");
        return;
      }
      setUser(current);
      setRoomId(current.uid || "default");
      setReady(true);
    });
    return () => unsub();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth).catch(() => {});
    router.replace("/login");
  };

  const { matches, loadingMatches } = usePremierLeagueMatches();
  const { news, loadingNews } = usePremierLeagueNews();
  const { standings, loadingStandings, reloadStandings } =
    usePremierLeagueStandings();
  const {
    uclStandings,
    loadingUclStandings,
    reloadUclStandings,
  } = useChampionsLeagueStandings();
  const { uclMatches, loadingUclMatches } = useChampionsLeagueMatches();

  // theme persistence
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("scoreboard-theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("scoreboard-theme", theme);
  }, [theme]);

  const isDark = theme === "dark";
  const isAdmin = user?.email === "admin@admin.com";

  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-gray-100">
        <div className="px-5 py-2 rounded-full bg-gray-800 text-xs tracking-[0.2em] uppercase">
          Memuat dashboard...
        </div>
      </div>
    );
  }

  const showRightColumn =
    active === "pl-matches" ||
    active === "pl-table" ||
    active === "ucl-table";

  const sideMatches =
    active === "ucl-table" ? uclMatches : matches;
  const sideLoadingMatches =
    active === "ucl-table" ? loadingUclMatches : loadingMatches;

  const rootClass = [
    "min-h-screen flex font-sans overflow-x-hidden",
    isDark
      ? "bg-gradient-to-br from-slate-950 via-gray-900 to-black text-gray-300"
      : "bg-gradient-to-br from-slate-100 via-slate-50 to-white text-slate-900",
  ].join(" ");

  return (
    <div className={rootClass}>
      <div className="flex flex-col flex-1 w-full">
        <TopBar
          user={user}
          theme={theme}
          onToggleTheme={() =>
            setTheme((prev) => (prev === "dark" ? "light" : "dark"))
          }
          onLogout={handleLogout}
        />
        <div className="flex flex-1">
          <LeftSidebar
            active={active}
            setActive={setActive}
            theme={theme}
          />
          <MainColumn
            active={active}
            user={user}
            roomId={roomId}
            matches={matches}
            loadingMatches={loadingMatches}
            fullWidth={
              active === "operator" ||
              active === "dream-eleven" ||
              active === "ucl-table"
            }
            theme={theme}
            standings={standings}
            loadingStandings={loadingStandings}
            uclStandings={uclStandings}
            loadingUclStandings={loadingUclStandings}
            uclMatches={uclMatches}
            loadingUclMatches={loadingUclMatches}
            isAdmin={isAdmin}
            onRefreshStandings={reloadStandings}
            onRefreshUclStandings={reloadUclStandings}
          />
          {showRightColumn && (
            <RightColumn
              active={active}
              matches={sideMatches}
              loadingMatches={sideLoadingMatches}
              news={news}
              loadingNews={loadingNews}
              theme={theme}
            />
          )}
        </div>
      </div>
    </div>
  );
}
