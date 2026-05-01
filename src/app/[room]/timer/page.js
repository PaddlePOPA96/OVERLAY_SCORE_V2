"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";

export default function TimerOverlay() {
  const params = useParams();
  const roomId = params.room;
  
  const [targetTime, setTargetTime] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const [timerColor, setTimerColor] = useState("#ffffff");
  const [borderColor, setBorderColor] = useState("transparent");

  const [currentRemaining, setCurrentRemaining] = useState(0);

  useEffect(() => {
    if (!roomId) return;
    const timerPath = `match_live/${roomId}/countdown_timer`;
    const timerRef = ref(db, timerPath);
    const unsubscribe = onValue(timerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTargetTime(data.targetTime || null);
        setIsRunning(data.isRunning || false);
        setRemainingMs(data.remainingMs || 0);
        setTimerColor(data.color || "#ffffff");
        setBorderColor(data.borderColor || "transparent");
      } else {
        setTargetTime(null);
        setIsRunning(false);
        setRemainingMs(0);
        setTimerColor("#ffffff");
        setBorderColor("transparent");
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    let interval;
    if (isRunning && targetTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const diff = targetTime - now;
        if (diff <= 0) {
          setCurrentRemaining(0);
        } else {
          setCurrentRemaining(diff);
        }
      }, 100);
    } else {
      setCurrentRemaining(remainingMs);
    }
    return () => clearInterval(interval);
  }, [isRunning, targetTime, remainingMs]);

  const formatTime = (ms) => {
    if (ms <= 0) return { d: "00", h: "00", m: "00", s: "00" };
    const totalSeconds = Math.floor(ms / 1000);
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    return {
      d: String(d).padStart(2, '0'),
      h: String(h).padStart(2, '0'),
      m: String(m).padStart(2, '0'),
      s: String(s).padStart(2, '0')
    };
  };

  const timeParts = formatTime(currentRemaining);

  // Return a transparent overlay for OBS
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-transparent overflow-hidden font-sans">
      <div 
        className="font-black tabular-nums tracking-tight flex items-center gap-4 font-mono drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]" 
        style={{ 
          fontSize: "8rem", 
          color: timerColor,
          WebkitTextStroke: borderColor !== "transparent" ? `4px ${borderColor}` : undefined
        }}
      >
         {timeParts.d !== "00" && (
           <>
             <div className="flex flex-col items-center">
                <span>{timeParts.d}</span>
                <span className="text-2xl uppercase tracking-widest font-semibold mt-2 text-gray-300">Days</span>
             </div>
             <span className="opacity-80 pb-12">:</span>
           </>
         )}
         <div className="flex flex-col items-center">
            <span>{timeParts.h}</span>
            <span className="text-2xl uppercase tracking-widest font-semibold mt-2 text-gray-300">Hours</span>
         </div>
         <span className="opacity-80 pb-12">:</span>
         <div className="flex flex-col items-center">
            <span>{timeParts.m}</span>
            <span className="text-2xl uppercase tracking-widest font-semibold mt-2 text-gray-300">Mins</span>
         </div>
         <span className="opacity-80 pb-12">:</span>
         <div className="flex flex-col items-center">
            <span>{timeParts.s}</span>
            <span className="text-2xl uppercase tracking-widest font-semibold mt-2 text-gray-300">Secs</span>
         </div>
      </div>
    </div>
  );
}
