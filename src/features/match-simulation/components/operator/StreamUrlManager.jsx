import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/db';
import { ref, onValue, set } from 'firebase/database';
import { Button, TextField, Box, Typography, Paper } from '@mui/material';

export default function StreamUrlManager({ theme }) {
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const isLight = theme === 'light';

  useEffect(() => {
    const urlRef = ref(db, 'settings/stream_url');
    const unsub = onValue(urlRef, (snapshot) => {
      if (snapshot.exists()) {
        setUrl(snapshot.val());
      }
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await set(ref(db, 'settings/stream_url'), url.trim());
    } catch (err) {
      console.error("Failed to save stream url:", err);
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
          Update the m3u8 link here to change the broadcast channel across all /streams viewers in real-time.
        </Typography>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField 
            fullWidth
            size="small"
            variant="outlined"
            placeholder="https://example.com/live/stream.m3u8"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            sx={{ flex: 1, minWidth: '250px' }}
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSave} 
            disabled={saving}
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          >
            {saving ? 'Saving...' : 'Save Broadcast URL'}
          </Button>
        </Box>
        
        {/* Preset Links */}
        <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
          <Typography variant="caption" sx={{ color: isLight ? '#666' : '#aaa', display: 'flex', alignItems: 'center', mr: 1 }}>
            Quick Presets:
          </Typography>
          <Button 
            variant="outlined" 
            size="small" 
            color="inherit"
            onClick={() => setUrl('https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/Caze_TV.m3u8')}
            sx={{ textTransform: 'none', fontSize: '11px', color: isLight ? '#444' : '#ccc' }}
          >
            CazeTV (Brasil)
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            color="inherit"
            onClick={() => setUrl('https://ott-balancer.tvri.go.id/live/eds/TVRIWorld/hls/TVRIWorld.m3u8')}
            sx={{ textTransform: 'none', fontSize: '11px', color: isLight ? '#444' : '#ccc' }}
          >
            TVRI World (1080p)
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            color="inherit"
            onClick={() => setUrl('https://ott-balancer.tvri.go.id/live/eds/SportHD/hls/SportHD.m3u8')}
            sx={{ textTransform: 'none', fontSize: '11px', color: isLight ? '#444' : '#ccc' }}
          >
            TVRI Sport HD (720p)
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
