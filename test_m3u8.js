const m3u8Text = `
#EXTM3U
#EXT-X-VERSION:7
#EXT-X-TARGETDURATION:2
#EXT-X-MEDIA-SEQUENCE:123
#EXT-X-MAP:URI="init-1784277253100384502.mp4"
#EXTINF:2.000,
segment-1.m4s
#EXT-X-KEY:METHOD=AES-128,URI="https://key.com/key.bin"
`;

const decodedUrl = "https://cdn.com/live/playlist.m3u8";

const rewrittenLines = m3u8Text.split('\n').map(line => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('#EXT-X-')) {
        const uriMatch = trimmedLine.match(/URI="([^"]+)"/);
        if (uriMatch) {
            const relativeUri = uriMatch[1];
            try {
                const absoluteUrl = new URL(relativeUri, decodedUrl).href;
                console.log("Rewriting", relativeUri, "to", absoluteUrl);
                return trimmedLine.replace(`URI="${relativeUri}"`, `URI="${absoluteUrl}"`);
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
        return absoluteUrl;
    } catch (e) {
        return line;
    }
});

console.log(rewrittenLines.join('\n'));
