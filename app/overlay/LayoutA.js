"use client";

import { useEffect, useState } from "react";
import "./layoutA.css";

export default function LayoutA({ data, displayTime, formatTime }) {
  const [showGoal, setShowGoal] = useState(false);
  const [goalTeam, setGoalTeam] = useState("");
  const [animateIn, setAnimateIn] = useState(false);
  const [lastIntroId, setLastIntroId] = useState(0);
  const [isVisible, setIsVisible] = useState(data.showOverlay);
  const [isHiding, setIsHiding] = useState(false);

  // Trigger animasi GOAL sederhana
  useEffect(() => {
    const now = Date.now();
    // Hanya tampilkan GOAL jika trigger masih "baru" (misalnya < 5 detik)
    if (data.goalTrigger > 0 && now - data.goalTrigger < 5000) {
      setGoalTeam(data.goalTeam || "");
      setShowGoal(true);

      const timer = setTimeout(() => {
        setShowGoal(false);
        setGoalTeam("");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [data.goalTrigger, data.goalTeam]);

  // Animasi saat overlay A ditampilkan (toggle show/hide)
  useEffect(() => {
    if (data.showOverlay && data.introId !== lastIntroId) {
      setLastIntroId(data.introId);
      setAnimateIn(true);
      // biarkan class animasi aktif sedikit lebih lama supaya efek lebih halus
      const timer = setTimeout(() => setAnimateIn(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [data.showOverlay, data.introId, lastIntroId]);

  // Kelola visible state supaya saat HIDE ada animasi keluar dulu
  useEffect(() => {
    if (data.showOverlay) {
      setIsVisible(true);
      setIsHiding(false);
      return;
    }

    if (isVisible && !data.showOverlay) {
      setIsHiding(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsHiding(false);
      }, 700); // durasi animasi hide di CSS
      return () => clearTimeout(timer);
    }
  }, [data.showOverlay, isVisible]);

  const dynamicStyles = {
    "--score-left-color": data.homeColor || "#0040a0",
    "--score-right-color": data.awayColor || "#b00024",
  };

  const renderLeftContent = () => {
    if (showGoal && goalTeam === data.homeName) {
      return <span className="goal-text-anim">GOAL</span>;
    }
    return <span className="layout-a-team-name">{data.homeName}</span>;
  };

  const renderRightContent = () => {
    if (showGoal && goalTeam === data.awayName) {
      return <span className="goal-text-anim">GOAL</span>;
    }
    return <span className="layout-a-team-name">{data.awayName}</span>;
  };

  // Jika sudah selesai animasi hide, jangan render Layout A di overlay
  if (!isVisible) {
    return null;
  }

  return (
    <div id="layout-a-root" style={dynamicStyles}>
      <div
        className={`slide16-9 ${animateIn ? "layout-a-animate-in" : ""} ${
          isHiding ? "layout-a-hide" : ""
        }`}
      >
        <div className={`layout-a-board ${showGoal ? "goal-anim" : ""}`}>
          <div
            className={`layout-a-team layout-a-team-left ${
              showGoal && goalTeam === data.homeName ? "goal-center" : ""
            }`}
          >
            {renderLeftContent()}
          </div>

          <div className="layout-a-center">
            <div className="layout-a-center-logo">
              <img src="/logo/logo-epl.svg" alt="PL" />
            </div>
            <div className="layout-a-score-overlay">
              <span
                className={`layout-a-score-num layout-a-score-left ${
                  showGoal && goalTeam === data.homeName ? "score-hidden" : ""
                }`}
              >
                {data.homeScore}
              </span>
              <span
                className={`layout-a-score-num layout-a-score-right ${
                  showGoal && goalTeam === data.awayName ? "score-hidden" : ""
                }`}
              >
                {data.awayScore}
              </span>
            </div>
          </div>

          <div
            className={`layout-a-team layout-a-team-right ${
              showGoal && goalTeam === data.awayName ? "goal-center" : ""
            }`}
          >
            {renderRightContent()}
          </div>
        </div>

        <div className="layout-a-time-pill">{formatTime(displayTime)}</div>
      </div>
    </div>
  );
}
