'use client'

import { useState, useMemo } from 'react'

export default function PlayerSearchModal({ isOpen, onClose, playersData, onSelect, theme = 'dark' }) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter up to 50 options to prevent lag
  const datalistOptions = useMemo(() => {
    const safePlayers = Array.isArray(playersData) ? playersData : []
    if (searchQuery.length < 4) return []
    const lowerQuery = searchQuery.toLowerCase()
    return safePlayers
      .filter(p => p && p.name && p.name.toLowerCase().includes(lowerQuery))
      .slice(0, 50)
  }, [playersData, searchQuery])

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
          gap: '12px',
          border: `1px solid ${borderColor}`,
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${borderColor}`, paddingBottom: '12px' }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: titleColor }}>Cari Pemain</span>
          <div role="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }} style={{ padding: '5px 12px', background: btnBg, border: `1px solid ${btnBorder}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: btnText }}>
            Tutup
          </div>
        </div>

        <input
          autoFocus
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (datalistOptions.length > 0) {
                onSelect(datalistOptions[0]);
                setSearchQuery('');
              }
            }
          }}
          placeholder="Ketik nama pemain..."
          style={{ width: '100%', padding: '10px 14px', background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: '8px', color: inputColor, fontSize: '14px', outline: 'none' }}
        />

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
          {datalistOptions.map((p, i) => (
            <div
              key={i}
              onClick={() => {
                onSelect(p)
                setSearchQuery('')
              }}
              style={{ padding: '10px 12px', background: itemBg, border: `1px solid ${itemBorder}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = itemHover}
              onMouseLeave={e => e.currentTarget.style.background = itemBg}
            >
              <span style={{ fontWeight: 600, fontSize: '14px', color: itemText }}>{p.name}</span>
              <span style={{ fontSize: '12px', color: itemSubText }}>{p.club}</span>
            </div>
          ))}
          {datalistOptions.length === 0 && (
            <span style={{ textAlign: 'center', color: itemSubText, fontSize: '13px', marginTop: '20px' }}>
              {searchQuery.length < 4 ? 'Ketik minimal 4 huruf untuk mencari pemain...' : 'Pemain tidak ditemukan'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
