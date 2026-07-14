'use client'

import { useState, useEffect } from 'react'
import { ref, onValue, update, get } from 'firebase/database'
import { db } from '@/services/firebase/index'

export default function CamlinkOverlayControl({ theme = 'dark', roomId = 'default' }) {
  const isDark = theme === 'dark'

  // Form states
  const [layout, setLayout] = useState('single')
  const [chatUrl, setChatUrl] = useState('')
  const [title, setTitle] = useState('NAMA TOURNAMENT')
  const [isVisible, setIsVisible] = useState(true)
  
  // Names states
  const [nameSingle, setNameSingle] = useState('BUNG ALDO')
  const [nameDual1, setNameDual1] = useState('BUNG ALDO')
  const [nameDual2, setNameDual2] = useState('BUNG HUI')
  const [nameTripleMain, setNameTripleMain] = useState('BUNG ALDO')
  const [nameTriple1, setNameTriple1] = useState('BUNG HUI')
  const [nameTriple2, setNameTriple2] = useState('BUNG GUEST')
  const [nameQuad1, setNameQuad1] = useState('PLAYER 1')
  const [nameQuad2, setNameQuad2] = useState('PLAYER 2')
  const [nameQuad3, setNameQuad3] = useState('PLAYER 3')
  const [nameQuad4, setNameQuad4] = useState('PLAYER 4')
  
  // Status states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const overlayPath = `match_live/${roomId}/camlink_overlay`

  // Fetch current state from Firebase
  useEffect(() => {
    if (!roomId) return
    const dbRef = ref(db, overlayPath)

    // Load initial form data ONCE so it doesn't overwrite unsaved typing
    get(dbRef).then(snapshot => {
      const data = snapshot.val()
      if (data) {
        if (data.layout) setLayout(data.layout)
        if (data.chatUrl) setChatUrl(data.chatUrl)
        if (data.title) setTitle(data.title)
        if (data.names) {
          if (data.names.single) setNameSingle(data.names.single)
          if (data.names.dual1) setNameDual1(data.names.dual1)
          if (data.names.dual2) setNameDual2(data.names.dual2)
          if (data.names.tripleMain) setNameTripleMain(data.names.tripleMain)
          if (data.names.triple1) setNameTriple1(data.names.triple1)
          if (data.names.triple2) setNameTriple2(data.names.triple2)
          if (data.names.quad1) setNameQuad1(data.names.quad1)
          if (data.names.quad2) setNameQuad2(data.names.quad2)
          if (data.names.quad3) setNameQuad3(data.names.quad3)
          if (data.names.quad4) setNameQuad4(data.names.quad4)
        }
      }
    })

    // Listen to real-time visibility updates only
    const unsubscribe = onValue(dbRef, snapshot => {
      const data = snapshot.val()
      if (data && data.isVisible !== undefined) {
        setIsVisible(data.isVisible)
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
        isVisible: true,
        layout,
        chatUrl: finalChatUrl,
        title,
        names: {
          single: nameSingle,
          dual1: nameDual1,
          dual2: nameDual2,
          tripleMain: nameTripleMain,
          triple1: nameTriple1,
          triple2: nameTriple2,
          quad1: nameQuad1,
          quad2: nameQuad2,
          quad3: nameQuad3,
          quad4: nameQuad4
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

  const handleHide = async () => {
    setLoading(true)
    setError('')
    setSuccessMsg('')
    try {
      await update(ref(db, overlayPath), { isVisible: false })
      setSuccessMsg('Overlay berhasil disembunyikan!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setError(`Gagal sembunyikan overlay: ${err.message}`)
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
    { id: 'quad', label: 'Quad Cam' },
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
              className="px-4 py-2 bg-[#a78bfa] hover:bg-[#8b5cf6] text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all text-xs cursor-pointer whitespace-nowrap uppercase tracking-wider"
            >
              Copy Link
            </button>
            <a
              href={`/${roomId}/camlink`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 border-2 border-black font-black text-xs flex items-center transition-all cursor-pointer whitespace-nowrap uppercase tracking-wider bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
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
            
            {/* Title Settings */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Judul Overlay (Title)
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Contoh: EL CLASICO MATCH"
                className={`w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all ${isDark ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
              />
            </div>

            <hr className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />

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
                    className={`p-3 border-2 font-bold text-sm transition-all text-center cursor-pointer uppercase tracking-wider ${
                      layout === l.id 
                        ? 'bg-[#c4b5fd] border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' 
                        : isDark 
                          ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-black hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1' 
                          : 'bg-white border-black text-black hover:bg-slate-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1'
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
                    placeholder="Kamera 1"
                    className={`w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all ${isDark ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  />
                  <input
                    type="text"
                    value={nameTriple1}
                    onChange={e => setNameTriple1(e.target.value)}
                    placeholder="Kamera 2"
                    className={`w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all ${isDark ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  />
                  <input
                    type="text"
                    value={nameTriple2}
                    onChange={e => setNameTriple2(e.target.value)}
                    placeholder="Kamera 3"
                    className={`w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all ${isDark ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  />
                </div>
              ) : null}

              {layout === 'quad' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={nameQuad1}
                    onChange={e => setNameQuad1(e.target.value)}
                    placeholder="Kamera 1 (Kiri Atas)"
                    className={`w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all ${isDark ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  />
                  <input
                    type="text"
                    value={nameQuad2}
                    onChange={e => setNameQuad2(e.target.value)}
                    placeholder="Kamera 2 (Kanan Atas)"
                    className={`w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all ${isDark ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  />
                  <input
                    type="text"
                    value={nameQuad3}
                    onChange={e => setNameQuad3(e.target.value)}
                    placeholder="Kamera 3 (Kiri Bawah)"
                    className={`w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all ${isDark ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  />
                  <input
                    type="text"
                    value={nameQuad4}
                    onChange={e => setNameQuad4(e.target.value)}
                    placeholder="Kamera 4 (Kanan Bawah)"
                    className={`w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all ${isDark ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  />
                </div>
              ) : null}
            </div>

            {/* Action Buttons */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-bold flex items-center gap-2 ${isVisible ? 'text-emerald-500' : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
                  <span className={`w-3 h-3 rounded-full ${isVisible ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
                  Status: {isVisible ? 'LIVE (Tampil di OBS)' : 'HIDDEN (Disembunyikan)'}
                </span>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="flex-1 py-3 px-8 bg-[#34d399] hover:bg-[#10b981] text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <i className="ri-save-3-line text-xl" />
                  {loading ? 'Menyimpan...' : 'Terapkan & Tampilkan'}
                </button>
                <button
                  onClick={handleHide}
                  disabled={loading || !isVisible}
                  className={`flex-1 py-3 px-8 text-black font-black border-2 border-black transition-all flex items-center justify-center gap-2 uppercase tracking-wider ${!isVisible ? 'bg-slate-300 opacity-50 cursor-not-allowed' : 'bg-[#fb7185] hover:bg-[#e11d48] cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'}`}
                >
                  <i className="ri-eye-off-line text-xl" />
                  Sembunyikan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
