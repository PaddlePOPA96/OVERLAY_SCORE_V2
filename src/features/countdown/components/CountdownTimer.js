"use client";

import { useState, useEffect, useRef } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";

export default function CountdownTimer({ theme = "dark", roomId = "default" }) {
  const isDark = theme === "dark";

  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  const [targetTime, setTargetTime] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);

  const [currentRemaining, setCurrentRemaining] = useState(0);
  const [timerColor, setTimerColor] = useState("#ffffff");
  const [borderColor, setBorderColor] = useState("transparent");
  const [fillColor, setFillColor] = useState("transparent");
  const [timerTitle, setTimerTitle] = useState("");
  const [audioVolume, setAudioVolume] = useState(1);
  const [audioSource, setAudioSource] = useState("/sounds/brr-brr-patapim-alarm-clock.mp3");
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);

  const timerPath = `match_live/${roomId}/countdown_timer`;

  useEffect(() => {
    if (!roomId) return;
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
    }, (error) => {
      console.error("Firebase read error:", error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let interval;
    if (isRunning && targetTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const diff = targetTime - now;
        if (diff <= 0) {
          setCurrentRemaining(0);
          update(ref(db, timerPath), { isRunning: false, remainingMs: 0 }).catch(console.error);
        } else {
          setCurrentRemaining(diff);
        }
      }, 100);
    } else {
      setCurrentRemaining(remainingMs);
    }
    return () => clearInterval(interval);
  }, [isRunning, targetTime, remainingMs]);

  const handleStartPreset = (ms) => {
    const target = Date.now() + ms;
    console.log("Starting preset:", ms, "Target:", target);
    update(ref(db, timerPath), {
      targetTime: target,
      isRunning: true,
      remainingMs: ms
    }).catch(err => console.error("Firebase update error:", err));
  };

  const handleStartManual = () => {
    const d = parseInt(days) || 0;
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;

    const ms = (d * 86400 + h * 3600 + m * 60 + s) * 1000;
    console.log("Starting manual:", ms);
    if (ms > 0) {
      handleStartPreset(ms);
    }
  };

  const handlePause = () => {
    update(ref(db, timerPath), {
      targetTime: null,
      isRunning: false,
      remainingMs: currentRemaining
    }).catch(console.error);
  };

  const handleResume = () => {
    update(ref(db, timerPath), {
      targetTime: Date.now() + remainingMs,
      isRunning: true,
      remainingMs: remainingMs
    }).catch(console.error);
  };

  const handleReset = () => {
    update(ref(db, timerPath), {
      targetTime: null,
      isRunning: false,
      remainingMs: 0
    }).catch(console.error);
    setDays(""); setHours(""); setMinutes(""); setSeconds("");
  };

  const handleColorChange = (color) => {
    setTimerColor(color);
    update(ref(db, timerPath), {
      color: color
    }).catch(console.error);
  };

  const handleBorderColorChange = (color) => {
    setBorderColor(color);
    update(ref(db, timerPath), {
      borderColor: color
    }).catch(console.error);
  };

  const toggleTransparentBorder = () => {
    const newColor = borderColor === "transparent" ? "#000000" : "transparent";
    setBorderColor(newColor);
    update(ref(db, timerPath), {
      borderColor: newColor
    }).catch(console.error);
  };

  const handleFillColorChange = (color) => {
    setFillColor(color);
    update(ref(db, timerPath), {
      fillColor: color
    }).catch(console.error);
  };

  const toggleTransparentFill = () => {
    const newColor = fillColor === "transparent" ? "#000000" : "transparent";
    setFillColor(newColor);
    update(ref(db, timerPath), {
      fillColor: newColor
    }).catch(console.error);
  };

  const handleTitleChange = (title) => {
    setTimerTitle(title);
    update(ref(db, timerPath), {
      title: title
    }).catch(console.error);
  };

  const handleVolumeChange = (vol) => {
    const val = parseFloat(vol);
    setAudioVolume(val);
    update(ref(db, timerPath), {
      audioVolume: val
    }).catch(console.error);
  };

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

  return (
    <div className={`p-6 rounded-2xl border shadow-xl max-w-4xl mx-auto ${isDark ? 'bg-slate-950/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>

      {/* Display */}
      <div className="flex flex-col items-center justify-center mb-8">
        {timerTitle && (
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold -mb-2 relative z-10 tracking-widest uppercase text-center" style={{ color: timerColor }}>
            {timerTitle}
          </h2>
        )}
        <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tabular-nums tracking-tight flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-2 font-mono w-full">
          <div className="flex flex-col items-center">
            <span>{timeParts.d}</span>
            <span className={`text-xs sm:text-sm md:text-base uppercase tracking-widest font-semibold mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Days</span>
          </div>
          <span className={`pb-6 sm:pb-8 ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>:</span>
          <div className="flex flex-col items-center">
            <span>{timeParts.h}</span>
            <span className={`text-xs sm:text-sm md:text-base uppercase tracking-widest font-semibold mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Hours</span>
          </div>
          <span className={`pb-6 sm:pb-8 ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>:</span>
          <div className="flex flex-col items-center">
            <span>{timeParts.m}</span>
            <span className={`text-xs sm:text-sm md:text-base uppercase tracking-widest font-semibold mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Mins</span>
          </div>
          <span className={`pb-6 sm:pb-8 ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>:</span>
          <div className="flex flex-col items-center">
            <span>{timeParts.s}</span>
            <span className={`text-xs sm:text-sm md:text-base uppercase tracking-widest font-semibold mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Secs</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mt-6">
          {!isRunning && currentRemaining > 0 ? (
            <button onClick={handleResume} className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-green-600/30">
              Resume
            </button>
          ) : isRunning ? (
            <button onClick={handlePause} className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-yellow-500/30">
              Pause
            </button>
          ) : null}
          <button onClick={handleReset} className={`px-8 py-3 rounded-xl font-bold transition-all border ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>
            Reset
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        {/* Presets */}
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className="text-lg font-bold mb-4">Quick Presets</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onClick={() => handleStartPreset(30 * 60 * 1000)} className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all">
              30 Mins
            </button>
            <button onClick={() => handleStartPreset(60 * 60 * 1000)} className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all">
              60 Mins
            </button>
            <button onClick={() => handleStartPreset(24 * 60 * 60 * 1000)} className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all">
              1 Day
            </button>
          </div>
        </div>

        {/* Manual Setup */}
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className="text-lg font-bold mb-4">Manual Setup</h3>
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1">Days</label>
              <input type="number" min="0" value={days} onChange={e => setDays(e.target.value)} className={`w-full p-2 rounded-lg border text-center ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} placeholder="0" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1">Hours</label>
              <input type="number" min="0" value={hours} onChange={e => setHours(e.target.value)} className={`w-full p-2 rounded-lg border text-center ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} placeholder="0" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1">Mins</label>
              <input type="number" min="0" value={minutes} onChange={e => setMinutes(e.target.value)} className={`w-full p-2 rounded-lg border text-center ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} placeholder="0" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1">Secs</label>
              <input type="number" min="0" value={seconds} onChange={e => setSeconds(e.target.value)} className={`w-full p-2 rounded-lg border text-center ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} placeholder="0" />
            </div>
          </div>
          <button onClick={handleStartManual} className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-blue-600/30">
            Start Manual Timer
          </button>
        </div>

        {/* Display Settings */}
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className="text-lg font-bold mb-4">Display Settings</h3>
          
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Timer Title:</label>
            <input 
              type="text" 
              value={timerTitle} 
              onChange={e => handleTitleChange(e.target.value)} 
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
              placeholder="e.g., MATCH STARTS IN"
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-semibold">Alarm Volume:</label>
              <span className="text-sm font-mono">{Math.round(audioVolume * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={audioVolume} 
              onChange={e => handleVolumeChange(e.target.value)} 
              className="w-full accent-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Alarm Sound:</label>
            <div className="flex gap-2 items-center">
              <span className={`flex-1 p-3 rounded-lg border font-mono text-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
                {audioSource.includes('lamine') ? 'Lamine Yamal' : audioSource.includes('parado') ? 'Parado no Bailao' : 'Brr Brr Patapim'}
              </span>
              <button 
                onClick={() => setIsSoundModalOpen(true)}
                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all shadow-md"
              >
                Change
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row flex-wrap gap-8 mb-6">
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-semibold">Text Color:</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={timerColor} 
                  onChange={e => handleColorChange(e.target.value)} 
                  className="w-14 h-10 cursor-pointer bg-transparent rounded"
                />
                <span className="text-sm font-mono text-slate-400">{timerColor}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-semibold">Border Color:</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={borderColor === "transparent" ? "#ffffff" : borderColor}
                  onChange={e => handleBorderColorChange(e.target.value)}
                  className="w-14 h-10 cursor-pointer bg-transparent rounded"
                />
                <span className="text-sm font-mono text-slate-400">
                  {borderColor === "transparent" ? "Transparent" : borderColor}
                </span>
              </div>
              <button
                onClick={toggleTransparentBorder}
                className={`text-xs px-3 py-1.5 rounded-md font-semibold border transition-colors w-max ${borderColor === "transparent"
                    ? "bg-slate-700 text-slate-200 border-slate-600"
                    : "bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30"
                  }`}
              >
                {borderColor === "transparent" ? "Enable Border" : "Set Transparent"}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="block text-sm font-semibold">Background / Fill:</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={fillColor === "transparent" ? "#ffffff" : fillColor}
                  onChange={e => handleFillColorChange(e.target.value)}
                  className="w-14 h-10 cursor-pointer bg-transparent rounded"
                />
                <span className="text-sm font-mono text-slate-400">
                  {fillColor === "transparent" ? "Transparent" : fillColor}
                </span>
              </div>
              <button
                onClick={toggleTransparentFill}
                className={`text-xs px-3 py-1.5 rounded-md font-semibold border transition-colors w-max ${fillColor === "transparent"
                    ? "bg-slate-700 text-slate-200 border-slate-600"
                    : "bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30"
                  }`}
              >
                {fillColor === "transparent" ? "Enable Fill" : "Set Transparent"}
              </button>
            </div>
          </div>

          <h3 className="text-lg font-bold mb-4 border-t border-slate-700/50 pt-4">OBS Setup</h3>
          <div>
            <label className="block text-xs uppercase text-slate-500 font-bold mb-2">Overlay URL</label>
            <div className="flex gap-2">
              <code className={`flex-1 p-3 rounded text-sm font-mono overflow-x-auto whitespace-nowrap ${isDark ? "bg-black text-green-400" : "bg-slate-200 text-slate-800"}`}>
                {typeof window !== 'undefined' ? `${window.location.origin}/${roomId}/timer` : `/${roomId}/timer`}
              </code>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/${roomId}/timer`;
                  navigator.clipboard.writeText(url);
                  alert("URL copied to clipboard!");
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Copy
              </button>
              <a
                href={`/${roomId}/timer`}
                target="_blank"
                rel="noreferrer"
                className={`px-4 py-2 border rounded-lg font-semibold text-sm flex items-center transition-colors ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}
              >
                Open
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Sound Selection Modal */}
      {isSoundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Select Alarm Sound</h3>
              <button onClick={() => setIsSoundModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors text-xl">
                ✕
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {[
                { name: "Brr Brr Patapim", path: "/sounds/brr-brr-patapim-alarm-clock.mp3" },
                { name: "Parado no Bailao", path: "/sounds/parado-no-bailao.mp3" },
                { name: "Lamine Yamal", path: "/sounds/lamine-yamal.mp3" }
              ].map(sound => (
                <div 
                  key={sound.path}
                  onClick={() => {
                    setAudioSource(sound.path);
                    update(ref(db, timerPath), { audioSource: sound.path }).catch(console.error);
                    setIsSoundModalOpen(false);
                  }}
                  className={`p-4 rounded-xl cursor-pointer border transition-all flex items-center justify-between ${audioSource === sound.path ? 'border-blue-500 bg-blue-500/10' : (isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50')}`}
                >
                  <span className="font-semibold">{sound.name}</span>
                  {audioSource === sound.path && <span className="text-blue-500 font-bold">✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
