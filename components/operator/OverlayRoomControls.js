"use client";

import { useState } from "react";

// Kontrol kecil untuk ROOM & link overlay
export default function OverlayRoomControls({
  showOverlay,
  toggleOverlay,
  roomId,
  compact,
}) {
  const [copied, setCopied] = useState(false);

  const overlayPath = `/dashboard/operator/overlay/${roomId || "default"}`;
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const overlayUrl = baseUrl ? `${baseUrl}${overlayPath}` : overlayPath;

  const handleToggleOverlay = () => {
    toggleOverlay();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(overlayUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  if (compact) {
    return (
      <div className="op-room-compact">
        <button className="op-btn op-b-btn-main" onClick={handleToggleOverlay}>
          {showOverlay ? "Hide Overlay" : "Show Overlay"}
        </button>
        <span className="op-room-display op-room-url">{overlayPath}</span>
        <button className="op-btn" onClick={handleCopy}>
          {copied ? "Copied" : "Copy URL"}
        </button>
      </div>
    );
  }

  return (
    <div className="op-room-row">
      <label className="op-label">Overlay</label>
      <button className="op-btn op-btn-main" onClick={handleToggleOverlay}>
        {showOverlay ? "HIDE" : "SHOW"}
      </button>

      <div className="op-room-box">
        <div className="op-room-display">
          <span className="op-room-display-label">ROOM</span>
          <span className="op-tiny">{roomId || "default"}</span>
        </div>
        <div className="op-room-display op-room-url">{overlayPath}</div>
        <button className="op-btn op-btn-main" onClick={handleCopy}>
          {copied ? "COPIED" : "COPY"}
        </button>
      </div>

      <span
        className={`op-tiny font-bold ${
          showOverlay ? "text-green-500" : "text-red-500"
        }`}
      >
        STATUS: {showOverlay ? "TAMPIL" : "SEMBUNYI"}
      </span>
    </div>
  );
}
