'use client'

import { useState, useEffect } from 'react'

import { ref, onValue, update, push, remove } from 'firebase/database'

import { db } from '@/lib/firebase'

export default function TikTokOverlayControl({ theme = 'dark', roomId = 'default' }) {
  const isDark = theme === 'dark'

  // Constant defaults for overlay settings as requested
  const alertSound = '/sounds/ikeve.mp3'
  const volume = 0.8
  const layout = 'glassmorphism'

  const [tiktokUrl, setTiktokUrl] = useState('')
  const [sender, setSender] = useState('')
  const [message, setMessage] = useState('')
  const [duration, setDuration] = useState(25) // Default 25 seconds

  // Status & states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resolvedVideoId, setResolvedVideoId] = useState('')
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState('')
  const [resolvedData, setResolvedData] = useState(null)
  const [currentOverlay, setCurrentOverlay] = useState(null)
  const [history, setHistory] = useState([])

  const overlayPath = `match_live/${roomId}/tiktok_overlay`
  const historyPath = `match_live/${roomId}/tiktok_history`

  // Fetch current overlay state from Firebase
  useEffect(() => {
    if (!roomId) return
    const dbRef = ref(db, overlayPath)

    const unsubscribe = onValue(dbRef, snapshot => {
      const data = snapshot.val()

      if (data) {
        setCurrentOverlay(data)
      } else {
        setCurrentOverlay(null)
      }
    })

    return () => unsubscribe()
  }, [roomId, overlayPath])

  // Fetch play history from Firebase
  useEffect(() => {
    if (!roomId) return
    const dbRef = ref(db, historyPath)

    const unsubscribe = onValue(dbRef, snapshot => {
      const data = snapshot.val()

      if (data) {
        // Convert to array and reverse to get latest first
        const list = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }))

        list.reverse()
        setHistory(list.slice(0, 10)) // Keep last 10 entries
      } else {
        setHistory([])
      }
    })

    return () => unsubscribe()
  }, [roomId, historyPath])

  const handleResolveUrl = async urlToCheck => {
    const url = urlToCheck || tiktokUrl

    if (!url) {
      setError('Please paste a TikTok or Instagram Reels link first!')

      return null
    }

    setLoading(true)
    setError('')
    setResolvedVideoId('')
    setResolvedVideoUrl('')
    setResolvedData(null)

    try {
      let resolvedResult = null

      const isInstagram = url.includes('instagram.com') || url.includes('instagr.am')

      // 1. Try client-side fetch to tikwm directly first (only for TikTok URLs) to bypass server IP block (403)
      if (!isInstagram) {
        try {
          const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`)

          if (response.ok) {
            const result = await response.json()

            if (result.code === 0 && result.data) {
              resolvedResult = {
                videoId: result.data.id,
                videoUrl: result.data.play,
                title: result.data.title || 'TikTok Video',
                duration: result.data.duration || 25,
                cover: result.data.cover || '',
                finalUrl: url
              }
            }
          }
        } catch (clientErr) {
          console.warn('Client-side direct fetch failed or CORS blocked, falling back to server resolver:', clientErr)
        }
      }

      // 2. If client-side fetch failed, fallback to hit our server-side API (which has extra backup APIs and handles Instagram)
      if (!resolvedResult) {
        const response = await fetch('/api/tiktok', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to resolve Video URL')
        }

        resolvedResult = result
      }

      setResolvedVideoId(resolvedResult.videoId)
      setResolvedVideoUrl(resolvedResult.videoUrl || '')
      setResolvedData(resolvedResult)

      if (resolvedResult.duration) {
        setDuration(resolvedResult.duration)
      }

      return resolvedResult
    } catch (err) {
      setError(err.message)
      console.error('Resolve error:', err)

      return null
    } finally {
      setLoading(false)
    }
  }

  const handleSendToOverlay = async () => {
    setError('')
    let data = resolvedData

    // If data is null or the input URL changed, resolve it now
    if (!data || data.finalUrl !== tiktokUrl.trim()) {
      data = await handleResolveUrl()
    }

    if (!data) return

    try {
      const payload = {
        videoId: data.videoId,
        videoUrl: data.videoUrl || '',
        cover: data.cover || '',
        sender: sender.trim() || 'Anonymous',
        message: message.trim(),
        alertSound,
        volume: parseFloat(volume),
        showDuration: parseInt(duration) || data.duration || 25,
        layout,
        isPlaying: true,
        triggeredAt: Date.now()
      }

      // Update overlay in Realtime DB
      await update(ref(db, overlayPath), payload)

      // Add to history list
      await push(ref(db, historyPath), {
        videoId: data.videoId,
        videoUrl: payload.videoUrl || '',
        cover: payload.cover || '',
        sender: payload.sender,
        message: payload.message,
        timestamp: Date.now()
      })

      // Reset main input URL/sender/message for next use
      setTiktokUrl('')
      setSender('')
      setMessage('')
      setResolvedVideoId('')
      setResolvedVideoUrl('')
      setResolvedData(null)
    } catch (err) {
      setError(`Failed to send to overlay: ${err.message}`)
    }
  }

  const handleStopOverlay = async () => {
    try {
      await update(ref(db, overlayPath), { isPlaying: false })
    } catch (err) {
      setError(`Failed to stop overlay: ${err.message}`)
    }
  }

  const handleReplay = async item => {
    try {
      const payload = {
        videoId: item.videoId,
        videoUrl: item.videoUrl || '',
        cover: item.cover || '',
        sender: item.sender || 'Anonymous',
        message: item.message || '',
        alertSound,
        volume: parseFloat(volume),
        showDuration: parseInt(duration) || 25,
        layout,
        isPlaying: true,
        triggeredAt: Date.now()
      }

      await update(ref(db, overlayPath), payload)
    } catch (err) {
      setError(`Failed to replay video: ${err.message}`)
    }
  }

  const handleDeleteHistoryItem = async itemId => {
    try {
      await remove(ref(db, `${historyPath}/${itemId}`))
    } catch (err) {
      setError(`Failed to delete history item: ${err.message}`)
    }
  }

  const handleClearHistory = async () => {
    if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat pemutaran?')) {
      try {
        await remove(ref(db, historyPath))
      } catch (err) {
        setError(`Failed to clear history: ${err.message}`)
      }
    }
  }

  // Copy OBS URL
  const copyObsUrl = () => {
    if (typeof window === 'undefined') return
    const url = `${window.location.origin}/dashboard/operator/overlay/${roomId}`

    navigator.clipboard.writeText(url)
    alert('OBS Overlay URL copied to clipboard!')
  }

  return (
    <div
      className={`p-6 rounded-2xl border shadow-xl w-full ${isDark ? 'bg-slate-950/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
    >
      {/* OBS setup box */}
      <div
        className={`mb-8 p-4 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
      >
        <h3 className="text-base font-bold mb-2 flex items-center gap-2">
          <i className="ri-broadcast-line text-violet-500 animate-pulse" />
          OBS Studio Browser Source Setup (Integrated)
        </h3>
        <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Tambahkan URL di bawah ini sebagai **Browser Source** di OBS Anda. Atur resolusi menjadi **1920x1080** (atau
          rasio 16:9). Overlay ini sudah tergabung dengan **Scoreboard**.
        </p>
        <div className="flex gap-2">
          <code
            className={`flex-1 p-3 rounded text-xs font-mono overflow-x-auto whitespace-nowrap ${isDark ? 'bg-black text-violet-400' : 'bg-slate-200 text-violet-700'}`}
          >
            {typeof window !== 'undefined' ? `${window.location.origin}/dashboard/operator/overlay/${roomId}` : `/dashboard/operator/overlay/${roomId}`}
          </code>
          <button
            onClick={copyObsUrl}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-all text-xs cursor-pointer shadow-md shadow-violet-600/10"
          >
            Copy
          </button>
          <a
            href={`/dashboard/operator/overlay/${roomId}`}
            target="_blank"
            rel="noreferrer"
            className={`px-4 py-2 border rounded-lg font-semibold text-xs flex items-center transition-all cursor-pointer ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
          >
            Test Page
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Trigger and Setup Form */}
        <div
          className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/50 border-slate-200'}`}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <i className="ri-send-plane-fill text-violet-500" />
              Kirim Video Baru
            </h3>

            {/* Live Status indicator */}
            <div
              className={`px-3 py-1 rounded-full border flex items-center gap-2 text-xs font-semibold ${currentOverlay?.isPlaying ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-400' : isDark ? 'border-slate-800 bg-slate-900/40 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-600'}`}
            >
              <span className="flex h-2 w-2 relative">
                {currentOverlay?.isPlaying && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${currentOverlay?.isPlaying ? 'bg-emerald-500' : 'bg-slate-500'}`}
                ></span>
              </span>
              <span>Overlay: {currentOverlay?.isPlaying ? 'Sedang Memutar Video' : 'Mati / Kosong'}</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* TikTok / Instagram Reel Link Input */}
            <div>
              <label
                className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
              >
                TikTok / Instagram Reel Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tiktokUrl}
                  onChange={e => {
                    setTiktokUrl(e.target.value)
                    setResolvedVideoId('') // Clear previous resolve on change
                  }}
                  placeholder="https://tiktok.com/... atau https://instagram.com/reel/..."
                  className={`flex-1 p-3 rounded-lg border text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all ${isDark ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                />
                <button
                  type="button"
                  onClick={() => handleResolveUrl()}
                  disabled={loading || !tiktokUrl}
                  className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer border ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50' : 'border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50'}`}
                >
                  {loading ? 'Resolving...' : 'Check Link'}
                </button>
              </div>
              {resolvedVideoId && (
                <span className="text-[10px] text-emerald-500 font-bold mt-1 block">
                  ✓ Video Terdeteksi (ID: {resolvedVideoId})
                </span>
              )}
            </div>

            {/* Sender & Message */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                >
                  Nama Pengirim (Dari)
                </label>
                <input
                  type="text"
                  value={sender}
                  onChange={e => setSender(e.target.value)}
                  placeholder="e.g. John Doe"
                  className={`w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all ${isDark ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                />
              </div>
              <div>
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                >
                  Durasi Tampil (Detik)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  placeholder="25"
                  className={`w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all ${isDark ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                />
              </div>
            </div>

            <div>
              <label
                className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
              >
                Pesan Pendukung
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Ketik pesan tambahan di sini... (kayak saweria)"
                rows="2"
                className={`w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all resize-none ${isDark ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={handleSendToOverlay}
                disabled={loading || (!tiktokUrl && !resolvedVideoId)}
                className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-violet-650/25 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <i className="ri-play-fill text-lg" />
                Kirim ke Overlay
              </button>

              <button
                onClick={handleStopOverlay}
                className="py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-red-650/25 flex items-center justify-center gap-2"
              >
                <i className="ri-stop-fill text-lg" />
                Hentikan Overlay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* History section */}
      <div
        className={`mt-8 p-6 rounded-xl border ${isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50/30 border-slate-200'}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold flex items-center gap-2">
            <i className="ri-history-line text-violet-500" />
            Riwayat Pemutaran (Maks 10)
          </h3>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-xs text-red-400 hover:text-red-500 font-semibold cursor-pointer"
            >
              Hapus Semua
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className={`text-center py-8 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Belum ada video yang diputar di room ini.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map(item => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border flex items-center justify-between gap-4 transition-all ${isDark ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-900' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-violet-500">{item.sender}</span>
                    <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {item.message && (
                    <div className={`text-xs mt-0.5 truncate italic ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      &quot;{item.message}&quot;
                    </div>
                  )}
                  <div className={`text-[10px] font-mono mt-0.5 truncate ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                    ID: {item.videoId}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleReplay(item)}
                    className="p-2 rounded-lg bg-violet-650/15 hover:bg-violet-650 text-violet-400 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                    title="Mainkan Lagi"
                  >
                    <i className="ri-play-circle-line text-sm" /> Replay
                  </button>
                  <button
                    onClick={() => handleDeleteHistoryItem(item.id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all text-xs cursor-pointer"
                    title="Hapus dari Riwayat"
                  >
                    <i className="ri-delete-bin-6-line text-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
