const https = require('https');

const url = 'https://lb12.strmd.st/secure/mebIqNpKuIqipisHtvdCLSpCubbStmzO/rtmp/stream/DWJyg2MOEvchycHoeLA6AAUaFOQPtbkrTW8E6Vq2SYcOjESDdXtp58uvKp6E6w7HXQPR8ze2gA/1/high/mono.m3u8';

const options = {
  headers: {
    'Accept': '*/*',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'Connection': 'keep-alive',
    'Origin': 'https://embedstreams.top',
    'Referer': 'https://embedstreams.top/',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
    'sec-ch-ua': '"Brave";v="149", "Chromium";v="149", "Not)A;Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"'
  },
  agent: new https.Agent({
    ciphers: 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384',
    honorCipherOrder: true,
    minVersion: 'TLSv1.2',
    maxVersion: 'TLSv1.3'
  })
};

https.get(url, options, (res) => {
  console.log('Status Code:', res.statusCode);
  res.on('data', d => process.stdout.write(d.toString().substring(0, 100)));
}).on('error', e => console.error(e));
