'use client'

import { audioOptions } from '@/lib/audioConfig'

export default function GoalAudioSettings({ data, updateMatch, stopGoalAudio, previewGoalAudio }) {
  const audioVolume = data.goalAudioVolume !== undefined ? data.goalAudioVolume : 1
  const audioSource = data.goalAudioSource || '/sounds/goal.mp3'

  return (
    <div
      style={{
        padding: '10px',
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid #444',
        borderRadius: '8px',
        marginTop: '10px',
        marginBottom: '10px'
      }}
    >
      <label className='op-label' style={{ marginBottom: '10px', display: 'block', color: '#4ade80' }}>
        Goal Audio Settings
      </label>

      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span className='op-tiny'>Volume:</span>
          <span className='op-tiny font-mono'>{Math.round(audioVolume * 100)}%</span>
        </div>
        <input
          type='range'
          min='0'
          max='1'
          step='0.01'
          value={audioVolume}
          onChange={e => updateMatch({ goalAudioVolume: parseFloat(e.target.value) })}
          className='w-full accent-green-500'
        />
      </div>

      <div>
        <span className='op-tiny' style={{ display: 'block', marginBottom: '5px' }}>
          Sound:
        </span>
        <select
          value={audioSource}
          onChange={e => updateMatch({ goalAudioSource: e.target.value })}
          className='op-input'
          style={{ width: '100%', padding: '8px', background: '#111', color: 'white' }}
        >
          {audioOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Preview di OBS button */}
      <button
        onClick={e => {
          e.preventDefault()

          if (typeof previewGoalAudio === 'function') {
            previewGoalAudio(audioSource)
          }
        }}
        style={{
          marginTop: '10px',
          width: '100%',
          padding: '8px 0',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '13px',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          color: 'white',
          boxShadow: '0 0 10px rgba(59,130,246,0.4)',
          transition: 'background 0.2s, box-shadow 0.2s'
        }}
      >
        <span style={{ fontSize: '15px' }}>▶</span> Preview di OBS
      </button>

      {/* Stop OBS Audio Button */}
      <button
        onClick={e => {
          e.preventDefault()

          if (typeof stopGoalAudio === 'function') {
            stopGoalAudio()
          }
        }}
        style={{
          marginTop: '10px',
          width: '100%',
          padding: '8px 0',
          borderRadius: '6px',
          border: '1px solid #ef4444',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '13px',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          transition: 'all 0.2s'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
        }}
      >
        <span style={{ fontSize: '15px' }}>🛑</span> Stop Audio di OBS
      </button>
    </div>
  )
}
