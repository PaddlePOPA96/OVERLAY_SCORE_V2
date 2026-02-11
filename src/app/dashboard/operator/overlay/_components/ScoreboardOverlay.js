"use client";

import { useScoreboard } from "@/features/match-simulation/hooks/useScoreboard";
import LayoutA from "../../_components/LayoutA"; // Adjust path if moved
import LayoutB from "../../_components/LayoutB"; // Adjust path if moved
import { useEffect, useState } from "react";
import { useLayoutSettings } from "@/hooks/useLayoutSettings";

export default function ScoreboardOverlay({ roomId = "default" }) {
    const { data, displayTime, formatTime } = useScoreboard(roomId);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // --- New Settings Hook ---
    // --- New Settings Hook ---
    const { settings } = useLayoutSettings();

    // Ensure values are numbers to prevent CSS errors
    const rawX = settings?.scoreboard?.x;
    const rawY = settings?.scoreboard?.y;
    const rawScale = settings?.scoreboard?.scale;

    const x = isNaN(Number(rawX)) ? 0 : Number(rawX);
    const y = isNaN(Number(rawY)) ? 0 : Number(rawY);
    const scale = isNaN(Number(rawScale)) ? 1 : Number(rawScale);

    // Debug log to check if props are updating
    useEffect(() => {
        if (isMounted) {
            console.log("[ScoreboardOverlay] Received settings:", { x, y, scale });
        }
    }, [x, y, scale, isMounted]);

    if (!isMounted) return null;

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none", // Allow clicks to pass through if needed, or handle layout specific
                transform: `translate(${x}px, ${y}px) scale(${scale})`,
                transformOrigin: "top left",
                transition: "transform 0.1s linear",
                zIndex: 10, // Scoreboard usually on top? Or distinct.
            }}
        >
            {data.layout === "A" ? (
                <LayoutA
                    data={data}
                    displayTime={displayTime}
                    formatTime={formatTime}
                />
            ) : (
                <LayoutB
                    data={data}
                    displayTime={displayTime}
                    formatTime={formatTime}
                />
            )}
        </div>
    );
}
