"use client";

import { useEffect, useState, useRef } from "react";

import { useScoreboard } from "@/features/match-simulation/hooks/useScoreboard";
import LayoutA from "../../_components/LayoutA";
import LayoutB from "../../_components/LayoutB";
import LayoutC from "../../_components/LayoutC";
import LayoutD from "../../_components/LayoutD";
import LayoutE from "../../_components/LayoutE";
import { useLayoutSettings } from "@/hooks/useLayoutSettings";

export default function ScoreboardOverlay({ roomId = "default" }) {
    const { data, isLoaded, displayTime, formatTime } = useScoreboard(roomId);
    const [isMounted, setIsMounted] = useState(false);
    const [playError, setPlayError] = useState(false);

    const prevGoalTrigger = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Check for goal
    useEffect(() => {
        if (!isLoaded || !data) return;

        if (prevGoalTrigger.current === null) {
            prevGoalTrigger.current = data.goalTrigger || 0;
            
return;
        }

        const currentTrigger = data.goalTrigger || 0;

        if (currentTrigger !== prevGoalTrigger.current && currentTrigger !== 0) {
            if (audioRef.current) {
                const audioVolume = data.goalAudioVolume !== undefined ? data.goalAudioVolume : 1;

                audioRef.current.src = data.goalAudioSource || "/sounds/goal.mp3";
                audioRef.current.volume = audioVolume;
                audioRef.current.currentTime = 0;
                const p = audioRef.current.play();

                if (p !== undefined) {
                    p.catch(e => {
                        console.error("Goal audio error:", e);

                        if (e.name === "NotAllowedError" || e.message.includes("interact")) {
                            setPlayError(true);
                        }
                    });
                }
            }
        }

        prevGoalTrigger.current = currentTrigger;
    }, [data?.goalTrigger, isLoaded]);

    // Listen for stop signal directly from data changes
    useEffect(() => {
        if (!data || !data.goalAudioStop) return;

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [data?.goalAudioStop]);

    // Listen for preview audio signal
    const prevPreviewTrigger = useRef(null);

    useEffect(() => {
        if (!isLoaded || !data) return;

        if (prevPreviewTrigger.current === null) {
            prevPreviewTrigger.current = data.previewAudioTrigger || 0;
            
return;
        }

        const currentTrigger = data.previewAudioTrigger || 0;

        if (currentTrigger !== prevPreviewTrigger.current && currentTrigger !== 0) {
            if (audioRef.current) {
                // Set source to preview audio source
                audioRef.current.src = data.previewAudioSource || "/sounds/goal.mp3";
                const audioVolume = data.goalAudioVolume !== undefined ? data.goalAudioVolume : 1;

                audioRef.current.volume = audioVolume;
                audioRef.current.currentTime = 0;
                
                const p = audioRef.current.play();

                if (p !== undefined) {
                    p.catch(e => {
                        console.error("Preview audio error:", e);

                        if (e.name === "NotAllowedError" || e.message.includes("interact")) {
                            setPlayError(true);
                        }
                    });
                }
            }
        }

        prevPreviewTrigger.current = currentTrigger;
    }, [data?.previewAudioTrigger, data?.previewAudioSource, isLoaded]);

    const handleInteraction = () => {
        setPlayError(false);

        if (audioRef.current) {
            audioRef.current.volume = 0;
            const p = audioRef.current.play();

            if (p !== undefined) {
                p.then(() => {
                    audioRef.current.pause();
                    audioRef.current.volume = 1;
                }).catch(() => { });
            }
        }
    };

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
            onClick={handleInteraction}
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                transform: `translate(${x}px, ${y}px) scale(${scale})`,
                transformOrigin: "center center",
                transition: "transform 0.1s linear",
                zIndex: 10,
            }}
        >
            <audio ref={audioRef} src={data.goalAudioSource || "/sounds/goal.mp3"} preload="auto" />
            {playError && (
                <div
                    onClick={handleInteraction}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', cursor: 'pointer' }}
                >
                    <div style={{ backgroundColor: '#ef4444', color: 'white', padding: '15px 30px', borderRadius: '30px', fontWeight: 'bold', fontFamily: 'sans-serif', fontSize: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', textAlign: 'center' }}>
                        ⚠️ Autoplay Blocked!<br /><span style={{ fontSize: '14px', fontWeight: 'normal' }}>Click anywhere on this screen to enable Goal Sound.</span>
                    </div>
                </div>
            )}
            {data.layout === "A" ? (
                <LayoutA
                    data={data}
                    displayTime={displayTime}
                    formatTime={formatTime}
                />
            ) : data.layout === "C" ? (
                <LayoutC
                    data={data}
                    displayTime={displayTime}
                    formatTime={formatTime}
                />
            ) : data.layout === "D" ? (
                <LayoutD
                    data={data}
                    displayTime={displayTime}
                    formatTime={formatTime}
                />
            ) : data.layout === "E" ? (
                <LayoutE
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
