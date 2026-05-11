"use client";

import { useState } from "react";
import LayoutB from "./LayoutB";
import LogoPickerModal from "./LogoPickerModal";
import { makeTeamAbbr } from "@/lib/logoData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import OverlayRoomControls from "./OverlayRoomControls";
import GoalAudioSettings from "./GoalAudioSettings";
import LayoutSelector from "./shared/LayoutSelector";
import TimerControls from "./shared/TimerControls";

export default function OperatorB({
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
        <h2 className="text-xl font-bold">
          ⚽ Operator Panel – EPL Scoreboard
        </h2>
        <Button className="op-btn" variant="ghost" size="sm" onClick={onLogout}>
          Logout
        </Button>
      </div>

      <Card className="operator-b-preview-box">
        <LayoutB
          data={{ ...data, showOverlay: true }}
          displayTime={displayTime}
          formatTime={formatTime}
        />
      </Card>
      <Card className="operator-b-controls">
        <LayoutSelector 
          data={data} 
          updateMatch={actions.updateMatch} 
        />

        <div className="op-section">
          <label className="op-label">Score Home</label>
          <Button
            className="op-btn"
            variant="default"
            onClick={() => actions.triggerGoal("home")}
          >
            +1 (GOAL)
          </Button>
          <Button
            className="op-btn"
            variant="ghost"
            onClick={() =>
              actions.updateMatch({
                homeScore: Math.min(20, (data.homeScore || 0) + 1),
              })
            }
          >
            +1 (No Anim)
          </Button>
          <Button
            className="op-btn"
            variant="ghost"
            onClick={() =>
              actions.updateMatch({
                homeScore: Math.max(0, (data.homeScore || 0) - 1),
              })
            }
          >
            -1
          </Button>
          <input
            className="op-input"
            value={data.homeName}
            onChange={(e) =>
              actions.updateMatch({ homeName: e.target.value })
            }
            placeholder="Nama Tim Home"
            style={{ width: "120px" }}
          />
        </div>

        <div className="op-section">
          <label className="op-label">Score Away</label>
          <Button
            className="op-btn"
            variant="default"
            onClick={() => actions.triggerGoal("away")}
          >
            +1 (GOAL)
          </Button>
          <Button
            className="op-btn"
            variant="ghost"
            onClick={() =>
              actions.updateMatch({
                awayScore: Math.min(20, (data.awayScore || 0) + 1),
              })
            }
          >
            +1 (No Anim)
          </Button>
          <Button
            className="op-btn"
            variant="ghost"
            onClick={() =>
              actions.updateMatch({
                awayScore: Math.max(0, (data.awayScore || 0) - 1),
              })
            }
          >
            -1
          </Button>
          <input
            className="op-input"
            value={data.awayName}
            onChange={(e) =>
              actions.updateMatch({ awayName: e.target.value })
            }
            placeholder="Nama Tim Away"
            style={{ width: "120px" }}
          />
        </div>



        <div className="op-section">
          <label className="op-label">Colors</label>
          <span className="op-tiny">Home:</span>
          <input
            type="color"
            className="op-input"
            value={data.homeBg || "#ff4b4b"}
            onChange={(e) =>
              actions.updateMatch({
                homeBg: e.target.value,
                homeColor: e.target.value,
              })
            }
          />
          <span className="op-tiny" style={{ marginLeft: "10px" }}>
            Away:
          </span>
          <input
            type="color"
            className="op-input"
            value={data.awayBg || "#e5e5e5"}
            onChange={(e) =>
              actions.updateMatch({
                awayBg: e.target.value,
                awayColor: e.target.value,
              })
            }
          />
        </div>

        <TimerControls data={data} actions={actions} displayTime={displayTime} formatTime={formatTime} btnMainClass="op-b-btn-main" />

        <div className="op-section">
          <label className="op-label">Babak</label>
          <Button
            className="op-btn"
            variant="ghost"
            onClick={() => actions.updateMatch({ period: 1 })}
          >
            1st
          </Button>
          <Button
            className="op-btn"
            variant="ghost"
            onClick={() => actions.updateMatch({ period: 2 })}
          >
            2nd
          </Button>
          <Button
            className="op-btn"
            variant="ghost"
            onClick={() => actions.updateMatch({ period: 3 })}
          >
            Extra
          </Button>
          <span className="op-tiny">
            Current:{" "}
            {data.period === 1 ? "1st" : data.period === 2 ? "2nd" : "Extra"}
          </span>
        </div>

        <div className="op-section">
          <label className="op-label">Logo Home</label>
          <input
            className="op-input"
            style={{ width: "200px" }}
            value={data.homeLogo}
            onChange={(e) =>
              actions.updateMatch({ homeLogo: e.target.value })
            }
          />
          <Button
            className="op-btn"
            variant="outline"
            onClick={() => {
              setLogoTarget("home");
              setLogoModalOpen(true);
            }}
          >
            Pilih
          </Button>
        </div>

        <div className="op-section">
          <label className="op-label">Logo Away</label>
          <input
            className="op-input"
            style={{ width: "200px" }}
            value={data.awayLogo}
            onChange={(e) =>
              actions.updateMatch({ awayLogo: e.target.value })
            }
          />
          <Button
            className="op-btn"
            variant="outline"
            onClick={() => {
              setLogoTarget("away");
              setLogoModalOpen(true);
            }}
          >
            Pilih
          </Button>
        </div>

        <div className="op-section">
          <label className="op-label">Sync</label>
          <Button
            className="op-btn"
            variant="subtle"
            onClick={() => alert("Data tersinkronisasi otomatis!")}
          >
            Sync Semua Client
          </Button>
        </div>

        <GoalAudioSettings data={data} updateMatch={actions.updateMatch} stopGoalAudio={actions.stopGoalAudio} previewGoalAudio={actions.previewGoalAudio} />

        <OverlayRoomControls
          showOverlay={data.showOverlay}
          toggleOverlay={actions.toggleOverlay}
          roomId={roomId}
        />
      </Card>
      <LogoPickerModal
        isOpen={logoModalOpen}
        onClose={() => setLogoModalOpen(false)}
        onSelect={({ src, club }) => {
          if (!src || !club) return;
          const abbr = makeTeamAbbr(club);
          if (logoTarget === "home") {
            actions.updateMatch({ homeLogo: src, homeName: abbr });
          } else {
            actions.updateMatch({ awayLogo: src, awayName: abbr });
          }
          setLogoModalOpen(false);
        }}
      />
    </div>
  );
}
