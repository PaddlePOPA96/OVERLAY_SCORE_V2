"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { LeftSidebar } from "@/app/dashboard/_components/LeftSidebar";
import { MainColumn } from "@/app/dashboard/_components/MainColumn";
import { RightColumn } from "@/app/dashboard/_components/RightColumn";
import { TopBar } from "@/app/dashboard/_components/TopBar";
import { Button } from "@/components/ui/button";
import { loginWithEmailPassword } from "@/lib/auth/service";
import {
  usePremierLeagueMatches,
  usePremierLeagueNews,
  usePremierLeagueStandings,
  useChampionsLeagueMatches,
  useChampionsLeagueStandings,
} from "@/hooks/pl-data";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  // active: "operator" | "pl-matches" | "pl-table"
  const [active, setActive] = useState("operator");
  const [roomId, setRoomId] = useState("");
  const [theme, setTheme] = useState("dark");
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (current) => {
      setUser(current);
      setRoomId(current?.uid || "default");
      setReady(true);
      if (!current) {
        setActive((prev) => (prev === "operator" ? "pl-matches" : prev));
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth).catch(() => { });
  };

  const { matches, loadingMatches, reloadMatches } = usePremierLeagueMatches();
  const { news, loadingNews } = usePremierLeagueNews();
  const { standings, loadingStandings, reloadStandings } =
    usePremierLeagueStandings();
  const {
    uclStandings,
    loadingUclStandings,
    reloadUclStandings,
  } = useChampionsLeagueStandings();
  const { uclMatches, loadingUclMatches } = useChampionsLeagueMatches();

  const handleAutoRefresh = () => {
    reloadMatches();
    reloadStandings();
  };

  useAutoRefresh(handleAutoRefresh);

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
    <>
      <div className={rootClass}>
        <div className="flex flex-col flex-1 w-full">
          <TopBar
            user={user}
            theme={theme}
            onToggleTheme={() =>
              setTheme((prev) => (prev === "dark" ? "light" : "dark"))
            }
            onLogout={handleLogout}
            onLoginClick={() => setLoginModalOpen(true)}
          />
          <div className="flex flex-1">
            <LeftSidebar
              active={active}
              setActive={setActive}
              theme={theme}
              user={user}
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
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </>
  );
}

function LoginModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);
    try {
      await loginWithEmailPassword(email, password);
      setStatus({
        type: "success",
        message: "Berhasil login.",
      });
      if (onClose) {
        onClose();
      }
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error?.message ||
          "Gagal login, periksa kembali email dan password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const statusClassName =
    status.type === "error"
      ? "text-xs text-red-400 mt-2"
      : "text-xs text-emerald-400 mt-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-slate-950 border border-slate-700 rounded-2xl p-4 w-full max-w-sm shadow-2xl text-slate-100 mx-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-semibold">Login Operator</h2>
            <p className="text-[11px] text-slate-400">
              Masuk untuk mengontrol scoreboard.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-2 space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Email</label>
            <input
              type="email"
              className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Password</label>
            <input
              type="password"
              className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="Masukkan password"
            />
          </div>

          {status.message && (
            <p className={statusClassName}>{status.message}</p>
          )}

          <Button
            type="submit"
            className="w-full mt-2 text-xs"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Login"}
          </Button>

          <div className="mt-2 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              className="text-xs"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
