"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { registerWithEmailPassword } from "@/lib/auth/service";
import { auth } from "@/lib/firebaseAuth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ADMIN_EMAIL = "admin@admin.com";

export default function AdminCreateUserPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      const isAdminUser = user.email === ADMIN_EMAIL;
      setIsAdmin(isAdminUser);
      setReady(true);
    });
    return () => unsub();
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (password !== confirmPassword) {
      setStatus({
        type: "error",
        message: "Password dan konfirmasi password tidak sama.",
      });
      return;
    }

    setLoading(true);
    try {
      await registerWithEmailPassword(email, password);
      setStatus({
        type: "success",
        message:
          "User berhasil dibuat. Saat ini Anda login sebagai user baru, silakan logout dan login kembali sebagai admin.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error?.message || "Gagal membuat user baru.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth).catch(() => {});
    router.replace("/login");
  };

  if (!ready) {
    return (
      <div className="auth-shell">
        <Card className="auth-card">
          <p className="text-sm text-slate-300">Memeriksa sesi admin...</p>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="auth-shell">
        <Card className="auth-card">
          <p className="text-sm text-red-400">
            Halaman ini hanya untuk admin.
          </p>
          <Button
            type="button"
            className="mt-4 auth-btn-main"
            onClick={() => router.push("/dashboard")}
          >
            Kembali ke Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <Card className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <span>⚙️</span>
          </div>
          <h1 className="auth-title">Admin: Buat User Baru</h1>
          <p className="auth-subtitle">
            Gunakan form ini setelah user melakukan pembayaran.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Email user</label>
            <input
              type="email"
              className="auth-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="user@example.com"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password awal</label>
            <input
              type="password"
              className="auth-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="Minimal 6 karakter"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Konfirmasi password</label>
            <input
              type="password"
              className="auth-input"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              placeholder="Ulangi password"
            />
          </div>

          {status.message && (
            <p
              className={`auth-status ${
                status.type === "error"
                  ? "auth-status-error"
                  : "auth-status-success"
              }`}
            >
              {status.message}
            </p>
          )}

          <div className="auth-actions-row">
            <Button
              type="submit"
              disabled={loading}
              className="auth-btn-main"
            >
              {loading ? "Membuat user..." : "Create User"}
            </Button>
            <Button
              type="button"
              className="auth-btn-ghost"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>

          <p className="mt-3 text-[11px] text-slate-500">
            Catatan: Firebase akan otomatis mengalihkan sesi ke user baru
            setelah user dibuat. Setelah selesai mencatat akun, logout dan
            login lagi sebagai admin.
          </p>
        </form>
      </Card>
    </div>
  );
}

