"use client";

import { useState } from "react";
import LayoutC from "./LayoutC";
import LogoPickerModal from "./LogoPickerModal";
import { makeTeamAbbr } from "@/lib/logoData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import OverlayRoomControls from "./OverlayRoomControls";
import GoalAudioSettings from "./GoalAudioSettings";
import LayoutSelector from "./shared/LayoutSelector";
import TimerControls from "./shared/TimerControls";

export default function OperatorC({
  data,
  actions,
  displayTime,
  formatTime,
  roomId,
  onLogout,
}) {
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [logoTarget, setLogoTarget] = useState("home");

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
        <LayoutSelector 
          data={data} 
          updateMatch={actions.updateMatch} 
        />

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
          <label className="op-label">Logo Home</label>
          <Button className="op-btn" variant="outline" onClick={() => { setLogoTarget("home"); setLogoModalOpen(true); }}>Pilih Logo</Button>
          <span className="op-tiny ml-2">{data.homeName}</span>
        </div>

        <div className="op-section">
          <label className="op-label">Logo Away</label>
          <Button className="op-btn" variant="outline" onClick={() => { setLogoTarget("away"); setLogoModalOpen(true); }}>Pilih Logo</Button>
          <span className="op-tiny ml-2">{data.awayName}</span>
        </div>

        <TimerControls data={data} actions={actions} displayTime={displayTime} formatTime={formatTime} btnMainClass="op-b-btn-main" />

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
