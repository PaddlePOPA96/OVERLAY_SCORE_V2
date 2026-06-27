import { useState, useEffect } from 'react';
import { db } from '@/services/firebase/db';
import { ref, onValue } from 'firebase/database';

export function useStreamSettings() {
    const [rawUrl, setRawUrl] = useState('');
    const [rawUrl2, setRawUrl2] = useState('');
    const [streamToken, setStreamToken] = useState('');
    const [streamToken2, setStreamToken2] = useState('');
    const [streamStartTime, setStreamStartTime] = useState(0);
    const [streamSyncVod, setStreamSyncVod] = useState(false);
    const [streamUseProxy, setStreamUseProxy] = useState(false);
    const [streamTitle, setStreamTitle] = useState('SELAMAT ULANG TAHUN');
    const [streamTitle2, setStreamTitle2] = useState('SELAMAT ULANG TAHUN');
    const [streamHeader, setStreamHeader] = useState('HUITOTOO');
    const [streamHeaderCountry, setStreamHeaderCountry] = useState('ID');
    const [isChatDisabled, setIsChatDisabled] = useState(false);
    const [multiMode, setMultiMode] = useState(false);

    const [currentChannel, setCurrentChannel] = useState('');
    const [currentChannel2, setCurrentChannel2] = useState('');

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
            setStreamToken(snapshot.exists() ? snapshot.val() : '');
        });

        const startTimeRef = ref(db, 'settings/stream_start_time');
        const unsubStartTime = onValue(startTimeRef, (snapshot) => {
            setStreamStartTime(snapshot.exists() ? snapshot.val() : Date.now());
        });

        const syncRef = ref(db, 'settings/stream_sync_vod');
        const unsubSync = onValue(syncRef, (snapshot) => {
            setStreamSyncVod(snapshot.exists() ? snapshot.val() : false);
        });

        const proxyRef = ref(db, 'settings/stream_use_proxy');
        const unsubProxy = onValue(proxyRef, (snapshot) => {
            setStreamUseProxy(snapshot.exists() ? snapshot.val() : false);
        });

        const titleRef = ref(db, 'settings/stream_title');
        const unsubTitle = onValue(titleRef, (snapshot) => {
            if (snapshot.exists()) setStreamTitle(snapshot.val());
        });

        const title2Ref = ref(db, 'settings/stream_title_2');
        const unsubTitle2 = onValue(title2Ref, (snapshot) => {
            if (snapshot.exists()) setStreamTitle2(snapshot.val());
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
        const unsubMultiMode = onValue(multiModeRef, (snapshot) => {
            setMultiMode(snapshot.exists() ? snapshot.val() : false);
        });

        const url2Ref = ref(db, 'settings/stream_url_2');
        const unsubUrl2 = onValue(url2Ref, (snapshot) => {
            setRawUrl2(snapshot.exists() ? snapshot.val() : '');
        });

        const token2Ref = ref(db, 'settings/stream_token_2');
        const unsubToken2 = onValue(token2Ref, (snapshot) => {
            setStreamToken2(snapshot.exists() ? snapshot.val() : '');
        });

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
            unsubMultiMode();
            unsubUrl2();
            unsubToken2();
            unsubChatDisabled();
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
                    finalUrl = finalUrl.replace(/{token}/gi, streamToken).replace(/\[token\]/gi, streamToken);
                }

                if (finalUrl.includes('.flv') && streamUseProxy) {
                    const encodedUrl = btoa(finalUrl);
                    finalUrl = `/api/flv-proxy?u=${encodedUrl}`;
                } else if (streamUseProxy && !finalUrl.includes('.flv') && !finalUrl.toLowerCase().includes('.mp4') && !finalUrl.includes('youtube.com') && !finalUrl.includes('youtu.be') && !finalUrl.includes('trendy47.club') && !finalUrl.includes('statusnode.is') && !finalUrl.includes('.html')) {
                    const encodedUrl = btoa(finalUrl);
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
                
                if (finalUrl.includes('.flv') && streamUseProxy) {
                    const encodedUrl = btoa(finalUrl);
                    finalUrl = `/api/flv-proxy?u=${encodedUrl}`;
                } else if (streamUseProxy && !finalUrl.includes('.flv') && !finalUrl.toLowerCase().includes('.mp4') && !finalUrl.includes('youtube.com') && !finalUrl.includes('youtu.be') && !finalUrl.includes('trendy47.club') && !finalUrl.includes('statusnode.is') && !finalUrl.includes('.html')) {
                    const encodedUrl = btoa(finalUrl);
                    finalUrl = `/api/stream.m3u8?u=${encodedUrl}`;
                }
                setCurrentChannel2(finalUrl);
            } else {
                setCurrentChannel2('');
            }
        };
        resolveUrl2();
    }, [rawUrl2, streamToken2, streamUseProxy]);

    return {
        streamStartTime,
        streamSyncVod,
        streamUseProxy,
        streamTitle,
        streamTitle2,
        streamHeader,
        streamHeaderCountry,
        isChatDisabled,
        multiMode,
        currentChannel,
        currentChannel2,
    };
}
