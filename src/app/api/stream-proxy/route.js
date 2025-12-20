import { NextResponse } from 'next/server';

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

        const contentType = response.headers.get('Content-Type');

        // Check if it's an m3u8 playlist
        if (contentType && (contentType.includes('application/vnd.apple.mpegurl') || contentType.includes('application/x-mpegurl') || targetUrl.endsWith('.m3u8'))) {
            const text = await response.text();
            const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
            const urlOrigin = new URL(request.url).origin;

            // Rewrite lines that are paths/URLs
            const modifiedText = text.split('\n').map(line => {
                if (line.trim() && !line.startsWith('#')) {
                    // It's a URL or path
                    let segmentUrl = line.trim();

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

            return new NextResponse(modifiedText, {
                status: 200,
                headers: headers
            });
        }

        // Binary content (TS segments, etc.)
        const data = await response.blob();
        const headers = new Headers();
        headers.set('Access-Control-Allow-Origin', '*');
        if (contentType) headers.set('Content-Type', contentType);

        return new NextResponse(data, {
            status: 200,
            headers: headers
        });
    } catch (error) {
        console.error("Proxy error:", error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
