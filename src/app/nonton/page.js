'use client';

import { useEffect, useState, useRef } from 'react';
import Hls from 'hls.js';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, set } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, dbFirestore } from '@/lib/firebase';

export default function NontonPage() {
    const [inputUrl, setInputUrl] = useState('');
    const [streamUrl, setStreamUrl] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const videoRef = useRef(null);

    // 1. Cek Admin Status
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Cek role di Firestore
                    const userRef = doc(dbFirestore, 'users', user.uid);
                    const snap = await getDoc(userRef);

                    let isUserAdmin = false;

                    if (snap.exists() && snap.data().role === 'admin') {
                        isUserAdmin = true;
                    } else if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
                        // Fallback env check
                        isUserAdmin = true;
                    }

                    setIsAdmin(isUserAdmin);
                } catch (error) {
                    console.error("Error checking admin status:", error);
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // 2. Sync Stream URL dari Realtime Database (Semua user dengerin ini)
    useEffect(() => {
        const streamRef = ref(db, 'stream/url');
        const unsubscribe = onValue(streamRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setStreamUrl(data);
                // Kalau admin, kita update juga inputUrl biar sinkron pas buka
                // (Opsional, tapi bagus UX-nya)
            }
        });

        return () => unsubscribe();
    }, []); // Run once on mount

    // 3. Update Stream URL (Hanya Admin)
    const handlePlay = () => {
        if (inputUrl.trim()) {
            // Simpan ke DB global
            const newUrl = inputUrl.trim();
            set(ref(db, 'stream/url'), newUrl)
                .then(() => {
                    console.log("Stream URL updated to:", newUrl);
                })
                .catch((err) => {
                    console.error("Failed to update stream URL:", err);
                    alert("Gagal update URL. Cek permission database.");
                });
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handlePlay();
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (streamUrl && video) {
            let hls = null;

            // Construct Proxy URL
            // We use our own API as a proxy to bypass CORS
            const proxyUrl = `/api/stream-proxy?url=${encodeURIComponent(streamUrl)}`;

            if (Hls.isSupported()) {
                hls = new Hls();
                // Load from Proxy
                hls.loadSource(proxyUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    video.play().catch(e => console.error("Auto-play failed:", e));
                });
                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        console.error("HLS Fatal Error", data);
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                console.log("fatal network error encountered, try to recover");
                                hls?.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.log("fatal media error encountered, try to recover");
                                hls?.recoverMediaError();
                                break;
                            default:
                                hls?.destroy();
                                break;
                        }
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                // Native HLS support (Safari)
                // Safari usually handles CORS strictly too, so proxy helps here as well
                video.src = proxyUrl;
                video.addEventListener('loadedmetadata', () => {
                    video.play().catch(e => console.error("Auto-play failed:", e));
                });
            }

            return () => {
                if (hls) {
                    hls.destroy();
                }
            };
        }
    }, [streamUrl]);

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl space-y-6">

                {/* Header / Title */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black bg-gradient-to-tr from-green-400 to-blue-600 bg-clip-text text-transparent tracking-tight">
                        BolaLive Player
                    </h1>
                    {isAdmin ? (
                        <p className="text-green-400 font-medium">Admin Mode: Control the stream</p>
                    ) : (
                        <p className="text-neutral-400">Live Streaming</p>
                    )}
                </div>

                {/* Input Section - ONLY FOR ADMIN */}
                {isAdmin && (
                    <div className="flex flex-col sm:flex-row gap-3 bg-neutral-900/50 p-4 rounded-2xl border border-dashed border-neutral-800">
                        <input
                            type="text"
                            placeholder="Paste stream URL (m3u8) here..."
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-blue-500 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-neutral-600"
                        />
                        <button
                            onClick={handlePlay}
                            disabled={!inputUrl}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-blue-900/40 active:scale-95"
                        >
                            Update Stream
                        </button>
                    </div>
                )}

                {/* Video Player - VISIBLE TO EVERYONE */}
                <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 group">
                    {streamUrl ? (
                        <video
                            ref={videoRef}
                            className="w-full h-full object-contain"
                            controls
                            playsInline
                            autoPlay
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-700 space-y-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 opacity-20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9.5 21c-2.485 0-4.5-2.015-4.5-4.5s2.015-4.5 4.5-4.5 4.5 2.015 4.5 4.5-2.015 4.5-4.5 4.5zm0-7c-1.379 0-2.5 1.121-2.5 2.5s1.121 2.5 2.5 2.5 2.5-1.121 2.5-2.5-1.121-2.5-2.5-2.5z" />
                                <path d="M22 6h-2v12c0 1.103-.897 2-2 2h-12c-1.103 0-2-.897-2-2v-12h-2v-2h20v2zm-2 0h-16v12h16v-12z" />
                                <path d="M8 8h8v2h-8z" />
                            </svg>
                            <span className="font-medium text-lg">Waiting for signal...</span>
                            {!isAdmin && <p className="text-xs text-neutral-600">Admin hasn&apos;t started the stream yet.</p>}
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="text-center">
                    <p className="text-xs text-neutral-600">
                        Supported formats: HLS (.m3u8), MP4, WebM
                    </p>
                </div>

            </div>
        </div>
    );
}
