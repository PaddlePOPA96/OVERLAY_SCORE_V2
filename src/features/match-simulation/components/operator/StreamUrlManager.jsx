import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/db';
import { ref, onValue, set } from 'firebase/database';
import { Button, TextField, Box, Typography, Paper } from '@mui/material';

export default function StreamUrlManager({ theme }) {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [extractedFeedback, setExtractedFeedback] = useState(false);
  const isLight = theme === 'light';

  useEffect(() => {
    const urlRef = ref(db, 'settings/stream_url');
    const unsubUrl = onValue(urlRef, (snapshot) => {
      if (snapshot.exists()) {
        setUrl(snapshot.val());
      }
    });

    const tokenRef = ref(db, 'settings/stream_token');
    const unsubToken = onValue(tokenRef, (snapshot) => {
      if (snapshot.exists()) {
        setToken(snapshot.val());
      }
    });

    return () => {
      unsubUrl();
      unsubToken();
    };
  }, []);

  const extractAndTemplateToken = (rawUrl) => {
    let extractedToken = '';
    let templatedUrl = rawUrl;

    // 1. Detect path token format like /token-XXXX/
    const pathTokenRegex = /\/token-([a-zA-Z0-9%_\-\.\+=]+)/i;
    const pathMatch = rawUrl.match(pathTokenRegex);
    if (pathMatch) {
      extractedToken = pathMatch[1];
      templatedUrl = rawUrl.replace(pathTokenRegex, '/token-{token}');
      return { token: extractedToken, templatedUrl };
    }

    // 2. Detect query parameter token/auth/key/pass/hash
    const queryParams = ['token', 'auth', 'key', 'token_id', 'pass', 'hash'];
    try {
      // Treat as URL or string with query parameters
      const hasHttp = rawUrl.startsWith('http://') || rawUrl.startsWith('https://');
      const urlObj = new URL(hasHttp ? rawUrl : `http://dummy.com/${rawUrl}`);
      for (const param of queryParams) {
        if (urlObj.searchParams.has(param)) {
          extractedToken = urlObj.searchParams.get(param);
          urlObj.searchParams.set(param, '{token}');
          templatedUrl = hasHttp 
            ? urlObj.toString() 
            : urlObj.toString().replace('http://dummy.com/', '');
          return { token: extractedToken, templatedUrl };
        }
      }
    } catch (e) {
      for (const param of queryParams) {
        const regex = new RegExp(`([\?&])${param}=([^&]+)`, 'i');
        const match = rawUrl.match(regex);
        if (match) {
          extractedToken = match[2];
          templatedUrl = rawUrl.replace(regex, `$1${param}={token}`);
          return { token: extractedToken, templatedUrl };
        }
      }
    }

    return { token: '', templatedUrl: rawUrl };
  };

  const handleUrlChange = (value) => {
    const result = extractAndTemplateToken(value.trim());
    if (result.token) {
      setUrl(result.templatedUrl);
      setToken(result.token);
      setExtractedFeedback(true);
      setTimeout(() => setExtractedFeedback(false), 3000);
    } else {
      setUrl(value);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await set(ref(db, 'settings/stream_url'), url.trim());
      await set(ref(db, 'settings/stream_token'), token.trim());
    } catch (err) {
      console.error("Failed to save stream settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper 
        elevation={0}
        sx={{ 
            p: 3, 
            mb: 4, 
            border: '1px solid', 
            borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
            borderRadius: 3,
            bgcolor: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(10px)'
        }}
    >
      <Box display="flex" flexDirection="column" gap={2}>
        <Typography variant="h6" fontWeight="bold" sx={{ color: isLight ? '#000' : '#fff' }}>
          Live Stream Global URL
        </Typography>
        <Typography variant="body2" sx={{ color: isLight ? '#666' : '#aaa' }}>
          Update the m3u8 link and token here to change the broadcast channel across all /streams viewers in real-time. Use <code>{'{token}'}</code> in the URL to insert the token dynamically.
        </Typography>
        
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField 
            fullWidth
            size="small"
            variant="outlined"
            label="Broadcast Stream URL / Template"
            placeholder="https://example.com/live/stream.m3u8 (gunakan {token} sebagai placeholder)"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: isLight ? '#000' : '#fff',
                '& fieldset': { borderColor: isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)' }
              },
              '& .MuiInputLabel-root': { color: isLight ? '#666' : '#aaa' }
            }}
          />
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField 
              size="small"
              variant="outlined"
              label="Access Token (Opsional)"
              placeholder="Masukkan token di sini..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              sx={{ 
                flex: 1, 
                minWidth: '250px',
                '& .MuiOutlinedInput-root': {
                  color: isLight ? '#000' : '#fff',
                  '& fieldset': { borderColor: isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)' }
                },
                '& .MuiInputLabel-root': { color: isLight ? '#666' : '#aaa' }
              }}
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSave} 
              disabled={saving}
              sx={{ textTransform: 'none', fontWeight: 'bold', height: '40px' }}
            >
              {saving ? 'Saving...' : 'Save Broadcast URL'}
            </Button>
          </Box>
        </Box>
        
        {extractedFeedback && (
          <Typography variant="caption" sx={{ color: '#22c55e', fontWeight: '500' }}>
            ✓ Token terdeteksi dan berhasil diekstrak otomatis!
          </Typography>
        )}
        
        {/* Preset Links */}
        <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
          <Typography variant="caption" sx={{ color: isLight ? '#666' : '#aaa', display: 'flex', alignItems: 'center', mr: 1 }}>
            Quick Presets:
          </Typography>
          <Button 
            variant="outlined" 
            size="small" 
            color="inherit"
            onClick={() => { setUrl('https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/Caze_TV.m3u8'); setToken(''); }}
            sx={{ textTransform: 'none', fontSize: '11px', color: isLight ? '#444' : '#ccc' }}
          >
            CazeTV (Brasil)
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            color="inherit"
            onClick={() => { setUrl('https://ott-balancer.tvri.go.id/live/eds/TVRIWorld/hls/TVRIWorld.m3u8'); setToken(''); }}
            sx={{ textTransform: 'none', fontSize: '11px', color: isLight ? '#444' : '#ccc' }}
          >
            TVRI World (1080p)
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            color="inherit"
            onClick={() => { setUrl('https://ott-balancer.tvri.go.id/live/eds/SportHD/hls/SportHD.m3u8'); setToken(''); }}
            sx={{ textTransform: 'none', fontSize: '11px', color: isLight ? '#444' : '#ccc' }}
          >
            TVRI Sport HD (720p)
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
