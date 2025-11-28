"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  registerWithEmailPassword,
  loginWithGooglePopup,
} from "@/lib/auth/service";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleAuthSuccess = (user) => {
    if (!user) return;
    const roomId = user.uid;
    router.push(`/operator?room=${roomId}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const user = await registerWithEmailPassword(email, password);
      handleAuthSuccess(user);
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.message || "Gagal membuat akun baru.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setStatus({ type: "", message: "" });
    setLoading(true);
    try {
      const user = await loginWithGooglePopup();
      handleAuthSuccess(user);
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.message || "Gagal menggunakan Google.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <span>⚽</span>
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            Register to start managing your scoreboard.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Minimal 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="auth-toggle-visibility"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Confirm password</label>
            <input
              type="password"
              className="auth-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Repeat your password"
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
            <button
              type="submit"
              disabled={loading}
              className="auth-btn-main"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
            <button
              type="button"
              disabled={loading}
              className="auth-btn-ghost"
              onClick={() => router.push("/login")}
            >
              Sign in
            </button>
          </div>
        </form>

        <div style={{ marginTop: 16 }}>
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogle}
            className="auth-secondary-btn"
          >
            <span style={{ fontSize: 15 }}>G</span>
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="auth-security">
          <div className="auth-security-icon">
            <span>✓</span>
          </div>
          <p>Your connection is secured with 256-bit SSL encryption.</p>
        </div>
      </div>

      <p className="auth-footnote">
        Sudah punya akun?{" "}
        <a href="/login" className="auth-link">
          Sign in
        </a>
      </p>
    </div>
  );
}
