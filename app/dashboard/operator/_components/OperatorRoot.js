"use client";

import { useEffect, useState } from "react";
import { useScoreboard } from "@/hooks/useScoreboard";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import OperatorA from "./OperatorA";
import OperatorB from "./OperatorB";

export default function OperatorRoot({
  initialRoomId,
  requireAuth = true,
} = {}) {
  const roomId = initialRoomId || "default";
  const [isAuthReady, setIsAuthReady] = useState(!requireAuth);

  useEffect(() => {
    if (!requireAuth) return undefined;

    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        if (typeof window !== "undefined") {
          window.location.replace("/login");
        }
      } else {
        setIsAuthReady(true);
      }
    });
    return () => unsub();
  }, [requireAuth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } finally {
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    }
  };

  const {
    data,
    displayTime,
    formatTime,
    updateMatch,
    toggleTimer,
    resetTimer,
    triggerGoal,
    toggleOverlay,
  } = useScoreboard(roomId);

  const actions = {
    updateMatch,
    toggleTimer,
    resetTimer,
    triggerGoal,
    toggleOverlay,
  };

  if (!isAuthReady) {
    return <div className="text-white p-10">Memeriksa sesi login...</div>;
  }

  if (!data) {
    return <div className="text-white p-10">Loading Scoreboard System...</div>;
  }

  if (data.layout === "A") {
    return (
      <OperatorA
        data={data}
        actions={actions}
        displayTime={displayTime}
        formatTime={formatTime}
        roomId={roomId}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <OperatorB
      data={data}
      actions={actions}
      displayTime={displayTime}
      formatTime={formatTime}
      roomId={roomId}
      onLogout={handleLogout}
    />
  );
}
