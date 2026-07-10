'use client'

import { useState, useEffect } from 'react'
import { ref, onValue, update } from 'firebase/database'
import { db } from '@/services/firebase/index'

export default function CamlinkOverlayControl({ theme = 'dark', roomId = 'default' }) {
  const isDark = theme === 'dark'

  // Form states
  const [layout, setLayout] = useState('single')
  const [chatUrl, setChatUrl] = useState('')
  
  // Names states
  const [nameSingle, setNameSingle] = useState('BUNG ALDO')
  const [nameDual1, setNameDual1] = useState('BUNG ALDO')
  const [nameDual2, setNameDual2] = useState('BUNG HUI')
  const [nameTripleMain, setNameTripleMain] = useState('MAIN EVENT')
  const [nameTriple1, setNameTriple1] = useState('BUNG ALDO')
  const [nameTriple2, setNameTriple2] = useState('BUNG HUI')
  
  // Status states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const overlayPath = `match_live/${roomId}/camlink_overlay`

  // Fetch current state from Firebase
  useEffect(() => {
    if (!roomId) return
    const dbRef = ref(db, overlayPath)

    const unsubscribe = onValue(dbRef, snapshot => {
      const data = snapshot.val()
      if (data) {
        if (data.layout) setLayout(data.layout)
        if (data.chatUrl) setChatUrl(data.chatUrl)
        if (data.names) {
          if (data.names.single) setNameSingle(data.names.single)
          if (data.names.dual1) setNameDual1(data.names.dual1)
          if (data.names.dual2) setNameDual2(data.names.dual2)
          if (data.names.tripleMain) setNameTripleMain(data.names.tripleMain)
          if (data.names.triple1) setNameTriple1(data.names.triple1)
          if (data.names.triple2) setNameTriple2(data.names.triple2)
        }
      }
    })

    return () => unsubscribe()
  }, [roomId, overlayPath])

  const handleUpdate = async () => {
    setLoading(true)
    setError('')
    setSuccessMsg('')
    
    try {
      let finalChatUrl = chatUrl.trim()
      if (finalChatUrl && !finalChatUrl.startsWith('http://') && !finalChatUrl.startsWith('https://')) {
        finalChatUrl = 'https://' + finalChatUrl
      }

      const payload = {
        layout,
        chatUrl: finalChatUrl,
        names: {
          single: nameSingle,
          dual1: nameDual1,
          dual2: nameDual2,
          tripleMain: nameTripleMain,
          triple1: nameTriple1,
          triple2: nameTriple2
        },
        updatedAt: Date.now()
      }

      await update(ref(db, overlayPath), payload)
      setSuccessMsg('Overlay berhasil diupdate!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setError(`Gagal update overlay: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const copyObsUrl = () => {
    if (typeof window === 'undefined') return
    const url = `${window.location.origin}/${roomId}/camlink`
    navigator.clipboard.writeText(url)
    alert('OBS Camlink URL copied to clipboard!')
  }

  const layouts = [
    { id: 'single', label: '1 Cam' },
    { id: 'dual', label: 'Dual Cam' },
    { id: 'triple', label: 'Triple Cam' },
    { id: 'chat', label: '1 Cam + Chat' }
  ]

  return (
    <div className={`p-6 rounded-2xl border shadow-xl w-full ${isDark ? 'bg-slate-950/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
      
      {/* OBS setup box */}
      <div className={`mb-8 p-4 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="text-base font-bold mb-2 flex items-center gap-2">
          <i className="ri-broadcast-line text-violet-500 animate-pulse" />
          OBS Studio Browser Source Setup
        </h3>
        <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Tambahkan URL di bawah ini sebagai **Browser Source** di OBS Anda. Atur resolusi menjadi **1920x1080**.<br/>
          Jangan lupa tambahkan filter <b>Chroma Key</b> warna <b>Magenta</b> pada Browser Source di OBS.
        </p>
        <div className="flex flex-col md:flex-row gap-2">
          <code className={`flex-1 p-3 rounded text-xs font-mono overflow-x-auto whitespace-nowrap ${isDark ? 'bg-black text-violet-400' : 'bg-slate-200 text-violet-700'}`}>
            {typeof window !== 'undefined' ? `${window.location.origin}/${roomId}/camlink` : `/${roomId}/camlink`}
          </code>
          <div className="flex gap-2">
            <button
              onClick={copyObsUrl}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-all text-xs cursor-pointer shadow-md shadow-violet-600/10 whitespace-nowrap"
            >
              Copy Link
            </button>
            <a
              href={`/${roomId}/camlink`}
              target="_blank"
              rel="noreferrer"
              className={`px-4 py-2 border rounded-lg font-semibold text-xs flex items-center transition-all cursor-pointer whitespace-nowrap ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
            >
              Test Page
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/50 border-slate-200'}`}>
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <i className="ri-settings-4-fill text-violet-500" />
            Control Panel Camlink
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-xs font-semibold">
              ✓ {successMsg}
            </div>
          )}

          <div className="flex flex-col gap-5">
            
            {/* Layout Selection */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Pilih Layout
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {layouts.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setLayout(l.id)}
                    className={`p-3 rounded-lg border font-semibold text-sm transition-all text-center cursor-pointer ${
                      layout === l.id 
                        ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/30' 
                        : isDark 
                          ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750' 
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat URL Input (Only relevant for chat layout) */}
            <div className={layout === 'chat' ? 'block' : 'opacity-50'}>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                YouTube Chat URL
              </label>
              <input
                type="text"
                value={chatUrl}
                onChange={e => setChatUrl(e.target.value)}
                placeholder="https://www.youtube.com/live_chat?v=..."
                className={`w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all ${isDark ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
              />
            </div>

            <hr className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
            
            {/* Name Settings based on layout */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Atur Nama Caster / Label
              </label>
              
              {layout === 'single' || layout === 'chat' ? (
                <div>
                  <input
                    type="text"
                    value={nameSingle}
                    onChange={e => setNameSingle(e.target.value)}
                    placeholder="Nama Caster"
                    className={`w-full md:w-1/2 p-3 rounded-lg border text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all ${isDark ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  />
                </div>
              ) : null}

              {layout === 'dual' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={nameDual1}
                    onChange={e => setNameDual1(e.target.value)}
                    placeholder="Nama Caster 1 (Kiri)"
                    className={`w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all ${isDark ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  />
                  <input
                    type="text"
                    value={nameDual2}
                    onChange={e => setNameDual2(e.target.value)}
                    placeholder="Nama Caster 2 (Kanan)"
                    className={`w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all ${isDark ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  />
                </div>
              ) : null}

              {layout === 'triple' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={nameTripleMain}
                    onChange={e => setNameTripleMain(e.target.value)}
                    placeholder="Label Main Event (Kiri Besar)"
                    className={`w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all ${isDark ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  />
                  <input
                    type="text"
                    value={nameTriple1}
                    onChange={e => setNameTriple1(e.target.value)}
                    placeholder="Nama Caster 1 (Kanan Atas)"
                    className={`w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all ${isDark ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  />
                  <input
                    type="text"
                    value={nameTriple2}
                    onChange={e => setNameTriple2(e.target.value)}
                    placeholder="Nama Caster 2 (Kanan Bawah)"
                    className={`w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all ${isDark ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  />
                </div>
              ) : null}
            </div>

            {/* Action Buttons */}
            <div className="mt-4">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="w-full md:w-auto py-3 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-emerald-600/25 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <i className="ri-save-3-line text-lg" />
                {loading ? 'Menyimpan...' : 'Terapkan ke Layar (Update)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
