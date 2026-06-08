'use client'

import { useState } from 'react'

export default function MobileOperatorView({ data, actions, displayTime, formatTime, roomId, theme }) {
  const [showSettings, setShowSettings] = useState(false)

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

  return (
    <div className='mob-op-shell'>
      {/* ── Phone frame ── */}
      <div className='mob-op-frame'>

        {/* ── Status bar ── */}
        <div className='mob-op-statusbar'>
          <span className='mob-op-statusbar-title'>SCOREBOARD REMOTE</span>
          <div className='mob-op-statusbar-icons'>
            <span className='mob-op-wifi'>
              <svg width='14' height='10' viewBox='0 0 14 10' fill='none'>
                <path d='M7 9L9 7C8.5 6.5 7.8 6.2 7 6.2C6.2 6.2 5.5 6.5 5 7L7 9Z' fill='white'/>
                <path d='M7 9L11 5C9.9 3.9 8.5 3.3 7 3.3C5.5 3.3 4.1 3.9 3 5L7 9Z' fill='white' opacity='.6'/>
                <path d='M7 9L13 3C11.3 1.3 9.3 0.4 7 0.4C4.7 0.4 2.7 1.3 1 3L7 9Z' fill='white' opacity='.3'/>
              </svg>
            </span>
            <span className='mob-op-battery'>
              <svg width='18' height='10' viewBox='0 0 18 10' fill='none'>
                <rect x='0.5' y='0.5' width='14' height='9' rx='2' stroke='white' strokeOpacity='.6'/>
                <rect x='2' y='2' width='10' height='6' rx='1' fill='white'/>
                <path d='M15.5 3.5V6.5C16.3 6.2 17 5.7 17 5C17 4.3 16.3 3.8 15.5 3.5Z' fill='white' opacity='.6'/>
              </svg>
            </span>
          </div>
        </div>

        {/* ── Live indicator ── */}
        <div className='mob-op-live-row'>
          <span className={`mob-op-live-dot ${isLive ? 'live' : ''}`} />
          <span className='mob-op-live-text'>{isLive ? 'Live' : 'Offline'}</span>
        </div>

        {/* ── Teams header ── */}
        <div className='mob-op-teams-header'>
          {/* Home */}
          <div className='mob-op-team-col'>
            <div className='mob-op-logo-ring' style={{ borderColor: homeColor }}>
              {homeLogo
                ? <img src={homeLogo} alt={homeName} className='mob-op-logo-img' />
                : <span className='mob-op-logo-letter' style={{ color: homeColor }}>{homeName.charAt(0)}</span>
              }
            </div>
            <span className='mob-op-team-name'>{homeName}</span>
            <span className='mob-op-team-label'>Home Team</span>
          </div>

          {/* VS / Period */}
          <div className='mob-op-center-col'>
            <span className='mob-op-vs'>VS</span>
            <span className='mob-op-period'>{periodLabel}</span>
            <span className='mob-op-clock'>{timeStr}</span>
          </div>

          {/* Away */}
          <div className='mob-op-team-col'>
            <div className='mob-op-logo-ring' style={{ borderColor: awayColor }}>
              {awayLogo
                ? <img src={awayLogo} alt={awayName} className='mob-op-logo-img' />
                : <span className='mob-op-logo-letter' style={{ color: awayColor }}>{awayName.charAt(0)}</span>
              }
            </div>
            <span className='mob-op-team-name'>{awayName}</span>
            <span className='mob-op-team-label'>Away Team</span>
          </div>
        </div>

        {/* ── Score controls ── */}
        <div className='mob-op-score-row'>
          {/* Home Score */}
          <div className='mob-op-score-col'>
            <button
              className='mob-op-score-btn plus'
              style={{ '--team-color': homeColor }}
              onClick={() => actions.updateMatch({ homeScore: homeScore + 1 })}
            >
              <svg width='28' height='28' viewBox='0 0 28 28' fill='none'>
                <line x1='14' y1='5' x2='14' y2='23' stroke='white' strokeWidth='3' strokeLinecap='round'/>
                <line x1='5' y1='14' x2='23' y2='14' stroke='white' strokeWidth='3' strokeLinecap='round'/>
              </svg>
            </button>
            <span className='mob-op-score-num' style={{ color: homeColor }}>{homeScore}</span>
            <button
              className='mob-op-score-btn minus'
              style={{ '--team-color': homeColor }}
              onClick={() => actions.updateMatch({ homeScore: Math.max(0, homeScore - 1) })}
            >
              <svg width='28' height='5' viewBox='0 0 28 5' fill='none'>
                <line x1='2' y1='2.5' x2='26' y2='2.5' stroke='white' strokeWidth='3' strokeLinecap='round'/>
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className='mob-op-score-divider'>:</div>

          {/* Away Score */}
          <div className='mob-op-score-col'>
            <button
              className='mob-op-score-btn plus'
              style={{ '--team-color': awayColor }}
              onClick={() => actions.updateMatch({ awayScore: awayScore + 1 })}
            >
              <svg width='28' height='28' viewBox='0 0 28 28' fill='none'>
                <line x1='14' y1='5' x2='14' y2='23' stroke='white' strokeWidth='3' strokeLinecap='round'/>
                <line x1='5' y1='14' x2='23' y2='14' stroke='white' strokeWidth='3' strokeLinecap='round'/>
              </svg>
            </button>
            <span className='mob-op-score-num' style={{ color: awayColor }}>{awayScore}</span>
            <button
              className='mob-op-score-btn minus'
              style={{ '--team-color': awayColor }}
              onClick={() => actions.updateMatch({ awayScore: Math.max(0, awayScore - 1) })}
            >
              <svg width='28' height='5' viewBox='0 0 28 5' fill='none'>
                <line x1='2' y1='2.5' x2='26' y2='2.5' stroke='white' strokeWidth='3' strokeLinecap='round'/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Quick action bar ── */}
        <div className='mob-op-actions'>
          <button
            className='mob-op-action-btn select-teams'
            onClick={() => setShowSettings(s => !s)}
          >
            SELECT TEAMS
          </button>
          <button
            className={`mob-op-action-btn timer-btn ${isRunning ? 'running' : ''}`}
            onClick={() => actions.toggleTimer()}
          >
            {isRunning ? 'PAUSE' : 'START/PAUSE'}
          </button>
          <button
            className='mob-op-action-btn reset'
            onClick={() => {
              if (typeof window !== 'undefined' && window.confirm('Reset match scores?')) {
                actions.updateMatch({ homeScore: 0, awayScore: 0 })
                actions.resetTimer()
              }
            }}
          >
            RESET MATCH
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

        {/* ── Period selector (settings panel) ── */}
        {showSettings && (
          <div className='mob-op-settings'>
            <div className='mob-op-settings-row'>
              <span className='mob-op-settings-label'>Period</span>
              <div className='mob-op-settings-btns'>
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
                    {p === 1 ? '1st' : p === 2 ? '2nd' : 'ET'}
                  </button>
                ))}
              </div>
            </div>
            <div className='mob-op-settings-row'>
              <span className='mob-op-settings-label'>Goal Home</span>
              <button
                className='mob-op-goal-btn home'
                onClick={() => actions.triggerGoal('home')}
              >
                ⚽ GOAL HOME
              </button>
            </div>
            <div className='mob-op-settings-row'>
              <span className='mob-op-settings-label'>Goal Away</span>
              <button
                className='mob-op-goal-btn away'
                onClick={() => actions.triggerGoal('away')}
              >
                ⚽ GOAL AWAY
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
