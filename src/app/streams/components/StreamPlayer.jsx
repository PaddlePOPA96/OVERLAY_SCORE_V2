import React, { useEffect, useRef, useMemo, useState } from 'react';

import Hls from 'hls.js';

import styles from '../streams.module.css';

export default function StreamPlayer({ currentChannel, streamStartTime, streamSyncVod, isMuted = true, drmKey }) {
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const flvRef = useRef(null);
    const dashRef = useRef(null);
    const openedUrlRef = useRef('');

    const [shakaModule, setShakaModule] = useState(null);
    const [mpegtsModule, setMpegtsModule] = useState(null);
    const [showCatchUp, setShowCatchUp] = useState(false);
    const [playError, setPlayError] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    const safePlay = (videoElement) => {
        if (!videoElement) return;
        videoElement.play().catch((err) => {
            console.log('[Autoplay] Blocked:', err);
            if (err.name === 'NotAllowedError') {
                videoElement.muted = true;
                console.log('[Autoplay] Retrying playing in muted mode...');
                videoElement.play().catch((err2) => console.error('[Autoplay] Muted play failed too:', err2));
            }
        });
    };

    // Pre-load dynamic player libraries once on mount to speed up stream loading/switching
    useEffect(() => {
        import('shaka-player').then((mod) => {
            setShakaModule(mod.default || mod);
        }).catch((err) => console.error('Pre-loading shaka-player failed:', err));

        import('mpegts.js/dist/mpegts.js').then((mod) => {
            setMpegtsModule(mod.default || mod);
        }).catch((err) => console.error('Pre-loading mpegts.js failed:', err));
    }, []);

    // Latency tracking to display Catch-up button
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const interval = setInterval(() => {
            try {
                if (streamSyncVod && streamStartTime > 0) {
                    const targetTime = Math.max(0, (Date.now() - streamStartTime) / 1000);
                    if (Math.abs(targetTime - video.currentTime) > 4) {
                        setShowCatchUp(true);
                    } else {
                        setShowCatchUp(false);
                    }
                } else if (video.seekable && video.seekable.length > 0) {
                    const liveEdge = video.seekable.end(video.seekable.length - 1);
                    if (liveEdge - video.currentTime > 5) {
                        setShowCatchUp(true);
                    } else {
                        setShowCatchUp(false);
                    }
                } else {
                    setShowCatchUp(false);
                }
            } catch (e) {
                // Ignore errors during transition states
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [streamSyncVod, streamStartTime]);

    const catchUpLive = () => {
        const video = videoRef.current;
        if (!video) return;

        try {
            if (streamSyncVod && streamStartTime > 0) {
                const targetTime = Math.max(0, (Date.now() - streamStartTime) / 1000);
                video.currentTime = targetTime;
            } else if (hlsRef.current && hlsRef.current.liveSyncPosition) {
                video.currentTime = hlsRef.current.liveSyncPosition;
            } else if (video.seekable && video.seekable.length > 0) {
                const liveEdge = video.seekable.end(video.seekable.length - 1);
                video.currentTime = liveEdge;
            } else if (video.buffered && video.buffered.length > 0) {
                video.currentTime = video.buffered.end(video.buffered.length - 1) - 0.5;
            }
            if (video.paused) {
                video.play().catch(console.error);
            }
        } catch (e) {
            console.error('Failed to catch up live:', e);
        }
    };

    let isYoutube = false;
    let youtubeId = '';
    let isGenericIframe = false;
    let genericIframeUrl = '';
    let isFlv = false;
    let isMp4 = false;
    let mp4Url = '';
    let isMpd = false;

    if (currentChannel) {
        let decodedChannel = currentChannel;

        if (currentChannel.includes('/api/stream.m3u8?u=')) {
            decodedChannel = atob(new URLSearchParams(currentChannel.split('?')[1]).get('u'));
        } else if (currentChannel.includes('/api/flv-proxy?u=')) {
            decodedChannel = atob(new URLSearchParams(currentChannel.split('?')[1]).get('u'));
        }

        if (decodedChannel.includes('youtube.com/watch')) {
            isYoutube = true;
            try { youtubeId = new URL(decodedChannel).searchParams.get('v'); } catch (e) { }
        } else if (decodedChannel.includes('youtu.be/')) {
            isYoutube = true;
            youtubeId = decodedChannel.split('youtu.be/')[1]?.split('?')[0];
        } else if (decodedChannel.includes('youtube.com/embed/')) {
            isYoutube = true;
            youtubeId = decodedChannel.split('youtube.com/embed/')[1]?.split('?')[0];
        } else if (decodedChannel.includes('.flv') || currentChannel.includes('/api/flv-proxy')) {
            isFlv = true;
        } else if (decodedChannel.toLowerCase().includes('.mp4')) {
            isMp4 = true;
            mp4Url = decodedChannel;
        } else if (decodedChannel.includes('.mpd')) {
            isMpd = true;
        } else if (!decodedChannel.includes('.m3u8') && !decodedChannel.includes('.mp4') && !decodedChannel.includes('.ts')) {
            isGenericIframe = true;
            genericIframeUrl = decodedChannel;
        }
    }

    const youtubeSrc = useMemo(() => {
        if (!isYoutube || !youtubeId) return '';
        let url = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&controls=1&mute=${isMuted ? '1' : '0'}&playsinline=1&rel=0&showinfo=0`;

        if (streamSyncVod && streamStartTime > 0) {
            const offset = Math.max(0, Math.floor((Date.now() - streamStartTime) / 1000));

            url += `&start=${offset}`;
        }

        
return url;
    }, [isYoutube, youtubeId, streamStartTime, streamSyncVod, isMuted]);

    const handleVideoPlay = (e, hlsInstance) => {
        const video = e.target;

        if (hlsInstance && hlsInstance.liveSyncPosition) {
            if (hlsInstance.liveSyncPosition > video.currentTime + 3) {
                video.currentTime = hlsInstance.liveSyncPosition;
            }
        } else if (video.seekable && video.seekable.length > 0) {
            const liveEdge = video.seekable.end(video.seekable.length - 1);

            if (liveEdge > video.currentTime + 3) {
                video.currentTime = liveEdge;
            }
        }
    };

    useEffect(() => {
        setPlayError(null);
        if (!isFlv || !currentChannel || !mpegtsModule) {
            if (flvRef.current) {
                flvRef.current.pause();
                flvRef.current.unload();
                flvRef.current.detachMediaElement();
                flvRef.current.destroy();
                flvRef.current = null;
            }
            return;
        }

        const video = videoRef.current;
        if (!video) return;

        let cancelled = false;
        const mpegts = mpegtsModule;

        if (!mpegts.isSupported()) {
            console.warn('mpegts.js is not supported in this browser');
            return;
        }

        if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
        if (dashRef.current) { dashRef.current.destroy(); dashRef.current = null; }

        if (flvRef.current) {
            flvRef.current.pause(); flvRef.current.unload(); flvRef.current.detachMediaElement(); flvRef.current.destroy(); flvRef.current = null;
        }

        const flvPlayer = mpegts.createPlayer({
            type: 'flv',
            url: currentChannel,
            isLive: true,
            hasAudio: true,
            hasVideo: true,
            cors: true,
        }, {
            enableWorker: true,
            enableStashBuffer: false,
            stashInitialSize: 64,
            lazyLoad: false,
            lazyLoadMaxDuration: 3 * 60,
            autoCleanupSourceBuffer: true,
            autoCleanupMaxBackwardDuration: 3 * 60,
            autoCleanupMinBackwardDuration: 2 * 60,
        });

        flvPlayer.attachMediaElement(video);
        flvPlayer.load();
        setTimeout(() => {
            if (cancelled) return;
            safePlay(video);
        }, 50);

        flvPlayer.on(mpegts.Events.ERROR, (errorType, errorDetail, errorInfo) => {
            console.error('FLV Error:', errorType, errorDetail, errorInfo);
            setPlayError({
                type: 'flv',
                message: 'Gagal Memuat FLV Stream',
                details: `Terjadi kesalahan saat memproses media stream FLV (${errorType}: ${errorDetail}).`
            });
        });

        flvRef.current = flvPlayer;

        return () => { cancelled = true; };
    }, [currentChannel, isFlv, mpegtsModule, reloadKey]);

    useEffect(() => {
        setPlayError(null);
        if (!isMpd || !currentChannel || !shakaModule) {
            if (dashRef.current) {
                dashRef.current.destroy();
                dashRef.current = null;
            }
            return;
        }

        const video = videoRef.current;
        if (!video) return;

        let cancelled = false;

        const shaka = shakaModule;
        const needsPolyfill = typeof window !== 'undefined' && (
            !window.MediaSource || 
            !navigator.requestMediaKeySystemAccess ||
            (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent))
        );
        if (needsPolyfill && !window.__shaka_polyfilled) {
            window.__shaka_polyfilled = true;
            try {
                shaka.polyfill.installAll();
            } catch (e) {
                console.error('Failed to install Shaka polyfills:', e);
            }
        }

        if (!shaka.Player.isBrowserSupported()) {
            console.error('Browser not supported for Shaka player!');
            return;
        }

        if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
        if (flvRef.current) { flvRef.current.pause(); flvRef.current.unload(); flvRef.current.detachMediaElement(); flvRef.current.destroy(); flvRef.current = null; }
        if (dashRef.current) { dashRef.current.destroy(); dashRef.current = null; }

        const player = new shaka.Player();
        let config = { 
            abr: { enabled: true },
            streaming: {
                bufferingGoal: 4,
                rebufferingGoal: 2,
                bufferBehind: 15
            }
        };

        if (drmKey && drmKey.includes(':')) {
            try {
                const [kid, key] = drmKey.split(':');
                config.drm = {
                    clearKeys: {
                        [kid.trim()]: key.trim()
                    }
                };
            } catch (e) {
                console.error('Failed to parse DRM Key:', e);
            }
        }

        player.configure(config);

        player.attach(video).then(() => {
            if (cancelled) return;
            return player.load(currentChannel);
        }).then(() => {
            if (cancelled) return;
            safePlay(video);
        }).catch(e => {
            if (cancelled) return;
            console.error("Shaka attach or load failed!");
            if (e && typeof e === 'object') {
                console.error("Error Code:", e.code, "Category:", e.category, "Data:", e.data);
                setPlayError({
                    type: 'dash',
                    message: 'Gagal Memuat DASH Stream',
                    details: `Shaka error: Code ${e.code} (Kategori: ${e.category}). Periksa kunci DRM atau ketersediaan media.`
                });
            } else {
                console.error(e);
                setPlayError({
                    type: 'dash',
                    message: 'Gagal Memuat DASH Stream',
                    details: String(e)
                });
            }
        });
        
        dashRef.current = player;

        return () => { cancelled = true; };
    }, [currentChannel, isMpd, drmKey, shakaModule, reloadKey]);

    useEffect(() => {
        setPlayError(null);
        if (isYoutube || isGenericIframe || isFlv || isMp4 || isMpd) {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }

            
return;
        }

        const video = videoRef.current;

        if (!video) return;

        if (flvRef.current) {
            flvRef.current.pause(); flvRef.current.unload(); flvRef.current.detachMediaElement(); flvRef.current.destroy(); flvRef.current = null;
        }

        if (dashRef.current) {
            dashRef.current.destroy(); dashRef.current = null;
        }

        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 30,
                liveSyncDurationCount: 2,
                liveMaxLatencyDurationCount: 4,
                maxBufferLength: 8,
                maxMaxBufferLength: 12,
            });

            hls.on(Hls.Events.MANIFEST_LOADED, (event, data) => {
                if (data && data.levels) {
                    data.levels.forEach(level => {
                        if (!level.codecs) {
                            level.codecs = 'avc1.64001f,mp4a.40.2';
                        }
                    });
                }
            });

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setTimeout(() => {
                    safePlay(video);
                }, 50);
            });

            let mediaRecoveryAttempts = 0;
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.details === Hls.ErrorDetails.BUFFER_ADD_CODEC_ERROR || data.details === Hls.ErrorDetails.MANIFEST_INCOMPATIBLE_CODECS_ERROR) {
                    console.warn('Codec error: Browser lacks support or configuration.');
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        console.log('Falling back to native Safari HLS playback.');
                        hls.destroy();
                        hlsRef.current = null;
                        video.src = currentChannel;
                        safePlay(video);
                    } else {
                        setPlayError({
                            type: 'codec',
                            message: 'Codec Video Tidak Didukung',
                            details: 'Browser Anda tidak mendukung codec HEVC (H.265) pada stream ini. Silakan gunakan Safari (macOS/iOS) atau gunakan stream alternatif H.264 (AVC).'
                        });
                    }
                } else if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.warn('Fatal network error, attempting to recover...');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            mediaRecoveryAttempts++;
                            if (mediaRecoveryAttempts <= 2) {
                                console.warn(`Fatal media error, attempting to recover (attempt ${mediaRecoveryAttempts})...`);
                                hls.recoverMediaError();
                            } else {
                                console.error('Fatal media error recovery failed multiple times. Giving up.');
                                setPlayError({
                                    type: 'codec',
                                    message: 'Gagal Mendekode Video',
                                    details: 'Browser Anda gagal mendekode segmen video. Ini biasanya disebabkan oleh ketidakcocokan codec HEVC/H.265 pada browser/perangkat Anda.'
                                });
                                hls.destroy();
                            }
                            break;
                        default:
                            console.error('Fatal error, destroying HLS instance:', data);
                            setPlayError({
                                type: 'fatal',
                                message: 'Gagal Memuat Video',
                                details: `Terjadi kesalahan saat memproses media stream (${data.details}).`
                            });
                            hls.destroy();
                            break;
                    }
                }
            });

            hls.attachMedia(video);
            hlsRef.current = hls;

            if (currentChannel) {
                hls.loadSource(currentChannel);
            }
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (currentChannel) {
                video.src = currentChannel;
                const playOnMetadata = () => {
                    setTimeout(() => {
                        safePlay(video);
                    }, 50);
                };
                video.addEventListener('loadedmetadata', playOnMetadata, { once: true });
            }
        }
    }, [currentChannel, isYoutube, isFlv, isGenericIframe, isMp4, isMpd, reloadKey]);

    useEffect(() => {
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }

            if (flvRef.current) {
                flvRef.current.pause(); flvRef.current.unload(); flvRef.current.detachMediaElement(); flvRef.current.destroy();
                flvRef.current = null;
            }

            if (dashRef.current) {
                dashRef.current.destroy();
                dashRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (process.env.NODE_ENV === 'development' && isGenericIframe && genericIframeUrl) {
            if (openedUrlRef.current !== genericIframeUrl) {
                openedUrlRef.current = genericIframeUrl;
                try {
                    window.open(genericIframeUrl, '_blank');
                } catch (e) {
                    console.error('Failed to auto-open tab:', e);
                }
            }
        }
    }, [isGenericIframe, genericIframeUrl]);

    if (isYoutube && youtubeId) {
        return (
            <iframe
                key={`yt-${streamStartTime}-${youtubeId}`}
                className={styles.video}
                src={youtubeSrc}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 'none', display: 'block', pointerEvents: 'auto' }}
            ></iframe>
        );
    } else if (isGenericIframe && genericIframeUrl) {
        if (process.env.NODE_ENV === 'development') {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    width: '100%',
                    backgroundColor: '#111',
                    color: '#fff',
                    gap: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    border: '1px dashed #ef4444',
                    borderRadius: '8px'
                }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#ef4444' }}>
                        ⚠️ [Dev Mode] Proteksi Debugger Freeze Aktif
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#aaa', maxWidth: '80%' }}>
                        Link iframe ini (<strong>{genericIframeUrl}</strong>) memiliki skrip anti-devtools yang dapat membekukan console local Anda. Link telah dibuka otomatis di tab baru.
                    </p>
                    <a
                        href={genericIframeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#ef4444',
                            color: '#fff',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            marginTop: '5px'
                        }}
                    >
                        Buka Ulang di Tab Baru
                    </a>
                </div>
            );
        }

        return (
            <iframe
                key={`iframe-${streamStartTime}`}
                className={styles.video}
                src={genericIframeUrl}
                frameBorder="0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 'none', display: 'block', pointerEvents: 'auto' }}
            ></iframe>
        );
    } else if (isMp4) {
        return (
            <video
                key={`mp4-${streamStartTime}-${mp4Url}`}
                className={styles.video}
                src={mp4Url}
                controls
                autoPlay
                playsInline
                muted={isMuted}
            ></video>
        );
    } else {
        return (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <style>{`
                    @keyframes blink {
                        0% { opacity: 0.5; }
                        50% { opacity: 1; }
                        100% { opacity: 0.5; }
                    }
                `}</style>
                <video
                    ref={videoRef}
                    className={styles.video}
                    controls
                    autoPlay
                    playsInline
                    muted={isMuted}
                    onPlay={(e) => handleVideoPlay(e, hlsRef.current)}
                ></video>
                {showCatchUp && !playError && (
                    <button
                        onClick={catchUpLive}
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            zIndex: 10,
                            backgroundColor: 'rgba(239, 68, 68, 0.85)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            transition: 'all 0.2s',
                            backdropFilter: 'blur(4px)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}
                    >
                        <span style={{
                            display: 'inline-block',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            animation: 'blink 1.5s infinite'
                        }}></span>
                        Kejar Live 🔴
                    </button>
                )}
                {playError && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#151515',
                        color: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 20,
                        padding: '24px',
                        boxSizing: 'border-box',
                        textAlign: 'center',
                        fontFamily: "'Roboto', 'Inter', sans-serif"
                    }}>
                        <div style={{
                            fontSize: '48px',
                            marginBottom: '12px',
                            animation: 'blink 2s infinite'
                        }}>
                            ⚠️
                        </div>
                        <h3 style={{
                            margin: '0 0 8px 0',
                            fontSize: '20px',
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            color: '#FF00FF',
                            letterSpacing: '0.5px'
                        }}>
                            {playError.message}
                        </h3>
                        <p style={{
                            margin: '0 0 16px 0',
                            fontSize: '13px',
                            color: '#ccc',
                            maxWidth: '480px',
                            lineHeight: '1.6'
                        }}>
                            {playError.details}
                        </p>
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            marginTop: '8px'
                        }}>
                            <button
                                onClick={() => {
                                    setPlayError(null);
                                    setReloadKey(prev => prev + 1);
                                }}
                                style={{
                                    backgroundColor: '#D9FF00',
                                    color: '#000',
                                    border: '3px solid #000',
                                    padding: '8px 16px',
                                    fontSize: '12px',
                                    fontWeight: '900',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    boxShadow: '4px 4px 0px #000',
                                    transition: 'all 0.1s active'
                                }}
                            >
                                Coba Lagi 🔄
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
