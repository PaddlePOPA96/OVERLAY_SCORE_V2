"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebaseAuth";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuthSuccess = (user) => {
    if (!user) return;
    const roomId = user.uid; // room berdasarkan UUID/UID user
    router.push(`/operator?room=${roomId}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let cred;
      if (mode === "login") {
        cred = await signInWithEmailAndPassword(auth, email, password);
      } else {
        cred = await createUserWithEmailAndPassword(auth, email, password);
      }
      handleAuthSuccess(cred.user);
    } catch (err) {
      setError(err?.message || "Gagal proses autentikasi");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      handleAuthSuccess(cred.user);
    } catch (err) {
      setError(err?.message || "Gagal login dengan Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="w-full max-w-md bg-gray-900/80 border border-gray-700 rounded-xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">
          ⚽ Scoreboard Login
        </h1>

        <div className="flex mb-6 bg-gray-800 rounded-lg overflow-hidden text-sm">
          <button
            type="button"
            className={`flex-1 py-2 ${
              mode === "login"
                ? "bg-blue-600 text-white"
                : "bg-transparent text-gray-300"
            }`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 py-2 ${
              mode === "register"
                ? "bg-blue-600 text-white"
                : "bg-transparent text-gray-300"
            }`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs whitespace-pre-wrap">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-sm font-semibold"
          >
            {loading
              ? "Memproses..."
              : mode === "login"
              ? "Login"
              : "Buat Akun"}
          </button>
        </form>

        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
            <span className="flex-1 h-px bg-gray-700" />
            <span>atau</span>
            <span className="flex-1 h-px bg-gray-700" />
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full py-2 rounded-md bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-60 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <span>Login dengan Google</span>
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-500 text-center">
          Setelah login, sistem akan membuat room berdasarkan UID user
          (contoh: <code>/overlay/&lt;uid-user&gt;</code>) dan langsung membuka
          halaman Operator.
        </p>
      </div>
    </div>
  );
}

