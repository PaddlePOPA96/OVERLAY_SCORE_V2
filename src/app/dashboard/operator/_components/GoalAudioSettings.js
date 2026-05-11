"use client";

import { useRef, useState, useEffect } from "react";

export default function GoalAudioSettings({ data, updateMatch, stopGoalAudio }) {
  const audioVolume = data.goalAudioVolume !== undefined ? data.goalAudioVolume : 1;
  const audioSource = data.goalAudioSource || "/sounds/goal.mp3";

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Stop audio when source changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [audioSource]);

  // Sync volume in real-time
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume;
    }
  }, [audioVolume]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    } else {
      audio.volume = audioVolume;
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleAudioEnded = () => setIsPlaying(false);

  return (
    <div style={{ padding: "10px", background: "rgba(0,0,0,0.2)", border: "1px solid #444", borderRadius: "8px", marginTop: "10px", marginBottom: "10px" }}>
      <label className="op-label" style={{ marginBottom: "10px", display: "block", color: "#4ade80" }}>Goal Audio Settings</label>

      {/* Hidden audio element */}
      <audio ref={audioRef} src={audioSource} onEnded={handleAudioEnded} preload="auto" />

      <div style={{ marginBottom: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
          <span className="op-tiny">Volume:</span>
          <span className="op-tiny font-mono">{Math.round(audioVolume * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={audioVolume}
          onChange={(e) => updateMatch({ goalAudioVolume: parseFloat(e.target.value) })}
          className="w-full accent-green-500"
        />
      </div>

      <div>
        <span className="op-tiny" style={{ display: "block", marginBottom: "5px" }}>Sound:</span>
        <select
          value={audioSource}
          onChange={(e) => updateMatch({ goalAudioSource: e.target.value })}
          className="op-input"
          style={{ width: "100%", padding: "8px", background: "#111", color: "white" }}
        >
          <option value="/sounds/tamatlah-sudah.mp3">upin ipin</option>
          <option value="/sounds/ikeve.mp3">IKEVE YAMAL</option>
          <option value="/sounds/goal.mp3">Goal Horn</option>
          <option value="/sounds/ggmu.mp3">GGMU</option>
          <option value="/sounds/parado-no-bailao.mp3">Parado no Bailao</option>
          <option value="/sounds/lamine-yamal.mp3">Lamine Yamal</option>
          <option value="/sounds/antek.mp3">antek-antek</option>
          <option value="/sounds/jokowi.mp3">jokowi</option>
          <option value="/sounds/dj-kicau-mania.mp3">dj-kicau-mania</option>
          <option value="/sounds/kenapa-nya.mp3">kenapa nyak</option>
        </select>
      </div>

      {/* Play / Pause button */}
      <button
        onClick={handlePlayPause}
        style={{
          marginTop: "10px",
          width: "100%",
          padding: "8px 0",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "13px",
          letterSpacing: "0.5px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          background: isPlaying
            ? "linear-gradient(135deg, #ef4444, #b91c1c)"
            : "linear-gradient(135deg, #22c55e, #15803d)",
          color: "white",
          boxShadow: isPlaying
            ? "0 0 10px rgba(239,68,68,0.4)"
            : "0 0 10px rgba(34,197,94,0.4)",
          transition: "background 0.2s, box-shadow 0.2s",
        }}
      >
        {isPlaying ? (
          <>
            <span style={{ fontSize: "15px" }}>⏹</span> Stop Preview
          </>
        ) : (
          <>
            <span style={{ fontSize: "15px" }}>▶</span> Preview Sound
          </>
        )}
      </button>

      {/* Stop OBS Audio Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          console.log("Tombol Stop ditekan!");
          if (typeof stopGoalAudio === "function") {
            stopGoalAudio();
          } else {
            console.error("stopGoalAudio bukan function! typeof:", typeof stopGoalAudio);
          }
        }}
        style={{
          marginTop: "10px",
          width: "100%",
          padding: "8px 0",
          borderRadius: "6px",
          border: "1px solid #ef4444",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "13px",
          letterSpacing: "0.5px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          background: "rgba(239, 68, 68, 0.1)",
          color: "#ef4444",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
        }}
      >
        <span style={{ fontSize: "15px" }}>🛑</span> Stop Audio di OBS
      </button>
    </div>
  );
}

