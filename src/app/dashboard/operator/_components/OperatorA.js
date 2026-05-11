"use client";

import { useEffect, useState } from "react";
import LayoutA from "./LayoutA";
import OverlayRoomControls from "./OverlayRoomControls";
import GoalAudioSettings from "./GoalAudioSettings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import LayoutSelector from "./shared/LayoutSelector";
import TimerControls from "./shared/TimerControls";

export default function OperatorA({
  data,
  actions,
  displayTime,
  formatTime,
  roomId,
  onLogout,
}) {
  return (
    <div className="operator-a-container">
      <div className="w-full max-w-[900px] flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">
          ⚽ Operator Panel – EPL Scoreboard
        </h2>
        <Button className="op-btn" variant="ghost" size="sm" onClick={onLogout}>
          Logout
        </Button>
      </div>

      <Card className="operator-a-preview-box">
        <LayoutA
          data={{ ...data, showOverlay: true }}
          displayTime={displayTime}
          formatTime={formatTime}
        />
      </Card>

      <Card className="operator-a-controls">
        <LayoutSelector 
          data={data} 
          updateMatch={actions.updateMatch} 
          description="Pilih B untuk pindah ke operator-B UI"
        />

        <div className="op-section">
          <label className="op-label" htmlFor="team-left">
            Team Left
          </label>
          <input
            id="team-left"
            className="op-input"
            value={data.homeName}
            onChange={(e) =>
              actions.updateMatch({ homeName: e.target.value })
            }
            placeholder="MAN"
          />
        </div>
        <div className="op-section">
          <label className="op-label" htmlFor="team-right">
            Team Right
          </label>
          <input
            id="team-right"
            className="op-input"
            value={data.awayName}
            onChange={(e) =>
              actions.updateMatch({ awayName: e.target.value })
            }
            placeholder="WHU"
          />
        </div>

        <div className="op-section">
          <label className="op-label" htmlFor="score-left">
            Score Left
          </label>
          <Button
            className="op-btn"
            variant="ghost"
            onClick={() =>
              actions.updateMatch({
                homeScore: Math.max(0, (data.homeScore || 0) - 1),
              })
            }
          >
            -
          </Button>
          <input
            id="score-left"
            className="op-input"
            type="number"
            min={0}
            max={20}
            value={data.homeScore}
            onChange={(e) =>
              actions.updateMatch({
                homeScore: Math.max(
                  0,
                  Math.min(20, parseInt(e.target.value, 10) || 0),
                ),
              })
            }
            style={{ width: "50px" }}
          />
          <Button
            className="op-btn"
            variant="ghost"
            onClick={() =>
              actions.updateMatch({
                homeScore: Math.min(20, (data.homeScore || 0) + 1),
              })
            }
          >
            +
          </Button>
          <Button
            className="op-btn op-btn-main"
            variant="default"
            onClick={() => actions.triggerGoal("home")}
          >
            GOAL L +1
          </Button>
        </div>

        <div className="op-section">
          <label className="op-label" htmlFor="score-right">
            Score Right
          </label>
          <Button
            className="op-btn"
            variant="ghost"
            onClick={() =>
              actions.updateMatch({
                awayScore: Math.max(0, (data.awayScore || 0) - 1),
              })
            }
          >
            -
          </Button>
          <input
            id="score-right"
            className="op-input"
            type="number"
            min={0}
            max={20}
            value={data.awayScore}
            onChange={(e) =>
              actions.updateMatch({
                awayScore: Math.max(
                  0,
                  Math.min(20, parseInt(e.target.value, 10) || 0),
                ),
              })
            }
            style={{ width: "50px" }}
          />
          <Button
            className="op-btn"
            variant="ghost"
            onClick={() =>
              actions.updateMatch({
                awayScore: Math.min(20, (data.awayScore || 0) + 1),
              })
            }
          >
            +
          </Button>
          <Button
            className="op-btn op-btn-main"
            variant="default"
            onClick={() => actions.triggerGoal("away")}
          >
            GOAL R +1
          </Button>
        </div>

        <div className="op-section">
          <label className="op-label" htmlFor="accent-left">
            Accent Gradient
          </label>
          <span className="op-tiny">Left:</span>
          <input
            id="accent-left"
            type="color"
            className="op-input"
            value={data.homeColor}
            onChange={(e) =>
              actions.updateMatch({
                homeColor: e.target.value,
                homeBg: e.target.value,
              })
            }
          />
          <span className="op-tiny">Right:</span>
          <input
            id="accent-right"
            type="color"
            className="op-input"
            value={data.awayColor}
            aria-label="Accent Right"
            onChange={(e) =>
              actions.updateMatch({
                awayColor: e.target.value,
                awayBg: e.target.value,
              })
            }
          />
        </div>

        <TimerControls data={data} actions={actions} displayTime={displayTime} formatTime={formatTime} btnMainClass="op-btn-main" />

        <GoalAudioSettings data={data} updateMatch={actions.updateMatch} stopGoalAudio={actions.stopGoalAudio} previewGoalAudio={actions.previewGoalAudio} />

        <OverlayRoomControls
          showOverlay={data.showOverlay}
          toggleOverlay={actions.toggleOverlay}
          roomId={roomId}
        />
      </Card>
    </div>
  );
}
