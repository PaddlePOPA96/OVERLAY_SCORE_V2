"use client";

import { useState } from "react";
import LayoutC from "./LayoutC";
import LogoPickerModal from "./LogoPickerModal";
import { makeTeamAbbr } from "@/lib/logoData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import OverlayRoomControls from "./OverlayRoomControls";
import GoalAudioSettings from "./GoalAudioSettings";

export default function OperatorC({
  data,
  actions,
  displayTime,
  formatTime,
  roomId,
  onLogout,
}) {
  const [manualM, setManualM] = useState(0);
  const [manualS, setManualS] = useState(0);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [logoTarget, setLogoTarget] = useState("home");

  const handleSetTime = () => {
    const total = (parseInt(manualM, 10) || 0) * 60 + (parseInt(manualS, 10) || 0);
    actions.updateMatch({
      "timer/baseTime": total,
      "timer/startTime": null,
      "timer/isRunning": false,
    });
  };

  return (
    <div className="operator-b-container">
      <div className="w-full max-w-[900px] flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">⚽ Operator Panel – Layout C (Modern)</h2>
        <Button className="op-btn" variant="ghost" size="sm" onClick={onLogout}>Logout</Button>
      </div>

      <Card className="operator-b-preview-box" style={{ overflow: "hidden" }}>
        <div style={{ transform: "scale(0.42)", transformOrigin: "center", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LayoutC
            data={{ ...data, showOverlay: true }}
            displayTime={displayTime}
            formatTime={formatTime}
          />
        </div>
      </Card>

      <Card className="operator-b-controls">
        <div className="op-section" style={{ borderBottom: "1px solid #444", paddingBottom: "10px", marginBottom: "5px" }}>
          <label className="op-label" htmlFor="operator-c-layout">Layout</label>
          <select
            id="operator-c-layout"
            className="op-input"
            value={data.layout}
            onChange={(e) => actions.updateMatch({ layout: e.target.value })}
          >
            <option value="A">Layout A</option>
            <option value="B">Layout B</option>
            <option value="C">Layout C</option>
          </select>
        </div>

        <div className="op-section">
          <label className="op-label">Score Home</label>
          <Button className="op-btn" onClick={() => actions.triggerGoal("home")}>+1 (GOAL)</Button>
          <Button className="op-btn" variant="ghost" onClick={() => actions.updateMatch({ homeScore: (data.homeScore || 0) + 1 })}>+1</Button>
          <Button className="op-btn" variant="ghost" onClick={() => actions.updateMatch({ homeScore: Math.max(0, (data.homeScore || 0) - 1) })}>-1</Button>
          <input className="op-input" value={data.homeFullName || data.homeName || ""} onChange={(e) => actions.updateMatch({ homeFullName: e.target.value })} placeholder="Full Name" style={{ width: "160px" }} />
        </div>

        <div className="op-section">
          <label className="op-label">Score Away</label>
          <Button className="op-btn" onClick={() => actions.triggerGoal("away")}>+1 (GOAL)</Button>
          <Button className="op-btn" variant="ghost" onClick={() => actions.updateMatch({ awayScore: (data.awayScore || 0) + 1 })}>+1</Button>
          <Button className="op-btn" variant="ghost" onClick={() => actions.updateMatch({ awayScore: Math.max(0, (data.awayScore || 0) - 1) })}>-1</Button>
          <input className="op-input" value={data.awayFullName || data.awayName || ""} onChange={(e) => actions.updateMatch({ awayFullName: e.target.value })} placeholder="Full Name" style={{ width: "160px" }} />
        </div>

        <div className="op-section">
          <label className="op-label">Timer</label>
          <Button className="op-btn op-b-btn-main" onClick={actions.toggleTimer}>{data.timer.isRunning ? "Pause" : "Start"}</Button>
          <Button className="op-btn" variant="outline" onClick={actions.resetTimer}>Reset</Button>
          <span className="op-tiny font-mono text-lg ml-2">{formatTime(displayTime)}</span>
        </div>

        <div className="op-section">
          <label className="op-label">Logo Home</label>
          <Button className="op-btn" variant="outline" onClick={() => { setLogoTarget("home"); setLogoModalOpen(true); }}>Pilih Logo</Button>
          <span className="op-tiny ml-2">{data.homeName}</span>
        </div>

        <div className="op-section">
          <label className="op-label">Logo Away</label>
          <Button className="op-btn" variant="outline" onClick={() => { setLogoTarget("away"); setLogoModalOpen(true); }}>Pilih Logo</Button>
          <span className="op-tiny ml-2">{data.awayName}</span>
        </div>

        <div className="op-section">
           <label className="op-label">Set Time</label>
           <input className="op-input" type="number" style={{ width: "50px" }} value={manualM} onChange={(e) => setManualM(e.target.value)} /> : 
           <input className="op-input" type="number" style={{ width: "50px" }} value={manualS} onChange={(e) => setManualS(e.target.value)} />
           <Button className="op-btn" variant="outline" size="sm" onClick={handleSetTime}>Set</Button>
        </div>

        <GoalAudioSettings data={data} updateMatch={actions.updateMatch} stopGoalAudio={actions.stopGoalAudio} previewGoalAudio={actions.previewGoalAudio} />

        <OverlayRoomControls showOverlay={data.showOverlay} toggleOverlay={actions.toggleOverlay} roomId={roomId} />
      </Card>

      <LogoPickerModal
        isOpen={logoModalOpen}
        onClose={() => setLogoModalOpen(false)}
        onSelect={({ src, club }) => {
          if (!src || !club) return;
          const abbr = makeTeamAbbr(club);
          if (logoTarget === "home") {
            actions.updateMatch({ 
              homeLogo: src, 
              homeName: abbr,
              homeFullName: club.toUpperCase()
            });
          } else {
            actions.updateMatch({ 
              awayLogo: src, 
              awayName: abbr,
              awayFullName: club.toUpperCase()
            });
          }
          setLogoModalOpen(false);
        }}
      />
    </div>
  );
}
