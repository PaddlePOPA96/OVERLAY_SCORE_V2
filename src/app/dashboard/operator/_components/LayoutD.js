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

  // Swapped check
  const isSwapped = !!data.switchSides;

  // Visual Left side (Team 1)
  const teamLeftName = isSwapped ? (data.awayName || "NRG") : (data.homeName || "FNC");
  const teamLeftFullName = isSwapped ? (data.awayFullName || "AMER#2") : (data.homeFullName || "EMEA#3");
  const teamLeftLogo = isSwapped ? (data.awayLogo || "/logo/placeholder.png") : (data.homeLogo || "/logo/placeholder.png");
  const teamLeftColor = isSwapped ? (data.awayColor || data.awayBg || "#0df2b9") : (data.homeColor || data.homeBg || "#ff5500");
  const teamLeftScore = isSwapped ? (data.awayScore ?? 5) : (data.homeScore ?? 5);
  const teamLeftSeriesScore = isSwapped ? (data.awaySeriesScore || 0) : (data.homeSeriesScore || 0);

  // Visual Right side (Team 2)
  const teamRightName = isSwapped ? (data.homeName || "FNC") : (data.awayName || "NRG");
  const teamRightFullName = isSwapped ? (data.homeFullName || "EMEA#3") : (data.awayFullName || "AMER#2");
  const teamRightLogo = isSwapped ? (data.homeLogo || "/logo/placeholder.png") : (data.awayLogo || "/logo/placeholder.png");
  const teamRightColor = isSwapped ? (data.homeColor || data.homeBg || "#ff5500") : (data.awayColor || data.awayBg || "#0df2b9");
  const teamRightScore = isSwapped ? (data.homeScore ?? 11) : (data.awayScore ?? 11);
  const teamRightSeriesScore = isSwapped ? (data.homeSeriesScore || 0) : (data.awaySeriesScore || 0);

  // Dynamic CSS variables for the accents (Tailwind equivalent)
  const boardStyles = {
    "--home-accent-color": teamLeftColor,
    "--away-accent-color": teamRightColor,
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
                src={teamLeftLogo}
                alt={teamLeftName}
                className="hud-team-logo"
              />
            </div>
            <div className="hud-team-name-box">
              <span className="hud-team-name">{teamLeftName}</span>
              <span className="hud-team-subtitle">
                {teamLeftFullName ? teamLeftFullName.substring(0, 10).toUpperCase() : "EMEA#3"}
              </span>
            </div>
          </div>

          {/* 2. HOME SCORE (WITH DIAMOND GAME WIN TRAY) */}
          <div className="hud-score-container-home">
            <div className={`hud-fnc-score ${showGoal && goalTeam === (isSwapped ? data.awayName : data.homeName) ? "goal-active" : ""}`}>
              <span className="hud-score-text">{teamLeftScore}</span>
            </div>
            
            {/* TIMEOUT TAB / DIAMOND SERIES TRAY */}
            {(data.seriesType === "bo3" || data.seriesType === "bo5") && (
              <div className="hud-timeout-tab">
                {Array.from({ length: data.seriesType === "bo3" ? 2 : 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`hud-diamond ${i < teamLeftSeriesScore ? "active" : ""}`}
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
            <div className={`hud-nrg-score ${showGoal && goalTeam === (isSwapped ? data.homeName : data.awayName) ? "goal-active" : ""}`}>
              <span className="hud-score-text">{teamRightScore}</span>
            </div>
            
            {/* TIMEOUT TAB / DIAMOND SERIES TRAY */}
            {(data.seriesType === "bo3" || data.seriesType === "bo5") && (
              <div className="hud-timeout-tab">
                {Array.from({ length: data.seriesType === "bo3" ? 2 : 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`hud-diamond ${i < teamRightSeriesScore ? "active" : ""}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 5. RIGHT PANEL: NRG */}
          <div className="hud-nrg-panel">
            <div className="hud-team-name-box-right">
              <span className="hud-team-name">{teamRightName}</span>
              <span className="hud-team-subtitle">
                {teamRightFullName ? teamRightFullName.substring(0, 10).toUpperCase() : "AMER#2"}
              </span>
            </div>
            <div className="hud-logo-container-right">
              <img
                src={teamRightLogo}
                alt={teamRightName}
                className="hud-team-logo"
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
