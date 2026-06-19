'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Hls from 'hls.js';
import styles from './streams.module.css';

export default function StreamsPage() {
    const videoRef = useRef(null);
    const [currentChannel, setCurrentChannel] = useState(
        'https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/Caze_TV.m3u8'
    );
    const hlsRef = useRef(null);

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
                // Support for Safari (native HLS)
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
    }, [currentChannel]);

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div style={{ marginBottom: '-10px' }}>
                    <Link href="/" className={styles.backButton}>
                        <i className="ri-arrow-left-line" style={{ marginRight: '8px' }}></i>
                        Kembali
                    </Link>
                </div>
                <h2 className={styles.title}>Live Sports & TV Hub</h2>

                <div className={styles.controls}>
                    <label htmlFor="channelSelect" className={styles.label}>Pilih Saluran</label>
                    <select
                        id="channelSelect"
                        className={styles.select}
                        value={currentChannel}
                        onChange={(e) => setCurrentChannel(e.target.value)}
                    >
                        <optgroup label="World Cup / Sports" className={styles.optgroup}>
                            <option className={styles.option} value="https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/Caze_TV.m3u8">
                                CazéTV (Brazil - World Cup/Sports)
                            </option>
                        </optgroup>
                    </select>
                </div>

                <div className={styles.videoWrapper}>
                    <video ref={videoRef} className={styles.video} controls autoPlay playsInline></video>
                </div>
            </div>
        </div>
    );
}
