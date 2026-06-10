'use client'

import { useState } from 'react'
import LogoPickerModal from './LogoPickerModal'
import { makeTeamAbbr } from '@/lib/logoData'

export default function MobileOperatorView({ data, actions, displayTime, formatTime, roomId, theme }) {
  const [showTeamPanel, setShowTeamPanel] = useState(false)
  const [logoModalOpen, setLogoModalOpen] = useState(false)
  const [logoTarget, setLogoTarget] = useState('home')

  const homeScore = data.homeScore ?? 0
  const awayScore = data.awayScore ?? 0
  const homeName = data.homeName || 'HOME'
  const awayName = data.awayName || 'AWAY'
  const homeLogo = data.homeLogo || null
  const awayLogo = data.awayLogo || null
  const homeColor = data.homeColor || data.homeBg || '#3b82f6'
  const awayColor = data.awayColor || data.awayBg || '#ef4444'
  const period = data.period || 1
  const isRunning = data.timer?.isRunning || false
  const timeStr = formatTime ? formatTime(displayTime) : (displayTime || '0:00')
  const isLive = data.showOverlay || false
  const periodLabel = period === 1 ? '1st Half' : period === 2 ? '2nd Half' : 'Extra Time'

  const openLogoPicker = (target) => {
    setLogoTarget(target)
    setLogoModalOpen(true)
  }

  return (
    <div className='mob-op-shell'>
      <div className='mob-op-frame'>

        {/* ── Status bar ── */}
        <div className='mob-op-statusbar'>
          <span className='mob-op-statusbar-title'>SCOREBOARD REMOTE</span>
          <div className='mob-op-live-badge'>
            <span className={`mob-op-live-dot ${isLive ? 'live' : ''}`} />
            <span className='mob-op-live-text'>{isLive ? '● LIVE' : '○ OFFLINE'}</span>
          </div>
        </div>

        {/* ── Teams header ── */}
        <div className='mob-op-teams-header'>
          {/* Home */}
          <div className='mob-op-team-col'>
            <div
              className='mob-op-logo-ring'
              style={{ borderColor: homeColor }}
              onClick={() => setShowTeamPanel(true)}
            >
              {homeLogo
                ? <img src={homeLogo} alt={homeName} className='mob-op-logo-img' />
                : <span className='mob-op-logo-letter' style={{ color: homeColor }}>{homeName.charAt(0)}</span>
              }
            </div>
            <span className='mob-op-team-name'>{homeName}</span>
            <span className='mob-op-team-label'>Home Team</span>
          </div>

          {/* Center */}
          <div className='mob-op-center-col'>
            <span className='mob-op-vs'>VS</span>
            <span className='mob-op-period'>{periodLabel}</span>
            <span className='mob-op-clock'>{timeStr}</span>
          </div>

          {/* Away */}
          <div className='mob-op-team-col'>
            <div
              className='mob-op-logo-ring'
              style={{ borderColor: awayColor }}
              onClick={() => setShowTeamPanel(true)}
            >
              {awayLogo
                ? <img src={awayLogo} alt={awayName} className='mob-op-logo-img' />
                : <span className='mob-op-logo-letter' style={{ color: awayColor }}>{awayName.charAt(0)}</span>
              }
            </div>
            <span className='mob-op-team-name'>{awayName}</span>
            <span className='mob-op-team-label'>Away Team</span>
          </div>
        </div>

        {/* ── Score + GOAL controls ── */}
        <div className='mob-op-score-row'>

          {/* Home side */}
          <div className='mob-op-score-col'>
            {/* GOAL HOME button */}
            <button
              className='mob-op-goal-big home'
              style={{ background: homeColor }}
              onClick={() => actions.triggerGoal('home')}
            >
              <span className='mob-op-goal-icon'>⚽</span>
              <span className='mob-op-goal-label'>GOAL<br/>HOME</span>
            </button>

            {/* Score display */}
            <span className='mob-op-score-num' style={{ color: homeColor }}>{homeScore}</span>

            {/* Minus */}
            <button
              className='mob-op-score-btn minus'
              onClick={() => actions.updateMatch({ homeScore: Math.max(0, homeScore - 1) })}
            >
              <svg width='24' height='4' viewBox='0 0 24 4' fill='none'>
                <line x1='2' y1='2' x2='22' y2='2' stroke='white' strokeWidth='3' strokeLinecap='round'/>
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className='mob-op-score-divider'>:</div>

          {/* Away side */}
          <div className='mob-op-score-col'>
            {/* GOAL AWAY button */}
            <button
              className='mob-op-goal-big away'
              style={{ background: awayColor }}
              onClick={() => actions.triggerGoal('away')}
            >
              <span className='mob-op-goal-icon'>⚽</span>
              <span className='mob-op-goal-label'>GOAL<br/>AWAY</span>
            </button>

            {/* Score display */}
            <span className='mob-op-score-num' style={{ color: awayColor }}>{awayScore}</span>

            {/* Minus */}
            <button
              className='mob-op-score-btn minus'
              onClick={() => actions.updateMatch({ awayScore: Math.max(0, awayScore - 1) })}
            >
              <svg width='24' height='4' viewBox='0 0 24 4' fill='none'>
                <line x1='2' y1='2' x2='22' y2='2' stroke='white' strokeWidth='3' strokeLinecap='round'/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Action bar ── */}
        <div className='mob-op-actions'>
          <button
            className='mob-op-action-btn select-teams'
            onClick={() => setShowTeamPanel(s => !s)}
          >
            👥 SELECT TEAMS
          </button>
          <button
            className={`mob-op-action-btn timer-btn ${isRunning ? 'running' : ''}`}
            onClick={() => actions.toggleTimer()}
          >
            {isRunning ? '⏸ PAUSE' : '▶ START'}
          </button>
          <button
            className='mob-op-action-btn reset'
            onClick={() => {
              if (typeof window !== 'undefined' && window.confirm('Reset skor pertandingan?')) {
                actions.updateMatch({ homeScore: 0, awayScore: 0 })
                actions.resetTimer()
              }
            }}
          >
            🔄 RESET
          </button>
        </div>

        {/* ── Info strip ── */}
        <div className='mob-op-infostrip'>
          <span><strong>HOME:</strong> {homeName}</span>
          <span><strong>AWAY:</strong> {awayName}</span>
          <span><strong>PERIOD:</strong> {period}</span>
          <span><strong>TIMER:</strong> {timeStr}</span>
        </div>

        {/* ── Overlay toggle ── */}
        <div className='mob-op-overlay-row'>
          <span className='mob-op-overlay-label'>Overlay Live</span>
          <button
            className={`mob-op-toggle ${isLive ? 'on' : 'off'}`}
            onClick={() => actions.toggleOverlay()}
          >
            <span className='mob-op-toggle-knob' />
          </button>
        </div>

        {/* ── Period selector ── */}
        <div className='mob-op-period-row'>
          {[1, 2, 3].map(p => (
            <button
              key={p}
              className={`mob-op-period-btn ${period === p ? 'active' : ''}`}
              onClick={() => actions.updateMatch({
                period: p,
                'timer/isRunning': false,
                'timer/baseTime': p === 2 ? 45 * 60 : p === 3 ? 90 * 60 : 0,
                'timer/startTime': null
              })}
            >
              {p === 1 ? '1st Half' : p === 2 ? '2nd Half' : 'Extra Time'}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════
            SELECT TEAMS PANEL
            ══════════════════════════════════════ */}
        {showTeamPanel && (
          <div className='mob-op-team-panel'>
            <div className='mob-op-team-panel-header'>
              <span>👥 Pilih Tim</span>
              <button className='mob-op-close-btn' onClick={() => setShowTeamPanel(false)}>✕</button>
            </div>

            <div className='mob-op-team-editors-container'>
              {/* HOME TEAM */}
              <div className='mob-op-team-editor'>
                <div className='mob-op-editor-label'>🏠 HOME TEAM</div>
                <div className='mob-op-editor-row'>
                  {/* Logo picker */}
                  <div
                    className='mob-op-logo-picker'
                    onClick={() => openLogoPicker('home')}
                    title='Tap untuk pilih logo'
                  >
                    {homeLogo
                      ? <img src={homeLogo} alt='home' style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      : <span style={{ fontSize: '10px', color: '#9ca3af' }}>+ Logo</span>
                    }
                  </div>
                  <div className='mob-op-editor-fields'>
                    <input
                      className='mob-op-name-input'
                      value={data.homeName || ''}
                      onChange={e => actions.updateMatch({ homeName: e.target.value })}
                      placeholder='Abbr (e.g. MAN)'
                      maxLength={6}
                    />
                    <input
                      className='mob-op-name-input'
                      value={data.homeFullName || ''}
                      onChange={e => actions.updateMatch({ homeFullName: e.target.value })}
                      placeholder='Full name (e.g. Manchester)'
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10px', color: '#9ca3af' }}>Warna:</span>
                      <input
                        type='color'
                        value={data.homeColor || '#3b82f6'}
                        onChange={e => actions.updateMatch({ homeColor: e.target.value, homeBg: e.target.value })}
                        style={{ width: '32px', height: '20px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* AWAY TEAM */}
              <div className='mob-op-team-editor'>
                <div className='mob-op-editor-label'>✈️ AWAY TEAM</div>
                <div className='mob-op-editor-row'>
                  {/* Logo picker */}
                  <div
                    className='mob-op-logo-picker'
                    onClick={() => openLogoPicker('away')}
                    title='Tap untuk pilih logo'
                  >
                    {awayLogo
                      ? <img src={awayLogo} alt='away' style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      : <span style={{ fontSize: '10px', color: '#9ca3af' }}>+ Logo</span>
                    }
                  </div>
                  <div className='mob-op-editor-fields'>
                    <input
                      className='mob-op-name-input'
                      value={data.awayName || ''}
                      onChange={e => actions.updateMatch({ awayName: e.target.value })}
                      placeholder='Abbr (e.g. CHE)'
                      maxLength={6}
                    />
                    <input
                      className='mob-op-name-input'
                      value={data.awayFullName || ''}
                      onChange={e => actions.updateMatch({ awayFullName: e.target.value })}
                      placeholder='Full name (e.g. Chelsea)'
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10px', color: '#9ca3af' }}>Warna:</span>
                      <input
                        type='color'
                        value={data.awayColor || '#ef4444'}
                        onChange={e => actions.updateMatch({ awayColor: e.target.value, awayBg: e.target.value })}
                        style={{ width: '32px', height: '20px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Logo Picker Modal */}
      <LogoPickerModal
        isOpen={logoModalOpen}
        onClose={() => setLogoModalOpen(false)}
        defaultClubName={logoTarget === 'home' ? data.homeFullName : data.awayFullName}
        onSelect={({ src, club }) => {
          if (!src || !club) return
          const abbr = makeTeamAbbr(club)
          if (logoTarget === 'home') {
            actions.updateMatch({ homeLogo: src, homeName: abbr, homeFullName: club.toUpperCase() })
          } else {
            actions.updateMatch({ awayLogo: src, awayName: abbr, awayFullName: club.toUpperCase() })
          }
          setLogoModalOpen(false)
        }}
      />
    </div>
  )
}
