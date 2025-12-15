"use client";

import { useEffect, useState } from "react";
import LayoutA from "./LayoutA";
import OverlayRoomControls from "./OverlayRoomControls";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function OperatorA({
  data,
  actions,
  displayTime,
  formatTime,
  roomId,
  onLogout,
}) {
  const [localTime, setLocalTime] = useState({ m: 0, s: 0 });

  useEffect(() => {
    if (!data.timer.isRunning) {
      setLocalTime({
        m: Math.floor(displayTime / 60),
        s: displayTime % 60,
      });
    }
  }, [displayTime, data.timer.isRunning]);

  const handleManualTime = () => {
    const totalSeconds =
      (parseInt(localTime.m, 10) || 0) * 60 +
      (parseInt(localTime.s, 10) || 0);
    actions.updateMatch({
      "timer/baseTime": totalSeconds,
      "timer/startTime": null,
      "timer/isRunning": false,
    });
  };

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
        <div
          className="op-section"
          style={{
            borderBottom: "1px solid #444",
            paddingBottom: "10px",
            marginBottom: "5px",
          }}
        >
          <label className="op-label" htmlFor="operator-a-layout">
            Layout
          </label>
          <select
            id="operator-a-layout"
            className="op-input"
            value={data.layout}
            onChange={(e) => actions.updateMatch({ layout: e.target.value })}
          >
            <option value="A">Layout A</option>
            <option value="B">Layout B</option>
          </select>
          <span className="op-tiny">
            Pilih B untuk pindah ke operator-B UI
          </span>
        </div>

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

        <div className="op-section">
          <label className="op-label" htmlFor="time-minute">
            Time
          </label>
          <input
            id="time-minute"
            className="op-input"
            type="number"
            style={{ width: "50px" }}
            value={localTime.m}
            onChange={(e) =>
              setLocalTime({ ...localTime, m: e.target.value })
            }
          />{" "}
          :{" "}
          <input
            id="time-second"
            className="op-input"
            type="number"
            style={{ width: "50px" }}
            value={localTime.s}
            aria-label="Seconds"
            onChange={(e) =>
              setLocalTime({ ...localTime, s: e.target.value })
            }
          />
          <Button className="op-btn" variant="outline" size="sm" onClick={handleManualTime}>
            Set Time
          </Button>
          <div style={{ display: "flex", gap: "5px", marginLeft: "10px" }}>
            <Button
              className="op-btn op-btn-main"
              variant="default"
              size="sm"
              onClick={actions.toggleTimer}
            >
              {data.timer.isRunning ? "PAUSE" : "START"}
            </Button>
            <Button
              className="op-btn op-btn-danger"
              variant="outline"
              size="sm"
              onClick={actions.resetTimer}
            >
              Reset
            </Button>
          </div>
          <span className="op-tiny text-green-400 font-mono ml-2">
            LIVE: {formatTime(displayTime)}
          </span>
        </div>

        <OverlayRoomControls
          showOverlay={data.showOverlay}
          toggleOverlay={actions.toggleOverlay}
          roomId={roomId}
        />
      </Card>
    </div>
  );
}
