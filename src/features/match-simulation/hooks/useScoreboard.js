"use client";
import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebaseDb";

// roomId / sessionId dipakai supaya beberapa pertandingan bisa jalan paralel
export function useScoreboard(roomId = "default") {
  const [data, setData] = useState({
    layout: "B", // Default Layout
    showOverlay: true,
    introId: 0, // Untuk trigger animasi masuk

    // Data Tim
    homeName: "MAN",
    awayName: "WHU",
    homeScore: 0,
    awayScore: 0,
    homeLogo:
      "/logo/England%20-%20Premier%20League/Liverpool%20FC.png",
    awayLogo:
      "/logo/England%20-%20Premier%20League/Manchester%20City.png",

    // Warna & Style
    homeColor: "#a40606", // Layout A gradient
    awayColor: "#a40606", // Layout A gradient
    homeBg: "#111111", // Layout B Box
    awayBg: "#111111", // Layout B Box

    // Timer
    period: 1,
    timer: { isRunning: false, baseTime: 0, startTime: 0 },

    // Goal
    goalTrigger: 0,
    goalTeam: "",
  });

  const [displayTime, setDisplayTime] = useState(0);

  // Sync Firebase untuk room tertentu
  useEffect(() => {
    if (!roomId) return;
    const matchRef = ref(db, `match_live/${roomId}`);
    const unsubscribe = onValue(matchRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        setData((prev) => ({ ...prev, ...val }));
        calculateTime(val);
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  // Interval Lokal
  useEffect(() => {
    let interval;
    if (data.timer?.isRunning) {
      interval = setInterval(() => { calculateTime(data); }, 500);
    }
    return () => clearInterval(interval);
  }, [data]);

  const calculateTime = (currentData) => {
    if (!currentData?.timer) return;
    if (currentData.timer.isRunning) {
      const now = Date.now();
      const elapsed = Math.floor((now - currentData.timer.startTime) / 1000);
      setDisplayTime(currentData.timer.baseTime + elapsed);
    } else {
      setDisplayTime(currentData.timer.baseTime);
    }
  };

  const updateMatch = (updates) => {
    if (!roomId) return;
    update(ref(db, `match_live/${roomId}`), updates);
  };

  const triggerGoal = (team) => {
    const current =
      team === "home" ? data.homeScore || 0 : data.awayScore || 0;
    const newScore = Math.min(20, current + 1);
    updateMatch({
      [team === "home" ? "homeScore" : "awayScore"]: newScore,
      goalTrigger: Date.now(),
      goalTeam: team === "home" ? data.homeName : data.awayName
    });
  };

  const toggleTimer = () => {
    const now = Date.now();
    let updates = {};
    if (data.timer.isRunning) {
      const elapsed = Math.floor((now - data.timer.startTime) / 1000);
      updates = { "timer/isRunning": false, "timer/baseTime": data.timer.baseTime + elapsed, "timer/startTime": null };
    } else {
      updates = { "timer/isRunning": true, "timer/baseTime": data.timer.baseTime, "timer/startTime": now };
    }
    updateMatch(updates);
  };

  const resetTimer = () => {
    updateMatch({ "timer/isRunning": false, "timer/baseTime": 0, "timer/startTime": null });
  };

  const toggleOverlay = () => {
    const newState = !data.showOverlay;
    updateMatch({
      showOverlay: newState,
      introId: newState ? Date.now() : data.introId // Trigger animasi saat unhide
    });
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return { data, displayTime, formatTime, updateMatch, toggleTimer, resetTimer, triggerGoal, toggleOverlay };
}
