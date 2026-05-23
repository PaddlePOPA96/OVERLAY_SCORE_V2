"use client";

import { useEffect, useState } from "react";
import "@/app/dashboard/operator/overlay/layoutD.css";

export default function LayoutD({ data, displayTime, formatTime }) {
  const [isVisible, setIsVisible] = useState(data.showOverlay);
  const [isHiding, setIsHiding] = useState(false);
  const [showGoal, setShowGoal] = useState(false);
  const [goalTeam, setGoalTeam] = useState("");

  // Visibility & exit animation transition logic
  useEffect(() => {
    if (data.showOverlay) {
      setIsVisible(true);
      setIsHiding(false);
    } else if (isVisible) {
      setIsHiding(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsHiding(false);
      }, 600); // matches the layoutDOut animation length
      return () => clearTimeout(timer);
    }
  }, [data.showOverlay, isVisible]);

  // Goal animation logic
  useEffect(() => {
    const now = Date.now();
    if (data.goalTrigger > 0 && (now - data.goalTrigger) < 5000) {
      setGoalTeam(data.goalTeam || "");
      setShowGoal(true);
      const timer = setTimeout(() => {
        setShowGoal(false);
        setGoalTeam("");
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [data.goalTrigger, data.goalTeam]);

  if (!isVisible) return null;

  // Fallbacks for layout values
  const homeName = data.homeName || "FNC";
  const awayName = data.awayName || "NRG";
  const homeColor = data.homeColor || data.homeBg || "#ff5500";
  const awayColor = data.awayColor || data.awayBg || "#0df2b9";

  // Dynamic CSS variables for the accents (Tailwind equivalent)
  const boardStyles = {
    "--home-accent-color": homeColor,
    "--away-accent-color": awayColor,
  };

  // Determine period text (round name)
  const periodText = `ROUND ${data.period || 17}`;

  return (
    <div id="layout-d-root" style={boardStyles}>
      <div className={`layout-d-container ${isHiding ? "layout-d-hide" : ""}`}>
        
        <div className="live-hud">
          
          {/* 1. LEFT PANEL: FNATIC (FNC) */}
          <div className="hud-fnc-panel">
            <div className="hud-logo-container">
              <img
                src={data.homeLogo || "/logo/placeholder.png"}
                alt={homeName}
                className="hud-team-logo"
              />
            </div>
            <div className="hud-team-name-box">
              <span className="hud-team-name">{homeName}</span>
              <span className="hud-team-subtitle">
                {data.homeFullName ? data.homeFullName.substring(0, 10).toUpperCase() : "EMEA#3"}
              </span>
            </div>
          </div>

          {/* 2. HOME SCORE (WITH DIAMOND GAME WIN TRAY) */}
          <div className="hud-score-container-home">
            <div className={`hud-fnc-score ${showGoal && goalTeam === data.homeName ? "goal-active" : ""}`}>
              <span className="hud-score-text">{data.homeScore ?? 5}</span>
            </div>
            
            {/* TIMEOUT TAB / DIAMOND SERIES TRAY */}
            {(data.seriesType === "bo3" || data.seriesType === "bo5") && (
              <div className="hud-timeout-tab">
                {Array.from({ length: data.seriesType === "bo3" ? 2 : 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`hud-diamond ${i < (data.homeSeriesScore || 0) ? "active" : ""}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 3. CENTER PANEL: TIMER & ROUND */}
          <div className="hud-timer-panel">
            <span className="hud-timer-period">{periodText}</span>
            <span className="hud-timer-time">{formatTime(displayTime) || "1:26"}</span>
          </div>

          {/* 4. AWAY SCORE (WITH DIAMOND GAME WIN TRAY) */}
          <div className="hud-score-container-away">
            <div className={`hud-nrg-score ${showGoal && goalTeam === data.awayName ? "goal-active" : ""}`}>
              <span className="hud-score-text">{data.awayScore ?? 11}</span>
            </div>
            
            {/* TIMEOUT TAB / DIAMOND SERIES TRAY */}
            {(data.seriesType === "bo3" || data.seriesType === "bo5") && (
              <div className="hud-timeout-tab">
                {Array.from({ length: data.seriesType === "bo3" ? 2 : 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`hud-diamond ${i < (data.awaySeriesScore || 0) ? "active" : ""}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 5. RIGHT PANEL: NRG */}
          <div className="hud-nrg-panel">
            <div className="hud-team-name-box-right">
              <span className="hud-team-name">{awayName}</span>
              <span className="hud-team-subtitle">
                {data.awayFullName ? data.awayFullName.substring(0, 10).toUpperCase() : "AMER#2"}
              </span>
            </div>
            <div className="hud-logo-container-right">
              <img
                src={data.awayLogo || "/logo/placeholder.png"}
                alt={awayName}
                className="hud-team-logo"
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
