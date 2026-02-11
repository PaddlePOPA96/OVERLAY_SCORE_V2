"use client";

import { useState, useEffect } from "react";

import ScoreboardOverlay from "@/app/dashboard/operator/overlay/_components/ScoreboardOverlay";
import RunningTextOverlay from "@/app/dashboard/operator/overlay/_components/RunningTextOverlay";
import { useParams } from "next/navigation";

export default function CombinedOverlayPage() {
    const params = useParams();
    const rawRoom = params?.room;
    const roomId =
        typeof rawRoom === "string"
            ? rawRoom
            : Array.isArray(rawRoom) && rawRoom.length > 0
                ? rawRoom[0]
                : "default";

    // --- Universal Scaling Logic ---
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const handleResize = () => {
            // Calculate scale to fit 1920x1080 into current window
            const scaleX = window.innerWidth / 1920;
            const scaleY = window.innerHeight / 1080;
            // Use the smaller scale to fit entirely (letterbox)
            // Or use larger to cover (crop)? Standard for overlays is usually fit or exact match.
            // Let's use Math.min to ensure it fits without scrolling.
            const newScale = Math.min(scaleX, scaleY);
            setScale(newScale);
        };

        // Initial calculation
        handleResize();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden bg-black flex items-center justify-center">
            {/* The 1920x1080 Container Scaled */}
            <div
                style={{
                    width: 1920,
                    height: 1080,
                    transform: `scale(${scale})`,
                    transformOrigin: "center center",
                    // overflow: "hidden", // Optional: Clip content outside 1080p?
                    position: "relative"
                }}
            >
                {/* Render both overlays. 
                They handle their own positioning via useLayoutSettings 
                and their own z-index/pointer-events. 
                */}
                <ScoreboardOverlay roomId={roomId} />
                <RunningTextOverlay />
            </div>
        </div>
    );
}
