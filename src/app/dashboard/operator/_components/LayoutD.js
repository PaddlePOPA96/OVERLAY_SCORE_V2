"use client";

import { useEffect, useState, useRef } from "react";
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
  const homeName = data.homeName || "HOME";
  const awayName = data.awayName || "AWAY";
  const homeColor = data.homeColor || data.homeBg || "#10b981";
  const awayColor = data.awayColor || data.awayBg || "#ef4444";

  // Dynamic CSS variables for the accents
  const boardStyles = {
    "--home-accent-color": homeColor,
    "--away-accent-color": awayColor,
  };

  // Determine period text (round name)
  const periodText = `ROUND ${data.period || 1}`;

  // Neon flash activation classes
  const homePillClass = `layout-d-team-pill layout-d-pill-home ${showGoal && goalTeam === data.homeName ? "goal-active" : ""}`;
  const awayPillClass = `layout-d-team-pill layout-d-pill-away ${showGoal && goalTeam === data.awayName ? "goal-active" : ""}`;

  return (
    <div id="layout-d-root" style={boardStyles}>
      <div className={`layout-d-container ${isHiding ? "layout-d-hide" : ""}`}>
        
        {/* HOME TEAM PILL (LEFT) */}
        <div className={homePillClass}>
          <div className="layout-d-logo-container">
            <img
              src={data.homeLogo || "/logo/placeholder.png"}
              alt={homeName}
              className="layout-d-team-logo"
            />
          </div>
          <div className="layout-d-name-container">
            <span className="layout-d-team-name">{homeName}</span>
            {(data.seriesType === "bo3" || data.seriesType === "bo5") && (
              <div className="layout-d-diamonds-row">
                {Array.from({ length: data.seriesType === "bo3" ? 2 : 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`layout-d-diamond ${i < (data.homeSeriesScore || 0) ? "active" : ""}`}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="layout-d-score-box">
            {data.homeScore ?? 0}
          </div>
        </div>

        {/* ROUND PILL (CENTER) - HIDDEN TO PRESERVE SPACING */}
        <div className="layout-d-center-pill" style={{ opacity: 0, pointerEvents: "none" }}>
          <span className="layout-d-period">{periodText}</span>
        </div>

        {/* AWAY TEAM PILL (RIGHT) */}
        <div className={awayPillClass}>
          <div className="layout-d-logo-container">
            <img
              src={data.awayLogo || "/logo/placeholder.png"}
              alt={awayName}
              className="layout-d-team-logo"
            />
          </div>
          <div className="layout-d-name-container">
            <span className="layout-d-team-name">{awayName}</span>
            {(data.seriesType === "bo3" || data.seriesType === "bo5") && (
              <div className="layout-d-diamonds-row">
                {Array.from({ length: data.seriesType === "bo3" ? 2 : 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`layout-d-diamond ${i < (data.awaySeriesScore || 0) ? "active" : ""}`}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="layout-d-score-box">
            {data.awayScore ?? 0}
          </div>
        </div>

      </div>
    </div>
  );
}
