import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const urlStr = searchParams.get('url');

        if (!urlStr || !urlStr.includes('falconstreams.net')) {
            return NextResponse.json({ url: urlStr });
        }

        const response = await fetch(urlStr, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            cache: 'no-store'
        });
        
        if (!response.ok) return NextResponse.json({ url: urlStr });

        const html = await response.text();
        
        // Find iframeStreams array inside the Next.js page data
        const match = html.match(/"iframeStreams":\[(.*?)\]/);
        if (match) {
            try {
                // Add brackets back to make it valid JSON array
                const streamsStr = `[${match[1]}]`;
                const streams = JSON.parse(streamsStr);
                
                // Return the first valid src (usually the main admin stream like trendy47.club)
                if (streams.length > 0 && streams[0].src) {
                    return NextResponse.json({ url: streams[0].src });
                }
            } catch (e) {
                console.error("Parse error resolving falconstreams:", e);
            }
        }

        return NextResponse.json({ url: urlStr });
    } catch (e) {
        return NextResponse.json({ url: urlStr || '' });
    }
}
