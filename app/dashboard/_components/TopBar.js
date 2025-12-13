"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { registerWithEmailPassword, createUserWithRole } from "@/lib/auth/service";
import { useUserRole } from "@/hooks/useUserRole";
import { UserManagementModal } from "./UserManagementModal";

export function TopBar({
  user,
  theme,
  onToggleTheme,
  onLogout,
  onLoginClick,
  onToggleMobileMenu,
}) {
  const isDark = theme === "dark";
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showUserMgmt, setShowUserMgmt] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserConfirm, setNewUserConfirm] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");
  const [adminStatus, setAdminStatus] = useState({ type: "", message: "" });
  const [adminLoading, setAdminLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { role, isAdmin } = useUserRole(user);

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
                    {isAdmin ? "Admin" : role ? capitalize(role) : "User"}
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
        />
      )}

      {user && showAdminModal && !showUserMgmt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-slate-950 border border-slate-700 rounded-2xl p-4 w-full max-w-sm shadow-2xl text-slate-100">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold">Profil</h3>
              <button
                type="button"
                onClick={() => {
                  setShowAdminModal(false);
                  setShowCreateForm(false);
                }}
                className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              {user?.email}{" "}
              <span className="text-emerald-400">({role || "user"})</span>
            </p>

            {isAdmin && showCreateForm && (
              <form onSubmit={handleAdminCreateUser} className="space-y-3 mb-3">
                <h4 className="text-xs font-semibold text-slate-200">
                  Admin: Buat User Baru
                </h4>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300">
                    Email user
                  </label>
                  <input
                    type="email"
                    className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="user@example.com"
                    value={newUserEmail}
                    onChange={(event) => setNewUserEmail(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300">
                    Password awal
                  </label>
                  <input
                    type="password"
                    className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="Minimal 6 karakter"
                    value={newUserPassword}
                    onChange={(event) =>
                      setNewUserPassword(event.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300">
                    Konfirmasi password
                  </label>
                  <input
                    type="password"
                    className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="Ulangi password"
                    value={newUserConfirm}
                    onChange={(event) =>
                      setNewUserConfirm(event.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300">
                    Role Access
                  </label>
                  <select
                    className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                  >
                    <option value="user">User Biasa</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {adminStatus.message && (
                  <p
                    className={`text-[11px] ${adminStatus.type === "error"
                        ? "text-red-400"
                        : "text-emerald-400"
                      }`}
                  >
                    {adminStatus.message}
                  </p>
                )}

                <p className="mt-1 text-[10px] text-slate-500">
                  Catatan: Setelah user dibuat, sesi login akan berpindah ke
                  akun tersebut.
                </p>

                <Button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full mt-2 text-xs"
                >
                  {adminLoading ? "Membuat user..." : "Simpan User Baru"}
                </Button>
              </form>
            )}

            <div className="flex justify-end gap-2 pt-1 flex-wrap">
              {isAdmin && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => setShowUserMgmt(true)}
                  >
                    Kelola User
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => setShowCreateForm((prev) => !prev)}
                  >
                    {showCreateForm ? "Tutup Add User" : "Add User"}
                  </Button>
                </>
              )}
              <Button
                type="button"
                className="text-xs bg-red-900 hover:bg-red-800 text-red-100"
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
