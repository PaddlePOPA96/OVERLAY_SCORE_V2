'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import styles from './streams.module.css';
import { db } from '@/lib/firebase/db';
import { ref, push, onValue, serverTimestamp } from 'firebase/database';

export default function StreamsPage() {
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const chatEndRef = useRef(null);

    const currentChannel = 'https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/Caze_TV.m3u8';

    const [chats, setChats] = useState([]);
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const loadVideo = (url) => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }

            if (Hls.isSupported()) {
                const hls = new Hls({
                    lowLatencyMode: true,
                    enableWorker: true,
                    backBufferLength: 90
                });
                hlsRef.current = hls;
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    setTimeout(() => {
                        video.play().catch(e => console.log("Autoplay prevented by browser:", e));
                    }, 500);
                });

                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data.fatal) {
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
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                video.addEventListener('loadedmetadata', function () {
                    video.play().catch(e => console.log("Autoplay prevented by browser:", e));
                });
            }
        };

        loadVideo(currentChannel);

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
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
                        <video ref={videoRef} className={styles.video} controls autoPlay playsInline></video>
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
                            chats.map((chat) => (
                                <div key={chat.id} className={styles.chatMessage}>
                                    <span className={styles.chatName}>{chat.name}</span>
                                    <span className={styles.chatText}>{chat.message}</span>
                                </div>
                            ))
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className={styles.chatInputArea}>
                        <form onSubmit={handleSendMessage} className={styles.chatForm}>
                            <div className={styles.inputRow}>
                                <input
                                    type="text"
                                    placeholder="Nama..."
                                    className={styles.nameInput}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    maxLength={20}
                                    required
                                />
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
                            </div>
                            <button
                                type="submit"
                                className={styles.sendBtn}
                                disabled={isSending || cooldown > 0 || !name.trim() || !message.trim()}
                            >
                                {cooldown > 0 ? `${cooldown}s` : 'Kirim'}
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}