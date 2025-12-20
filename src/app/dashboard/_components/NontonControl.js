"use client";

import { useEffect, useState, useRef } from "react";
import Hls from "hls.js";
import { ref, onValue, set } from "firebase/database";
import { db } from "@/lib/firebase";

export default function NontonControl({ theme, isAdmin }) {
    const [inputUrl, setInputUrl] = useState("");
    const [streamUrl, setStreamUrl] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const videoRef = useRef(null);
    const isDark = theme === "dark";

    // 1. Sync Stream URL dari Realtime Database
    useEffect(() => {
        const streamRef = ref(db, "stream/url");
        const unsubscribe = onValue(streamRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setStreamUrl(data);
                // Only autofill if input is empty, to avoid overwriting user typing
                if ((isAdmin && !inputUrl) || !inputUrl) {
                    setInputUrl(data);
                }
            }
        });

        return () => unsubscribe();
    }, [isAdmin]);

    // 2. Update Stream URL (Hanya Admin)
    const handleUpdateStream = () => {
        if (inputUrl.trim()) {
            const newUrl = inputUrl.trim();
            set(ref(db, "stream/url"), newUrl)
                .then(() => {
                    console.log("Stream URL updated to:", newUrl);
                    alert("Stream URL berhasil diupdate!");
                })
                .catch((err) => {
                    console.error("Failed to update stream URL:", err);
                    alert("Gagal update URL ke Database. Pastikan Anda sudah update Firebase Rules dan Relogin.");
                });
        }
    };

    const handlePreview = () => {
        if (inputUrl.trim()) {
            setPreviewUrl(inputUrl.trim());
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handlePreview(); // Default enter to preview first
        }
    };

    // 3. Video Player Logic (HLS)
    // Priority: Preview URL (local testing) -> Stream URL (from DB)
    const activeUrl = previewUrl || streamUrl;

    useEffect(() => {
        const video = videoRef.current;
        if (activeUrl && video) {
            let hls = null;

            if (Hls.isSupported()) {
                // Konfigurasi HLS untuk Low Latency / Live Sync ketat
                const hlsConfig = {
                    enableWorker: true,
                    lowLatencyMode: true,
                    liveSyncDuration: 3, // Target 3s behind live edge
                    liveMaxLatencyDuration: 10, // Max 10s delay before jump
                    backBufferLength: 0, // Don't cache much back buffer for live
                };

                hls = new Hls(hlsConfig);
                hls.loadSource(activeUrl);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    video.play().catch((e) => console.error("Auto-play failed:", e));
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        console.warn("HLS Error:", data);
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                hls.recoverMediaError();
                                break;
                            default:
                                hls.destroy();
                                break;
                        }
                    }
                });

                // Periodic sync check (every 5s) to ensure we are at live edge
                const syncInterval = setInterval(() => {
                    if (video && !video.paused && hls.liveSyncPosition) {
                        const latency = hls.liveSyncPosition - video.currentTime;
                        if (latency > 15) { // If lag > 15s
                            console.log("Catching up to live...", latency);
                            video.currentTime = hls.liveSyncPosition;
                        }
                    }
                }, 5000);

                return () => {
                    clearInterval(syncInterval);
                    if (hls) hls.destroy();
                };

            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = activeUrl;
                video.addEventListener("loadedmetadata", () => {
                    video.play().catch((e) => console.error("Auto-play failed:", e));
                });
            }
        }
    }, [activeUrl]);

    return (
        <div className={`space-y-6 flex flex-col items-center w-full ${isDark ? "text-white" : "text-slate-900"}`}>
            {/* Header - Only for Admin */}
            {isAdmin && (
                <div className="space-y-2 w-full">
                    <h2 className="text-2xl font-bold">Live Stream Control</h2>
                    <p className={`text-sm ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
                        Kelola link streaming untuk halaman /nonton.
                    </p>
                </div>
            )}

            {/* Input Section - Only for Admin */}
            {isAdmin && (
                <div className={`w-full flex flex-col gap-3 p-4 rounded-xl border border-dashed ${isDark ? "bg-neutral-900/50 border-neutral-800" : "bg-slate-50 border-slate-300"
                    }`}>
                    <input
                        type="text"
                        placeholder="Paste stream URL (m3u8) here..."
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className={`flex-1 rounded-lg border px-4 py-3 outline-none transition-all ${isDark
                            ? "bg-neutral-900 border-neutral-800 focus:border-blue-500 placeholder:text-neutral-600"
                            : "bg-white border-slate-300 focus:border-blue-500 placeholder:text-slate-400"
                            }`}
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handlePreview}
                            disabled={!inputUrl}
                            className={`flex-1 font-bold py-3 px-6 rounded-lg transition-all shadow-lg active:scale-95 ${isDark ? "bg-neutral-800 hover:bg-neutral-700 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                                }`}
                        >
                            Test Preview (Local)
                        </button>
                        <button
                            onClick={handleUpdateStream}
                            disabled={!inputUrl}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg active:scale-95"
                        >
                            Update Live Stream (Public)
                        </button>
                    </div>
                </div>
            )}

            {/* Video Player */}
            <div className="space-y-2 w-full flex-1 flex flex-col">
                {isAdmin && (
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg">
                            Preview: {activeUrl === previewUrl ? "Local Test" : "Live Stream"}
                        </h3>
                        {activeUrl && <span className="text-xs font-mono opacity-50 truncate max-w-[200px]">{activeUrl}</span>}
                    </div>
                )}

                {/* Main Player Container - BIGGER */}
                <div className={`relative w-full h-full min-h-[60vh] lg:min-h-[75vh] rounded-xl overflow-hidden shadow-2xl border group flex items-center justify-center ${isDark ? "bg-black border-neutral-800" : "bg-black border-slate-300"
                    }`}>
                    {activeUrl ? (
                        <>
                            <video
                                ref={videoRef}
                                className="w-full h-full object-contain"
                                controls={isAdmin} // Admin gets standard controls for debugging
                                playsInline
                                muted={true} // Always start muted for autoplay policy
                                autoPlay
                            />
                            {/* Custom Overlay for Non-Admin */}
                            {!isAdmin && (
                                <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2 bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg backdrop-blur-sm">
                                            <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                                            LIVE
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => {
                                                if (videoRef.current) {
                                                    videoRef.current.muted = !videoRef.current.muted;
                                                }
                                            }}
                                            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md transition-all active:scale-95"
                                            title="Mute/Unmute"
                                        >
                                            {/* Simple Speaker Icon */}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                                        </button>

                                        <button
                                            onClick={() => {
                                                if (videoRef.current) {
                                                    if (!document.fullscreenElement) {
                                                        videoRef.current.requestFullscreen().catch(err => console.log(err));
                                                    } else {
                                                        document.exitFullscreen();
                                                    }
                                                }
                                            }}
                                            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md transition-all active:scale-95"
                                            title="Fullscreen"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 space-y-4">
                            <span className="font-medium">Waiting for signal...</span>
                        </div>
                    )}
                </div>

                {isAdmin && (
                    <p className="text-xs text-neutral-500">
                        *Gunakan tombol "Test Preview" untuk mencoba link sebelum melakukan Update Live Stream.
                    </p>
                )}
            </div>
        </div>
    );
}
