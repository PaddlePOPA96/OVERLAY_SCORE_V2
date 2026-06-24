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
        const serverIndex = searchParams.get('server'); // optional manual override
        
        // Find iframeStreams array inside the Next.js page data. Quotes might be escaped.
        let matchStr = null;
        const startIndex = html.indexOf('iframeStreams');
        if (startIndex !== -1) {
            const arrayStart = html.indexOf('[', startIndex);
            const arrayEnd = html.indexOf(']', arrayStart);
            if (arrayStart !== -1 && arrayEnd !== -1) {
                matchStr = html.substring(arrayStart + 1, arrayEnd);
            }
        }
        
        if (matchStr) {
            try {
                // Unescape backslashes if present
                const cleanStr = matchStr.replace(/\\"/g, '"');
                // Add brackets back to make it valid JSON array
                const streamsStr = `[${cleanStr}]`;
                const streams = JSON.parse(streamsStr);
                
                if (streams.length > 0) {
                    // If user manually requested a specific server index (1-based)
                    if (serverIndex && !isNaN(serverIndex)) {
                        const index = parseInt(serverIndex) - 1;
                        if (index >= 0 && index < streams.length && streams[index].src) {
                            return NextResponse.json({ url: streams[index].src });
                        }
                    }

                    // Auto-select priority: echo > delta > anything else (to avoid overloaded admin servers)
                    const echoServer = streams.find(s => s.name?.toLowerCase() === 'echo');
                    if (echoServer && echoServer.src) return NextResponse.json({ url: echoServer.src });

                    const deltaServer = streams.find(s => s.name?.toLowerCase() === 'delta');
                    if (deltaServer && deltaServer.src) return NextResponse.json({ url: deltaServer.src });

                    // Fallback to the very first one
                    if (streams[0].src) {
                        return NextResponse.json({ url: streams[0].src });
                    }
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
