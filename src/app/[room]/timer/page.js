"use client";

import { useEffect, useState, useRef } from "react";

import { useParams } from "next/navigation";

import { ref, onValue } from "firebase/database";

import { db } from "@/lib/firebase";

export default function TimerOverlay() {
  const params = useParams();
  const roomId = params.room;

  const [targetTime, setTargetTime] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const [timerColor, setTimerColor] = useState("#ffffff");
  const [borderColor, setBorderColor] = useState("transparent");
  const [fillColor, setFillColor] = useState("transparent");
  const [timerTitle, setTimerTitle] = useState("");
  const [audioVolume, setAudioVolume] = useState(1);
  const [audioSource, setAudioSource] = useState("/sounds/brr-brr-patapim-alarm-clock.mp3");

  const [currentRemaining, setCurrentRemaining] = useState(0);
  const [playError, setPlayError] = useState(false);

  const audioRef = useRef(null);
  const prevIsRunningRef = useRef(false);
  const playedTargetRef = useRef(null);

  const handleInteraction = () => {
    setPlayError(false);

    if (audioRef.current) {
      // Just a silent play/pause to unlock audio context without playing the actual sound
      audioRef.current.volume = 0;
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise.then(() => {
          audioRef.current.pause();
          audioRef.current.volume = audioVolume;
        }).catch(() => {});
      }
    }
  };

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume;
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.error("Audio play error:", e);

          if (e.name === "NotAllowedError" || e.message.includes("interact")) {
            setPlayError(true);
          }
        });
      }
    }
  };

  useEffect(() => {
    if (prevIsRunningRef.current === true && isRunning === false && targetTime !== null && remainingMs === 0) {
      if (playedTargetRef.current !== targetTime) {
        playedTargetRef.current = targetTime;
        playSound();
      }
    }

    prevIsRunningRef.current = isRunning;
  }, [isRunning, targetTime, remainingMs]);

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
        setFillColor(data.fillColor || "transparent");
        setTimerTitle(data.title || "");
        setAudioVolume(data.audioVolume !== undefined ? data.audioVolume : 1);
        setAudioSource(data.audioSource || "/sounds/brr-brr-patapim-alarm-clock.mp3");
      } else {
        setTargetTime(null);
        setIsRunning(false);
        setRemainingMs(0);
        setTimerColor("#ffffff");
        setBorderColor("transparent");
        setFillColor("transparent");
        setTimerTitle("");
        setAudioVolume(1);
        setAudioSource("/sounds/brr-brr-patapim-alarm-clock.mp3");
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

          if (playedTargetRef.current !== targetTime) {
            playedTargetRef.current = targetTime;
            playSound();
          }
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
    <div onClick={handleInteraction} className="w-screen h-screen flex flex-col items-center justify-center bg-transparent overflow-hidden font-sans cursor-pointer">
      <audio ref={audioRef} src={audioSource} preload="auto" />
      {playError && (
        <div className="absolute top-8 bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg animate-pulse z-50">
          ⚠️ Autoplay Blocked! Click here to play alarm
        </div>
      )}
      {timerTitle && (
        <h1
          className="font-black tracking-widest uppercase drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] text-center -mb-4 relative z-10"
          style={{ fontSize: "2.5rem", color: timerColor }}
        >
          {timerTitle}
        </h1>
      )}
      <div
        className={`font-black tabular-nums tracking-tight flex items-center gap-4 font-mono drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] px-12 py-6 rounded-3xl ${borderColor !== "transparent" ? "border-8" : ""}`}
        style={{
          fontSize: "8rem",
          color: timerColor,
          borderColor: borderColor !== "transparent" ? borderColor : "transparent",
          backgroundColor: fillColor !== "transparent" ? fillColor : "transparent"
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
