'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import PlayerSearchModal from './PlayerSearchModal'

export default function ThirdTitleControls({ data, actions, theme = 'dark' }) {
  const [playersData, setPlayersData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [eventType, setEventType] = useState('goal') // goal, yellow_card, red_card
  const [isLoading, setIsLoading] = useState(true)

  const isLight = theme === 'light'
  const labelColor = isLight ? '#000000' : '#ffffff'
  const borderCol = isLight ? '#cbd5e1' : '#333'

  useEffect(() => {
    fetch('/fix-player.json')
      .then(res => res.json())
      .then(data => {
        const clubsArray = data.players || []
        const flatPlayers = []
        clubsArray.forEach(c => {
          c.players.forEach(p => {
            flatPlayers.push({ club: c.club, name: p.name, img_url: p.img_url })
          })
        })
        setPlayersData(flatPlayers)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Error loading players:', err)
        setIsLoading(false)
      })
  }, [])

  const handleShow = () => {
    if (!searchQuery) return
    const player = playersData.find(p => p.name === searchQuery)
    if (player) {
      actions.triggerThirdTitle(eventType, player.name, player.img_url)
    } else {
      actions.triggerThirdTitle(eventType, searchQuery, '')
    }
  }

  const handleHide = () => {
    actions.hideThirdTitle()
  }

  const isShowing = data?.thirdTitle?.isShowing

  if (isLoading) {
    return <div className="p-4 text-xs text-slate-400">Loading players database...</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: labelColor, margin: 0 }}>
        🌟 Third Title Overlay (Events)
      </h3>
      
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {/* Event Type */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '100px' }}>
          <label className='op-label' style={{ fontSize: '11px', color: labelColor }}>Event</label>
          <select
            className='op-input'
            value={eventType}
            onChange={e => setEventType(e.target.value)}
            style={{
              width: '100%', height: '32px', padding: '0 8px',
              background: isLight ? '#fff' : '#090d16',
              border: `1px solid ${borderCol}`,
              borderRadius: '6px', color: isLight ? '#000' : '#fff', fontSize: '12px'
            }}
          >
            <option value="goal">⚽ Goal</option>
            <option value="yellow_card">🟨 Yellow Card</option>
            <option value="red_card">🟥 Red Card</option>
          </select>
        </div>

        {/* Player Search Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 2, minWidth: '180px' }}>
          <label className='op-label' style={{ fontSize: '11px', color: labelColor }}>Pilih Player</label>
          <div
            role="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsModalOpen(true); }}
            style={{
              width: '100%', height: '32px', padding: '0 8px',
              background: isLight ? '#fff' : '#090d16',
              border: `1px solid ${borderCol}`,
              borderRadius: '6px', color: isLight ? '#000' : '#fff', fontSize: '12px',
              textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {searchQuery || 'Pilih pemain...'}
            </span>
            <span style={{ fontSize: '10px', opacity: 0.6 }}>🔍 Cari</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <Button
          onClick={handleShow}
          style={{
            flex: 1, height: '36px', fontSize: '12px', fontWeight: 'bold',
            background: isShowing ? '#4b5563' : '#3b82f6', color: '#fff'
          }}
        >
          {isShowing ? 'Update Display' : '▶ Show Third Title'}
        </Button>
        <Button
          onClick={handleHide}
          variant="outline"
          style={{
            flex: 1, height: '36px', fontSize: '12px', fontWeight: 'bold',
            borderColor: isShowing ? '#ef4444' : borderCol,
            color: isShowing ? '#ef4444' : labelColor
          }}
          disabled={!isShowing}
        >
          ⏹ Hide Third Title
        </Button>
      </div>

      <PlayerSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        playersData={playersData}
        theme={theme}
        onSelect={(p) => {
          setSearchQuery(p.name)
          setIsModalOpen(false)
        }}
      />
    </div>
  )
}
