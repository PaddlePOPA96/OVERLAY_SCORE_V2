'use client'

import React, { useEffect, useState } from 'react';
import { ref, onValue, remove, set, query, limitToLast } from 'firebase/database';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase/db';
import { dbFirestore } from '@/services/firebase/firestore';
import { useAuth } from '@/shared/components/providers/AuthContext';
import StreamUrlManager from './StreamUrlManager';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';

export default function StreamsOperatorSection({ theme }) {
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
        const chatQuery = query(chatRef, limitToLast(200));

        const unsub = onValue(chatQuery, (snapshot) => {
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
        try {
            await set(ref(db, 'settings/stream_chat_disabled'), e.target.checked);
        } catch (err) {
            console.error("Gagal toggle chat:", err);
            alert("Gagal merubah status chat.");
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* 1. Global URL Config */}
            <StreamUrlManager theme={theme} />

            {/* 2. Live Chat Moderation */}
            <div className="p-6 bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-black pb-4">
                    <h2 className="text-2xl font-black uppercase tracking-wider text-black">Live Chat Moderation</h2>
                    <div className="flex flex-wrap gap-4 items-center">
                        {isSuperAdmin && (
                            <Checkbox 
                                checked={isChatDisabled} 
                                onChange={handleToggleChat} 
                                label="Disable Chat"
                            />
                        )}
                        <div className="px-4 py-2 bg-[#ff3366] text-white border-2 border-black font-black uppercase tracking-wider text-sm">
                            Live Viewers: {viewersCount}
                        </div>
                    </div>
                </div>

                <p className="text-sm font-bold text-slate-700">
                    {isSuperAdmin 
                        ? "Anda login sebagai Superadmin. Anda dapat memantau dan menghapus chat pengunjung." 
                        : "Anda dapat memantau chat secara realtime. Fitur hapus chat hanya untuk Superadmin."}
                </p>

                <div className="max-h-[500px] overflow-y-auto flex flex-col gap-2 p-4 bg-slate-100 border-2 border-black rounded-none">
                    {chats.length === 0 ? (
                        <p className="text-sm font-bold text-slate-500 text-center my-8">Belum ada pesan chat.</p>
                    ) : (
                        chats.map(chat => (
                            <div 
                                key={chat.id} 
                                className="flex items-start justify-between p-3 bg-white border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                            >
                                <div>
                                    <span className="text-xs font-black text-[#00ffff] uppercase bg-black px-2 py-0.5 border border-black inline-block mb-1">
                                        {chat.name}
                                    </span>
                                    <p className="text-sm font-bold text-black break-words mt-1">
                                        {chat.message}
                                    </p>
                                </div>
                                {isSuperAdmin && (
                                    <button
                                        onClick={() => handleDeleteChat(chat.id)}
                                        className="text-[#ff3366] hover:text-red-700 hover:bg-red-100 p-1 border-2 border-transparent hover:border-black transition-colors"
                                        title="Hapus Pesan"
                                    >
                                        <i className="ri-delete-bin-line text-xl"></i>
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
