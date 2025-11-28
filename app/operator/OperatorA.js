"use client";

import { useEffect, useState } from "react";
import LayoutA from "../overlay/LayoutA";
import OverlayRoomControls from "./OverlayRoomControls";

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
        <button className="op-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="operator-a-preview-box">
        <LayoutA
          data={{ ...data, showOverlay: true }}
          displayTime={displayTime}
          formatTime={formatTime}
        />
      </div>

      <div className="operator-a-controls">
        <div
          className="op-section"
          style={{
            borderBottom: "1px solid #444",
            paddingBottom: "10px",
            marginBottom: "5px",
          }}
        >
          <label className="op-label">Layout</label>
          <select
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
          <label className="op-label">Team Left</label>
          <input
            className="op-input"
            value={data.homeName}
            onChange={(e) =>
              actions.updateMatch({ homeName: e.target.value })
            }
            placeholder="MAN"
          />
        </div>
        <div className="op-section">
          <label className="op-label">Team Right</label>
          <input
            className="op-input"
            value={data.awayName}
            onChange={(e) =>
              actions.updateMatch({ awayName: e.target.value })
            }
            placeholder="WHU"
          />
        </div>

        <div className="op-section">
          <label className="op-label">Score Left</label>
          <button
            className="op-btn"
            onClick={() =>
              actions.updateMatch({
                homeScore: Math.max(0, data.homeScore - 1),
              })
            }
          >
            -
          </button>
          <input
            className="op-input"
            type="number"
            value={data.homeScore}
            onChange={(e) =>
              actions.updateMatch({
                homeScore: parseInt(e.target.value, 10) || 0,
              })
            }
            style={{ width: "50px" }}
          />
          <button
            className="op-btn"
            onClick={() =>
              actions.updateMatch({ homeScore: data.homeScore + 1 })
            }
          >
            +
          </button>
          <button
            className="op-btn op-btn-main"
            onClick={() => actions.triggerGoal("home")}
          >
            GOAL L +1
          </button>
        </div>

        <div className="op-section">
          <label className="op-label">Score Right</label>
          <button
            className="op-btn"
            onClick={() =>
              actions.updateMatch({
                awayScore: Math.max(0, data.awayScore - 1),
              })
            }
          >
            -
          </button>
          <input
            className="op-input"
            type="number"
            value={data.awayScore}
            onChange={(e) =>
              actions.updateMatch({
                awayScore: parseInt(e.target.value, 10) || 0,
              })
            }
            style={{ width: "50px" }}
          />
          <button
            className="op-btn"
            onClick={() =>
              actions.updateMatch({ awayScore: data.awayScore + 1 })
            }
          >
            +
          </button>
          <button
            className="op-btn op-btn-main"
            onClick={() => actions.triggerGoal("away")}
          >
            GOAL R +1
          </button>
        </div>

        <div className="op-section">
          <label className="op-label">Accent Gradient</label>
          <span className="op-tiny">Left:</span>
          <input
            type="color"
            className="op-input"
            value={data.homeColor}
            onChange={(e) =>
              actions.updateMatch({ homeColor: e.target.value })
            }
          />
          <span className="op-tiny">Right:</span>
          <input
            type="color"
            className="op-input"
            value={data.awayColor}
            onChange={(e) =>
              actions.updateMatch({ awayColor: e.target.value })
            }
          />
        </div>

        <div className="op-section">
          <label className="op-label">Time</label>
          <input
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
            className="op-input"
            type="number"
            style={{ width: "50px" }}
            value={localTime.s}
            onChange={(e) =>
              setLocalTime({ ...localTime, s: e.target.value })
            }
          />
          <button className="op-btn" onClick={handleManualTime}>
            Set Time
          </button>
          <div style={{ display: "flex", gap: "5px", marginLeft: "10px" }}>
            <button className="op-btn op-btn-main" onClick={actions.toggleTimer}>
              {data.timer.isRunning ? "PAUSE" : "START"}
            </button>
            <button
              className="op-btn op-btn-danger"
              onClick={actions.resetTimer}
            >
              Reset
            </button>
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
      </div>
    </div>
  );
}

