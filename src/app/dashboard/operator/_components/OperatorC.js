"use client";

import LayoutC from "./LayoutC";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import UnifiedOperatorControls from "./shared/UnifiedOperatorControls";

export default function OperatorC({
  data,
  actions,
  displayTime,
  formatTime,
  roomId,
  theme,
}) {
  const isLight = theme === "light";

  return (
    <div className={`operator-b-container ${isLight ? "theme-light" : ""}`}>
      <div className="w-full max-w-[900px] flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold" style={isLight ? { color: "#0f172a" } : { color: "#eee" }}>⚽ Operator Panel – Layout C (Modern)</h2>
      </div>

      <Card className="operator-b-preview-box" style={{ overflow: "hidden" }}>
        <div style={{ transform: "scale(0.42)", transformOrigin: "center", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LayoutC
            data={{ ...data, showOverlay: true }}
            displayTime={displayTime}
            formatTime={formatTime}
          />
        </div>
      </Card>

      <UnifiedOperatorControls
        data={data}
        actions={actions}
        displayTime={displayTime}
        formatTime={formatTime}
        roomId={roomId}
        theme={theme}
      />
    </div>
  );
}
