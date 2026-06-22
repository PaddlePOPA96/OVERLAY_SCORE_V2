'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/db';
import { dbFirestore } from '@/lib/firebase/firestore';
import { ref, onValue, remove } from 'firebase/database';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/components/providers/AuthContext';
import StreamUrlManager from './StreamUrlManager';
import { Paper, Typography, Box, Chip, Switch, FormControlLabel, set } from '@mui/material';

export default function StreamsOperatorSection({ theme }) {
    const isLight = theme === 'light';
    const { user } = useAuth();
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [chats, setChats] = useState([]);
    const [viewersCount, setViewersCount] = useState(0);
    const [isChatDisabled, setIsChatDisabled] = useState(false);

    // Check role
    useEffect(() => {
        if (!user) return;
        const userRef = doc(dbFirestore, 'users', user.uid);
        const unsub = onSnapshot(userRef, snap => {
            const role = snap.exists() ? snap.data().role : 'user';
            setIsSuperAdmin(role === 'superadmin');
        });
        return () => unsub();
    }, [user]);

    // Listen to viewers count & chat disabled state
    useEffect(() => {
        const viewersRef = ref(db, 'stream_viewers');
        const unsubViewers = onValue(viewersRef, (snapshot) => {
            setViewersCount(snapshot.exists() ? snapshot.size : 0);
        });

        const chatDisabledRef = ref(db, 'settings/stream_chat_disabled');
        const unsubChatDisabled = onValue(chatDisabledRef, (snapshot) => {
            setIsChatDisabled(snapshot.exists() ? snapshot.val() : false);
        });

        return () => {
            unsubViewers();
            unsubChatDisabled();
        };
    }, []);

    // Listen to chats
    useEffect(() => {
        const chatRef = ref(db, 'live_streams_chat');
        const unsub = onValue(chatRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const chatList = Object.keys(data).map(key => {
                    const item = data[key];
                    return {
                        id: key,
                        ...item,
                        sortTime: typeof item.timestamp === 'number' ? item.timestamp : Date.now()
                    };
                }).sort((a, b) => b.sortTime - a.sortTime); // newest first for operator

                setChats(chatList.slice(0, 200)); // show up to 200 recent chats
            } else {
                setChats([]);
            }
        });

        return () => unsub();
    }, []);

    const handleDeleteChat = async (chatId) => {
        if (!window.confirm("Yakin ingin menghapus pesan ini?")) return;
        try {
            await remove(ref(db, `live_streams_chat/${chatId}`));
        } catch (err) {
            console.error("Gagal menghapus chat:", err);
            alert("Gagal menghapus chat.");
        }
    };

    const handleToggleChat = async (e) => {
        import('firebase/database').then(({ set }) => {
            set(ref(db, 'settings/stream_chat_disabled'), e.target.checked);
        });
    };

    return (
        <Box display="flex" flexDirection="column" gap={4}>
            {/* 1. Global URL Config */}
            <StreamUrlManager theme={theme} />

            {/* 2. Live Chat Moderation */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    border: '1px solid',
                    borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                    borderRadius: 3,
                    bgcolor: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: isLight ? '#000' : '#fff' }}>
                        Live Chat Moderation
                    </Typography>
                    <Box display="flex" gap={2} alignItems="center">
                        {isSuperAdmin && (
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={isChatDisabled}
                                        onChange={handleToggleChat}
                                        color="error"
                                        size="small"
                                    />
                                }
                                label={<Typography variant="body2" sx={{ color: isLight ? '#444' : '#ccc', fontWeight: 'bold' }}>Disable Chat</Typography>}
                                sx={{ m: 0 }}
                            />
                        )}
                        <Chip 
                            label={`Live Viewers: ${viewersCount}`} 
                            color="error" 
                            variant="filled" 
                            size="medium"
                            sx={{ fontWeight: 'bold' }}
                        />
                    </Box>
                </Box>
                <Typography variant="body2" sx={{ color: isLight ? '#666' : '#aaa', mb: 3 }}>
                    {isSuperAdmin ? "Anda login sebagai Superadmin. Anda dapat memantau dan menghapus chat pengunjung." : "Anda dapat memantau chat secara realtime. Fitur hapus chat hanya untuk Superadmin."}
                </Typography>

                <Box
                    sx={{
                        maxHeight: '500px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        bgcolor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.2)',
                        p: 2,
                        borderRadius: 2
                    }}
                >
                    {chats.length === 0 ? (
                        <Typography variant="body2" sx={{ color: isLight ? '#888' : '#777', textAlign: 'center', my: 4 }}>
                            Belum ada pesan chat.
                        </Typography>
                    ) : (
                        chats.map(chat => (
                            <Box 
                                key={chat.id} 
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'flex-start', 
                                    justifyContent: 'space-between',
                                    p: 1.5,
                                    bgcolor: isLight ? '#fff' : 'rgba(255,255,255,0.05)',
                                    borderRadius: 1.5,
                                    boxShadow: isLight ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                                }}
                            >
                                <Box>
                                    <Typography variant="caption" sx={{ color: isLight ? '#3b82f6' : '#3ea6ff', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                                        {chat.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: isLight ? '#1e293b' : '#f1f1f1', wordBreak: 'break-word' }}>
                                        {chat.message}
                                    </Typography>
                                </Box>
                                {isSuperAdmin && (
                                    <button
                                        onClick={() => handleDeleteChat(chat.id)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '18px'
                                        }}
                                        title="Hapus Pesan"
                                    >
                                        <i className="ri-delete-bin-line"></i>
                                    </button>
                                )}
                            </Box>
                        ))
                    )}
                </Box>
            </Paper>
        </Box>
    );
}
