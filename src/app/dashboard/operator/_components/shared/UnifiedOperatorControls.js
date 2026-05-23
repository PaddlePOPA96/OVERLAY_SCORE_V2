"use client";

import { useState } from "react";
import LogoPickerModal from "../LogoPickerModal";
import { makeTeamAbbr } from "@/lib/logoData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import LayoutSelector from "./LayoutSelector";
import TimerControls from "./TimerControls";
import GoalAudioSettings from "../GoalAudioSettings";
import OverlayRoomControls from "../OverlayRoomControls";

export default function UnifiedOperatorControls({
  data,
  actions,
  displayTime,
  formatTime,
  roomId,
  theme = "dark",
}) {
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [logoTarget, setLogoTarget] = useState("home");

  const openLogoPicker = (target) => {
    setLogoTarget(target);
    setLogoModalOpen(true);
  };

  const handleHomeColorChange = (color) => {
    actions.updateMatch({
      homeColor: color,
      homeBg: color,
    });
  };

  const handleAwayColorChange = (color) => {
    actions.updateMatch({
      awayColor: color,
      awayBg: color,
    });
  };

  const handlePeriodChange = (periodVal) => {
    let baseTimeVal = 0;
    if (periodVal === 2) {
      baseTimeVal = 45 * 60; // 45:00
    } else if (periodVal === 3) {
      baseTimeVal = 90 * 60; // 90:00
    }

    actions.updateMatch({
      period: periodVal,
      "timer/isRunning": false,
      "timer/baseTime": baseTimeVal,
      "timer/startTime": null,
    });
  };

  const isLight = theme === "light";
  const labelColor = isLight ? "#1e293b" : "#aaa";
  const tinyColor = isLight ? "#475569" : "#aaa";
  const borderCol = isLight ? "#cbd5e1" : "#333";
  const cardBg = isLight ? "rgba(15, 23, 42, 0.02)" : "rgba(255, 255, 255, 0.02)";
  const cardBorder = isLight ? "1px solid #cbd5e1" : "1px solid #2e2e2e";
  const scoreBg = isLight ? "rgba(15, 23, 42, 0.03)" : "rgba(0, 0, 0, 0.2)";
  const scoreNumColor = isLight ? "#0f172a" : "#ffffff";

  return (
    <div className="operator-b-controls" style={{ width: "100%", maxWidth: "900px" }}>
      {/* SECTION 1: Layout & Babak Selection */}
      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "16px",
          borderBottom: `1px solid ${borderCol}`,
          paddingBottom: "12px",
          marginBottom: "8px"
        }}
      >
        <div>
          <LayoutSelector 
            data={data} 
            updateMatch={actions.updateMatch} 
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label className="op-label" style={{ marginBottom: "2px", color: labelColor }}>Babak (Period)</label>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <Button
              className={`op-btn ${data.period === 1 ? "op-btn-active" : ""}`}
              variant={data.period === 1 ? "default" : "ghost"}
              onClick={() => handlePeriodChange(1)}
            >
              1st Half
            </Button>
            <Button
              className={`op-btn ${data.period === 2 ? "op-btn-active" : ""}`}
              variant={data.period === 2 ? "default" : "ghost"}
              onClick={() => handlePeriodChange(2)}
            >
              2nd Half
            </Button>
            <Button
              className={`op-btn ${data.period === 3 ? "op-btn-active" : ""}`}
              variant={data.period === 3 ? "default" : "ghost"}
              onClick={() => handlePeriodChange(3)}
            >
              Extra
            </Button>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 3: Side-by-Side Team setup and Score panels */}
      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", 
          gap: "18px",
          marginBottom: "8px"
        }}
      >
        {/* HOME (LEFT) TEAM CARD */}
        <div 
          style={{ 
            background: cardBg, 
            border: cardBorder, 
            borderRadius: "10px", 
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}
        >
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#60a5fa", borderBottom: `1px solid ${borderCol}`, paddingBottom: "6px", margin: "0" }}>
            🏠 Home Team (Left Side)
          </h3>
          
          {/* Logo Picker & Color Thumbnail Row */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div 
              onClick={() => openLogoPicker("home")}
              style={{ 
                width: "56px", 
                height: "56px", 
                background: isLight ? "#f8fafc" : "#0d0d0d", 
                border: `1px solid ${borderCol}`, 
                borderRadius: "8px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                cursor: "pointer",
                overflow: "hidden"
              }}
              title="Pilih Logo"
            >
              {data.homeLogo ? (
                <img src={data.homeLogo} alt="Home Logo" style={{ maxWidth: "85%", maxHeight: "85%", objectFit: "contain" }} />
              ) : (
                <span style={{ fontSize: "10px", color: "#666" }}>No Logo</span>
              )}
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
              <Button 
                className="op-btn" 
                variant="outline" 
                size="sm"
                onClick={() => openLogoPicker("home")}
                style={{ alignSelf: "flex-start", padding: "2px 10px", fontSize: "11px" }}
              >
                Pilih Logo
              </Button>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="op-tiny" style={{ margin: 0, color: tinyColor }}>Warna:</span>
                <input
                  type="color"
                  value={data.homeColor || data.homeBg || "#ff4b4b"}
                  onChange={(e) => handleHomeColorChange(e.target.value)}
                  style={{ 
                    border: "none", 
                    width: "28px", 
                    height: "20px", 
                    padding: "0", 
                    background: "transparent", 
                    cursor: "pointer" 
                  }}
                />
              </div>
            </div>
          </div>

          {/* Names Setup */}
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label className="op-label" style={{ fontSize: "11px", color: labelColor }}>Abbr (Short Name)</label>
              <input
                className="op-input"
                value={data.homeName || ""}
                onChange={(e) => actions.updateMatch({ homeName: e.target.value })}
                placeholder="E.g. ARS"
                style={{ width: "100%", marginTop: "4px" }}
              />
            </div>
            <div style={{ flex: 2 }}>
              <label className="op-label" style={{ fontSize: "11px", color: labelColor }}>Full Name (Modern layout)</label>
              <input
                className="op-input"
                value={data.homeFullName || ""}
                onChange={(e) => actions.updateMatch({ homeFullName: e.target.value })}
                placeholder="E.g. ARSENAL"
                style={{ width: "100%", marginTop: "4px" }}
              />
            </div>
          </div>

          {/* Home Score Controls */}
          <div 
            style={{ 
              marginTop: "8px",
              padding: "10px", 
              background: scoreBg, 
              borderRadius: "8px", 
              display: "flex", 
              flexDirection: "column", 
              gap: "8px",
              border: isLight ? `1px solid ${borderCol}` : "none"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifycontent: "space-between" }}>
              <span style={{ fontWeight: "600", fontSize: "11px", color: labelColor }}>Skor Home</span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Button
                  className="op-btn"
                  variant="ghost"
                  onClick={() => actions.updateMatch({ homeScore: Math.max(0, (data.homeScore || 0) - 1) })}
                  style={{ width: "28px", height: "28px", padding: 0 }}
                >
                  -
                </Button>
                <input
                  className="op-input"
                  type="number"
                  min={0}
                  max={20}
                  value={data.homeScore ?? 0}
                  onChange={(e) => actions.updateMatch({ homeScore: Math.max(0, Math.min(20, parseInt(e.target.value, 10) || 0)) })}
                  style={{ width: "42px", textAlign: "center", height: "28px", padding: "0 2px", color: scoreNumColor }}
                />
                <Button
                  className="op-btn"
                  variant="ghost"
                  onClick={() => actions.updateMatch({ homeScore: Math.min(20, (data.homeScore || 0) + 1) })}
                  style={{ width: "28px", height: "28px", padding: 0 }}
                >
                  +
                </Button>
              </div>
            </div>
            
            <Button
              className="op-btn op-btn-main"
              onClick={() => actions.triggerGoal("home")}
              style={{ 
                width: "100%", 
                padding: "8px", 
                backgroundColor: "#047857",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px"
              }}
            >
              ⚽ GOAL HOME +1
            </Button>
          </div>
        </div>

        {/* AWAY (RIGHT) TEAM CARD */}
        <div 
          style={{ 
            background: cardBg, 
            border: cardBorder, 
            borderRadius: "10px", 
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}
        >
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#f87171", borderBottom: `1px solid ${borderCol}`, paddingBottom: "6px", margin: "0" }}>
            ✈️ Away Team (Right Side)
          </h3>
          
          {/* Logo Picker & Color Thumbnail Row */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div 
              onClick={() => openLogoPicker("away")}
              style={{ 
                width: "56px", 
                height: "56px", 
                background: isLight ? "#f8fafc" : "#0d0d0d", 
                border: `1px solid ${borderCol}`, 
                borderRadius: "8px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                cursor: "pointer",
                overflow: "hidden"
              }}
              title="Pilih Logo"
            >
              {data.awayLogo ? (
                <img src={data.awayLogo} alt="Away Logo" style={{ maxWidth: "85%", maxHeight: "85%", objectFit: "contain" }} />
              ) : (
                <span style={{ fontSize: "10px", color: "#666" }}>No Logo</span>
              )}
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
              <Button 
                className="op-btn" 
                variant="outline" 
                size="sm"
                onClick={() => openLogoPicker("away")}
                style={{ alignSelf: "flex-start", padding: "2px 10px", fontSize: "11px" }}
              >
                Pilih Logo
              </Button>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="op-tiny" style={{ margin: 0, color: tinyColor }}>Warna:</span>
                <input
                  type="color"
                  value={data.awayColor || data.awayBg || "#b00024"}
                  onChange={(e) => handleAwayColorChange(e.target.value)}
                  style={{ 
                    border: "none", 
                    width: "28px", 
                    height: "20px", 
                    padding: "0", 
                    background: "transparent", 
                    cursor: "pointer" 
                  }}
                />
              </div>
            </div>
          </div>

          {/* Names Setup */}
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label className="op-label" style={{ fontSize: "11px", color: labelColor }}>Abbr (Short Name)</label>
              <input
                className="op-input"
                value={data.awayName || ""}
                onChange={(e) => actions.updateMatch({ awayName: e.target.value })}
                placeholder="E.g. CHE"
                style={{ width: "100%", marginTop: "4px" }}
              />
            </div>
            <div style={{ flex: 2 }}>
              <label className="op-label" style={{ fontSize: "11px", color: labelColor }}>Full Name (Modern layout)</label>
              <input
                className="op-input"
                value={data.awayFullName || ""}
                onChange={(e) => actions.updateMatch({ awayFullName: e.target.value })}
                placeholder="E.g. CHELSEA"
                style={{ width: "100%", marginTop: "4px" }}
              />
            </div>
          </div>

          {/* Away Score Controls */}
          <div 
            style={{ 
              marginTop: "8px",
              padding: "10px", 
              background: scoreBg, 
              borderRadius: "8px", 
              display: "flex", 
              flexDirection: "column", 
              gap: "8px",
              border: isLight ? `1px solid ${borderCol}` : "none"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: "600", fontSize: "11px", color: labelColor }}>Skor Away</span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Button
                  className="op-btn"
                  variant="ghost"
                  onClick={() => actions.updateMatch({ awayScore: Math.max(0, (data.awayScore || 0) - 1) })}
                  style={{ width: "28px", height: "28px", padding: 0 }}
                >
                  -
                </Button>
                <input
                  className="op-input"
                  type="number"
                  min={0}
                  max={20}
                  value={data.awayScore ?? 0}
                  onChange={(e) => actions.updateMatch({ awayScore: Math.max(0, Math.min(20, parseInt(e.target.value, 10) || 0)) })}
                  style={{ width: "42px", textAlign: "center", height: "28px", padding: "0 2px", color: scoreNumColor }}
                />
                <Button
                  className="op-btn"
                  variant="ghost"
                  onClick={() => actions.updateMatch({ awayScore: Math.min(20, (data.awayScore || 0) + 1) })}
                  style={{ width: "28px", height: "28px", padding: 0 }}
                >
                  +
                </Button>
              </div>
            </div>
            
            <Button
              className="op-btn op-btn-danger"
              onClick={() => actions.triggerGoal("away")}
              style={{ 
                width: "100%", 
                padding: "8px", 
                color: "#fff",
                fontWeight: "bold",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px"
              }}
            >
              ⚽ GOAL AWAY +1
            </Button>
          </div>
        </div>
      </div>

      {/* SECTION 4: Timer & Audio Settings */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderBottom: `1px solid ${borderCol}`, paddingBottom: "10px", marginBottom: "8px" }}>
        <TimerControls 
          data={data} 
          actions={actions} 
          displayTime={displayTime} 
          formatTime={formatTime} 
          btnMainClass={isLight ? "op-btn-main" : "op-b-btn-main"} 
        />
        
        <GoalAudioSettings 
          data={data} 
          updateMatch={actions.updateMatch} 
          stopGoalAudio={actions.stopGoalAudio} 
          previewGoalAudio={actions.previewGoalAudio} 
        />
      </div>

      {/* SECTION 5: Overlay Room Admin & Sync */}
      <div 
        style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          alignItems: "center", 
          justifyContent: "space-between", 
          gap: "10px" 
        }}
      >
        <OverlayRoomControls
          showOverlay={data.showOverlay}
          toggleOverlay={actions.toggleOverlay}
          roomId={roomId}
        />
        
        <div className="op-section" style={{ margin: 0 }}>
          <Button
            className="op-btn"
            variant="outline"
            onClick={() => alert("Data tersinkronisasi otomatis dengan Realtime Database!")}
            style={{ fontSize: "11px" }}
          >
            🔄 Sync Semua Client
          </Button>
        </div>
      </div>

      {/* LOGO PICKER MODAL */}
      <LogoPickerModal
        isOpen={logoModalOpen}
        onClose={() => setLogoModalOpen(false)}
        defaultClubName={logoTarget === "home" ? data.homeFullName : data.awayFullName}
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
