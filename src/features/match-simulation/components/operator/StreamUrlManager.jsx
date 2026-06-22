import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/db';
import { ref, onValue, set } from 'firebase/database';
import { Button, TextField, Box, Typography, Paper } from '@mui/material';
import { CODE_CLOUD_BD } from '@/lib/streams';

export default function StreamUrlManager({ theme }) {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', isError: false });
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

  const isUrl = (str) => {
    const trimmed = str.trim();
    return /^(https?:\/\/|\/\/)/i.test(trimmed) || trimmed.includes('.m3u8') || trimmed.includes('.mpd');
  };

  const getPendingValues = (input) => {
    const trimmed = input.trim();
    if (!trimmed) return { pendingUrl: url, pendingToken: token, type: '' };

    if (isUrl(trimmed)) {
      const result = extractAndTemplateToken(trimmed);
      if (result.token) {
        return { pendingUrl: result.templatedUrl, pendingToken: result.token, type: 'url_with_token' };
      } else {
        return { pendingUrl: trimmed, pendingToken: '', type: 'url_only' };
      }
    } else {
      return { pendingUrl: url, pendingToken: trimmed, type: 'token_only' };
    }
  };

  const { pendingUrl, pendingToken, type } = getPendingValues(inputValue);
  const resolvedLiveUrl = url ? url.replace(/{token}/gi, token).replace(/\[token\]/gi, token) : '';
  const previewUrl = pendingUrl ? pendingUrl.replace(/{token}/gi, pendingToken).replace(/\[token\]/gi, pendingToken) : '';

  const handleSave = async () => {
    if (!inputValue.trim()) return;
    setSaving(true);
    try {
      await set(ref(db, 'settings/stream_url'), pendingUrl.trim());
      await set(ref(db, 'settings/stream_token'), pendingToken.trim());
      setInputValue('');
      setFeedback({ text: '✓ Pengaturan berhasil disimpan!', isError: false });
      setTimeout(() => setFeedback({ text: '', isError: false }), 4000);
    } catch (err) {
      console.error("Failed to save stream settings:", err);
      setFeedback({ text: '❌ Gagal menyimpan pengaturan.', isError: true });
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = async (presetUrl) => {
    setSaving(true);
    try {
      await set(ref(db, 'settings/stream_url'), presetUrl);
      await set(ref(db, 'settings/stream_token'), '');
      setInputValue('');
      setFeedback({ text: '✓ Preset berhasil diterapkan!', isError: false });
      setTimeout(() => setFeedback({ text: '', isError: false }), 4000);
    } catch (err) {
      console.error("Failed to save preset:", err);
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

        {/* Current Active URL */}
        <Box sx={{ p: 2, bgcolor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)', borderRadius: 2, border: '1px dashed', borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}>
          <Typography variant="caption" display="block" sx={{ color: isLight ? '#666' : '#aaa', mb: 0.5, fontWeight: 'bold' }}>
            URL AKTIF SAAT INI (RESOLVED):
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', color: resolvedLiveUrl ? (isLight ? '#1e293b' : '#cbd5e1') : (isLight ? '#94a3b8' : '#64748b') }}>
            {resolvedLiveUrl || 'Belum ada siaran aktif'}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: isLight ? '#666' : '#aaa' }}>
          Tempel URL .m3u8 baru di bawah ini. Sistem akan otomatis memisahkan tokennya. Jika nanti token kedaluwarsa, Anda <strong>cukup menempelkan token baru saja</strong> di kolom yang sama.
        </Typography>
        
        <Box display="flex" gap={2} alignItems="stretch" flexWrap="wrap">
          <TextField 
            fullWidth
            size="small"
            variant="outlined"
            label="Masukkan URL Aliran atau Token Baru"
            placeholder="Tempel URL m3u8 utuh ATAU tempel token baru saja..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            sx={{ 
              flex: 1, 
              minWidth: '280px',
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
            disabled={saving || !inputValue.trim()}
            sx={{ textTransform: 'none', fontWeight: 'bold', height: '40px', px: 3 }}
          >
            {saving ? 'Saving...' : 'Simpan Perubahan'}
          </Button>
        </Box>

        {/* Real-time Feedback & Preview */}
        {inputValue.trim() && (
          <Box sx={{ p: 2, bgcolor: isLight ? 'rgba(34, 197, 94, 0.05)' : 'rgba(34, 197, 94, 0.08)', borderRadius: 2, border: '1px solid', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
            <Typography variant="caption" display="block" sx={{ color: '#22c55e', fontWeight: 'bold', mb: 1 }}>
              {type === 'url_with_token' && '✓ Terdeteksi: URL Lengkap (Token otomatis dipisahkan)'}
              {type === 'url_only' && '✓ Terdeteksi: URL Baru (Tanpa Token)'}
              {type === 'token_only' && '✓ Terdeteksi: Token Baru (Menggunakan Template URL Lama)'}
            </Typography>
            <Typography variant="caption" display="block" sx={{ color: isLight ? '#666' : '#aaa', mb: 0.5 }}>
              PREVIEW HASIL GABUNGAN:
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', color: isLight ? '#1e293b' : '#94a3b8' }}>
              {previewUrl}
            </Typography>
          </Box>
        )}

        {feedback.text && !inputValue.trim() && (
          <Typography variant="caption" sx={{ color: feedback.isError ? '#ef4444' : '#22c55e', fontWeight: '500' }}>
            {feedback.text}
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
            onClick={() => applyPreset('https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/Caze_TV.m3u8')}
            sx={{ textTransform: 'none', fontSize: '11px', color: isLight ? '#444' : '#ccc' }}
          >
            CazeTV (Brasil)
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            color="inherit"
            onClick={() => applyPreset('https://ott-balancer.tvri.go.id/live/eds/TVRIWorld/hls/TVRIWorld.m3u8')}
            sx={{ textTransform: 'none', fontSize: '11px', color: isLight ? '#444' : '#ccc' }}
          >
            TVRI World (1080p)
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            color="inherit"
            onClick={() => applyPreset('https://ott-balancer.tvri.go.id/live/eds/SportHD/hls/SportHD.m3u8')}
            sx={{ textTransform: 'none', fontSize: '11px', color: isLight ? '#444' : '#ccc' }}
          >
            TVRI Sport HD (720p)
          </Button>

          {CODE_CLOUD_BD.data.map((stream, idx) => (
            <Button
              key={`preset-codecloud-${idx}`}
              variant="outlined" 
              size="small" 
              color="inherit"
              onClick={() => applyPreset(stream.url)}
              sx={{ textTransform: 'none', fontSize: '11px', color: isLight ? '#444' : '#ccc' }}
            >
              {stream.title}
            </Button>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
