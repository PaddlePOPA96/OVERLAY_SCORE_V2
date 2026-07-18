import https from 'https';

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ALLOWED_DOMAINS = [
    'falconstreams.net',
    'trendy47.club',
    'embedstreams.top',
    'strmd.st',
    'lola30es.mpipzni2naturally32kistomach.ru',
    'folaplay.com',
    'cloudfront.net'
];

export async function GET(request) {
    const originHeader = request.headers.get('origin');
    const allowedOrigins = [
        'https://scoreboss.my.id',
        'https://www.scoreboss.my.id'
    ];
    const isOriginAllowed = (url) => {
        if (!url) return false;
        if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) return true;
        return allowedOrigins.some(domain => url.startsWith(domain));
    };
    const corsOrigin = (originHeader && isOriginAllowed(originHeader)) ? originHeader : 'https://scoreboss.my.id';

    try {
        const { searchParams } = new URL(request.url);
        const encodedUrl = searchParams.get('u');
        const encodedReferer = searchParams.get('r');

        if (!encodedUrl) {
            return new NextResponse('Missing URL parameter', { status: 400 });
        }

        const decodedUrl = Buffer.from(encodedUrl, 'base64').toString('utf-8');

        let decodedReferer = '';

        if (encodedReferer) {
            decodedReferer = Buffer.from(encodedReferer, 'base64').toString('utf-8');
        } else if (decodedUrl.includes('strmd.st')) {
            // Delta / Echo servers require trendy47 referer, Admin requires embedstreams
            decodedReferer = decodedUrl.includes('/delta/') || decodedUrl.includes('/echo/') || decodedUrl.includes('/golf/')
                ? 'https://trendy47.club/'
                : 'https://embedstreams.top/';
        } else if (decodedUrl.includes('folaplay.com')) {
            decodedReferer = 'https://h5.folaplay.com/';
        }

        if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
            return new NextResponse('Invalid URL', { status: 400 });
        }

        const parsedUrl = new URL(decodedUrl);
        const isAllowed = ALLOWED_DOMAINS.some(domain => parsedUrl.hostname.endsWith(domain));

        if (!isAllowed) {
            return new NextResponse('Domain not allowed', { status: 403 });
        }

        const fetchHeaders = new Headers();

        if (decodedUrl.includes('folaplay.com')) {
            fetchHeaders.set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36');
            fetchHeaders.set('Accept', '*/*');
            fetchHeaders.set('Accept-Language', 'en-GB,en-US;q=0.9,en;q=0.8');
            fetchHeaders.set('Connection', 'keep-alive');
            fetchHeaders.set('Referer', 'https://h5.folaplay.com/');
            fetchHeaders.set('Origin', 'https://h5.folaplay.com');
        } else {
            // Forward ALL headers from the original browser request to perfectly spoof the client
            request.headers.forEach((value, key) => {
                const lowerKey = key.toLowerCase();


                // Skip headers that should not be forwarded
                if (!['host', 'referer', 'origin', 'connection', 'content-length', 'accept-encoding'].includes(lowerKey) && !lowerKey.startsWith('x-')) {
                    fetchHeaders.set(key, value);
                }
            });

            if (decodedReferer) {
                fetchHeaders.set('Referer', decodedReferer);

                try {
                    fetchHeaders.set('Origin', new URL(decodedReferer).origin);
                } catch (e) { }
            }
        }

        const response = await fetch(decodedUrl, {
            headers: fetchHeaders,
            cache: 'no-store'
        });

        if (!response.ok) {
            return new NextResponse('Failed to fetch upstream M3U8', { status: response.status });
        }

        const m3u8Text = await response.text();

        // Rewrite relative URLs to absolute URLs and inject codecs if missing
        const rewrittenLines = m3u8Text.split('\n').map(line => {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith('#EXT-X-STREAM-INF:')) {
                if (!trimmedLine.includes('CODECS=')) {
                    return `${line.trim()},CODECS="avc1.64001f,mp4a.40.2"`;
                }
                return line;
            }

            if (trimmedLine.startsWith('#EXT-X-MEDIA:')) {
                const uriMatch = trimmedLine.match(/URI="([^"]+)"/);
                if (uriMatch) {
                    const relativeUri = uriMatch[1];
                    try {
                        const absoluteUri = new URL(relativeUri, decodedUrl).href;
                        const encodedAbsoluteUri = Buffer.from(absoluteUri).toString('base64');
                        const host = request.headers.get('host');
                        const protocol = host.includes('localhost') ? 'http' : 'https';
                        let proxyUrl = `${protocol}://${host}/api/stream.m3u8?u=${encodedAbsoluteUri}`;
                        if (decodedReferer) {
                            proxyUrl += `&r=${Buffer.from(decodedReferer).toString('base64')}`;
                        }
                        return trimmedLine.replace(`URI="${relativeUri}"`, `URI="${proxyUrl}"`);
                    } catch (e) {
                        return line;
                    }
                }
            }

            if (!trimmedLine || trimmedLine.startsWith('#')) {
                return line;
            }

            try {
                const absoluteUrl = new URL(trimmedLine, decodedUrl).href;

                if (absoluteUrl.includes('.m3u8')) {
                    const encodedAbsoluteUrl = Buffer.from(absoluteUrl).toString('base64');
                    const host = request.headers.get('host');
                    const protocol = host.includes('localhost') ? 'http' : 'https';
                    let proxyUrl = `${protocol}://${host}/api/stream.m3u8?u=${encodedAbsoluteUrl}`;

                    if (decodedReferer) {
                        proxyUrl += `&r=${Buffer.from(decodedReferer).toString('base64')}`;
                    }


                    return proxyUrl;
                }

                return absoluteUrl;
            } catch (e) {
                return line;
            }
        });

        return new NextResponse(rewrittenLines.join('\n'), {
            headers: {
                'Content-Type': 'application/vnd.apple.mpegurl',
                'Access-Control-Allow-Origin': corsOrigin,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            }
        });

    } catch (error) {
        console.error('M3U8 Proxy Error:', error);

        return new NextResponse(error.message || 'Internal Server Error', { status: error.message?.includes('status: 403') ? 403 : 500 });
    }
}
