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

    // Hardcode the channel since they wanted to remove the dropdown
    const currentChannel = 'https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/Caze_TV.m3u8';

    // Chat state
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
                                console.error("Network Error: The link might be down or blocked.");
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

    // Firebase Chat Effect
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
                        // Handle serverTimestamp placeholder
                        sortTime: typeof item.timestamp === 'number' ? item.timestamp : Date.now()
                    };
                }).sort((a, b) => a.sortTime - b.sortTime);
                
                // Limit to last 100 messages locally
                setChats(chatList.slice(-100));
            } else {
                setChats([]);
            }
        });

        return () => unsubscribe();
    }, []);

    // Scroll to bottom when chats update
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chats]);

    // Cooldown timer effect
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
            setCooldown(30); // 30 seconds delay
        } catch (error) {
            console.error("Failed to send message", error);
            alert("Gagal mengirim pesan: " + error.message);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.layout}>
                {/* Main Video Section */}
                <div className={styles.videoSection}>
                    <div className={styles.videoWrapper}>
                        <video ref={videoRef} className={styles.video} controls autoPlay playsInline></video>
                    </div>
                    <h2 className={styles.title}>CazéTV Live Hub</h2>
                </div>

                {/* Right Chat Section */}
                <div className={styles.chatSection}>
                    <div className={styles.chatHeader}>
                        Live Chat
                    </div>
                    
                    <div className={styles.chatMessages}>
                        {chats.length === 0 ? (
                            <div style={{ color: '#64748b', textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
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
                            <input 
                                type="text" 
                                placeholder="Nama Anda" 
                                className={styles.inputField}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={20}
                                required
                            />
                            <input 
                                type="text" 
                                placeholder="Ketik pesan..." 
                                className={styles.inputField}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                maxLength={200}
                                required
                                autoComplete="off"
                            />
                            <button 
                                type="submit" 
                                className={styles.sendBtn}
                                disabled={isSending || cooldown > 0 || !name.trim() || !message.trim()}
                            >
                                {cooldown > 0 ? `Tunggu ${cooldown} detik...` : 'Kirim Pesan'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
