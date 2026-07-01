'use client';

import React, { useEffect, useRef, useState } from 'react';

import { onAuthStateChanged } from 'firebase/auth';

import styles from './streams.module.css';
import { auth } from '@/services/firebase/auth';
import RunningTextOverlay from '@/features/overlay/components/RunningTextOverlay';
import dynamic from 'next/dynamic';

import StreamNavbar from './components/StreamNavbar';
import ChatPanel from './components/ChatPanel';
import { useStreamSettings } from './hooks/useStreamSettings';

const StreamPlayer = dynamic(() => import('./components/StreamPlayer'), { ssr: false });

export default function StreamsPage() {
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [isMinimal, setIsMinimal] = useState(false);
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [leftWidth, setLeftWidth] = useState(50);

    const {
        streamStartTime,
        streamSyncVod,
        streamTitle2,
        streamHeader,
        streamHeaderCountry,
        isChatDisabled,
        multiMode,
        currentChannel,
        currentChannel2,
        streamDrmKey,
        streamDrmKey2,
    } = useStreamSettings();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => setFirebaseUser(user));

        
return () => unsub();
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.search.includes('minimal=true')) {
            setIsMinimal(true);
        }
    }, []);

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

    return (
        <div
            className={styles.wrapper}
            style={isMinimal ? { padding: 0, minHeight: '100%', height: '100vh', overflow: 'hidden' } : {}}
        >
            {/* YOUTUBE STYLE NAVBAR */}
            {!isMinimal && (
                <StreamNavbar
                    firebaseUser={firebaseUser}
                    streamHeader={streamHeader}
                    streamHeaderCountry={streamHeaderCountry}
                    multiMode={multiMode}
                    leftWidth={leftWidth}
                    setLeftWidth={setLeftWidth}
                />
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
                        <StreamPlayer
                            currentChannel={currentChannel}
                            streamStartTime={streamStartTime}
                            streamSyncVod={streamSyncVod}
                            isMuted={false}
                            drmKey={streamDrmKey}
                        />
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
                            <StreamPlayer
                                currentChannel={currentChannel2}
                                streamStartTime={streamStartTime}
                                streamSyncVod={streamSyncVod}
                                isMuted={true}
                                drmKey={streamDrmKey2}
                            />
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
                    <ChatPanel isChatDisabled={isChatDisabled} />
                )}

            </div>
            {/* Running Text Ticker at the bottom */}
            {!isMinimal && <RunningTextOverlay isPageMode={true} />}
        </div>
    );
}