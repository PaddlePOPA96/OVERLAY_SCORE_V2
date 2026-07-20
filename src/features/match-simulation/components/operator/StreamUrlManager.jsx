import { useState, useEffect } from 'react';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { db } from '@/services/firebase/db';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/Dialog';

export default function StreamUrlManager({ theme }) {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [drmKey, setDrmKey] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', isError: false });
  const [presets, setPresets] = useState([]);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [playlistTarget, setPlaylistTarget] = useState('left');
  const [selectedPresets, setSelectedPresets] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newPresetTitle, setNewPresetTitle] = useState('');
  const [newPresetUrl, setNewPresetUrl] = useState('');
  const [newPresetDrmKey, setNewPresetDrmKey] = useState('');
  const [syncVod, setSyncVod] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const [title, setTitle] = useState('');
  const [title2, setTitle2] = useState('');
  const [header, setHeader] = useState('');
  const [headerCountry, setHeaderCountry] = useState('');
  const [multiMode, setMultiMode] = useState(false);
  const [url2, setUrl2] = useState('');
  const [token2, setToken2] = useState('');
  const [drmKey2, setDrmKey2] = useState('');
  const [inputValue2, setInputValue2] = useState('');

  useEffect(() => {
    const urlRef = ref(db, 'settings/stream_url');
    const unsubUrl = onValue(urlRef, (snapshot) => { if (snapshot.exists()) setUrl(snapshot.val()); });

    const tokenRef = ref(db, 'settings/stream_token');
    const unsubToken = onValue(tokenRef, (snapshot) => { if (snapshot.exists()) setToken(snapshot.val()); });

    const drmRef = ref(db, 'settings/stream_drm_key');
    const unsubDrm = onValue(drmRef, (snapshot) => { if (snapshot.exists()) setDrmKey(snapshot.val()); else setDrmKey(''); });

    const multiModeRef = ref(db, 'settings/stream_multi_mode');
    const unsubMultiMode = onValue(multiModeRef, (snapshot) => { if (snapshot.exists()) setMultiMode(snapshot.val()); else setMultiMode(false); });

    const url2Ref = ref(db, 'settings/stream_url_2');
    const unsubUrl2 = onValue(url2Ref, (snapshot) => { if (snapshot.exists()) setUrl2(snapshot.val()); else setUrl2(''); });

    const token2Ref = ref(db, 'settings/stream_token_2');
    const unsubToken2 = onValue(token2Ref, (snapshot) => { if (snapshot.exists()) setToken2(snapshot.val()); else setToken2(''); });

    const drm2Ref = ref(db, 'settings/stream_drm_key_2');
    const unsubDrm2 = onValue(drm2Ref, (snapshot) => { if (snapshot.exists()) setDrmKey2(snapshot.val()); else setDrmKey2(''); });

    const presetsRef = ref(db, 'settings/stream_presets');
    const unsubPresets = onValue(presetsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const presetList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setPresets(presetList);
      } else {
        setPresets([]);
      }
    });

    const syncRef = ref(db, 'settings/stream_sync_vod');
    const unsubSync = onValue(syncRef, (snapshot) => { if (snapshot.exists()) setSyncVod(snapshot.val()); });

    const proxyRef = ref(db, 'settings/stream_use_proxy');
    const unsubProxy = onValue(proxyRef, (snapshot) => { if (snapshot.exists()) setUseProxy(snapshot.val()); });

    const titleRef = ref(db, 'settings/stream_title');
    const unsubTitle = onValue(titleRef, (snapshot) => { if (snapshot.exists()) setTitle(snapshot.val()); else setTitle('SELAMAT ULANG TAHUN'); });

    const title2Ref = ref(db, 'settings/stream_title_2');
    const unsubTitle2 = onValue(title2Ref, (snapshot) => { if (snapshot.exists()) setTitle2(snapshot.val()); else setTitle2('SELAMAT ULANG TAHUN'); });

    const headerRef = ref(db, 'settings/stream_header');
    const unsubHeader = onValue(headerRef, (snapshot) => { if (snapshot.exists()) setHeader(snapshot.val()); else setHeader('HUITOTOO'); });

    const headerCountryRef = ref(db, 'settings/stream_header_country');
    const unsubHeaderCountry = onValue(headerCountryRef, (snapshot) => { if (snapshot.exists()) setHeaderCountry(snapshot.val()); else setHeaderCountry('ID'); });

    return () => {
      unsubUrl(); unsubToken(); unsubPresets(); unsubSync(); unsubProxy();
      unsubTitle(); unsubTitle2(); unsubHeader(); unsubHeaderCountry();
      unsubMultiMode(); unsubUrl2(); unsubToken2(); unsubDrm(); unsubDrm2();
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
          templatedUrl = hasHttp ? urlObj.toString() : urlObj.toString().replace('http://dummy.com/', '');
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

  const getPendingValues = (input, currentUrl, currentToken) => {
    const trimmed = input.trim();
    if (!trimmed) return { pendingUrl: currentUrl, pendingToken: currentToken, type: '' };
    if (isUrl(trimmed)) {
      const result = extractAndTemplateToken(trimmed);
      if (result.token) return { pendingUrl: result.templatedUrl, pendingToken: result.token, type: 'url_with_token' };
      else return { pendingUrl: trimmed, pendingToken: '', type: 'url_only' };
    } else {
      return { pendingUrl: currentUrl, pendingToken: trimmed, type: 'token_only' };
    }
  };

  const { pendingUrl, pendingToken } = getPendingValues(inputValue, url, token);
  const resolvedLiveUrl = url ? url.replace(/{token}/gi, token).replace(/\[token\]/gi, token) : '';
  const previewUrl = pendingUrl ? pendingUrl.replace(/{token}/gi, pendingToken).replace(/\[token\]/gi, pendingToken) : '';

  const { pendingUrl: pendingUrl2, pendingToken: pendingToken2 } = getPendingValues(inputValue2, url2, token2);
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
      saveToHistory(pendingUrl.trim(), drmKey);
      setFeedback({ text: '✓ Pengaturan Stream Kiri berhasil disimpan!', isError: false });
      setTimeout(() => setFeedback({ text: '', isError: false }), 4000);
    } catch (err) {
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
      saveToHistory(pendingUrl2.trim(), drmKey2);
      setFeedback({ text: '✓ Pengaturan Stream Kanan berhasil disimpan!', isError: false });
      setTimeout(() => setFeedback({ text: '', isError: false }), 4000);
    } catch (err) {
      setFeedback({ text: '❌ Gagal menyimpan pengaturan.', isError: true });
    } finally {
      setSaving(false);
    }
  };

  const saveToHistory = (historyUrl, drm = '') => {
    if (!historyUrl || !historyUrl.trim()) return;
    const isExist = presets.some(p => p.url === historyUrl.trim());
    if (!isExist) {
      const title = "History " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newPresetRef = push(ref(db, 'settings/stream_presets'));
      const dataToSave = { title, url: historyUrl.trim() };
      if (drm.trim()) dataToSave.drmKey = drm.trim();
      set(newPresetRef, dataToSave).catch(console.error);
    }
  };

  const applyPreset = async (presetUrl, drm = '', target = 'left') => {
    setSaving(true);
    try {
      if (target === 'left') {
        await set(ref(db, 'settings/stream_url'), presetUrl);
        await set(ref(db, 'settings/stream_token'), '');
        await set(ref(db, 'settings/stream_drm_key'), drm);
        await set(ref(db, 'settings/stream_start_time'), Date.now());
        setInputValue('');
        setFeedback({ text: '✓ Preset Kiri berhasil diterapkan!', isError: false });
      } else {
        await set(ref(db, 'settings/stream_url_2'), presetUrl);
        await set(ref(db, 'settings/stream_token_2'), '');
        await set(ref(db, 'settings/stream_drm_key_2'), drm);
        await set(ref(db, 'settings/stream_start_time'), Date.now());
        setInputValue2('');
        setFeedback({ text: '✓ Preset Kanan berhasil diterapkan!', isError: false });
      }
      setTimeout(() => setFeedback({ text: '', isError: false }), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePresetModal = () => {
    if (!newPresetTitle.trim() || !newPresetUrl.trim()) return;
    const newPresetRef = push(ref(db, 'settings/stream_presets'));
    const dataToSave = { title: newPresetTitle.trim(), url: newPresetUrl.trim() };
    if (newPresetDrmKey.trim()) dataToSave.drmKey = newPresetDrmKey.trim();
    set(newPresetRef, dataToSave).then(() => setModalOpen(false));
  };

  const handleDeleteSelectedPresets = () => {
    if (selectedPresets.length === 0) return;
    if (!window.confirm(`Yakin ingin menghapus ${selectedPresets.length} history terpilih?`)) return;
    const updates = {};
    selectedPresets.forEach(id => { updates[id] = null; });
    update(ref(db, 'settings/stream_presets'), updates).then(() => setSelectedPresets([]));
  };

  const toggleSelection = (id) => {
    setSelectedPresets(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedPresets.length === presets.length && presets.length > 0) setSelectedPresets([]);
    else setSelectedPresets(presets.map(p => p.id));
  };



  console.log('StreamUrlManager render components:', { Button, Input, Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, Checkbox });

  return (
    <div className="p-6 bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col gap-6">
      {/* TOP LEVEL SWITCHES */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-black pb-4">
        <div className="flex flex-wrap gap-4">
          <Checkbox checked={multiMode} onChange={e => set(ref(db, 'settings/stream_multi_mode'), e.target.checked)} label="Mode Multi Stream" />
          <Checkbox checked={syncVod} onChange={e => set(ref(db, 'settings/stream_sync_vod'), e.target.checked)} label="Sync Waktu VOD" />
          <Checkbox checked={useProxy} onChange={e => set(ref(db, 'settings/stream_use_proxy'), e.target.checked)} label="Proxy Siluman" />
        </div>
        <a href="/streams" target="_blank" className="px-4 py-2 bg-white border-2 border-black font-bold uppercase hover:bg-slate-100 transition-colors">
          Buka Halaman /streams ↗
        </a>
      </div>

      {/* STREAM MANAGER GRID */}
      <div className="grid grid-cols-1 gap-6"> {/* Menggunakan 1 kolom penuh agar baris memanjang maksimal */}

        {/* STREAM KIRI */}
        <div className="p-4 bg-slate-100 border-4 border-black flex flex-col gap-4 w-full">
          <h3 className="text-xl font-black uppercase text-black">🔴 Stream Utama {multiMode && '(Kiri)'}</h3>

          <div className="p-3 bg-white border-2 border-black">
            <span className="text-xs font-black uppercase text-slate-500 block mb-1">URL AKTIF (RESOLVED)</span>
            <span className="text-sm font-bold text-black break-all">{resolvedLiveUrl || 'Belum ada siaran aktif'}</span>
          </div>

          {/* Mengubah flex-row menjadi flex-col agar Input punya lebar 100% penuh tanpa terpotong tombol */}
          <div className="flex flex-col gap-2 items-end">
            <Input
              fullWidth
              className="w-full" // Memastikan input mengambil 100% lebar layar
              placeholder="Tempel m3u8 utuh atau token yang sangat panjang di sini..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Button
              variant="primary"
              className="w-full sm:w-auto px-6" // Tombol melebar di hp, tapi proporsional di desktop
              onClick={handleSave}
              disabled={saving || !inputValue.trim()}
            >
              {saving ? '...' : 'Simpan Stream Utama'}
            </Button>
          </div>

          {/* Input DRM sekarang punya baris mandiri yang sangat panjang */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black text-slate-700 uppercase">DRM Key Kiri:</span>
            <Input
              fullWidth
              className="w-full"
              placeholder="DRM Key (KID:KEY)"
              value={drmKey}
              onChange={(e) => setDrmKey(e.target.value)}
              onBlur={() => set(ref(db, 'settings/stream_drm_key'), drmKey.trim())}
            />
          </div>

          {inputValue.trim() && (
            <div className="p-3 bg-[#ccff00] border-2 border-black">
              <span className="text-xs font-black uppercase text-black block mb-1">✓ Terdeteksi (Preview):</span>
              <span className="text-sm font-bold text-black break-all">{previewUrl}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            <Button variant="outline" className="bg-white" onClick={() => { setPlaylistTarget('left'); setPlaylistModalOpen(true); }}>
              Buka History Playlist ({presets.length})
            </Button>
            <Button variant="outline" className="bg-white" onClick={() => { setNewPresetTitle(''); setNewPresetUrl(resolvedLiveUrl || ''); setNewPresetDrmKey(drmKey || ''); setModalOpen(true); }}>
              + Tambah Baru
            </Button>
          </div>
        </div>

        {/* STREAM KANAN */}
        {multiMode && (
          <div className="p-4 bg-slate-100 border-4 border-black flex flex-col gap-4 w-full border-t-4 pt-6">
            <h3 className="text-xl font-black uppercase text-black">🔴 Stream Kedua (Kanan)</h3>

            <div className="p-3 bg-white border-2 border-black">
              <span className="text-xs font-black uppercase text-slate-500 block mb-1">URL AKTIF (RESOLVED)</span>
              <span className="text-sm font-bold text-black break-all">{resolvedLiveUrl2 || 'Belum ada siaran aktif'}</span>
            </div>

            {/* Mengubah menjadi susunan vertikal agar input memanjang */}
            <div className="flex flex-col gap-2 items-end">
              <Input
                fullWidth
                className="w-full"
                placeholder="Tempel m3u8 utuh atau token yang sangat panjang di sini..."
                value={inputValue2}
                onChange={(e) => setInputValue2(e.target.value)}
              />
              <Button
                variant="primary"
                className="w-full sm:w-auto px-6"
                onClick={handleSave2}
                disabled={saving || !inputValue2.trim()}
              >
                {saving ? '...' : 'Simpan Stream Kedua'}
              </Button>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-black text-slate-700 uppercase">DRM Key Kanan:</span>
              <Input
                fullWidth
                className="w-full"
                placeholder="DRM Key Kanan (KID:KEY)"
                value={drmKey2}
                onChange={(e) => setDrmKey2(e.target.value)}
                onBlur={() => set(ref(db, 'settings/stream_drm_key_2'), drmKey2.trim())}
              />
            </div>

            {inputValue2.trim() && (
              <div className="p-3 bg-[#ccff00] border-2 border-black">
                <span className="text-xs font-black uppercase text-black block mb-1">✓ Terdeteksi (Preview):</span>
                <span className="text-sm font-bold text-black break-all">{previewUrl2}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-2">
              <Button variant="outline" className="bg-white" onClick={() => { setPlaylistTarget('right'); setPlaylistModalOpen(true); }}>
                Buka History Playlist ({presets.length})
              </Button>
              <Button variant="outline" className="bg-white" onClick={() => { setNewPresetTitle(''); setNewPresetUrl(resolvedLiveUrl2 || ''); setNewPresetDrmKey(drmKey2 || ''); setModalOpen(true); }}>
                + Tambah Baru
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* PENGATURAN TAMPILAN */}
      <div className="p-4 bg-slate-100 border-4 border-black">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 mb-4">Pengaturan Tampilan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            placeholder={multiMode ? "Judul Kiri" : "Judul Stream"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => set(ref(db, 'settings/stream_title'), title.trim())}
          />
          {multiMode && (
            <Input
              placeholder="Judul Kanan"
              value={title2}
              onChange={(e) => setTitle2(e.target.value)}
              onBlur={() => set(ref(db, 'settings/stream_title_2'), title2.trim())}
            />
          )}
          <Input
            placeholder="Teks Logo Header"
            value={header}
            onChange={(e) => setHeader(e.target.value)}
            onBlur={() => set(ref(db, 'settings/stream_header'), header.trim())}
          />
          <Input
            placeholder="Kode Negara (ID/EN)"
            value={headerCountry}
            onChange={(e) => setHeaderCountry(e.target.value)}
            onBlur={() => set(ref(db, 'settings/stream_header_country'), headerCountry.trim())}
          />
        </div>
      </div>

      {feedback.text && !inputValue.trim() && !inputValue2.trim() && (
        <div className={`p-4 font-black uppercase border-4 border-black text-center ${feedback.isError ? 'bg-[#ff3366] text-white' : 'bg-[#ccff00] text-black'}`}>
          {feedback.text}
        </div>
      )}

      {/* Modal Tambah Baru */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogHeader>
          <DialogTitle>Tambah Preset Playlist</DialogTitle>
        </DialogHeader>
        <DialogContent className="py-4">
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Nama Preset Playlist"
              value={newPresetTitle}
              onChange={(e) => setNewPresetTitle(e.target.value)}
            />
            <Input
              placeholder="URL Stream (.m3u8 / .mpd)"
              value={newPresetUrl}
              onChange={(e) => setNewPresetUrl(e.target.value)}
            />
            {newPresetUrl.includes('.mpd') && (
              <Input
                placeholder="DRM Key (KID:KEY)"
                value={newPresetDrmKey}
                onChange={(e) => setNewPresetDrmKey(e.target.value)}
              />
            )}
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
          <Button variant="primary" onClick={handleSavePresetModal} disabled={!newPresetTitle.trim() || !newPresetUrl.trim()}>
            Simpan
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Modal Playlist */}
      <Dialog open={playlistModalOpen} onClose={() => setPlaylistModalOpen(false)}>
        <DialogHeader>
          <DialogTitle>History Playlist ({playlistTarget === 'left' ? 'Kiri' : 'Kanan'})</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="flex justify-between mb-4 mt-2">
            <Button variant="outline" className="bg-white" onClick={selectAll}>
              {selectedPresets.length === presets.length && presets.length > 0 ? 'Deselect All' : 'Select All'}
            </Button>
            <Button variant="outline" className="bg-[#ff3366] text-white" onClick={handleDeleteSelectedPresets} disabled={selectedPresets.length === 0}>
              Hapus Terpilih ({selectedPresets.length})
            </Button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto flex flex-col gap-2">
            {presets.length === 0 ? (
              <p className="text-center font-bold text-slate-500 py-8">Belum ada history playlist.</p>
            ) : (
              presets.map((preset) => (
                <div key={preset.id} className="flex items-center gap-3 p-3 bg-slate-100 border-2 border-black">
                  <input
                    type="checkbox"
                    checked={selectedPresets.includes(preset.id)}
                    onChange={() => toggleSelection(preset.id)}
                    className="w-5 h-5 accent-black border-2 border-black"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-sm text-black truncate">{preset.title}</h4>
                    <p className="text-xs font-bold text-slate-600 truncate">{preset.url}</p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => { applyPreset(preset.url, preset.drmKey || '', playlistTarget); setPlaylistModalOpen(false); }}
                  >
                    Terapkan
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}