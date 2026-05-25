"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { registerWithEmailPassword, createUserWithRole } from "@/lib/auth/service";
import { useUserRole } from "@/features/iam/hooks/useUserRole";
import { UserManagementModal } from "@/features/iam/components/UserManagementModal";

export function TopBar({
  user,
  theme,
  onToggleTheme,
  onLogout,
  onLoginClick,
  onToggleMobileMenu,
  autoRefresh,
  setAutoRefresh,
  onManualRefresh,
  manualLoading,
}) {
  const isDark = theme === "dark";
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showUserMgmt, setShowUserMgmt] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserConfirm, setNewUserConfirm] = useState("");
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [showNewUserConfirm, setShowNewUserConfirm] = useState(false);
  const [newUserRole, setNewUserRole] = useState("user");
  const [adminStatus, setAdminStatus] = useState({ type: "", message: "" });
  const [adminLoading, setAdminLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { role, isAdmin, isSuperAdmin } = useUserRole(user);

  const username = useMemo(
    () => user?.email?.split("@")[0] || "Operator",
    [user],
  );

  useEffect(() => {
    if (!showAdminModal) return;
    const handler = (event) => {
      if (event.key === "Escape") {
        setShowAdminModal(false);
        setShowCreateForm(false);
        setShowUserMgmt(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showAdminModal]);

  useEffect(() => {
    if (!user) {
      setShowAdminModal(false);
      setShowCreateForm(false);
      setShowUserMgmt(false);
    }
  }, [user]);

  const handleAdminCreateUser = async (event) => {
    event.preventDefault();
    setAdminStatus({ type: "", message: "" });
    // ... existing logic ...
    if (!newUserEmail || !newUserPassword) {
      setAdminStatus({
        type: "error",
        message: "Isi email dan password untuk user baru.",
      });
      return;
    }

    if (newUserPassword !== newUserConfirm) {
      setAdminStatus({
        type: "error",
        message: "Password dan konfirmasi password tidak sama.",
      });
      return;
    }

    setAdminLoading(true);
    try {
      await createUserWithRole(newUserEmail, newUserPassword, newUserRole);
      setAdminStatus({
        type: "success",
        message:
          "User berhasil dibuat dengan role " +
          newUserRole +
          ". Sesi login berpindah ke user baru.",
      });
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserConfirm("");
      setNewUserRole("user");
    } catch (error) {
      setAdminStatus({
        type: "error",
        message: error?.message || "Gagal membuat user baru.",
      });
    } finally {
      setAdminLoading(false);
    }
  };

  const barClass = [
    "w-full px-6 py-3 flex items-center justify-between border-b",
    isDark
      ? "border-gray-800 bg-black/60 backdrop-blur"
      : "border-gray-200 bg-white/70 backdrop-blur",
  ].join(" ");

  return (
    <>
      <header className={barClass}>
        <div className="flex items-center gap-3 font-bold text-sm tracking-wide">
          <button
            type="button"
            className="lg:hidden text-2xl leading-none"
            onClick={onToggleMobileMenu}
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center text-xs text-white">
            ⚽
          </div>
          <span className={isDark ? "text-white" : "text-slate-900"}>
            SCOREBOARD PANEL
          </span>

          {/* Global Auto Refresh Toggle */}
          {isAdmin && (
            <div className="ml-4 h-6 border-l border-gray-500/30 pl-4 flex items-center gap-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${autoRefresh
                  ? "bg-purple-600/20 border-purple-500 text-purple-400"
                  : isDark
                    ? "bg-white/5 border-white/10 text-gray-500 hover:text-gray-300"
                    : "bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700"
                  }`}
                title="Auto Refresh Data (60s)"
              >
                <div className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? "bg-purple-400 animate-pulse" : "bg-gray-500"}`} />
                AUTO {autoRefresh ? "ON" : "OFF"}
              </button>

              <button
                onClick={onManualRefresh}
                disabled={manualLoading || !user}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${!user
                  ? "opacity-40 cursor-not-allowed bg-gray-800 border-gray-700 text-gray-600"
                  : isDark
                    ? "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                    : "bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={!user ? "Login terlebih dahulu untuk refresh data" : "Refresh All Data Now"}
              >
                {manualLoading ? (
                  <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 16h5v5" />
                  </svg>
                )}
                REFRESH
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleTheme}
            className="cursor-pointer hover:bg-gray-800/40 text-lg rounded-full p-2"
            aria-label="Toggle theme"
          >
            {isDark ? "🌞" : "🌙"}
          </button>

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAdminModal(true)}
                className={`flex items-center gap-3 rounded-full px-3 py-1 border ${isDark
                  ? "border-gray-700 hover:bg-gray-800/60"
                  : "border-gray-300 hover:bg-gray-100"
                  }`}
              >
                <div className="text-right">
                  <div
                    className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"
                      }`}
                  >
                    {username}
                  </div>
                  <div className="text-[11px] text-purple-400">
                    {role === "superadmin" ? "Super Admin" : (isAdmin ? "Admin" : role ? capitalize(role) : "User")}
                  </div>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full border-2 border-gray-800" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              className="text-xs font-semibold px-4"
              onClick={onLoginClick}
            >
              Login
            </Button>
          )}
        </div>
      </header>

      {/* User Management Modal */}
      {showUserMgmt && (
        <UserManagementModal
          open={showUserMgmt}
          onClose={() => setShowUserMgmt(false)}
          currentUserUid={user?.uid}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {user && showAdminModal && !showUserMgmt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-slate-950 border border-slate-700 rounded-2xl p-8 w-full max-w-xl shadow-2xl text-slate-100 mx-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-bold tracking-tight">Profil</h3>
              <button
                type="button"
                onClick={() => {
                  setShowAdminModal(false);
                  setShowCreateForm(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              {user?.email}{" "}
              <span className="text-emerald-400 font-medium">({role || "user"})</span>
            </p>

            {isSuperAdmin && showCreateForm && (
              <form onSubmit={handleAdminCreateUser} className="space-y-4 mb-6 border-t border-slate-800/80 pt-5">
                <h4 className="text-base font-bold text-slate-200 mb-3">
                  Super Admin: Buat User Baru
                </h4>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">
                    Email user
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-slate-500"
                    placeholder="user@example.com"
                    value={newUserEmail}
                    onChange={(event) => setNewUserEmail(event.target.value)}
                    required
                  />
                </div>
                 <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">
                    Password awal
                  </label>
                  <div className="relative">
                    <input
                      type={showNewUserPassword ? "text" : "password"}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-3.5 pr-14 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-slate-500"
                      placeholder="Minimal 6 karakter"
                      value={newUserPassword}
                      onChange={(event) =>
                        setNewUserPassword(event.target.value)
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
                    >
                      {showNewUserPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">
                    Konfirmasi password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewUserConfirm ? "text" : "password"}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-3.5 pr-14 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-slate-500"
                      placeholder="Ulangi password"
                      value={newUserConfirm}
                      onChange={(event) =>
                        setNewUserConfirm(event.target.value)
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewUserConfirm(!showNewUserConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
                    >
                      {showNewUserConfirm ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">
                    Role Access
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                  >
                    <option value="user">User Biasa</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>

                {adminStatus.message && (
                  <p
                    className={`text-xs ${adminStatus.type === "error"
                      ? "text-red-400 font-medium"
                      : "text-emerald-400 font-medium"
                      }`}
                  >
                    {adminStatus.message}
                  </p>
                )}

                <p className="mt-1 text-xs text-slate-500">
                  Catatan: Setelah user dibuat, sesi login akan berpindah ke
                  akun tersebut.
                </p>

                <Button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full mt-3 py-2.5 text-sm font-semibold rounded-lg shadow-md"
                >
                  {adminLoading ? "Membuat user..." : "Simpan User Baru"}
                </Button>
              </form>
            )}

            <div className="flex justify-end gap-2 pt-2 flex-wrap">
              {isSuperAdmin && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-sm py-2 px-4 rounded-lg"
                    onClick={() => setShowUserMgmt(true)}
                  >
                    Kelola User
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="text-sm py-2 px-4 rounded-lg"
                    onClick={() => setShowCreateForm((prev) => !prev)}
                  >
                    {showCreateForm ? "Tutup Add User" : "Add User"}
                  </Button>
                </>
              )}
              <Button
                type="button"
                className="text-sm py-2 px-4 rounded-lg bg-red-900 hover:bg-red-800 text-red-100 font-medium transition-colors"
                onClick={onLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
