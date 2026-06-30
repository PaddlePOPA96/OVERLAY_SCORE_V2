'use client'

import { useState } from 'react'

import { audioOptions, getAudioLabel } from '@/shared/configs/audioConfig'

export default function GoalAudioSettings({ data, updateMatch, stopGoalAudio, previewGoalAudio, theme }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const isLight = true
  const audioVolume = data.goalAudioVolume !== undefined ? data.goalAudioVolume : 1
  const audioSource = data.goalAudioSource || '/sounds/goal.mp3'

  const currentSongLabel = getAudioLabel(audioSource)

  const handleSelectSong = (source) => {
    updateMatch({ goalAudioSource: source })
    setIsModalOpen(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {/* Current Song Badge */}
      <div className="neo-card" style={{ padding: '12px', margin: '0', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
          Current Goal Sound
        </div>
        <div style={{ fontSize: '14px', fontWeight: '900', color: '#000000' }}>
          🎵 {currentSongLabel}
        </div>
      </div>

      {/* Volume Slider */}
      <div style={{ padding: '4px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000' }}>VOLUME:</span>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#000000' }}>{Math.round(audioVolume * 100)}%</span>
        </div>
        <input
          type='range'
          min='0'
          max='1'
          step='0.01'
          value={audioVolume}
          onChange={e => updateMatch({ goalAudioVolume: parseFloat(e.target.value) })}
          className='w-full accent-green-500'
          style={{ cursor: 'pointer', height: '8px' }}
        />
      </div>

      {/* Play / Stop buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <button
          onClick={e => {
            e.preventDefault()

            if (typeof previewGoalAudio === 'function') {
              previewGoalAudio(audioSource)
            }
          }}
          className="neo-btn-lg neo-btn-primary"
          style={{ width: '100%' }}
        >
          ▶ Play Audio
        </button>

        <button
          onClick={e => {
            e.preventDefault()

            if (typeof stopGoalAudio === 'function') {
              stopGoalAudio()
            }
          }}
          className="neo-btn-lg neo-btn-danger"
          style={{ width: '100%' }}
        >
          🛑 Stop Audio
        </button>
      </div>

      {/* Choose Song Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="neo-btn-lg neo-btn-outline"
        style={{ width: '100%' }}
      >
        🎵 Choose Sound
      </button>

      {/* Song Selection Grid Modal */}
      {isModalOpen && (
        <div className="neo-modal-overlay">
          <div className="neo-modal-content">
            <div className="neo-modal-header">
              <span className="neo-modal-title">Select Song / Sound</span>
              <button 
                className="neo-btn-lg neo-btn-outline" 
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="neo-modal-body">
              <span style={{ display: 'block', fontWeight: '950', fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Select a song to play on goal event:
              </span>
              
              <div className="neo-grid-2">
                {audioOptions.map(option => (
                  <div
                    key={option.value}
                    onClick={() => handleSelectSong(option.value)}
                    className={`neo-grid-item-btn ${audioSource === option.value ? 'selected' : ''}`}
                    style={{ minHeight: '60px', justifyContent: 'center' }}
                  >
                    <span>{option.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

