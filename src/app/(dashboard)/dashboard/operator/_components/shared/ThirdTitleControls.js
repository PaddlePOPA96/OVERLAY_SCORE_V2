'use client'

import { useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import PlayerSearchModal from './PlayerSearchModal'

export default function ThirdTitleControls({ data, actions, theme = 'dark' }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [eventType, setEventType] = useState('goal') // goal, yellow_card, red_card

  const isLight = theme === 'light'
  const labelColor = isLight ? '#000000' : '#ffffff'
  const borderCol = isLight ? '#cbd5e1' : '#333'

  const handleShow = () => {
    if (!selectedPlayer) return
    actions.triggerThirdTitle(eventType, selectedPlayer.name, selectedPlayer.img_url)
  }

  const handleHide = () => {
    actions.hideThirdTitle()
  }

  const isShowing = data?.thirdTitle?.isShowing

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
            <option value="mvp">🏆 MVP</option>
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
              {selectedPlayer ? selectedPlayer.name : 'Pilih pemain...'}
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
        theme={theme}
        homeTeam={data?.homeFullName || data?.homeName}
        awayTeam={data?.awayFullName || data?.awayName}
        onSelect={(p) => {
          setSelectedPlayer(p)
          setIsModalOpen(false)
        }}
      />
    </div>
  )
}
