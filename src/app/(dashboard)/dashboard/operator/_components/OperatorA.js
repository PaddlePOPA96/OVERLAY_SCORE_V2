"use client";

import LayoutA from "./LayoutA";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import UnifiedOperatorControls from "./shared/UnifiedOperatorControls";

export default function OperatorA({
  data,
  actions,
  displayTime,
  formatTime,
  roomId,
  theme,
}) {
  const isLight = theme === "light";

  return (
    <div className={`operator-a-container ${isLight ? "theme-light" : ""}`}>
      <div className="w-full flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-textPrimary">
          ⚽ Operator Panel – EPL Scoreboard
        </h2>
      </div>

      <Card className="operator-a-preview-box">
        <LayoutA
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
