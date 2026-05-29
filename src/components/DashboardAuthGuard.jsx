"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardAuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 text-white z-[9999]">
        {/* Sleek, premium aesthetic loading container */}
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl shadow-2xl">
          {/* Animated Spinner with subtle gradients */}
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-pink-500 animate-spin"></div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Securing Session
            </p>
            <p className="text-xs text-slate-400 font-medium">Verifying credentials, please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Prevent showing any dashboard elements during redirect
  }

  return <>{children}</>;
}
