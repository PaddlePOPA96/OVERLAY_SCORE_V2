'use client'

import { useState, useEffect } from 'react'
import { getClubs, getPlayersByClub, searchAllPlayers } from '@/shared/actions/playerActions'

export default function PlayerSearchModal({ isOpen, onClose, onSelect, theme = 'dark', homeTeam, awayTeam }) {
  const [activeTab, setActiveTab] = useState('club') // 'club' or 'global'

  // Club Mode State
  const [clubs, setClubs] = useState([])
  const [filteredClubs, setFilteredClubs] = useState([])
  const [clubSearch, setClubSearch] = useState('')
  const [selectedClub, setSelectedClub] = useState(null)
  const [players, setPlayers] = useState([])
  const [playerSearch, setPlayerSearch] = useState('')

  // Global Mode State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('')
  const [globalResults, setGlobalResults] = useState([])

  const [isLoading, setIsLoading] = useState(false)

  // Load clubs when modal opens
  useEffect(() => {
    if (isOpen && clubs.length === 0) {
      setIsLoading(true)
      getClubs().then(data => {
        setClubs(data || [])
        setFilteredClubs(data || [])
        setIsLoading(false)
      })
    }
  }, [isOpen, clubs.length])

  // Filter clubs locally
  useEffect(() => {
    if (!clubSearch) {
      setFilteredClubs(clubs)
      return
    }
    const lower = clubSearch.toLowerCase()
    setFilteredClubs(clubs.filter(c => c.name.toLowerCase().includes(lower)))
  }, [clubSearch, clubs])

  // Load players when a club is selected
  useEffect(() => {
    if (selectedClub) {
      setIsLoading(true)
      getPlayersByClub(selectedClub.id).then(data => {
        setPlayers(data || [])
        setIsLoading(false)
      })
    }
  }, [selectedClub])

  // Global Search Debounce
  useEffect(() => {
    if (activeTab !== 'global') return
    if (globalSearchQuery.length < 3) {
      setGlobalResults([])
      return
    }
    const delayDebounceFn = setTimeout(() => {
      setIsLoading(true)
      searchAllPlayers(globalSearchQuery).then(res => {
        setGlobalResults(res || [])
        setIsLoading(false)
      })
    }, 400)
    return () => clearTimeout(delayDebounceFn)
  }, [globalSearchQuery, activeTab])

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('club')
      setClubSearch('')
      setSelectedClub(null)
      setPlayerSearch('')
      setPlayers([])
      setGlobalSearchQuery('')
      setGlobalResults([])
    }
  }, [isOpen])

  if (!isOpen) return null

  const isLight = theme === 'light'
  
  const bgColor = isLight ? '#ffffff' : '#020617'
  const textColor = isLight ? '#334155' : '#e5e7eb'
  const borderColor = isLight ? '#e2e8f0' : '#1f2937'
  const titleColor = isLight ? '#2563eb' : '#60a5fa'
  const btnBg = isLight ? '#f1f5f9' : '#1f2937'
  const btnBorder = isLight ? '#cbd5e1' : '#374151'
  const btnText = isLight ? '#475569' : '#e5e7eb'
  const inputBg = isLight ? '#ffffff' : '#090d16'
  const inputBorder = isLight ? '#cbd5e1' : '#3b82f6'
  const inputColor = isLight ? '#0f172a' : '#ffffff'
  const itemBg = isLight ? '#f8fafc' : '#0f172a'
  const itemBorder = isLight ? '#e2e8f0' : '#1e293b'
  const itemHover = isLight ? '#f1f5f9' : '#1e293b'
  const itemText = isLight ? '#0f172a' : '#f8fafc'
  const itemSubText = isLight ? '#64748b' : '#9ca3af'

  const handleQuickMatch = (teamName) => {
    const lower = teamName.toLowerCase()
    const matched = clubs.find(c => c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase()))
    
    if (matched) {
      setSelectedClub(matched)
    } else {
      setClubSearch(teamName)
    }
  }

  const displayedPlayers = playerSearch 
    ? players.filter(p => p.name.toLowerCase().includes(playerSearch.toLowerCase()))
    : players;

  const renderPlayerItem = (p, i) => (
    <div
      key={i}
      onClick={() => {
        onSelect(p)
        onClose()
      }}
      style={{ padding: '10px 12px', background: itemBg, border: `1px solid ${itemBorder}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      onMouseEnter={e => e.currentTarget.style.background = itemHover}
      onMouseLeave={e => e.currentTarget.style.background = itemBg}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {p.img_url && p.img_url !== "" ? (
          <img src={p.img_url} alt={p.name} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>?</div>
        )}
        <span style={{ fontWeight: 600, fontSize: '14px', color: itemText }}>{p.name}</span>
      </div>
      <span style={{ fontSize: '12px', color: itemSubText }}>{p.club}</span>
    </div>
  )

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center'
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
    >
      <div
        style={{
          background: bgColor,
          color: textColor,
          padding: '20px',
          borderRadius: '16px',
          width: '500px',
          height: '600px',
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${borderColor}`,
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${borderColor}`, paddingBottom: '12px', marginBottom: '12px' }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: titleColor }}>Pencarian Pemain</span>
          <div role="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }} style={{ padding: '5px 12px', background: btnBg, border: `1px solid ${btnBorder}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: btnText }}>
            Tutup
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button 
            onClick={() => setActiveTab('club')}
            style={{ flex: 1, padding: '8px', background: activeTab === 'club' ? titleColor : btnBg, color: activeTab === 'club' ? '#fff' : textColor, border: `1px solid ${activeTab === 'club' ? titleColor : btnBorder}`, borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
          >
            Pilih Dari Tim
          </button>
          <button 
            onClick={() => setActiveTab('global')}
            style={{ flex: 1, padding: '8px', background: activeTab === 'global' ? titleColor : btnBg, color: activeTab === 'global' ? '#fff' : textColor, border: `1px solid ${activeTab === 'global' ? titleColor : btnBorder}`, borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
          >
            Cari Global (Semua Tim)
          </button>
        </div>

        {activeTab === 'club' ? (
          // --- TAB: CLUB ---
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              {selectedClub && (
                <button 
                  onClick={() => {
                    setSelectedClub(null)
                    setPlayerSearch('')
                  }}
                  style={{ padding: '4px 8px', background: 'transparent', border: `1px solid ${borderColor}`, borderRadius: '4px', cursor: 'pointer', color: textColor }}
                >
                  ← Kembali
                </button>
              )}
              <span style={{ fontWeight: 600, fontSize: 14, color: textColor }}>
                {selectedClub ? `Menampilkan pemain ${selectedClub.name}:` : '1. Pilih Klub / Negara terlebih dahulu'}
              </span>
            </div>

            {!selectedClub ? (
              <>
                <input
                  autoFocus
                  value={clubSearch}
                  onChange={e => setClubSearch(e.target.value)}
                  placeholder="Ketik nama klub atau negara..."
                  style={{ width: '100%', padding: '10px 14px', background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: '8px', color: inputColor, fontSize: '14px', outline: 'none' }}
                />
                
                {(homeTeam || awayTeam) && !clubSearch && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    {homeTeam && homeTeam !== 'HOME' && homeTeam !== 'NRG' && homeTeam !== 'XLG' && (
                      <button 
                        onClick={() => handleQuickMatch(homeTeam)}
                        style={{ flex: 1, padding: '8px', background: btnBg, border: `1px solid ${btnBorder}`, borderRadius: '8px', color: textColor, fontSize: '13px', cursor: 'pointer', textAlign: 'left', fontWeight: '600' }}
                      >
                        🏠 Tim Home: {homeTeam}
                      </button>
                    )}
                    {awayTeam && awayTeam !== 'AWAY' && awayTeam !== 'NRG' && awayTeam !== 'XLG' && (
                      <button 
                        onClick={() => handleQuickMatch(awayTeam)}
                        style={{ flex: 1, padding: '8px', background: btnBg, border: `1px solid ${btnBorder}`, borderRadius: '8px', color: textColor, fontSize: '13px', cursor: 'pointer', textAlign: 'left', fontWeight: '600' }}
                      >
                        ✈️ Tim Away: {awayTeam}
                      </button>
                    )}
                  </div>
                )}

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                  {filteredClubs.map((club) => (
                    <div
                      key={club.id}
                      onClick={() => setSelectedClub(club)}
                      style={{ padding: '12px', background: itemBg, border: `1px solid ${itemBorder}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      onMouseEnter={e => e.currentTarget.style.background = itemHover}
                      onMouseLeave={e => e.currentTarget.style.background = itemBg}
                    >
                      <span style={{ fontWeight: 600, fontSize: '14px', color: itemText }}>{club.name}</span>
                      <span style={{ fontSize: '12px', color: titleColor }}>Pilih &rarr;</span>
                    </div>
                  ))}
                  {filteredClubs.length === 0 && !isLoading && (
                    <span style={{ textAlign: 'center', color: itemSubText, fontSize: '13px', marginTop: '20px' }}>
                      Klub tidak ditemukan.
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <input
                  autoFocus
                  value={playerSearch}
                  onChange={e => setPlayerSearch(e.target.value)}
                  placeholder={`Cari pemain di ${selectedClub.name}...`}
                  style={{ width: '100%', padding: '10px 14px', background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: '8px', color: inputColor, fontSize: '14px', outline: 'none' }}
                />
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                  {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: itemSubText }}>Memuat data pemain...</div>
                  ) : (
                    <>
                      {displayedPlayers.map((p, i) => renderPlayerItem(p, i))}
                      {displayedPlayers.length === 0 && (
                        <span style={{ textAlign: 'center', color: itemSubText, fontSize: '13px', marginTop: '20px' }}>
                          Pemain tidak ditemukan.
                        </span>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          // --- TAB: GLOBAL ---
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: textColor, marginBottom: '12px' }}>
              Cari nama pemain di seluruh database:
            </span>
            <input
              autoFocus
              value={globalSearchQuery}
              onChange={e => setGlobalSearchQuery(e.target.value)}
              placeholder="Ketik minimal 3 huruf nama pemain..."
              style={{ width: '100%', padding: '10px 14px', background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: '8px', color: inputColor, fontSize: '14px', outline: 'none' }}
            />
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: itemSubText }}>Mencari di seluruh database...</div>
              ) : (
                <>
                  {globalResults.map((p, i) => renderPlayerItem(p, `global-${i}`))}
                  
                  {globalResults.length === 0 && globalSearchQuery.length >= 3 && (
                    <span style={{ textAlign: 'center', color: itemSubText, fontSize: '13px', marginTop: '20px' }}>
                      Pemain tidak ditemukan.
                    </span>
                  )}
                  {globalSearchQuery.length > 0 && globalSearchQuery.length < 3 && (
                    <span style={{ textAlign: 'center', color: itemSubText, fontSize: '13px', marginTop: '20px' }}>
                      Ketik lebih panjang untuk mencari...
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
