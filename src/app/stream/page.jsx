'use client';

import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

import styles from '../streams/streams.module.css';
import { useStreamSettings } from '../streams/hooks/useStreamSettings';

const StreamPlayer = dynamic(() => import('../streams/components/StreamPlayer'), { ssr: false });

export default function StreamOnlyPage() {
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [leftWidth, setLeftWidth] = useState(50);

    const {
        streamStartTime,
        streamSyncVod,
        multiMode,
        currentChannel,
        currentChannel2,
        streamDrmKey,
        streamDrmKey2,
    } = useStreamSettings();

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
            style={{ padding: 0, minHeight: '100%', height: '100vh', overflow: 'hidden' }}
        >
            <div
                className={`${styles.layout} ${isDragging ? styles.dragging : ''}`}
                ref={containerRef}
                style={{
                    ...(multiMode ? { gap: 0 } : {}),
                    paddingTop: 0, paddingBottom: 0, height: '100vh', marginTop: 0, alignItems: 'stretch'
                }}
            >
                {/* Video Kiri (Utama) */}
                <div className={`${styles.videoSection} ${multiMode ? styles.resizableLeft : ''}`} style={multiMode ? { flex: `0 0 ${leftWidth}%`, paddingRight: '12px' } : {}}>
                    <div className={styles.videoWrapper} style={{ paddingTop: 0, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', border: 'none', boxShadow: 'none' }}>
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

                {/* Video Kanan (Channel 2) */}
                {multiMode && (
                    <div className={`${styles.videoSection} ${styles.resizableRight}`} style={{ flex: '1', paddingLeft: '12px', minWidth: 0 }}>
                        <div className={styles.videoWrapper} style={{ paddingTop: 0, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', border: 'none', boxShadow: 'none' }}>
                            <StreamPlayer
                                currentChannel={currentChannel2}
                                streamStartTime={streamStartTime}
                                streamSyncVod={streamSyncVod}
                                isMuted={true}
                                drmKey={streamDrmKey2}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
