'use client'

import { useState, useEffect } from 'react'
import { ref, onValue, set } from 'firebase/database'
import { db } from '@/services/firebase/db'
import Select from '@/components/ui/Select'

export default function CamlinkControls({ roomId, theme = 'dark' }) {
  const [layout, setLayout] = useState('single')
  const [title, setTitle] = useState('NAMA TOURNAMENT')
  const [chatUrl, setChatUrl] = useState('')
  const [names, setNames] = useState({
    single: 'BUNG ALDO',
    dual1: 'BUNG ALDO',
    dual2: 'BUNG HUI',
    tripleMain: 'BUNG ALDO',
    triple1: 'BUNG HUI',
    triple2: 'BUNG ALDO',
    quad1: 'PLAYER 1',
    quad2: 'PLAYER 2',
    quad3: 'PLAYER 3',
    quad4: 'PLAYER 4'
  })

  useEffect(() => {
    if (!roomId) return
    const dbRef = ref(db, `match_live/global_camlink_overlay`)
    const unsubscribe = onValue(dbRef, snapshot => {
      const val = snapshot.val()
      if (val) {
        if (val.layout) setLayout(val.layout)
        if (val.title !== undefined) setTitle(val.title)
        if (val.chatUrl !== undefined) setChatUrl(val.chatUrl)
        if (val.names) {
          setNames(prev => ({ ...prev, ...val.names }))
        }
      }
    })
    return () => unsubscribe()
  }, [roomId])

  const handleSave = () => {
    if (!roomId) return
    const dbRef = ref(db, `match_live/global_camlink_overlay`)
    set(dbRef, {
      layout,
      title,
      chatUrl,
      names
    }).then(() => {
      alert('✅ Konfigurasi Camlink Overlay Berhasil Disimpan!')
    }).catch((err) => {
      console.error(err)
      alert('❌ Gagal menyimpan konfigurasi')
    })
  }

  const handleNameChange = (key, value) => {
    setNames(prev => ({ ...prev, [key]: value }))
  }

  const isLight = true // following UnifiedOperatorControls pattern
  const labelColor = isLight ? '#000000' : '#ffffff'

  return (
    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ background: '#f8fafc', border: '3px solid #000', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '950', color: '#000', borderBottom: '3px solid #000', paddingBottom: '8px', margin: '0', textTransform: 'uppercase' }}>
          🎥 Camlink Setup
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '12px' }}>
          {/* General Config */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            <Select
              label='Layout Mode'
              value={layout}
              onChange={e => setLayout(e.target.value)}
              options={[
                { value: 'single', label: '1 Cam (Single)' },
                { value: 'dual', label: '2 Cam (Dual)' },
                { value: 'triple', label: '3 Cam (Triple)' },
                { value: 'quad', label: '4 Cam (Quad)' },
                { value: 'chat', label: '1 Cam + Live Chat' }
              ]}
              fullWidth
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: labelColor }}>Header Title / Tournament Name</label>
              <input
                type='text'
                className='op-input'
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ width: '100%', height: '40px', padding: '0 10px', background: isLight ? '#ffffff' : '#090d16', border: `2px solid #000`, borderRadius: '8px', color: isLight ? '#0f172a' : '#fff', fontSize: '13px', fontWeight: 'bold' }}
                placeholder="NAMA TOURNAMENT"
              />
            </div>

            {layout === 'chat' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: labelColor }}>YouTube Live Chat URL</label>
                <input
                  type='text'
                  className='op-input'
                  value={chatUrl}
                  onChange={e => setChatUrl(e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 10px', background: isLight ? '#ffffff' : '#090d16', border: `2px solid #000`, borderRadius: '8px', color: isLight ? '#0f172a' : '#fff', fontSize: '13px', fontWeight: 'bold' }}
                  placeholder="https://youtube.com/live_chat?v=..."
                />
              </div>
            )}
          </div>

          {/* Names Config */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#ffffff', padding: '12px', border: '2px dashed #000', borderRadius: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: labelColor, borderBottom: '2px solid #e2e8f0', paddingBottom: '4px' }}>Name Plates</label>
            
            {(layout === 'single' || layout === 'chat') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>Main Cam Name</label>
                <input
                  type='text'
                  value={names.single}
                  onChange={e => handleNameChange('single', e.target.value)}
                  style={{ width: '100%', height: '36px', padding: '0 10px', border: `2px solid #e2e8f0`, borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}
                />
              </div>
            )}

            {layout === 'dual' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>Cam 1 Name</label>
                  <input
                    type='text'
                    value={names.dual1}
                    onChange={e => handleNameChange('dual1', e.target.value)}
                    style={{ width: '100%', height: '36px', padding: '0 10px', border: `2px solid #e2e8f0`, borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>Cam 2 Name</label>
                  <input
                    type='text'
                    value={names.dual2}
                    onChange={e => handleNameChange('dual2', e.target.value)}
                    style={{ width: '100%', height: '36px', padding: '0 10px', border: `2px solid #e2e8f0`, borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}
                  />
                </div>
              </>
            )}

            {layout === 'triple' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>Top Left Name</label>
                  <input
                    type='text'
                    value={names.tripleMain}
                    onChange={e => handleNameChange('tripleMain', e.target.value)}
                    style={{ width: '100%', height: '36px', padding: '0 10px', border: `2px solid #e2e8f0`, borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>Top Right Name</label>
                  <input
                    type='text'
                    value={names.triple1}
                    onChange={e => handleNameChange('triple1', e.target.value)}
                    style={{ width: '100%', height: '36px', padding: '0 10px', border: `2px solid #e2e8f0`, borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>Bottom Cam Name</label>
                  <input
                    type='text'
                    value={names.triple2}
                    onChange={e => handleNameChange('triple2', e.target.value)}
                    style={{ width: '100%', height: '36px', padding: '0 10px', border: `2px solid #e2e8f0`, borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}
                  />
                </div>
              </>
            )}

            {layout === 'quad' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>Cam 1 (Top L)</label>
                  <input type='text' value={names.quad1} onChange={e => handleNameChange('quad1', e.target.value)} style={{ width: '100%', height: '36px', padding: '0 10px', border: `2px solid #e2e8f0`, borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>Cam 2 (Top R)</label>
                  <input type='text' value={names.quad2} onChange={e => handleNameChange('quad2', e.target.value)} style={{ width: '100%', height: '36px', padding: '0 10px', border: `2px solid #e2e8f0`, borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>Cam 3 (Bot L)</label>
                  <input type='text' value={names.quad3} onChange={e => handleNameChange('quad3', e.target.value)} style={{ width: '100%', height: '36px', padding: '0 10px', border: `2px solid #e2e8f0`, borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>Cam 4 (Bot R)</label>
                  <input type='text' value={names.quad4} onChange={e => handleNameChange('quad4', e.target.value)} style={{ width: '100%', height: '36px', padding: '0 10px', border: `2px solid #e2e8f0`, borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }} />
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          className='neo-btn-lg'
          onClick={handleSave}
          style={{ background: '#fbbf24', color: '#000000', border: '3px solid #000', height: '48px', fontSize: '14px', fontWeight: '900', marginTop: '8px', cursor: 'pointer' }}
        >
          💾 SIMPAN CAMLINK
        </button>

      </div>
    </div>
  )
}
