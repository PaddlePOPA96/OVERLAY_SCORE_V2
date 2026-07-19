const resolveUrl = (relative, base) => {
    const baseUrlObj = new URL(base);
    const resolvedUrlObj = new URL(relative, base);
    baseUrlObj.searchParams.forEach((val, key) => {
        if (!resolvedUrlObj.searchParams.has(key)) {
            resolvedUrlObj.searchParams.append(key, val);
        }
    });
    return resolvedUrlObj.href;
};
console.log(resolveUrl("init-123.mp4", "https://cdn.com/stream.m3u8?token=abc&hd=1"));
console.log(resolveUrl("seg.ts?hd=0", "https://cdn.com/stream.m3u8?token=abc&hd=1"));
