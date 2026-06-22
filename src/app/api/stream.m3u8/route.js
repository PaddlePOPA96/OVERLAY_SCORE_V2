import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Prevent static caching

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const encodedUrl = searchParams.get('u');

        if (!encodedUrl) {
            return new NextResponse('Missing URL parameter', { status: 400 });
        }

        // Decode base64 URL
        const decodedUrl = Buffer.from(encodedUrl, 'base64').toString('utf-8');

        if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
            return new NextResponse('Invalid URL', { status: 400 });
        }

        const response = await fetch(decodedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            return new NextResponse('Failed to fetch upstream M3U8', { status: response.status });
        }

        const m3u8Text = await response.text();
        const baseUrl = new URL('.', decodedUrl).href;

        // Rewrite relative URLs to absolute URLs
        const rewrittenLines = m3u8Text.split('\n').map(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                return line;
            }

            // It's a URI line
            try {
                const absoluteUrl = new URL(trimmedLine, decodedUrl).href;
                
                // If it's another m3u8 playlist (variant), proxy it as well
                if (absoluteUrl.includes('.m3u8')) {
                    const encodedAbsoluteUrl = Buffer.from(absoluteUrl).toString('base64');
                    // Get the host from the original request to build the proxy URL
                    const host = request.headers.get('host');
                    const protocol = host.includes('localhost') ? 'http' : 'https';
                    return `${protocol}://${host}/api/stream.m3u8?u=${encodedAbsoluteUrl}`;
                }

                // If it's a media segment (.ts), return absolute URL so client downloads directly
                return absoluteUrl;
            } catch (e) {
                return line;
            }
        });

        return new NextResponse(rewrittenLines.join('\n'), {
            headers: {
                'Content-Type': 'application/vnd.apple.mpegurl',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            }
        });

    } catch (error) {
        console.error('M3U8 Proxy Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
