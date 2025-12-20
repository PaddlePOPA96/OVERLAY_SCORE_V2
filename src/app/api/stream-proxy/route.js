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

        // Robust detection of M3U8 Playlist
        // 1. Check Content-Type header
        const contentType = response.headers.get('Content-Type');
        const isM3U8Header = contentType && (
            contentType.includes('application/vnd.apple.mpegurl') ||
            contentType.includes('application/x-mpegurl') ||
            contentType.includes('audio/mpegurl')
        );

        // 2. Sniff content (first 1024 bytes) for #EXTM3U tag
        // This handles cases where Content-Type is wrong (e.g. text/plain or application/json)
        // and also cases where the file has leading whitespace or BOM.
        const headerBytes = new Uint8Array(arrayBuffer.slice(0, 1024));
        const headerText = new TextDecoder('utf-8').decode(headerBytes);
        const hasM3U8Tag = headerText.includes('#EXTM3U');

        if (isM3U8Header || hasM3U8Tag) {
            const decoder = new TextDecoder('utf-8');
            const text = decoder.decode(arrayBuffer);

            const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
            const urlOrigin = new URL(request.url).origin;

            // Rewrite lines that are paths/URLs
            const modifiedText = text.split('\n').map(line => {
                const trimmed = line.trim();
                // Skip empty lines and comments (that are not #EXT-X-KEY with URI attribute, but usually we only rewrite lines that don't start with #)
                // Actually, we must check for URI attributes in tags too? 
                // Standard HLS: URI="..." in #EXT-X-KEY or #EXT-X-MAP
                // But simple proxy usually just handles the segment lines (URI lines).
                // NOTE: The previous logic only rewrote lines NOT starting with #.
                // If the playlist uses #EXT-X-KEY:METHOD=AES-128,URI="key.php" we need to rewrite that too.
                // But let's stick to the segment rewriting first as that's the main blocker shown in logs (CORS on segments).

                if (trimmed && !trimmed.startsWith('#')) {
                    // It's a Segment URL
                    let segmentUrl = trimmed;

                    // Resolve relative paths
                    if (!segmentUrl.startsWith('http')) {
                        segmentUrl = baseUrl + segmentUrl;
                    }

                    // Wrap in our proxy
                    return `${urlOrigin}/api/stream-proxy?url=${encodeURIComponent(segmentUrl)}`;
                }
                // Handle URI inside tags (like encryption keys or map)
                // Example: #EXT-X-KEY:METHOD=AES-128,URI="https://..."
                if (trimmed.startsWith('#EXT-X-KEY') || trimmed.startsWith('#EXT-X-MAP')) {
                    const uriMatch = trimmed.match(/URI="([^"]+)"/);
                    if (uriMatch) {
                        let originalUri = uriMatch[1];
                        let absoluteUri = originalUri;
                        if (!originalUri.startsWith('http')) {
                            absoluteUri = baseUrl + originalUri;
                        }
                        const proxiedUri = `${urlOrigin}/api/stream-proxy?url=${encodeURIComponent(absoluteUri)}`;
                        return line.replace(originalUri, proxiedUri);
                    }
                }

                return line;
            }).join('\n');

            const headers = new Headers();
            headers.set('Access-Control-Allow-Origin', '*');
            headers.set('Content-Type', 'application/vnd.apple.mpegurl');
            if (response.headers.get('Cache-Control')) headers.set('Cache-Control', response.headers.get('Cache-Control'));

            return new NextResponse(modifiedText, {
                status: 200,
                headers: headers
            });
        }

        // Binary content (TS segments, etc.) or unknown text
        const headers = new Headers();
        headers.set('Access-Control-Allow-Origin', '*');

        // Forward original Content-Type if present
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
