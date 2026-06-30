import { useState, useEffect } from 'react';

import { ref, onValue, set, push, remove } from 'firebase/database';
import { Button, TextField, Box, Typography, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel, Grid } from '@mui/material';

import { db } from '@/services/firebase/db';

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
  const [syncVod, setSyncVod] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const [title, setTitle] = useState('');
  const [title2, setTitle2] = useState('');
  const [header, setHeader] = useState('');
  const [headerCountry, setHeaderCountry] = useState('');
  const [multiMode, setMultiMode] = useState(false);
  const [url2, setUrl2] = useState('');
  const [token2, setToken2] = useState('');
  const [inputValue2, setInputValue2] = useState('');
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

    const multiModeRef = ref(db, 'settings/stream_multi_mode');

    const unsubMultiMode = onValue(multiModeRef, (snapshot) => {
      if (snapshot.exists()) setMultiMode(snapshot.val());
      else setMultiMode(false);
    });

    const url2Ref = ref(db, 'settings/stream_url_2');

    const unsubUrl2 = onValue(url2Ref, (snapshot) => {
      if (snapshot.exists()) setUrl2(snapshot.val());
      else setUrl2('');
    });

    const token2Ref = ref(db, 'settings/stream_token_2');

    const unsubToken2 = onValue(token2Ref, (snapshot) => {
      if (snapshot.exists()) setToken2(snapshot.val());
      else setToken2('');
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

    const syncRef = ref(db, 'settings/stream_sync_vod');

    const unsubSync = onValue(syncRef, (snapshot) => {
      if (snapshot.exists()) {
        setSyncVod(snapshot.val());
      }
    });

    const proxyRef = ref(db, 'settings/stream_use_proxy');

    const unsubProxy = onValue(proxyRef, (snapshot) => {
      if (snapshot.exists()) {
        setUseProxy(snapshot.val());
      }
    });

    const titleRef = ref(db, 'settings/stream_title');

    const title2Ref = ref(db, 'settings/stream_title_2');

    const unsubTitle2 = onValue(title2Ref, (snapshot) => {
      if (snapshot.exists()) setTitle2(snapshot.val());
      else setTitle2('SELAMAT ULANG TAHUN');
    });

    const unsubTitle = onValue(titleRef, (snapshot) => {
      if (snapshot.exists()) setTitle(snapshot.val());
      else setTitle('SELAMAT ULANG TAHUN');
    });

    const headerRef = ref(db, 'settings/stream_header');

    const unsubHeader = onValue(headerRef, (snapshot) => {
      if (snapshot.exists()) setHeader(snapshot.val());
      else setHeader('HUITOTOO');
    });

    const headerCountryRef = ref(db, 'settings/stream_header_country');

    const unsubHeaderCountry = onValue(headerCountryRef, (snapshot) => {
      if (snapshot.exists()) setHeaderCountry(snapshot.val());
      else setHeaderCountry('ID');
    });

    return () => {
      unsubUrl();
      unsubToken();
      unsubPresets();
      unsubSync();
      unsubProxy();
      unsubTitle();
      unsubTitle2();
      unsubHeader();
      unsubHeaderCountry();
      unsubMultiMode();
      unsubUrl2();
      unsubToken2();
    };
  }, []);

  const extractAndTemplateToken = (rawUrl) => {
    let extractedToken = '';
    let templatedUrl = rawUrl;

    const pathTokenRegex = /\/token-([a-zA-Z0-9%_\-\.\+=]+)/i;
    const pathMatch = rawUrl.match(pathTokenRegex);

    if (pathMatch) {
      extractedToken = pathMatch[1];
      templatedUrl = rawUrl.replace(pathTokenRegex, '/token-{token}');
      
return { token: extractedToken, templatedUrl };
    }

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

  const getPendingValues2 = (input) => {
    const trimmed = input.trim();

    if (!trimmed) return { pendingUrl2: url2, pendingToken2: token2, type2: '' };

    if (isUrl(trimmed)) {
      const result = extractAndTemplateToken(trimmed);

      if (result.token) return { pendingUrl2: result.templatedUrl, pendingToken2: result.token, type2: 'url_with_token' };
      else return { pendingUrl2: trimmed, pendingToken2: '', type2: 'url_only' };
    } else {
      return { pendingUrl2: url2, pendingToken2: trimmed, type2: 'token_only' };
    }
  };

  const { pendingUrl2, pendingToken2, type2 } = getPendingValues2(inputValue2);
  const resolvedLiveUrl2 = url2 ? url2.replace(/{token}/gi, token2).replace(/\[token\]/gi, token2) : '';
  const previewUrl2 = pendingUrl2 ? pendingUrl2.replace(/{token}/gi, pendingToken2).replace(/\[token\]/gi, pendingToken2) : '';

  const handleSave = async () => {
    if (!inputValue.trim()) return;
    setSaving(true);

    try {
      await set(ref(db, 'settings/stream_url'), pendingUrl.trim());
      await set(ref(db, 'settings/stream_token'), pendingToken.trim());
      await set(ref(db, 'settings/stream_start_time'), Date.now());
      setInputValue('');
      saveToHistory(pendingUrl.trim());
      setFeedback({ text: '✓ Pengaturan Stream Kiri berhasil disimpan!', isError: false });
      setTimeout(() => setFeedback({ text: '', isError: false }), 4000);
    } catch (err) {
      console.error("Failed to save stream settings:", err);
      setFeedback({ text: '❌ Gagal menyimpan pengaturan.', isError: true });
    } finally {
      setSaving(false);
    }
  };

  const handleSave2 = async () => {
    if (!inputValue2.trim()) return;
    setSaving(true);

    try {
      await set(ref(db, 'settings/stream_url_2'), pendingUrl2.trim());
      await set(ref(db, 'settings/stream_token_2'), pendingToken2.trim());
      await set(ref(db, 'settings/stream_start_time'), Date.now());
      setInputValue2('');
      saveToHistory(pendingUrl2.trim());
      setFeedback({ text: '✓ Pengaturan Stream Kanan berhasil disimpan!', isError: false });
      setTimeout(() => setFeedback({ text: '', isError: false }), 4000);
    } catch (err) {
      console.error("Failed to save stream 2 settings:", err);
      setFeedback({ text: '❌ Gagal menyimpan pengaturan.', isError: true });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSync = async (e) => {
    const newValue = e.target.checked;

    await set(ref(db, 'settings/stream_sync_vod'), newValue);
  };

  const handleToggleProxy = async (e) => {
    const newValue = e.target.checked;

    await set(ref(db, 'settings/stream_use_proxy'), newValue);
  };

  const handleToggleMultiMode = async (e) => {
    const newValue = e.target.checked;

    await set(ref(db, 'settings/stream_multi_mode'), newValue);
  };

  const saveToHistory = (url) => {
    if (!url || !url.trim()) return;
    const isExist = presets.some(p => p.url === url.trim());

    if (!isExist) {
      const title = "History " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newPresetRef = push(ref(db, 'settings/stream_presets'));

      set(newPresetRef, { title, url: url.trim() }).catch(console.error);
    }
  };

  const applyPreset = async (presetUrl, target = 'left') => {
    setSaving(true);

    try {
      if (target === 'left') {
        await set(ref(db, 'settings/stream_url'), presetUrl);
        await set(ref(db, 'settings/stream_token'), '');
        await set(ref(db, 'settings/stream_start_time'), Date.now());
        setInputValue('');
        setFeedback({ text: '✓ Preset Kiri berhasil diterapkan!', isError: false });
      } else {
        await set(ref(db, 'settings/stream_url_2'), presetUrl);
        await set(ref(db, 'settings/stream_token_2'), '');
        await set(ref(db, 'settings/stream_start_time'), Date.now());
        setInputValue2('');
        setFeedback({ text: '✓ Preset Kanan berhasil diterapkan!', isError: false });
      }

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
        borderRadius: 4,
        bgcolor: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <Box display="flex" flexDirection="column" gap={3}>
        
        {/* TOP LEVEL SWITCHES */}
        <Box display="flex" flexWrap="wrap" gap={3} sx={{ pb: 3, borderBottom: '1px solid', borderColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}>
          <FormControlLabel
            control={<Switch checked={multiMode} onChange={handleToggleMultiMode} color="primary" />}
            label={<Typography variant="body2" sx={{ color: isLight ? '#222' : '#eee', fontWeight: 'bold' }}>Mode Multi Stream (Layar Ganda)</Typography>}
            sx={{ m: 0 }}
          />
          <FormControlLabel
            control={<Switch checked={syncVod} onChange={handleToggleSync} color="primary" size="small" />}
            label={<Typography variant="body2" sx={{ color: isLight ? '#666' : '#aaa' }}>Sync Waktu VOD</Typography>}
            sx={{ m: 0 }}
          />
          <FormControlLabel
            control={<Switch checked={useProxy} onChange={handleToggleProxy} color="primary" size="small" />}
            label={<Typography variant="body2" sx={{ color: isLight ? '#666' : '#aaa' }}>Proxy Siluman (Sembunyikan URL)</Typography>}
            sx={{ m: 0 }}
          />
        </Box>

        {/* STREAM MANAGER GRID */}
        <Grid container spacing={3}>
          {/* STREAM KIRI */}
          <Grid item xs={12} md={multiMode ? 6 : 12}>
            <Box sx={{ height: '100%', p: 3, borderRadius: 3, bgcolor: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: isLight ? '#000' : '#fff', mb: 2 }}>
                🔴 Stream Utama {multiMode && '(Kiri)'}
              </Typography>

              {/* Current Active URL */}
              <Box sx={{ p: 1.5, mb: 3, bgcolor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                <Typography variant="caption" display="block" sx={{ color: isLight ? '#888' : '#888', mb: 0.5, fontWeight: 'bold' }}>
                  URL AKTIF (RESOLVED)
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', color: resolvedLiveUrl ? (isLight ? '#1e293b' : '#cbd5e1') : (isLight ? '#94a3b8' : '#64748b') }}>
                  {resolvedLiveUrl || 'Belum ada siaran aktif'}
                </Typography>
              </Box>

              <Box display="flex" gap={2} alignItems="stretch">
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  label="URL Aliran / Token Baru"
                  placeholder="Tempel m3u8 utuh atau token..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': { color: isLight ? '#000' : '#fff', '& fieldset': { borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' } },
                    '& .MuiInputLabel-root': { color: isLight ? '#666' : '#aaa' }
                  }}
                />
                <Button variant="contained" color="primary" disableElevation onClick={handleSave} disabled={saving || !inputValue.trim()} sx={{ textTransform: 'none', fontWeight: 'bold', minWidth: '100px' }}>
                  {saving ? '...' : 'Simpan'}
                </Button>
              </Box>

              {/* Real-time Feedback Kiri */}
              {inputValue.trim() && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: isLight ? 'rgba(34, 197, 94, 0.05)' : 'rgba(34, 197, 94, 0.08)', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ display: 'block', color: '#22c55e', fontWeight: 'bold', mb: 0.5 }}>✓ Terdeteksi (Preview):</Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', color: isLight ? '#1e293b' : '#94a3b8' }}>{previewUrl}</Typography>
                </Box>
              )}

              {/* Presets Kiri */}
              {presets.length > 0 && (
                <Box display="flex" gap={1} flexWrap="wrap" mt={3} alignItems="center">
                  <Typography variant="caption" sx={{ color: isLight ? '#888' : '#888', mr: 1 }}>History:</Typography>
                  {presets.map(preset => (
                    <Chip key={preset.id} label={preset.title} onClick={() => applyPreset(preset.url, 'left')} onDelete={() => handleDeletePreset(preset.id)} color="primary" variant="outlined" size="small" sx={{ borderColor: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)' }} />
                  ))}
                  <Button variant="text" size="small" color="inherit" onClick={handleOpenModal} sx={{ textTransform: 'none', fontSize: '11px', color: isLight ? '#666' : '#aaa', minWidth: 'auto', p: 0.5 }}>+ Tambah</Button>
                </Box>
              )}
            </Box>
          </Grid>

          {/* STREAM KANAN */}
          {multiMode && (
            <Grid item xs={12} md={6}>
              <Box sx={{ height: '100%', p: 3, borderRadius: 3, bgcolor: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: isLight ? '#000' : '#fff', mb: 2 }}>
                  🔴 Stream Kedua (Kanan)
                </Typography>

                <Box sx={{ p: 1.5, mb: 3, bgcolor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                  <Typography variant="caption" display="block" sx={{ color: isLight ? '#888' : '#888', mb: 0.5, fontWeight: 'bold' }}>
                    URL AKTIF (RESOLVED)
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', color: resolvedLiveUrl2 ? (isLight ? '#1e293b' : '#cbd5e1') : (isLight ? '#94a3b8' : '#64748b') }}>
                    {resolvedLiveUrl2 || 'Belum ada siaran aktif'}
                  </Typography>
                </Box>

                <Box display="flex" gap={2} alignItems="stretch">
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    label="URL Aliran / Token Baru"
                    placeholder="Tempel m3u8 utuh atau token..."
                    value={inputValue2}
                    onChange={(e) => setInputValue2(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': { color: isLight ? '#000' : '#fff', '& fieldset': { borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' } },
                      '& .MuiInputLabel-root': { color: isLight ? '#666' : '#aaa' }
                    }}
                  />
                  <Button variant="contained" color="secondary" disableElevation onClick={handleSave2} disabled={saving || !inputValue2.trim()} sx={{ textTransform: 'none', fontWeight: 'bold', minWidth: '100px' }}>
                    {saving ? '...' : 'Simpan'}
                  </Button>
                </Box>

                {/* Real-time Feedback Kanan */}
                {inputValue2.trim() && (
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: isLight ? 'rgba(34, 197, 94, 0.05)' : 'rgba(34, 197, 94, 0.08)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ display: 'block', color: '#22c55e', fontWeight: 'bold', mb: 0.5 }}>✓ Terdeteksi (Preview):</Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', color: isLight ? '#1e293b' : '#94a3b8' }}>{previewUrl2}</Typography>
                  </Box>
                )}

                {/* Presets Kanan */}
                {presets.length > 0 && (
                  <Box display="flex" gap={1} flexWrap="wrap" mt={3} alignItems="center">
                    <Typography variant="caption" sx={{ color: isLight ? '#888' : '#888', mr: 1 }}>History:</Typography>
                    {presets.map(preset => (
                      <Chip key={preset.id} label={preset.title} onClick={() => applyPreset(preset.url, 'right')} onDelete={() => handleDeletePreset(preset.id)} color="secondary" variant="outlined" size="small" sx={{ borderColor: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)' }} />
                    ))}
                    <Button variant="text" size="small" color="inherit" onClick={handleOpenModal} sx={{ textTransform: 'none', fontSize: '11px', color: isLight ? '#666' : '#aaa', minWidth: 'auto', p: 0.5 }}>+ Tambah</Button>
                  </Box>
                )}
              </Box>
            </Grid>
          )}
        </Grid>

        {/* TAMPILAN HALAMAN STREAM */}
        <Box sx={{ p: 3, borderRadius: 3, bgcolor: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}>
          <Typography variant="subtitle2" sx={{ color: isLight ? '#888' : '#888', mb: 2, fontWeight: 'bold', letterSpacing: 1 }}>
            PENGATURAN TAMPILAN
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={multiMode ? 6 : 12} md={multiMode ? 3 : 4}>
              <TextField
                fullWidth size="small" variant="outlined"
                label={multiMode ? "Judul Video Kiri" : "Judul Video Stream"}
                value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => set(ref(db, 'settings/stream_title'), title.trim())}
                sx={{ '& .MuiOutlinedInput-root': { color: isLight ? '#000' : '#fff' }, '& .MuiInputLabel-root': { color: isLight ? '#666' : '#aaa' } }}
              />
            </Grid>
            {multiMode && (
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth size="small" variant="outlined"
                  label="Judul Video Kanan"
                  value={title2} onChange={(e) => setTitle2(e.target.value)} onBlur={() => set(ref(db, 'settings/stream_title_2'), title2.trim())}
                  sx={{ '& .MuiOutlinedInput-root': { color: isLight ? '#000' : '#fff' }, '& .MuiInputLabel-root': { color: isLight ? '#666' : '#aaa' } }}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth size="small" variant="outlined"
                label="Teks Logo Header"
                value={header} onChange={(e) => setHeader(e.target.value)} onBlur={() => set(ref(db, 'settings/stream_header'), header.trim())}
                sx={{ '& .MuiOutlinedInput-root': { color: isLight ? '#000' : '#fff' }, '& .MuiInputLabel-root': { color: isLight ? '#666' : '#aaa' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth size="small" variant="outlined"
                label="Kode Negara (ID/EN)"
                value={headerCountry} onChange={(e) => setHeaderCountry(e.target.value)} onBlur={() => set(ref(db, 'settings/stream_header_country'), headerCountry.trim())}
                sx={{ '& .MuiOutlinedInput-root': { color: isLight ? '#000' : '#fff' }, '& .MuiInputLabel-root': { color: isLight ? '#666' : '#aaa' } }}
              />
            </Grid>
          </Grid>
        </Box>

      </Box>

      {/* Global Feedback Alert */}
      {(feedback.text && !inputValue.trim() && !inputValue2.trim()) && (
        <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'center', color: feedback.isError ? '#ef4444' : '#22c55e', fontWeight: 'bold' }}>
          {feedback.text}
        </Typography>
      )}

      {/* Add Preset Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: isLight ? '#000' : '#fff', bgcolor: isLight ? '#fff' : '#1e293b' }}>
          Tambah Preset Playlist
        </DialogTitle>
        <DialogContent sx={{ bgcolor: isLight ? '#fff' : '#1e293b' }}>
          <TextField
            autoFocus margin="dense" label="Nama Preset Playlist" fullWidth variant="outlined"
            value={newPresetTitle} onChange={(e) => setNewPresetTitle(e.target.value)}
            sx={{ mb: 2, mt: 1, '& .MuiOutlinedInput-root': { color: isLight ? '#000' : '#fff' }, '& .MuiInputLabel-root': { color: isLight ? '#666' : '#aaa' } }}
          />
          <TextField
            margin="dense" label="URL Stream (.m3u8)" fullWidth variant="outlined"
            value={newPresetUrl} onChange={(e) => setNewPresetUrl(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { color: isLight ? '#000' : '#fff' }, '& .MuiInputLabel-root': { color: isLight ? '#666' : '#aaa' } }}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: isLight ? '#fff' : '#1e293b', p: 2 }}>
          <Button onClick={handleCloseModal} sx={{ color: isLight ? '#666' : '#aaa' }}>Batal</Button>
          <Button onClick={handleSavePresetModal} variant="contained" color="primary" disableElevation disabled={!newPresetTitle.trim() || !newPresetUrl.trim()}>Simpan</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}