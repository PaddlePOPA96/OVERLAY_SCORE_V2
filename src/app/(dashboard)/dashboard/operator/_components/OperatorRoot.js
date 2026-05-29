"use client";

import { useEffect, useState } from "react";

import { signOut, onAuthStateChanged } from "firebase/auth";

import { useScoreboard } from "@/features/match-simulation/hooks/useScoreboard";
import { auth } from "@/lib/firebaseAuth";
import OperatorA from "./OperatorA";
import OperatorB from "./OperatorB";
import OperatorC from "./OperatorC";
import OperatorD from "./OperatorD";
import OperatorE from "./OperatorE";

export default function OperatorRoot({
  initialRoomId,
  requireAuth = true,
  theme: parentTheme,
}) {
  const roomId = initialRoomId;
  if (!roomId) {
    return <div className="text-white p-10">Loading Room...</div>;
  }

  const [isAuthReady, setIsAuthReady] = useState(!requireAuth);
  const [theme, setTheme] = useState(parentTheme || "dark");

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

  // Synchronize state when parent theme prop changes
  useEffect(() => {
    if (parentTheme) {
      setTheme(parentTheme);
    }
  }, [parentTheme]);

  // Load theme from local storage only if no parent theme prop is provided
  useEffect(() => {
    if (!parentTheme && typeof window !== "undefined") {
      const stored = window.localStorage.getItem("scoreboard-theme");

      if (stored) {
        setTheme(stored);
      }
    }
  }, [parentTheme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("scoreboard-theme", nextTheme);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } finally {
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    }
  };

  console.log("OperatorRoot roomId:", roomId);
  const {
    data,
    displayTime,
    formatTime,
    updateMatch,
    toggleTimer,
    resetTimer,
    triggerGoal,
    toggleOverlay,
    stopGoalAudio,
    previewGoalAudio,
  } = useScoreboard(roomId);

  const actions = {
    updateMatch,
    toggleTimer,
    resetTimer,
    triggerGoal,
    toggleOverlay,
    stopGoalAudio,
    previewGoalAudio,
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
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  if (data.layout === "C") {
    return (
      <OperatorC
        data={data}
        actions={actions}
        displayTime={displayTime}
        formatTime={formatTime}
        roomId={roomId}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  if (data.layout === "D") {
    return (
      <OperatorD
        data={data}
        actions={actions}
        displayTime={displayTime}
        formatTime={formatTime}
        roomId={roomId}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  if (data.layout === "E") {
    return (
      <OperatorE
        data={data}
        actions={actions}
        displayTime={displayTime}
        formatTime={formatTime}
        roomId={roomId}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
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
      theme={theme}
      toggleTheme={toggleTheme}
    />
  );
}
