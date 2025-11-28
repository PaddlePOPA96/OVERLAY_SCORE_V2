"use client";
import { useScoreboard } from "@/hooks/useScoreboard";
import LayoutA from "../overlay/LayoutA";
import LayoutB from "../overlay/LayoutB";
import { useState, useEffect } from "react";

// Komponen kecil untuk kontrol Room + Overlay + Copy URL (seperti kalkulator)
function OverlayRoomControls({ showOverlay, toggleOverlay, roomId, setRoomId, compact }) {
  const [copied, setCopied] = useState(false);

  const overlayPath = `/overlay/${roomId || "default"}`;
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const overlayUrl = baseUrl ? `${baseUrl}${overlayPath}` : overlayPath;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(overlayUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  if (compact) {
    // Versi B: baris lebih ringkas di kanan atas
    return (
      <div className="op-room-compact">
        <button className="op-btn op-b-btn-main" onClick={toggleOverlay}>
          {showOverlay ? "Hide Overlay" : "Show Overlay"}
        </button>
        <input
          className="op-input op-room-input"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value.trim())}
          placeholder="room-id"
        />
        <button className="op-btn" onClick={handleCopy}>
          {copied ? "Copied" : "Copy URL"}
        </button>
      </div>
    );
  }

  // Versi A: tampilan seperti kalkulator di blok kontrol
  return (
    <div className="op-room-row">
      <label className="op-label">Overlay</label>
      <button className="op-btn op-btn-main" onClick={toggleOverlay}>
        {showOverlay ? "HIDE" : "SHOW"}
      </button>

      <div className="op-room-box">
        <div className="op-room-display">
          <span className="op-room-display-label">ROOM</span>
          <input
            className="op-input op-room-input"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.trim())}
            placeholder="default"
          />
        </div>
        <div className="op-room-display op-room-url">
          {overlayPath}
        </div>
        <button className="op-btn op-btn-main" onClick={handleCopy}>
          {copied ? "COPIED" : "COPY"}
        </button>
      </div>

      <span
        className={`op-tiny font-bold ${
          showOverlay ? "text-green-500" : "text-red-500"
        }`}
      >
        STATUS: {showOverlay ? "TAMPIL" : "SEMBUNYI"}
      </span>
    </div>
  );
}

// ==========================================
// KOMPONEN OPERATOR A (Mirip operator.html)
// ==========================================
function OperatorA({ data, actions, displayTime, formatTime, roomId, setRoomId }) {
  // State lokal untuk input waktu manual (biar gak nge-lag saat ngetik)
  const [localTime, setLocalTime] = useState({ m: 0, s: 0 });

  useEffect(() => {
    // Sinkronkan input waktu dengan timer asli saat timer STOP
    if (!data.timer.isRunning) {
      setLocalTime({
        m: Math.floor(displayTime / 60),
        s: displayTime % 60
      });
    }
  }, [displayTime, data.timer.isRunning]);

  const handleManualTime = () => {
    // Hitung total detik dari input manual
    const totalSeconds = (parseInt(localTime.m) || 0) * 60 + (parseInt(localTime.s) || 0);
    // Kita harus 'mengakali' timer sistem dengan mereset baseTime
    // Logic ini ada di hook useScoreboard (nanti kita pastikan support)
    actions.updateMatch({
       "timer/baseTime": totalSeconds,
       "timer/startTime": null, // Reset start time
       "timer/isRunning": false // Pause dulu biar aman
    });
  };

  return (
    <div className="operator-a-container">
      <h2 className="text-xl font-bold mb-4">⚽ Operator Panel – EPL Scoreboard</h2>

      {/* PREVIEW AREA */}
      <div className="operator-a-preview-box">
        {/* Kita reuse komponen LayoutA sebagai preview! */}
        <LayoutA data={{ ...data, showOverlay: true }} displayTime={displayTime} formatTime={formatTime} />
      </div>

      <div className="operator-a-controls">
        
        {/* LAYOUT SWITCHER */}
        <div className="op-section" style={{borderBottom:'1px solid #444', paddingBottom:'10px', marginBottom:'5px'}}>
          <label className="op-label">Layout</label>
          <select 
            className="op-input" 
            value={data.layout}
            onChange={(e) => actions.updateMatch({ layout: e.target.value })}
          >
            <option value="A">Layout A</option>
            <option value="B">Layout B</option>
          </select>
          <span className="op-tiny">Pilih B untuk pindah ke operator-B UI</span>
        </div>

        {/* TEAM NAMES */}
        <div className="op-section">
          <label className="op-label">Team Left</label>
          <input className="op-input" value={data.homeName} onChange={e => actions.updateMatch({homeName: e.target.value})} placeholder="MAN" />
        </div>
        <div className="op-section">
          <label className="op-label">Team Right</label>
          <input className="op-input" value={data.awayName} onChange={e => actions.updateMatch({awayName: e.target.value})} placeholder="WHU" />
        </div>

        {/* SCORES & GOALS */}
        <div className="op-section">
          <label className="op-label">Score Left</label>
          <button className="op-btn" onClick={() => actions.updateMatch({homeScore: Math.max(0, data.homeScore-1)})}>-</button>
          <input className="op-input" type="number" value={data.homeScore} onChange={e => actions.updateMatch({homeScore: parseInt(e.target.value)||0})} style={{width:'50px'}}/>
          <button className="op-btn" onClick={() => actions.updateMatch({homeScore: data.homeScore+1})}>+</button>
          <button className="op-btn op-btn-main" onClick={() => actions.triggerGoal("home")}>GOAL L +1</button>
        </div>

        <div className="op-section">
          <label className="op-label">Score Right</label>
          <button className="op-btn" onClick={() => actions.updateMatch({awayScore: Math.max(0, data.awayScore-1)})}>-</button>
          <input className="op-input" type="number" value={data.awayScore} onChange={e => actions.updateMatch({awayScore: parseInt(e.target.value)||0})} style={{width:'50px'}}/>
          <button className="op-btn" onClick={() => actions.updateMatch({awayScore: data.awayScore+1})}>+</button>
          <button className="op-btn op-btn-main" onClick={() => actions.triggerGoal("away")}>GOAL R +1</button>
        </div>

        {/* COLORS */}
        <div className="op-section">
          <label className="op-label">Accent Gradient</label>
          <span className="op-tiny">Left:</span>
          <input type="color" className="op-input" value={data.homeColor} onChange={e => actions.updateMatch({homeColor: e.target.value})} />
          <span className="op-tiny">Right:</span>
          <input type="color" className="op-input" value={data.awayColor} onChange={e => actions.updateMatch({awayColor: e.target.value})} />
        </div>

        {/* TIMER */}
        <div className="op-section">
          <label className="op-label">Time</label>
          <input className="op-input" type="number" style={{width:'50px'}} value={localTime.m} onChange={e => setLocalTime({...localTime, m: e.target.value})} /> :
          <input className="op-input" type="number" style={{width:'50px'}} value={localTime.s} onChange={e => setLocalTime({...localTime, s: e.target.value})} />
          
          <button className="op-btn" onClick={handleManualTime}>Set Time</button>
          
          <div style={{display:'flex', gap:'5px', marginLeft:'10px'}}>
             <button className="op-btn op-btn-main" onClick={actions.toggleTimer}>
                {data.timer.isRunning ? "PAUSE" : "START"}
             </button>
             <button className="op-btn op-btn-danger" onClick={actions.resetTimer}>Reset</button>
          </div>
          <span className="op-tiny text-green-400 font-mono ml-2">
             LIVE: {formatTime(displayTime)}
          </span>
        </div>

        {/* OVERLAY TOGGLE + ROOM / LINK */}
        <OverlayRoomControls
          showOverlay={data.showOverlay}
          toggleOverlay={actions.toggleOverlay}
          roomId={roomId}
          setRoomId={setRoomId}
        />

      </div>
    </div>
  );
}

// ==========================================
// KOMPONEN OPERATOR B (Mirip operator-B.html)
// ==========================================
function OperatorB({ data, actions, displayTime, formatTime, roomId, setRoomId }) {
  const [manualM, setManualM] = useState(0);
  const [manualS, setManualS] = useState(0);

  const handleSetTime = () => {
    const total = (parseInt(manualM) || 0) * 60 + (parseInt(manualS) || 0);
    actions.updateMatch({
        "timer/baseTime": total,
        "timer/startTime": null,
        "timer/isRunning": false
     });
  };

  return (
    <div className="operator-b-container">
      
      {/* PREVIEW WRAPPER */}
      <div className="operator-b-preview-box">
          <LayoutB data={{...data, showOverlay: true}} displayTime={displayTime} formatTime={formatTime} />
      </div>

      <div className="top-controls w-full flex justify-end max-w-[860px] mt-4">
        <OverlayRoomControls
          compact
          showOverlay={data.showOverlay}
          toggleOverlay={actions.toggleOverlay}
          roomId={roomId}
          setRoomId={setRoomId}
        />
      </div>

      <div className="operator-b-controls">
         
         {/* Layout Switcher */}
         <div className="op-section">
            <label className="op-label">Layout</label>
            <select className="op-input" value={data.layout} onChange={(e) => actions.updateMatch({ layout: e.target.value })}>
               <option value="A">Layout A</option>
               <option value="B">Layout B</option>
            </select>
         </div>

         {/* Score Home */}
         <div className="op-section">
            <label className="op-label">Score Home</label>
            <button className="op-btn" onClick={() => actions.triggerGoal("home")}>+1 (GOAL)</button>
            <button className="op-btn" onClick={() => actions.updateMatch({homeScore: data.homeScore+1})}>+1 (No Anim)</button>
            <button className="op-btn" onClick={() => actions.updateMatch({homeScore: Math.max(0, data.homeScore-1)})}>-1</button>
            <input className="op-input" value={data.homeName} onChange={e => actions.updateMatch({homeName: e.target.value})} placeholder="Nama Tim Home" style={{width:'120px'}}/>
         </div>

         {/* Score Away */}
         <div className="op-section">
            <label className="op-label">Score Away</label>
            <button className="op-btn" onClick={() => actions.triggerGoal("away")}>+1 (GOAL)</button>
            <button className="op-btn" onClick={() => actions.updateMatch({awayScore: data.awayScore+1})}>+1 (No Anim)</button>
            <button className="op-btn" onClick={() => actions.updateMatch({awayScore: Math.max(0, data.awayScore-1)})}>-1</button>
            <input className="op-input" value={data.awayName} onChange={e => actions.updateMatch({awayName: e.target.value})} placeholder="Nama Tim Away" style={{width:'120px'}}/>
         </div>

         {/* Timer Controls */}
         <div className="op-section">
            <label className="op-label">Timer</label>
            <button className="op-btn op-b-btn-main" onClick={actions.toggleTimer}>{data.timer.isRunning ? "Pause" : "Start"}</button>
            <button className="op-btn" onClick={actions.resetTimer}>Reset</button>
            <span className="op-tiny font-mono text-lg ml-2">{formatTime(displayTime)}</span>
         </div>

         {/* Colors Home/Away (Border & Background) */}
         <div className="op-section">
            <label className="op-label">Colors</label>
            <span className="op-tiny">Home:</span>
            <input
              type="color"
              className="op-input"
              value={data.homeBg || "#ff4b4b"}
              onChange={(e) => actions.updateMatch({ homeBg: e.target.value })}
            />
            <span className="op-tiny" style={{ marginLeft: "10px" }}>Away:</span>
            <input
              type="color"
              className="op-input"
              value={data.awayBg || "#e5e5e5"}
              onChange={(e) => actions.updateMatch({ awayBg: e.target.value })}
            />
         </div>

         {/* Set Time */}
         <div className="op-section">
            <label className="op-label">Set Time</label>
            <input className="op-input" type="number" style={{width:'50px'}} value={manualM} onChange={e => setManualM(e.target.value)}/> : 
            <input className="op-input" type="number" style={{width:'50px'}} value={manualS} onChange={e => setManualS(e.target.value)}/>
            <button className="op-btn" onClick={handleSetTime}>Set</button>
         </div>

         {/* Babak */}
         <div className="op-section">
            <label className="op-label">Babak</label>
            <button className="op-btn" onClick={() => actions.updateMatch({period: 1})}>1st</button>
            <button className="op-btn" onClick={() => actions.updateMatch({period: 2})}>2nd</button>
            <button className="op-btn" onClick={() => actions.updateMatch({period: 3})}>Extra</button>
            <span className="op-tiny">Current: {data.period === 1 ? "1st" : data.period === 2 ? "2nd" : "Extra"}</span>
         </div>

         {/* Logo URL */}
         <div className="op-section">
            <label className="op-label">Logo Home</label>
            <input className="op-input" style={{width:'200px'}} value={data.homeLogo} onChange={e => actions.updateMatch({homeLogo: e.target.value})} />
         </div>
         <div className="op-section">
            <label className="op-label">Logo Away</label>
            <input className="op-input" style={{width:'200px'}} value={data.awayLogo} onChange={e => actions.updateMatch({awayLogo: e.target.value})} />
         </div>

         {/* Sync Button (Dummy untuk UI karena Firebase sudah auto-sync) */}
         <div className="op-section">
            <label className="op-label">Sync</label>
            <button className="op-btn" onClick={() => alert("Data tersinkronisasi otomatis!")}>Sync Semua Client</button>
         </div>

      </div>
    </div>
  );
}


// ==========================================
// PAGE UTAMA (Layout Router)
// ==========================================
export default function OperatorPage() {
  const roomFromHash =
    typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
  const initialRoom = roomFromHash || "default";

  const [roomId, setRoomId] = useState(initialRoom);

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

  // Kelompokkan actions biar rapi saat dipassing ke props
  const actions = {
    updateMatch,
    toggleTimer,
    resetTimer,
    triggerGoal,
    toggleOverlay,
  };

  if (!data)
    return <div className="text-white p-10">Loading Scoreboard System...</div>;

  // Render sesuai Layout yang dipilih di state
  if (data.layout === "A") {
    return (
      <OperatorA
        data={data}
        actions={actions}
        displayTime={displayTime}
        formatTime={formatTime}
        roomId={roomId}
        setRoomId={setRoomId}
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
      setRoomId={setRoomId}
    />
  );
}
