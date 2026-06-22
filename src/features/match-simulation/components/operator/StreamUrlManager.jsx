import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/db';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { Button, TextField, Box, Typography, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

export default function StreamUrlManager({ theme }) {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', isError: false });
  const [presets, setPresets] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newPresetTitle, setNewPresetTitle] = useState('');
  const [newPresetUrl, setNewPresetUrl] = useState('');
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

    const presetsRef = ref(db, 'settings/stream_presets');
    const unsubPresets = onValue(presetsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const presetList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setPresets(presetList);
      } else {
        setPresets([]);
      }
    });

    return () => {
      unsubUrl();
      unsubToken();
      unsubPresets();
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

  const handleOpenModal = () => {
    setNewPresetTitle('');
    setNewPresetUrl(resolvedLiveUrl || '');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSavePresetModal = () => {
    if (!newPresetTitle.trim() || !newPresetUrl.trim()) return;
    
    const newPresetRef = push(ref(db, 'settings/stream_presets'));
    set(newPresetRef, { title: newPresetTitle.trim(), url: newPresetUrl.trim() }).then(() => {
      setModalOpen(false);
    }).catch(err => {
      console.error("Failed to add preset:", err);
      alert("Gagal menambahkan preset.");
    });
  };

  const handleDeletePreset = (presetId) => {
    if (!window.confirm("Yakin ingin menghapus preset ini?")) return;
    remove(ref(db, `settings/stream_presets/${presetId}`)).catch(err => {
      console.error("Failed to delete preset:", err);
      alert("Gagal menghapus preset.");
    });
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
        <Box display="flex" gap={1} flexWrap="wrap" mt={1} alignItems="center">
          <Typography variant="caption" sx={{ color: isLight ? '#666' : '#aaa', display: 'flex', alignItems: 'center', mr: 1 }}>
            Quick Presets:
          </Typography>
          
          {presets.map(preset => (
            <Chip 
              key={preset.id}
              label={preset.title}
              onClick={() => applyPreset(preset.url)}
              onDelete={() => handleDeletePreset(preset.id)}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ color: isLight ? '#444' : '#ccc', borderColor: isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)' }}
            />
          ))}

          <Button 
            variant="outlined" 
            size="small" 
            color="inherit"
            onClick={handleOpenModal}
            sx={{ textTransform: 'none', fontSize: '11px', color: isLight ? '#444' : '#ccc', borderRadius: '16px', py: 0.2 }}
          >
            + Tambah Preset
          </Button>
        </Box>
      </Box>

      {/* Add Preset Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: isLight ? '#000' : '#fff', bgcolor: isLight ? '#fff' : '#1e293b' }}>
          Tambah Preset Playlist
        </DialogTitle>
        <DialogContent sx={{ bgcolor: isLight ? '#fff' : '#1e293b' }}>
          <TextField
            autoFocus
            margin="dense"
            label="Nama Preset Playlist"
            fullWidth
            variant="outlined"
            value={newPresetTitle}
            onChange={(e) => setNewPresetTitle(e.target.value)}
            sx={{ mb: 2, mt: 1, '& .MuiOutlinedInput-root': { color: isLight ? '#000' : '#fff' }, '& .MuiInputLabel-root': { color: isLight ? '#666' : '#aaa' } }}
          />
          <TextField
            margin="dense"
            label="URL Stream (.m3u8)"
            fullWidth
            variant="outlined"
            value={newPresetUrl}
            onChange={(e) => setNewPresetUrl(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { color: isLight ? '#000' : '#fff' }, '& .MuiInputLabel-root': { color: isLight ? '#666' : '#aaa' } }}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: isLight ? '#fff' : '#1e293b', p: 2 }}>
          <Button onClick={handleCloseModal} sx={{ color: isLight ? '#666' : '#aaa' }}>Batal</Button>
          <Button onClick={handleSavePresetModal} variant="contained" color="primary" disabled={!newPresetTitle.trim() || !newPresetUrl.trim()}>Simpan</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
