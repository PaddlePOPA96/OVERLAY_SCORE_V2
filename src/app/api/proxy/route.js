import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ALLOWED_DOMAINS = [
    'falconstreams.net',
    'trendy47.club',
    'embedstreams.top',
    'strmd.st',
    'lola30es.mpipzni2naturally32kistomach.ru'
];

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const customReferer = searchParams.get('referer');

    if (!url) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    try {
        const parsedUrl = new URL(url);

        // VALIDASI SSRF: Cek apakah domain ada di allowlist
        const isAllowed = ALLOWED_DOMAINS.some(domain => parsedUrl.hostname.endsWith(domain));
        
        if (!isAllowed) {
            return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
        }
        
        // Use custom referer if provided, fallback to the one required by the CDN, or origin
        const referer = customReferer || 'https://lola30es.mpipzni2naturally32kistomach.ru/';

        // Set Origin. For this particular CDN, the origin needs to match the referer's origin.
        let origin = parsedUrl.origin;

        try {
            if (referer) {
                const refererUrl = new URL(referer);

                origin = refererUrl.origin;
            }
        } catch (e) {
            // Ignored
        }

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': origin,
            'Referer': referer,
            'Connection': 'keep-alive',
        };

        const response = await fetch(url, { 
            headers,
            cache: 'no-store' // Disable Next.js caching to prevent serving stale 403s
        });

        if (!response.ok) {
            console.error(`Proxy error: ${response.status} ${response.statusText} for ${url}`);

            // Provide more detail in development to debug 403s
            const errText = await response.text().catch(() => '');

            console.error(`Proxy error response body: ${errText}`);
            
return new NextResponse(`Error proxying: ${response.statusText} - ${errText}`, { status: response.status });
        }

        const contentType = response.headers.get('content-type') || '';
        
        // If it's an m3u8 playlist, we need to rewrite the URLs inside it so they also go through our proxy
        if (contentType.includes('application/vnd.apple.mpegurl') || contentType.includes('application/x-mpegURL') || url.includes('.m3u8')) {
            let text = await response.text();
            
            // Rewrite lines that are not comments or empty (which are URLs)
            const lines = text.split('\n');

            const rewrittenLines = lines.map(line => {
                line = line.trim();
                if (!line || line.startsWith('#')) return line;
                
                // It's a URL
                try {
                    // Resolve relative URL against the base URL
                    const absoluteUrl = new URL(line, url).toString();


                    // Point back to our proxy
                    return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}&referer=${encodeURIComponent(referer)}`;
                } catch (e) {
                    return line;
                }
            });
            
            text = rewrittenLines.join('\n');
            
            return new NextResponse(text, {
                headers: {
                    'Content-Type': 'application/vnd.apple.mpegurl',
                    'Access-Control-Allow-Origin': '*',
                }
            });
        }

        // For video segments (.ts, .m4s, etc.), return the binary body directly
        const bodyBuffer = await response.arrayBuffer();
        
        const responseHeaders = new Headers();

        if (contentType) responseHeaders.set('Content-Type', contentType);
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        
        // Pass cache headers if any
        if (response.headers.has('cache-control')) {
            responseHeaders.set('Cache-Control', response.headers.get('cache-control'));
        }

        return new NextResponse(bodyBuffer, { headers: responseHeaders });
        
    } catch (error) {
        console.error('Proxy exception:', error);
        
return new NextResponse(error.message, { status: 500 });
    }
}
