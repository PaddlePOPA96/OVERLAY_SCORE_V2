import React, { useEffect, useRef, useMemo } from 'react';

import Hls from 'hls.js';

import styles from '../streams.module.css';

export default function StreamPlayer({ currentChannel, streamStartTime, streamSyncVod, isMuted = true }) {
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const flvRef = useRef(null);

    let isYoutube = false;
    let youtubeId = '';
    let isGenericIframe = false;
    let genericIframeUrl = '';
    let isFlv = false;
    let isMp4 = false;
    let mp4Url = '';

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
        if (!isFlv || !currentChannel) {
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

        import('mpegts.js/dist/mpegts.js').then((mpegtsModule) => {
            const mpegts = mpegtsModule.default || mpegtsModule;

            if (cancelled) return;

            if (!mpegts.isSupported()) { console.warn('mpegts.js is not supported in this browser'); 

return; }

            if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

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
                enableWorker: false,
                enableStashBuffer: false,
                stashInitialSize: 128,
                lazyLoad: false,
                lazyLoadMaxDuration: 3 * 60,
                autoCleanupSourceBuffer: true,
                autoCleanupMaxBackwardDuration: 3 * 60,
                autoCleanupMinBackwardDuration: 2 * 60,
            });

            flvPlayer.attachMediaElement(video);
            flvPlayer.load();
            setTimeout(() => {
                video.play().catch((err) => console.log('FLV Autoplay blocked:', err));
            }, 500);

            flvPlayer.on(mpegts.Events.ERROR, (errorType, errorDetail, errorInfo) => {
                console.error('FLV Error:', errorType, errorDetail, errorInfo);
            });

            flvRef.current = flvPlayer;
        }).catch((err) => console.error('Failed to load mpegts.js:', err));

        return () => { cancelled = true; };
    }, [currentChannel, isFlv]);

    useEffect(() => {
        if (isYoutube || isGenericIframe || isFlv || isMp4) {
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

        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90,
                liveSyncDurationCount: 3,
                liveMaxLatencyDurationCount: 6,
                maxBufferLength: 30,
            });

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setTimeout(() => {
                    video.play().catch((err) => console.log('Autoplay blocked:', err));
                }, 500);
            });

            hls.attachMedia(video);
            hlsRef.current = hls;

            if (currentChannel) {
                hls.loadSource(currentChannel);
            }
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (currentChannel) {
                video.src = currentChannel;
                video.addEventListener('loadedmetadata', () => {
                    setTimeout(() => {
                        video.play().catch((err) => console.log('Autoplay blocked:', err));
                    }, 500);
                });
            }
        }
    }, [currentChannel, isYoutube, isFlv, isGenericIframe, isMp4]);

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
        };
    }, []);

    if (isYoutube && youtubeId) {
        return (
            <iframe
                key={`yt-${streamStartTime}-${youtubeId}`}
                className={styles.video}
                src={youtubeSrc}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 'none', display: 'block', pointerEvents: 'auto' }}
            ></iframe>
        );
    } else if (isGenericIframe && genericIframeUrl) {
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
            <video
                ref={videoRef}
                className={styles.video}
                controls
                autoPlay
                playsInline
                muted={isMuted}
                onPlay={(e) => handleVideoPlay(e, hlsRef.current)}
            ></video>
        );
    }
}
