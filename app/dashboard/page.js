"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { LeftSidebar } from "@/app/dashboard/_components/LeftSidebar";
import { MainColumn } from "@/app/dashboard/_components/MainColumn";
import { RightColumn } from "@/app/dashboard/_components/RightColumn";
import {
  usePremierLeagueMatches,
  usePremierLeagueNews,
  usePremierLeagueStandings,
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

  const isPremierLeagueView =
    active === "pl-matches" || active === "pl-table";

  const rootClass = [
    "min-h-screen flex font-sans overflow-x-hidden",
    isDark
      ? "bg-gradient-to-br from-slate-950 via-gray-900 to-black text-gray-300"
      : "bg-gradient-to-br from-slate-100 via-slate-50 to-white text-slate-900",
  ].join(" ");

  return (
    <div className={rootClass}>
      <LeftSidebar
        active={active}
        setActive={setActive}
        onLogout={handleLogout}
        theme={theme}
      />
      <MainColumn
        active={active}
        user={user}
        roomId={roomId}
        matches={matches}
        loadingMatches={loadingMatches}
        fullWidth={active === "operator"}
        theme={theme}
        standings={standings}
        loadingStandings={loadingStandings}
        isAdmin={isAdmin}
        onRefreshStandings={reloadStandings}
      />
      {isPremierLeagueView && (
        <RightColumn
          active={active}
          user={user}
          matches={matches}
          loadingMatches={loadingMatches}
          news={news}
          loadingNews={loadingNews}
          theme={theme}
          onToggleTheme={() =>
            setTheme((prev) => (prev === "dark" ? "light" : "dark"))
          }
        />
      )}
    </div>
  );
}
