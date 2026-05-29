"use client";

import LayoutB from "./LayoutB";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import UnifiedOperatorControls from "./shared/UnifiedOperatorControls";

export default function OperatorB({
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
        <h2 className="text-xl font-bold text-textPrimary">
          ⚽ Operator Panel – EPL Scoreboard
        </h2>
      </div>

      <Card className="operator-b-preview-box">
        <LayoutB
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
