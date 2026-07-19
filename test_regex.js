const lines = [
    '#EXT-X-MAP:URI="init-1.mp4"',
    '#EXT-X-MAP:URI=init-2.mp4',
    '#EXT-X-KEY:METHOD=AES-128,URI="https://key.com/k"',
    '#EXT-X-KEY:METHOD=AES-128,URI=https://key.com/k'
];

lines.forEach(line => {
    const match = line.match(/URI=(?:"([^"]+)"|([^",\s]+))/);
    if (match) {
        const uri = match[1] || match[2];
        console.log(`Matched: ${uri}`);
    } else {
        console.log(`Failed: ${line}`);
    }
});
