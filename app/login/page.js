"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loginWithEmailPassword,
  loginWithGooglePopup,
  sendResetPassword,
} from "@/lib/auth/service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Matikan login/register via Google agar akun harus dibuat admin (setelah bayar)
const GOOGLE_LOGIN_DISABLED = true;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleAuthSuccess = (user) => {
    if (!user) return;
    if (typeof window !== "undefined") {
      if (remember) {
        window.localStorage.setItem("scoreboard-remember", "1");
        window.localStorage.setItem(
          "scoreboard-email",
          user.email || email || ""
        );
      } else {
        window.localStorage.removeItem("scoreboard-remember");
        window.localStorage.removeItem("scoreboard-email");
      }
    }
    router.push("/dashboard");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedRemember = window.localStorage.getItem("scoreboard-remember");
    const savedEmail = window.localStorage.getItem("scoreboard-email") || "";
    if (savedRemember === "1") {
      setRemember(true);
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);
    try {
      const user = await loginWithEmailPassword(email, password);
      handleAuthSuccess(user);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error?.message || "Gagal login, periksa kembali email dan password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (GOOGLE_LOGIN_DISABLED) {
      setStatus({
        type: "error",
        message:
          "Login dengan Google dinonaktifkan. Gunakan email & password akun yang dibuat admin.",
      });
      return;
    }
    setStatus({ type: "", message: "" });
    setLoading(true);
    try {
      const user = await loginWithGooglePopup();
      handleAuthSuccess(user);
    } catch (error) {
      setStatus({
        type: "error",
        message: error?.message || "Gagal login dengan Google.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setStatus({
        type: "error",
        message: "Isi email terlebih dahulu untuk reset password.",
      });
      return;
    }
    setLoading(true);
    try {
      await sendResetPassword(email);
      setStatus({
        type: "success",
        message:
          "Link reset password telah dikirim ke email jika terdaftar.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error?.message || "Gagal mengirim email reset password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const statusClassName =
    status.type === "error"
      ? "auth-status auth-status-error"
      : "auth-status auth-status-success";

  return (
    <div className="auth-shell">
      <Card className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <span>⚽</span>
          </div>
          <h1 className="auth-title">Scoreboard Panel</h1>
          <p className="auth-subtitle">Access your operator dashboard securely.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              type="email"
              className="auth-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="auth-input auth-input-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-toggle-visibility"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="auth-remember-row">
            <label>
              <input
                type="checkbox"
                className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              <span>Remember this device</span>
            </label>
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-xs font-medium text-indigo-500 hover:text-indigo-600"
            >
              Reset password
            </button>
          </div>

          {status.message && (
            <p className={statusClassName}>{status.message}</p>
          )}

          <div className="auth-actions-row">
            <Button
              type="submit"
              disabled={loading}
              className="auth-btn-main"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <Button
              type="button"
              disabled={loading}
              className="auth-btn-ghost"
              onClick={() => router.push("/register")}
            >
              Create account
            </Button>
          </div>
        </form>

        <div className="mt-4">
          <Button
            type="button"
            disabled={loading || GOOGLE_LOGIN_DISABLED}
            onClick={handleGoogleLogin}
            className="auth-secondary-btn"
            >
            <span style={{ fontSize: 15 }}>G</span>
            <span>Continue with Google</span>
          </Button>
        </div>

        <div className="auth-security">
          <div className="auth-security-icon">
            <span>✓</span>
          </div>
          <p>
            Your connection is secured with 256-bit SSL encryption.
          </p>
        </div>
      </Card>
    </div>
  );
}
