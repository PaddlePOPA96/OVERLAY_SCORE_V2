import { useEffect, useState } from "react";
import Image from "next/image";
import "@/app/dashboard/operator/overlay/layoutB.css";

// Pilih warna teks (hitam/putih) agar kontras dengan warna background
function getContrastColor(hex) {
  if (!hex) return "#000000";
  let clean = hex.trim().replace(/^#/, "");
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;

  // rumus luminance sederhana (YIQ)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? "#000000" : "#ffffff";
}

export default function LayoutB({ data, displayTime, formatTime }) {
  const [animateIn, setAnimateIn] = useState(false);
  const [showGoal, setShowGoal] = useState(false);
  // null supaya animasi pertama kali juga jalan
  const [lastIntroId, setLastIntroId] = useState(null);

  useEffect(() => {
    if (data.showOverlay && data.introId !== lastIntroId) {
      setLastIntroId(data.introId);
      setAnimateIn(true);
      const timer = setTimeout(() => setAnimateIn(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [data.showOverlay, data.introId, lastIntroId]);

  useEffect(() => {
    const now = Date.now();
    if (data.goalTrigger > 0 && (now - data.goalTrigger) < 5000) {
      setShowGoal(true);
      const timer = setTimeout(() => setShowGoal(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [data.goalTrigger]);

  const wrapperClass = `layout-b-wrapper ${!data.showOverlay ? "hidden" : ""} ${animateIn ? "animate-in" : ""}`;

  // Warna dinamis untuk home/away (background & border/accent)
  const homeBg = data.homeBg || "#ff4b4b";
  const awayBg = data.awayBg || "#e5e5e5";

  const boardStyle = {
    "--layout-b-home-bg": homeBg,
    "--layout-b-away-bg": awayBg,
  };

  const homeTextColor = getContrastColor(homeBg);
  const awayTextColor = getContrastColor(awayBg);

  return (
    <div id="layout-b-root">
      <div className={wrapperClass}>
        <div className="layout-b-scoreboard" style={boardStyle}>

          <div className="layout-b-time-panel">
            <div className="layout-b-time-top">
              {data.period === 1 ? '1st HALF' : data.period === 2 ? '2nd HALF' : 'EXTRA'}
            </div>
            <div className="layout-b-time-bottom">{formatTime(displayTime)}</div>
          </div>

          <div className="layout-b-teams-panel">
            <Image
              className="layout-b-team-logo"
              src={data.homeLogo}
              alt={data.homeName || "Home"}
              width={110}
              height={110}
              priority
            />
            <Image
              className="layout-b-team-logo"
              src={data.awayLogo}
              alt={data.awayName || "Away"}
              width={110}
              height={110}
              priority
            />
          </div>

          <div className="layout-b-score-panel">
            <div
              className="layout-b-score-row layout-b-home-row"
              style={{ color: homeTextColor }}
            >
              <span>{data.homeScore}</span>
            </div>
            <div
              className="layout-b-score-row layout-b-away-row"
              style={{ color: awayTextColor }}
            >
              <span>{data.awayScore}</span>
            </div>
          </div>
        </div>

        <div className={`layout-b-goal-overlay ${showGoal ? "active" : ""}`}>
          <span>GOAL!</span>
        </div>
      </div>
    </div>
  );
}
