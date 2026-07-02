import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ALLOWED_DOMAINS = [
    'falconstreams.net',
    'trendy47.club',
    'embedstreams.top',
    'strmd.st',
    'lola30es.mpipzni2naturally32kistomach.ru',
    'folaplay.com'
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
        const urlStr = searchParams.get('url');

        if (!urlStr) {
            return new NextResponse('Missing URL parameter', { status: 400 });
        }

        const parsedUrl = new URL(urlStr);
        const isAllowed = ALLOWED_DOMAINS.some(domain => parsedUrl.hostname.endsWith(domain));
        
        if (!isAllowed) {
            return new NextResponse('Domain not allowed', { status: 403 });
        }

        const fetchHeaders = new Headers();

        request.headers.forEach((value, key) => {
            const lowerKey = key.toLowerCase();


            // Do not forward headers that break the request
            if (!['host', 'referer', 'origin', 'connection'].includes(lowerKey)) {
                fetchHeaders.set(key, value);
            }
        });
        
        const upstreamUrl = new URL(urlStr);

        // Fetch the target webpage
        const response = await fetch(urlStr, {
            headers: fetchHeaders,
            cache: 'no-store',
            redirect: 'follow'
        });

        if (!response.ok) {
            return new NextResponse(`Upstream returned ${response.status}`, { status: response.status });
        }

        const contentType = response.headers.get('content-type') || '';
        
        // If it's not HTML, just return it without X-Frame-Options
        if (!contentType.includes('text/html')) {
            const bodyBuffer = await response.arrayBuffer();
            const resHeaders = new Headers(response.headers);

            resHeaders.delete('x-frame-options');
            resHeaders.delete('content-security-policy');
            resHeaders.set('access-control-allow-origin', corsOrigin);
            
return new NextResponse(bodyBuffer, { headers: resHeaders });
        }

        let htmlText = await response.text();

        // Inject <base> tag to ensure relative links (CSS, JS, images, fetch) resolve correctly
        const baseTag = `<base href="${upstreamUrl.origin}/">`;

        if (htmlText.includes('<head>')) {
            htmlText = htmlText.replace('<head>', `<head>\n${baseTag}`);
        } else if (htmlText.includes('<head ')) {
            htmlText = htmlText.replace(/(<head[^>]*>)/i, `$1\n${baseTag}`);
        } else {
            htmlText = `${baseTag}\n${htmlText}`;
        }

        // We build clean headers, INTENTIONALLY dropping X-Frame-Options and CSP
        const resHeaders = new Headers();

        resHeaders.set('Content-Type', contentType);
        resHeaders.set('Access-Control-Allow-Origin', corsOrigin);
        
        return new NextResponse(htmlText, { headers: resHeaders });

    } catch (error) {
        console.error('Iframe Proxy Error:', error);
        
return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
    }
}
