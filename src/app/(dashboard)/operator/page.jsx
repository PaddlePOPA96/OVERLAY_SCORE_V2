"use client";

import { useEffect, useState } from "react";
import OperatorRoot from "@/app/dashboard/operator/_components/OperatorRoot";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@mui/material/styles";

export default function OperatorPage() {
  const { user, loading, roomId: authRoomId } = useAuth();
  const theme = useTheme();
  const activeTheme = theme.palette.mode;

  // Allow URL query/hash to override the default roomId
  const [roomId, setRoomId] = useState("default");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const roomFromQuery = params.get("room") || "";
    const roomFromHash = window.location.hash.replace("#", "") || "";
    setRoomId(roomFromQuery || roomFromHash || authRoomId || "default");
  }, [authRoomId]);

  if (loading) {
    return <div className="p-6 text-textSecondary text-sm">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600">
        <h3 className="font-semibold mb-1">Access Restricted</h3>
        <p className="text-xs">Please login to use the Scoreboard Operator.</p>
      </div>
    );
  }

  return (
    <div className="p-4 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-textPrimary">Scoreboard Operator</h1>
        <p className="text-textSecondary text-sm">Manage, update scores, time, and customize scoreboard overlay live.</p>
      </div>
      <OperatorRoot initialRoomId={roomId} theme={activeTheme} />
    </div>
  );
}
