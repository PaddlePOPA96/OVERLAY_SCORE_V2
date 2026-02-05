"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, onValue } from "firebase/database"; // Realtime Database
import { auth, db } from "@/lib/firebase"; // Use 'db' from firebase export (realtime)
import { LeftSidebar } from "@/app/dashboard/_components/LeftSidebar";
import { MainColumn } from "@/app/dashboard/_components/MainColumn";
import { RightColumn } from "@/app/dashboard/_components/RightColumn";
import { TopBar } from "@/app/dashboard/_components/TopBar";
import { Button } from "@/components/ui/button";
import { loginWithEmailPassword, syncUserToFirestore } from "@/lib/auth/service";
import {
  usePremierLeagueMatches,
  usePremierLeagueNews,
  usePremierLeagueStandings,
} from "@/features/premier-league/hooks/usePremierLeagueData";
import {
  useChampionsLeagueMatches,
  useChampionsLeagueStandings,
} from "@/features/champions-league/hooks/useChampionsLeagueData";

import { useUserRole } from "@/features/iam/hooks/useUserRole";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const { role, isAdmin } = useUserRole(user);
  const [ready, setReady] = useState(false);
  // active: "operator" | "pl-matches" | "pl-table"
  const [active, setActive] = useState("operator");
  const [roomId, setRoomId] = useState("");
  const [theme, setTheme] = useState("dark");
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (current) => {
      setUser(current);
      setRoomId(current?.uid || "default");
      setReady(true);
      if (current) {
        // Sync user ke Firestore jika belum ada
        syncUserToFirestore(current);
      } else {
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
  const { uclMatches, loadingUclMatches, reloadUclMatches } = useChampionsLeagueMatches();

  // useAutoRefresh removed: Client listens to Firebase realtime updates now.


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
  // isAdmin determined by hook above

  // --- Global Auto Refresh Logic (Admin Only) ---
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const stored = localStorage.getItem("dashboard_auto_refresh");
    if (stored === "true") setAutoRefresh(true);
  }, [isAdmin]);

  useEffect(() => {
    localStorage.setItem("dashboard_auto_refresh", autoRefresh);
  }, [autoRefresh]);

  useEffect(() => {
    let interval;
    if (autoRefresh && isAdmin) {
      interval = setInterval(() => {
        // Refresh EVERYTHING when global auto-refresh is ON
        reloadMatches();
        reloadStandings();
        reloadUclMatches();
        reloadUclStandings();
      }, 60000); // 60 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh, isAdmin, reloadMatches, reloadStandings, reloadUclMatches, reloadUclStandings]);
  // --- End Global Auto Refresh Logic ---

  const [manualLoading, setManualLoading] = useState(false);

  const handleManualRefresh = async () => {
    if (manualLoading) return;

    // Check if user is logged in
    if (!user) {
      alert("⚠️ Anda harus login terlebih dahulu untuk refresh data.");
      return;
    }

    setManualLoading(true);
    try {
      await Promise.all([
        reloadMatches(),
        reloadStandings(),
        reloadUclMatches(),
        reloadUclStandings(),
      ]);
      // Success feedback (optional, could add toast notification here)
      console.log("✅ All data refreshed successfully");
    } catch (e) {
      console.error("Manual refresh failed", e);
      // Show user-friendly error message
      if (e.message?.includes("logged in")) {
        alert("⚠️ Sesi login Anda telah berakhir. Silakan login kembali.");
      } else if (e.message?.includes("token")) {
        alert("⚠️ Gagal mendapatkan token autentikasi. Silakan coba lagi.");
      } else {
        alert(`⚠️ Gagal refresh data: ${e.message || "Unknown error"}`);
      }
    } finally {
      // Small delay to show feedback if too fast
      setTimeout(() => setManualLoading(false), 500);
    }
  };

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
            onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
            autoRefresh={autoRefresh}
            setAutoRefresh={setAutoRefresh}
            onManualRefresh={handleManualRefresh}
            manualLoading={manualLoading}
          />
          <div className="flex flex-col lg:flex-row flex-1 relative">
            <LeftSidebar
              active={active}
              setActive={setActive}
              theme={theme}
              user={user}

              isOpen={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
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
                active === "ucl-table" ||
                active === "running-text"
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
              onRefreshMatches={reloadMatches}
              onRefreshUclMatches={reloadUclMatches}
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
