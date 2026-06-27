import React, { useEffect, useRef, useState } from 'react';
import { db } from '@/services/firebase/db';
import { ref, push, onValue, serverTimestamp, get, query, orderByChild, equalTo, update, onDisconnect, set, remove } from 'firebase/database';
import styles from '../streams.module.css';

export default function ChatPanel({ isChatDisabled }) {
    const chatEndRef = useRef(null);

    const [chats, setChats] = useState([]);
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [isNameSet, setIsNameSet] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [uid, setUid] = useState(null);

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
    );
}
