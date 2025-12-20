import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Prevent caching of the proxy itself

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': new URL(targetUrl).origin,
            },
        });

        if (!response.ok) {
            return new NextResponse(`Error fetching stream: ${response.statusText}`, { status: response.status });
        }

        const arrayBuffer = await response.arrayBuffer();

        // Detect if content is M3U8 Playlist (starts with #EXTM3U)
        // #EXTM3U in hex is: 23 45 58 54 4d 33 55
        const firstBytes = new Uint8Array(arrayBuffer.slice(0, 7));
        const isM3U8 =
            firstBytes[0] === 0x23 &&
            firstBytes[1] === 0x45 &&
            firstBytes[2] === 0x58 &&
            firstBytes[3] === 0x54 &&
            firstBytes[4] === 0x4d &&
            firstBytes[5] === 0x33 &&
            firstBytes[6] === 0x55;

        // Also check standard Content-Type as fallback or reinforcement, 
        // but the byte check is authoritative for rewriting purposes.

        if (isM3U8) {
            const decoder = new TextDecoder('utf-8');
            const text = decoder.decode(arrayBuffer);

            const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
            const urlOrigin = new URL(request.url).origin;

            // Rewrite lines that are paths/URLs
            const modifiedText = text.split('\n').map(line => {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                    // It's a URL or path
                    let segmentUrl = trimmed;

                    // Resolve relative paths
                    if (!segmentUrl.startsWith('http')) {
                        segmentUrl = baseUrl + segmentUrl;
                    }

                    // Wrap in our proxy
                    return `${urlOrigin}/api/stream-proxy?url=${encodeURIComponent(segmentUrl)}`;
                }
                return line;
            }).join('\n');

            const headers = new Headers();
            headers.set('Access-Control-Allow-Origin', '*');
            headers.set('Content-Type', 'application/vnd.apple.mpegurl');
            // Copy cache headers if present
            if (response.headers.get('Cache-Control')) headers.set('Cache-Control', response.headers.get('Cache-Control'));

            return new NextResponse(modifiedText, {
                status: 200,
                headers: headers
            });
        }

        // Binary content (TS segments, etc.) or unknown text
        const headers = new Headers();
        headers.set('Access-Control-Allow-Origin', '*');

        const contentType = response.headers.get('Content-Type');
        if (contentType) headers.set('Content-Type', contentType);
        if (response.headers.get('Cache-Control')) headers.set('Cache-Control', response.headers.get('Cache-Control'));

        return new NextResponse(arrayBuffer, {
            status: 200,
            headers: headers
        });
    } catch (error) {
        console.error("Proxy error:", error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
