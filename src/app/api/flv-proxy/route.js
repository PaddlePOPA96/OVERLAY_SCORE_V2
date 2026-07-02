import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ALLOWED_DOMAINS = [
    'folaplay.com',
    'play.folaplay.com',
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

        if (!encodedUrl) {
            return new NextResponse('Missing URL parameter', { status: 400 });
        }

        const decodedUrl = Buffer.from(encodedUrl, 'base64').toString('utf-8');

        if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
            return new NextResponse('Invalid URL', { status: 400 });
        }

        const parsedUrl = new URL(decodedUrl);
        const isAllowed = ALLOWED_DOMAINS.some(domain => parsedUrl.hostname.endsWith(domain));

        if (!isAllowed) {
            return new NextResponse('Domain not allowed', { status: 403 });
        }

        const response = await fetch(decodedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                'Origin': 'https://h5.folaplay.com',
                'Referer': 'https://h5.folaplay.com/',
                'Connection': 'keep-alive',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            return new NextResponse(`Upstream error: ${response.status} ${response.statusText}`, { status: response.status });
        }

        // Stream the FLV response body directly to the client
        const { readable, writable } = new TransformStream();

        response.body.pipeTo(writable).catch(() => {});

        return new NextResponse(readable, {
            headers: {
                'Content-Type': 'video/x-flv',
                'Access-Control-Allow-Origin': corsOrigin,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error) {
        console.error('FLV Proxy Error:', error);
        
return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
    }
}
