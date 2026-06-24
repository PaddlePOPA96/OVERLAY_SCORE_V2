'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import styles from './streams.module.css';
import { db } from '@/services/firebase/db';
import { ref, push, onValue, serverTimestamp, get, query, orderByChild, equalTo, update, onDisconnect, set, remove } from 'firebase/database';
import RunningTextOverlay from '@/shared/components/ui/RunningTextOverlay';

export default function StreamsPage() {
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const hlsRef2 = useRef(null);
    const videoRef2 = useRef(null);
    const chatEndRef = useRef(null);

    const [chats, setChats] = useState([]);
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isMinimal, setIsMinimal] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.search.includes('minimal=true')) {
            setIsMinimal(true);
        }
    }, []);
    const [cooldown, setCooldown] = useState(0);
    const [isNameSet, setIsNameSet] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [uid, setUid] = useState(null);
    const [currentChannel, setCurrentChannel] = useState('');
    const [rawUrl, setRawUrl] = useState('');
    const [rawUrl2, setRawUrl2] = useState('');
    const [streamToken2, setStreamToken2] = useState('');
    const [currentChannel2, setCurrentChannel2] = useState('');
    const [multiMode, setMultiMode] = useState(false);
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [leftWidth, setLeftWidth] = useState(50);
    const [streamToken, setStreamToken] = useState('');
    const [streamStartTime, setStreamStartTime] = useState(0);
    const [streamSyncVod, setStreamSyncVod] = useState(false);
    const [streamUseProxy, setStreamUseProxy] = useState(false);
    const [streamTitle, setStreamTitle] = useState('SELAMAT ULANG TAHUN');
    const [streamTitle2, setStreamTitle2] = useState('SELAMAT ULANG TAHUN');
    const [streamHeader, setStreamHeader] = useState('HUITOTOO');
    const [streamHeaderCountry, setStreamHeaderCountry] = useState('ID');
    const [isChatDisabled, setIsChatDisabled] = useState(false);

    let isYoutube = false;
    let youtubeId = '';
    let isGenericIframe = false;
    let genericIframeUrl = '';

    if (currentChannel) {
        // Resolve proxy path if any to check for YouTube
        const decodedChannel = currentChannel.includes('/api/stream.m3u8?u=')
            ? Buffer.from(new URLSearchParams(currentChannel.split('?')[1]).get('u'), 'base64').toString('utf-8')
            : currentChannel;

        if (decodedChannel.includes('youtube.com/watch')) {
            isYoutube = true;
            try {
                youtubeId = new URL(decodedChannel).searchParams.get('v');
            } catch (e) {
                // Ignore parsing errors
            }
        } else if (decodedChannel.includes('youtu.be/')) {
            isYoutube = true;
            youtubeId = decodedChannel.split('youtu.be/')[1]?.split('?')[0];
        } else if (decodedChannel.includes('youtube.com/embed/')) {
            isYoutube = true;
            youtubeId = decodedChannel.split('youtube.com/embed/')[1]?.split('?')[0];
        } else if (!decodedChannel.includes('.m3u8') && !decodedChannel.includes('.mp4') && !decodedChannel.includes('.ts')) {
            isGenericIframe = true;
            genericIframeUrl = decodedChannel;
        }
    }

    let isYoutube2 = false;
    let youtubeId2 = '';
    let isGenericIframe2 = false;
    let genericIframeUrl2 = '';

    if (currentChannel2) {
        const decodedChannel2 = currentChannel2.includes('/api/stream.m3u8?u=')
            ? Buffer.from(new URLSearchParams(currentChannel2.split('?')[1]).get('u'), 'base64').toString('utf-8')
            : currentChannel2;

        if (decodedChannel2.includes('youtube.com/watch')) {
            isYoutube2 = true;
            try { youtubeId2 = new URL(decodedChannel2).searchParams.get('v'); } catch (e) { }
        } else if (decodedChannel2.includes('youtu.be/')) {
            isYoutube2 = true;
            youtubeId2 = decodedChannel2.split('youtu.be/')[1]?.split('?')[0];
        } else if (decodedChannel2.includes('youtube.com/embed/')) {
            isYoutube2 = true;
            youtubeId2 = decodedChannel2.split('youtube.com/embed/')[1]?.split('?')[0];
        } else if (!decodedChannel2.includes('.m3u8') && !decodedChannel2.includes('.mp4') && !decodedChannel2.includes('.ts')) {
            isGenericIframe2 = true;
            genericIframeUrl2 = decodedChannel2;
        }
    }

    const youtubeSrc2 = React.useMemo(() => {
        if (!isYoutube2 || !youtubeId2) return '';
        let url = `https://www.youtube.com/embed/${youtubeId2}?autoplay=1&controls=1&mute=1&playsinline=1&rel=0&showinfo=0`;
        if (streamSyncVod && streamStartTime > 0) {
            const offset = Math.max(0, Math.floor((Date.now() - streamStartTime) / 1000));
            url += `&start=${offset}`;
        }
        return url;
    }, [isYoutube2, youtubeId2, streamStartTime, streamSyncVod]);

    const youtubeSrc = React.useMemo(() => {
        if (!isYoutube || !youtubeId) return '';
        let url = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&controls=1&mute=0&playsinline=1&rel=0&showinfo=0`;
        if (streamSyncVod && streamStartTime > 0) {
            const offset = Math.max(0, Math.floor((Date.now() - streamStartTime) / 1000));
            url += `&start=${offset}`;
        }
        return url;
    }, [isYoutube, youtubeId, streamStartTime, streamSyncVod]);

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!isDragging || !containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            if (window.innerWidth <= 1000) return;
            let newLeft = ((e.clientX - containerRect.left) / containerRect.width) * 100;
            if (newLeft < 15) newLeft = 15;
            if (newLeft > 85) newLeft = 85;
            setLeftWidth(newLeft);
        };
        const onTouchMove = (e) => {
            if (!isDragging || !containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            if (window.innerWidth <= 1000) return;
            let newLeft = ((e.touches[0].clientX - containerRect.left) / containerRect.width) * 100;
            if (newLeft < 15) newLeft = 15;
            if (newLeft > 85) newLeft = 85;
            setLeftWidth(newLeft);
        };
        const onMouseUp = () => setIsDragging(false);

        if (isDragging) {
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.addEventListener('touchmove', onTouchMove, { passive: false });
            document.addEventListener('touchend', onMouseUp);
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onMouseUp);
            document.body.style.userSelect = '';
        };
    }, [isDragging]);

    // Pastikan video selalu lompat ke LIVE edge saat di-play (setelah di-pause)
    const handleVideoPlay = (e, hlsInstance) => {
        const video = e.target;
        // Gunakan hls.liveSyncPosition jika ada (hls.js)
        if (hlsInstance && hlsInstance.liveSyncPosition) {
            if (hlsInstance.liveSyncPosition > video.currentTime + 3) {
                video.currentTime = hlsInstance.liveSyncPosition;
            }
        }
        // Fallback untuk native player (Safari iOS)
        else if (video.seekable && video.seekable.length > 0) {
            const liveEdge = video.seekable.end(video.seekable.length - 1);
            if (liveEdge > video.currentTime + 3) {
                video.currentTime = liveEdge;
            }
        }
    };

    useEffect(() => {
        if (isYoutube || isGenericIframe) {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            return;
        }

        const video = videoRef.current;
        if (!video) return;

        // Selalu bersihkan instance lama karena tag <video> mungkin baru saja dimount ulang
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false, // Dinonaktifkan untuk mencegah stream patah-patah
                backBufferLength: 90,
                liveSyncDurationCount: 3, // Menjaga jarak dari live edge (buffer lebih aman)
                liveMaxLatencyDurationCount: 6, // Jika telat 6 segmen, otomatis jump ke LIVE
                maxBufferLength: 30, // Menyimpan buffer ke depan yang lebih banyak
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
    }, [currentChannel, isYoutube]);


    useEffect(() => {
        if (isYoutube2 || isGenericIframe2) {
            if (hlsRef2.current) { hlsRef2.current.destroy(); hlsRef2.current = null; }
            return;
        }
        const video = videoRef2.current;
        if (!video) return;
        if (hlsRef2.current) { hlsRef2.current.destroy(); hlsRef2.current = null; }

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
                setTimeout(() => { video.play().catch((err) => console.log('Autoplay blocked:', err)); }, 500);
            });
            hls.attachMedia(video);
            hlsRef2.current = hls;
            if (currentChannel2) hls.loadSource(currentChannel2);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (currentChannel2) {
                video.src = currentChannel2;
                video.addEventListener('loadedmetadata', () => {
                    setTimeout(() => { video.play().catch((err) => console.log('Autoplay blocked:', err)); }, 500);
                });
            }
        }
    }, [currentChannel2, isYoutube2]);

    useEffect(() => {
        const urlRef = ref(db, 'settings/stream_url');
        const unsubUrl = onValue(urlRef, (snapshot) => {
            if (snapshot.exists()) {
                setRawUrl(snapshot.val());
            } else {
                setRawUrl('https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/Caze_TV.m3u8');
            }
        });

        const tokenRef = ref(db, 'settings/stream_token');
        const unsubToken = onValue(tokenRef, (snapshot) => {
            if (snapshot.exists()) {
                setStreamToken(snapshot.val());
            } else {
                setStreamToken('');
            }
        });

        const startTimeRef = ref(db, 'settings/stream_start_time');
        const unsubStartTime = onValue(startTimeRef, (snapshot) => {
            if (snapshot.exists()) {
                setStreamStartTime(snapshot.val());
            } else {
                setStreamStartTime(Date.now());
            }
        });

        const syncRef = ref(db, 'settings/stream_sync_vod');
        const unsubSync = onValue(syncRef, (snapshot) => {
            if (snapshot.exists()) {
                setStreamSyncVod(snapshot.val());
            } else {
                setStreamSyncVod(false);
            }
        });

        const proxyRef = ref(db, 'settings/stream_use_proxy');
        const unsubProxy = onValue(proxyRef, (snapshot) => {
            if (snapshot.exists()) {
                setStreamUseProxy(snapshot.val());
            } else {
                setStreamUseProxy(false);
            }
        });

        const titleRef = ref(db, 'settings/stream_title');

        const title2Ref = ref(db, 'settings/stream_title_2');
        const unsubTitle2 = onValue(title2Ref, (snapshot) => {
            if (snapshot.exists()) setStreamTitle2(snapshot.val());
        });

        const unsubTitle = onValue(titleRef, (snapshot) => {
            if (snapshot.exists()) setStreamTitle(snapshot.val());
        });

        const headerRef = ref(db, 'settings/stream_header');
        const unsubHeader = onValue(headerRef, (snapshot) => {
            if (snapshot.exists()) setStreamHeader(snapshot.val());
        });

        const headerCountryRef = ref(db, 'settings/stream_header_country');
        const unsubHeaderCountry = onValue(headerCountryRef, (snapshot) => {
            if (snapshot.exists()) setStreamHeaderCountry(snapshot.val());
        });

        const multiModeRef = ref(db, 'settings/stream_multi_mode');
        const unsubMultiMode = onValue(multiModeRef, (snapshot) => { setMultiMode(snapshot.exists() ? snapshot.val() : false); });

        const url2Ref = ref(db, 'settings/stream_url_2');
        const unsubUrl2 = onValue(url2Ref, (snapshot) => { setRawUrl2(snapshot.exists() ? snapshot.val() : ''); });

        const token2Ref = ref(db, 'settings/stream_token_2');
        const unsubToken2 = onValue(token2Ref, (snapshot) => { setStreamToken2(snapshot.exists() ? snapshot.val() : ''); });

        const chatDisabledRef = ref(db, 'settings/stream_chat_disabled');
        const unsubChatDisabled = onValue(chatDisabledRef, (snapshot) => {
            setIsChatDisabled(snapshot.exists() ? snapshot.val() : false);
        });

        return () => {
            unsubUrl();
            unsubToken();
            unsubStartTime();
            unsubSync();
            unsubProxy();
            unsubTitle();
            unsubTitle2();
            unsubHeader();
            unsubHeaderCountry();
            unsubChatDisabled();
            unsubMultiMode();
            unsubUrl2();
            unsubToken2();
        };
    }, []);

    useEffect(() => {
        const resolveUrl = async () => {
            if (rawUrl) {
                let finalUrl = rawUrl;

                if (finalUrl.includes('falconstreams.net')) {
                    try {
                        const res = await fetch(`/api/resolve-stream?url=${encodeURIComponent(finalUrl)}`);
                        const data = await res.json();
                        if (data.url) finalUrl = data.url;
                    } catch (e) {
                        console.error('Failed to resolve falconstreams', e);
                    }
                }

                if (streamToken) {
                    finalUrl = finalUrl.replace(/{token}/gi, streamToken)
                        .replace(/\[token\]/gi, streamToken);
                }

                // Apply proxy if enabled, but exclude known iframe domains to prevent CORS/proxy breakage
                if (streamUseProxy && !finalUrl.includes('youtube.com') && !finalUrl.includes('youtu.be') && !finalUrl.includes('trendy47.club') && !finalUrl.includes('statusnode.is') && !finalUrl.includes('.html')) {
                    const encodedUrl = Buffer.from(finalUrl).toString('base64');
                    finalUrl = `/api/stream.m3u8?u=${encodedUrl}`;
                }

                setCurrentChannel(finalUrl);
            }
        };
        resolveUrl();
    }, [rawUrl, streamToken, streamUseProxy]);

    useEffect(() => {
        const resolveUrl2 = async () => {
            if (rawUrl2) {
                let finalUrl = rawUrl2;

                if (finalUrl.includes('falconstreams.net')) {
                    try {
                        const res = await fetch(`/api/resolve-stream?url=${encodeURIComponent(finalUrl)}`);
                        const data = await res.json();
                        if (data.url) finalUrl = data.url;
                    } catch (e) {
                        console.error('Failed to resolve falconstreams', e);
                    }
                }

                if (streamToken2) {
                    finalUrl = finalUrl.replace(/{token}/gi, streamToken2).replace(/\[token\]/gi, streamToken2);
                }
                
                if (streamUseProxy && !finalUrl.includes('youtube.com') && !finalUrl.includes('youtu.be') && !finalUrl.includes('trendy47.club') && !finalUrl.includes('statusnode.is') && !finalUrl.includes('.html')) {
                    const encodedUrl = Buffer.from(finalUrl).toString('base64');
                    finalUrl = `/api/stream.m3u8?u=${encodedUrl}`;
                }
                setCurrentChannel2(finalUrl);
            } else {
                setCurrentChannel2('');
            }
        };
        resolveUrl2();
    }, [rawUrl2, streamToken2, streamUseProxy]);

    // Cleanup HLS on unmount
    useEffect(() => {
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            if (hlsRef2.current) {
                hlsRef2.current.destroy();
                hlsRef2.current = null;
            }
        };
    }, []);

    // Load saved name and uid from local storage to avoid hydration mismatch
    useEffect(() => {
        setIsMounted(true);
        const savedName = localStorage.getItem('chat_username');
        if (savedName) {
            setName(savedName);
            setIsNameSet(true);
        }

        let savedUid = localStorage.getItem('chat_uid');
        if (!savedUid) {
            savedUid = 'uid_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
            localStorage.setItem('chat_uid', savedUid);
        }
        setUid(savedUid);
    }, []);

    useEffect(() => {
        const chatRef = ref(db, 'live_streams_chat');
        const unsubscribe = onValue(chatRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const chatList = Object.keys(data).map(key => {
                    const item = data[key];
                    return {
                        id: key,
                        ...item,
                        sortTime: typeof item.timestamp === 'number' ? item.timestamp : Date.now()
                    };
                }).sort((a, b) => a.sortTime - b.sortTime);

                setChats(chatList.slice(-100));
            } else {
                setChats([]);
            }
        });

        return () => unsubscribe();
    }, []);

    // Presence tracking for Live Viewers count
    useEffect(() => {
        if (!uid) return;
        const connectedRef = ref(db, '.info/connected');
        const userStatusRef = ref(db, `stream_viewers/${uid}`);

        const unsub = onValue(connectedRef, (snap) => {
            if (snap.val() === true) {
                onDisconnect(userStatusRef).remove().then(() => {
                    set(userStatusRef, true).catch(err => {
                        console.error("Firebase Presence Error: Kemungkinan Firebase Rules belum diizinkan untuk 'stream_viewers'. Error:", err);
                    });
                });
            }
        });

        return () => {
            unsub();
            remove(userStatusRef).catch(console.error);
        };
    }, [uid]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chats]);

    useEffect(() => {
        let timer = null;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [cooldown]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!name.trim() || !message.trim() || cooldown > 0) return;

        setIsSending(true);
        try {
            const chatRef = ref(db, 'live_streams_chat');
            await push(chatRef, {
                uid: uid,
                name: name.trim(),
                message: message.trim(),
                timestamp: serverTimestamp()
            });
            setMessage('');
            setCooldown(30);
        } catch (error) {
            console.error("Failed to send message", error);
            alert("Gagal mengirim pesan: " + error.message);
        } finally {
            setIsSending(false);
        }
    };

    const handleSaveName = async (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (trimmed) {
            localStorage.setItem('chat_username', trimmed);
            setName(trimmed);
            setIsNameSet(true);

            // Update all past messages with this UID to the new name
            if (uid) {
                const chatRef = ref(db, 'live_streams_chat');
                const q = query(chatRef, orderByChild('uid'), equalTo(uid));
                try {
                    const snapshot = await get(q);
                    if (snapshot.exists()) {
                        const updates = {};
                        snapshot.forEach((childSnapshot) => {
                            updates[childSnapshot.key + '/name'] = trimmed;
                        });
                        await update(chatRef, updates);
                    }
                } catch (err) {
                    console.error("Failed to update previous names:", err);
                }
            }
        }
    };

    return (
        <div
            className={styles.wrapper}
            style={isMinimal ? { padding: 0, minHeight: '100%', height: '100vh', overflow: 'hidden' } : {}}
        >
            {/* YOUTUBE STYLE NAVBAR */}
            {!isMinimal && (
                <nav className={styles.navbar}>
                    <div className={styles.navLeft}>
                        <button className={styles.menuBtn} aria-label="Menu">
                            <svg viewBox="0 0 24 24" className={styles.navIcon}><path d="M21,6H3V5h18V6z M21,11H3v1h18V11z M21,17H3v1h18V17z" fill="currentColor"></path></svg>
                        </button>
                        <div className={styles.logoContainer}>
                            <span className={styles.logoText}>{streamHeader}</span>
                            <span className={styles.logoCountry}>{streamHeaderCountry}</span>
                        </div>
                    </div>

                    <div className={styles.navCenter}>
                        {multiMode ? (
                            <div style={{ display: 'flex', gap: '8px', background: '#121212', padding: '4px 8px', borderRadius: '20px', border: '1px solid #303030' }}>
                                <button
                                    onClick={() => setLeftWidth(75)}
                                    style={{ background: leftWidth > 60 ? '#3ea6ff' : 'transparent', color: leftWidth > 60 ? '#0f0f0f' : '#f1f1f1', border: 'none', borderRadius: '16px', padding: '6px 16px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                                >Besar Kiri</button>
                                <button
                                    onClick={() => setLeftWidth(50)}
                                    style={{ background: leftWidth > 40 && leftWidth < 60 ? '#3ea6ff' : 'transparent', color: leftWidth > 40 && leftWidth < 60 ? '#0f0f0f' : '#f1f1f1', border: 'none', borderRadius: '16px', padding: '6px 16px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                                >50 : 50</button>
                                <button
                                    onClick={() => setLeftWidth(25)}
                                    style={{ background: leftWidth < 40 ? '#3ea6ff' : 'transparent', color: leftWidth < 40 ? '#0f0f0f' : '#f1f1f1', border: 'none', borderRadius: '16px', padding: '6px 16px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                                >Besar Kanan</button>
                            </div>
                        ) : (
                            <div className={styles.searchContainer}>
                                <input type="text" placeholder="Telusuri" className={styles.searchBar} disabled />
                                <button className={styles.searchBtn} aria-label="Cari">
                                    <svg viewBox="0 0 24 24" className={styles.searchIcon}><path d="M20.87,20.17l-5.59-5.59C16.35,13.35,17,11.75,17,10c0-3.87-3.13-7-7-7S3,6.13,3,10s3.13,7,7,7c1.75,0,3.35-0.65,4.58-1.71 l5.59,5.59L20.87,20.17z M10,16c-3.31,0-6-2.69-6-6s2.69-6,6-6s6,2.69,6,6S13.31,16,10,16z" fill="currentColor"></path></svg>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={styles.navRight}>
                        <button className={styles.navActionBtn}>
                            <svg viewBox="0 0 24 24" className={styles.navIcon}><path d="M14,13h-3v3H9v-3H6v-2h3V8h2v3h3V13z M17,6H3v12h14V6z M18,5v14H2V5H18z M22,8.5l-3,2.5v2l3,2.5V8.5z" fill="currentColor"></path></svg>
                        </button>
                        <button className={styles.navActionBtn}>
                            <svg viewBox="0 0 24 24" className={styles.navIcon}><path d="M10,20h4c0,1.1-0.9,2-2,2S10,21.1,10,20z M20,17.35V19H4v-1.65l2-1.88V10.2c0-2.92,1.56-5.36,4.28-6.01C10.45,4.07,10.5,3.92,10.5,3.7c0-0.94,0.67-1.7,1.5-1.7s1.5,0.76,1.5,1.7c0,0.22,0.05,0.37,0.22,0.49C16.44,4.84,18,7.28,18,10.2v5.27L20,17.35z M17,10.5c0-2.76-1.92-5-4.5-5S8,7.74,8,10.5v5.7h9V10.5z" fill="currentColor"></path></svg>
                        </button>
                        <div className={styles.userAvatar}>S</div>
                    </div>
                </nav>
            )}

            {/* MAIN LAYOUT */}
            <div
                className={`${styles.layout} ${isDragging ? styles.dragging : ''}`}
                ref={containerRef}
                style={{
                    ...(multiMode ? { gap: 0 } : {}),
                    ...(isMinimal ? { paddingTop: 0, paddingBottom: 0, height: '100vh', marginTop: 0, alignItems: 'stretch' } : {})
                }}
            >

                {/* Bagian Kiri: Video & Judul */}
                <div className={`${styles.videoSection} ${multiMode ? styles.resizableLeft : ''}`} style={multiMode ? { flex: `0 0 ${leftWidth}%`, paddingRight: '12px' } : {}}>
                    <div className={styles.videoWrapper} style={isMinimal ? { paddingTop: 0, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' } : {}}>
                        {isYoutube && youtubeId ? (
                            <iframe
                                key={`yt-${streamStartTime}-${youtubeId}`}
                                className={styles.video}
                                src={youtubeSrc}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ width: '100%', height: '100%', border: 'none', display: 'block', pointerEvents: 'auto' }}
                            ></iframe>
                        ) : isGenericIframe && genericIframeUrl ? (
                            <iframe
                                key={`iframe-${streamStartTime}`}
                                className={styles.video}
                                src={genericIframeUrl}
                                frameBorder="0"
                                allow="autoplay; encrypted-media; fullscreen"
                                allowFullScreen
                                style={{ width: '100%', height: '100%', border: 'none', display: 'block', pointerEvents: 'auto' }}
                            ></iframe>
                        ) : (
                            <video
                                ref={videoRef}
                                className={styles.video}
                                controls
                                autoPlay
                                playsInline
                                onPlay={(e) => handleVideoPlay(e, hlsRef.current)}
                            ></video>
                        )}
                    </div>

                </div>

                {multiMode && (
                    <div
                        className={styles.splitter}
                        onMouseDown={() => setIsDragging(true)}
                        onTouchStart={() => setIsDragging(true)}
                    >
                        <div className={styles.splitterHandle}></div>
                    </div>
                )}

                {multiMode && (
                    <div className={`${styles.videoSection} ${styles.resizableRight}`} style={{ flex: '1', paddingLeft: '12px', minWidth: 0 }}>
                        <div className={styles.videoWrapper} style={isMinimal ? { paddingTop: 0, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' } : {}}>
                            {isYoutube2 && youtubeId2 ? (
                                <iframe
                                    key={`yt2-${streamStartTime}-${youtubeId2}`}
                                    className={styles.video}
                                    src={youtubeSrc2}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={{ width: '100%', height: '100%', border: 'none', display: 'block', pointerEvents: 'auto' }}
                                ></iframe>
                            ) : isGenericIframe2 && genericIframeUrl2 ? (
                                <iframe
                                    key={`iframe2-${streamStartTime}`}
                                    className={styles.video}
                                    src={genericIframeUrl2}
                                    frameBorder="0"
                                    allow="autoplay; encrypted-media; fullscreen"
                                    allowFullScreen
                                    style={{ width: '100%', height: '100%', border: 'none', display: 'block', pointerEvents: 'auto' }}
                                ></iframe>
                            ) : (
                                <video
                                    ref={videoRef2}
                                    className={styles.video}
                                    controls
                                    autoPlay
                                    playsInline
                                    muted
                                    onPlay={(e) => handleVideoPlay(e, hlsRef2.current)}
                                ></video>
                            )}
                        </div>
                        {!isMinimal && (
                            <div className={styles.metaData}>
                                <h1 className={styles.title}>{streamTitle2}</h1>
                                <div className={styles.channelInfo}>
                                    <div className={styles.channelAvatar}>C</div>
                                    <div className={styles.channelText}>
                                        <h2>Channel Dua</h2>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Bagian Kanan: Live Chat */}
                {!multiMode && !isMinimal && (
                    <div className={styles.chatSection}>
                        <div className={styles.chatHeader}>
                            Top chat <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 14.5l-6-6h12z" fill="currentColor"></path></svg>
                        </div>

                        <div className={styles.chatMessages}>
                            {chats.length === 0 ? (
                                <div className={styles.emptyChat}>
                                    Belum ada pesan. Mulai obrolan!
                                </div>
                            ) : (
                                chats.map((chat) => {
                                    const isMe = chat.uid === uid;
                                    return (
                                        <div
                                            key={chat.id}
                                            className={styles.chatMessage}
                                            style={isMe ? { backgroundColor: 'rgba(62, 166, 255, 0.1)', padding: '6px 8px', borderRadius: '6px' } : {}}
                                        >
                                            <span
                                                className={styles.chatName}
                                                style={isMe ? { color: '#3ea6ff' } : {}}
                                            >
                                                {chat.name}
                                            </span>
                                            <span className={styles.chatText}>{chat.message}</span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <div className={styles.chatInputArea}>
                            {isChatDisabled ? (
                                <div style={{ padding: '16px', textAlign: 'center', color: '#ff6b6b', fontSize: '13px', background: 'rgba(255, 0, 0, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 0, 0, 0.2)' }}>
                                    Fitur Live Chat sedang dinonaktifkan.
                                </div>
                            ) : !isMounted ? (
                                <div style={{ height: '50px' }}></div>
                            ) : !isNameSet ? (
                                <form onSubmit={handleSaveName} className={styles.chatForm}>
                                    <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '4px' }}>Masukkan nama untuk mulai chat:</div>
                                    <div className={styles.inputRow}>
                                        <input
                                            type="text"
                                            placeholder="Ketik nama kamu..."
                                            className={styles.messageInput}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            maxLength={20}
                                            required
                                            autoFocus
                                        />
                                        <button
                                            type="submit"
                                            className={styles.sendBtn}
                                            disabled={!name.trim()}
                                        >
                                            Simpan
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleSendMessage} className={styles.chatForm}>
                                    <div style={{ fontSize: '12px', color: '#aaa', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span>Chat sebagai: <strong style={{ color: '#f1f1f1' }}>{name}</strong></span>
                                        <span style={{ cursor: 'pointer', color: '#3ea6ff' }} onClick={() => setIsNameSet(false)}>Ubah</span>
                                    </div>
                                    <div className={styles.inputRow}>
                                        <input
                                            type="text"
                                            placeholder="Ketik pesan di sini..."
                                            className={styles.messageInput}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            maxLength={200}
                                            required
                                            autoComplete="off"
                                        />
                                        <button
                                            type="submit"
                                            className={styles.sendBtn}
                                            disabled={isSending || cooldown > 0 || !message.trim()}
                                        >
                                            {cooldown > 0 ? `${cooldown}s` : 'Kirim'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}

            </div>
            {/* Running Text Ticker at the bottom */}
            {!isMinimal && <RunningTextOverlay isPageMode={true} />}
        </div>
    );
}