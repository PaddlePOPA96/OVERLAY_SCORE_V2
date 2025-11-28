"use client";
import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";

export function useScoreboard() {
  const [data, setData] = useState({
    layout: "B", // Default Layout
    showOverlay: true,
    introId: 0, // Untuk trigger animasi masuk
    
    // Data Tim
    homeName: "MAN",
    awayName: "WHU",
    homeScore: 0,
    awayScore: 0,
    homeLogo: "https://upload.wikimedia.org/wikipedia/id/thumb/0/0c/Liverpool_FC.svg/370px-Liverpool_FC.svg.png",
    awayLogo: "https://upload.wikimedia.org/wikipedia/id/thumb/e/eb/Manchester_City_FC_badge.svg/400px-Manchester_City_FC_badge.svg.png",
    
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

  // Sync Firebase
  useEffect(() => {
    const matchRef = ref(db, "match_live");
    const unsubscribe = onValue(matchRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        setData((prev) => ({ ...prev, ...val }));
        calculateTime(val); 
      }
    });
    return () => unsubscribe();
  }, []);

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

  const updateMatch = (updates) => { update(ref(db, "match_live"), updates); };

  const triggerGoal = (team) => {
    const newScore = team === "home" ? (data.homeScore || 0) + 1 : (data.awayScore || 0) + 1;
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