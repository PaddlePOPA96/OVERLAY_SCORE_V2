'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import styles from './streams.module.css';
import { db } from '@/lib/firebase/db';
import { ref, push, onValue, serverTimestamp, get, query, orderByChild, equalTo, update } from 'firebase/database';
import RunningTextOverlay from '@/components/ui/RunningTextOverlay';

export default function StreamsPage() {
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const chatEndRef = useRef(null);

    const [chats, setChats] = useState([]);
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [isNameSet, setIsNameSet] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [uid, setUid] = useState(null);
    const [currentChannel, setCurrentChannel] = useState('');

    let isYoutube = false;
    let youtubeId = '';
    
    if (currentChannel) {
        if (currentChannel.includes('youtube.com/watch')) {
            isYoutube = true;
            try {
                youtubeId = new URL(currentChannel).searchParams.get('v');
            } catch (e) {
                // Ignore parsing errors
            }
        } else if (currentChannel.includes('youtu.be/')) {
            isYoutube = true;
            youtubeId = currentChannel.split('youtu.be/')[1]?.split('?')[0];
        } else if (currentChannel.includes('youtube.com/embed/')) {
            isYoutube = true;
            youtubeId = currentChannel.split('youtube.com/embed/')[1]?.split('?')[0];
        }
    }

    useEffect(() => {
        if (isYoutube) return; // Do not initialize HLS for YouTube

        const video = videoRef.current;
        if (!video) return;

        if (Hls.isSupported()) {
            if (!hlsRef.current) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    setTimeout(() => {
                        video.play().catch((err) => console.log('Autoplay blocked:', err));
                    }, 500);
                });
                
                hls.attachMedia(video);
                hlsRef.current = hls;
            }
            
            if (currentChannel) {
                hlsRef.current.loadSource(currentChannel);
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
    }, [currentChannel]);

    useEffect(() => {
        const urlRef = ref(db, 'settings/stream_url');
        const unsub = onValue(urlRef, (snapshot) => {
            if (snapshot.exists()) {
                setCurrentChannel(snapshot.val());
            } else {
                // Default fallback if not set
                setCurrentChannel('https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/Caze_TV.m3u8');
            }
        });
        return () => unsub();
    }, []);

    // Cleanup HLS on unmount
    useEffect(() => {
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
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
        <div className={styles.wrapper}>
            {/* YOUTUBE STYLE NAVBAR */}
            <nav className={styles.navbar}>
                <div className={styles.navLeft}>
                    <button className={styles.menuBtn} aria-label="Menu">
                        <svg viewBox="0 0 24 24" className={styles.navIcon}><path d="M21,6H3V5h18V6z M21,11H3v1h18V11z M21,17H3v1h18V17z" fill="currentColor"></path></svg>
                    </button>
                    <div className={styles.logoContainer}>
                        <span className={styles.logoText}>SCOREBOSS</span>
                        <span className={styles.logoCountry}>ID</span>
                    </div>
                </div>

                <div className={styles.navCenter}>
                    <div className={styles.searchContainer}>
                        <input type="text" placeholder="Telusuri" className={styles.searchBar} disabled />
                        <button className={styles.searchBtn} aria-label="Cari">
                            <svg viewBox="0 0 24 24" className={styles.searchIcon}><path d="M20.87,20.17l-5.59-5.59C16.35,13.35,17,11.75,17,10c0-3.87-3.13-7-7-7S3,6.13,3,10s3.13,7,7,7c1.75,0,3.35-0.65,4.58-1.71 l5.59,5.59L20.87,20.17z M10,16c-3.31,0-6-2.69-6-6s2.69-6,6-6s6,2.69,6,6S13.31,16,10,16z" fill="currentColor"></path></svg>
                        </button>
                    </div>
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

            {/* MAIN LAYOUT */}
            <div className={styles.layout}>

                {/* Bagian Kiri: Video & Judul */}
                <div className={styles.videoSection}>
                    <div className={styles.videoWrapper}>
                        {isYoutube && youtubeId ? (
                            <iframe 
                                className={styles.video} 
                                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`} 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                            ></iframe>
                        ) : (
                            <video ref={videoRef} className={styles.video} controls autoPlay playsInline></video>
                        )}
                    </div>
                    <div className={styles.metaData}>
                        <h1 className={styles.title}>SELAMAT ULANG TAHUN</h1>
                        <div className={styles.badgeLive}>• LIVE</div>
                    </div>
                </div>

                {/* Bagian Kanan: Live Chat */}
                <div className={styles.chatSection}>
                    <div className={styles.chatHeader}>
                        <span>Live Chat</span>
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
                        {!isMounted ? (
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
                                    <span>Chat sebagai: <strong style={{color: '#f1f1f1'}}>{name}</strong></span>
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

            </div>
            {/* Running Text Ticker at the bottom */}
            <RunningTextOverlay isPageMode={true} />
        </div>
    );
}