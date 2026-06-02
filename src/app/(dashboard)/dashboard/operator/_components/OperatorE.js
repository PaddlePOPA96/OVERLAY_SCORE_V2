"use client";

import LayoutE from "./LayoutE";
import { Card } from "@/components/ui/card";
import UnifiedOperatorControls from "./shared/UnifiedOperatorControls";

export default function OperatorE({
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
      <div className="w-full flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-textPrimary">
          ⚽ Operator Panel – Layout E (Valorant Overlay HUD)
        </h2>
      </div>

      <Card className="operator-b-preview-box">
        <LayoutE
          data={{ ...data, showOverlay: true, isPreview: true }}
          displayTime={displayTime}
          formatTime={formatTime}
        />
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
