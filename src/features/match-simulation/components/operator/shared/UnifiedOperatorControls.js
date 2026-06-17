'use client'

import { useState, useEffect } from 'react'

import LogoPickerModal from '../LogoPickerModal'
import { makeTeamAbbr } from '@/lib/logoData'
import { Button } from '@/components/ui/button'
import LayoutSelector from './LayoutSelector'
import GoalAudioSettings from '../GoalAudioSettings'
import OverlayRoomControls from '../OverlayRoomControls'
import ThirdTitleControls from './ThirdTitleControls'

export default function UnifiedOperatorControls({ data, actions, displayTime, formatTime, roomId, theme = 'dark' }) {
  const [activeTab, setActiveTab] = useState('scoreboard')
  const [logoModalOpen, setLogoModalOpen] = useState(false)
  const [logoTarget, setLogoTarget] = useState('home')
  const [manualM, setManualM] = useState(0)
  const [manualS, setManualS] = useState(0)

  // Collapsible accordion states
  const [timerOpen, setTimerOpen] = useState(true)
  const [scoresOpen, setScoresOpen] = useState(true)
  const [goalAudioOpen, setGoalAudioOpen] = useState(true)
  const [thirdContainerOpen, setThirdContainerOpen] = useState(true)

  // Sync manual timer inputs when not running
  useEffect(() => {
    if (!data.timer?.isRunning) {
      setManualM(Math.floor(displayTime / 60))
      setManualS(displayTime % 60)
    }
  }, [displayTime, data.timer?.isRunning])

  const openLogoPicker = target => {
    setLogoTarget(target)
    setLogoModalOpen(true)
  }

  const handleHomeColorChange = color => {
    actions.updateMatch({ homeColor: color, homeBg: color })
  }

  const handleAwayColorChange = color => {
    actions.updateMatch({ awayColor: color, awayBg: color })
  }

  const handlePeriodChange = periodVal => {
    let baseTimeVal = 0
    if (periodVal === 2) baseTimeVal = 45 * 60
    else if (periodVal === 3) baseTimeVal = 90 * 60

    actions.updateMatch({
      period: periodVal,
      'timer/isRunning': false,
      'timer/baseTime': baseTimeVal,
      'timer/startTime': null
    })
  }

  const handleSetTime = () => {
    const total = (parseInt(manualM, 10) || 0) * 60 + (parseInt(manualS, 10) || 0)
    actions.updateMatch({
      'timer/baseTime': total,
      'timer/startTime': null,
      'timer/isRunning': false
    })
  }

  const isLight = theme === 'light'
  const labelColor = isLight ? '#000000' : '#ffffff'
  const tinyColor = isLight ? '#000000' : '#ffffff'
  const borderCol = isLight ? '#cbd5e1' : '#333'
  const cardBg = isLight ? 'rgba(15, 23, 42, 0.02)' : 'rgba(255, 255, 255, 0.02)'
  const cardBorder = isLight ? '1px solid #cbd5e1' : '1px solid #2e2e2e'

  const homeScore = data.homeScore ?? 0
  const awayScore = data.awayScore ?? 0
  const homeName = data.homeName || 'HOME'
  const awayName = data.awayName || 'AWAY'
  const isRunning = data.timer?.isRunning || false
  const isLive = data.showOverlay || false
  const period = data.period || 1

  // ══════════════════════════════════════════════════════
  //  TAB 1: SCOREBOARD (Live match controls - collapsible cards)
  // ══════════════════════════════════════════════════════
  const renderScoreboardTab = () => {
    const cardStyle = {
      background: cardBg,
      border: cardBorder,
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      marginBottom: '12px'
    }

    const headerStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      padding: '10px 14px',
      background: isLight ? 'rgba(15, 23, 42, 0.04)' : 'rgba(255, 255, 255, 0.04)',
      fontWeight: '700',
      fontSize: '13px',
      color: labelColor,
      userSelect: 'none',
    }

    const bodyStyle = {
      padding: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }

    return (
      <div className={`op-tab-pane ${activeTab === 'scoreboard' ? 'active' : 'inactive'}`}>

        {/* ── Overlay Live Toggle ── */}
        <div className='op-overlay-toggle' style={{ marginBottom: '12px' }}>
          <div className='op-overlay-toggle-label'>
            <span style={{ fontSize: '18px' }}>{isLive ? '🟢' : '🔴'}</span>
            <div>
              <div>Overlay</div>
              <span className={`op-overlay-toggle-status ${isLive ? 'live' : 'off'}`}>
                {isLive ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>
          <button
            className={`op-toggle-big ${isLive ? 'on' : 'off'}`}
            onClick={() => actions.toggleOverlay()}
          >
            <span className='op-toggle-big-knob' />
          </button>
        </div>

        {/* ── 1. TIMER & PERIOD CONTROLS ── */}
        <div style={cardStyle}>
          <div style={{ ...headerStyle, borderBottom: timerOpen ? `1px solid ${borderCol}` : 'none' }} onClick={() => setTimerOpen(!timerOpen)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⏱️ Timer & Period Controls
            </span>
            <i className={timerOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} style={{ fontSize: '18px', color: labelColor }} />
          </div>
          {timerOpen && (
            <div style={bodyStyle}>
              {/* Timer Display */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div className='op-timer-display' style={{ padding: '6px 10px', marginBottom: '2px', borderRadius: '8px' }}>
                  <span className='op-timer-time' style={{ fontSize: '20px', minWidth: '70px' }}>{formatTime(displayTime)}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className={`op-timer-btn ${isRunning ? 'pause' : 'start'}`}
                    onClick={() => actions.toggleTimer()}
                    style={{ minHeight: '30px', padding: '4px 12px', fontSize: '11px', borderRadius: '6px' }}
                  >
                    <i className={isRunning ? 'ri-pause-fill' : 'ri-play-fill'} style={{ fontSize: '12px' }} />
                    {isRunning ? 'Pause' : 'Start'}
                  </button>
                  <button 
                    className='op-timer-btn reset' 
                    onClick={() => actions.resetTimer()}
                    style={{ minHeight: '30px', padding: '4px 12px', fontSize: '11px', borderRadius: '6px' }}
                  >
                    <i className='ri-restart-line' style={{ fontSize: '11px' }} />
                    Reset
                  </button>
                </div>

                {/* Manual set time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 0 0' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: labelColor, minWidth: '55px' }}>Set Time:</span>
                  <input
                    className='op-input'
                    type='number'
                    style={{ width: '48px', height: '30px', textAlign: 'center', fontSize: '12px', padding: '0 4px' }}
                    value={manualM}
                    onChange={e => setManualM(e.target.value)}
                    min={0}
                  />
                  <span style={{ color: labelColor, fontWeight: '700', fontSize: '14px' }}>:</span>
                  <input
                    className='op-input'
                    type='number'
                    style={{ width: '48px', height: '30px', textAlign: 'center', fontSize: '12px', padding: '0 4px' }}
                    value={manualS}
                    onChange={e => setManualS(e.target.value)}
                    min={0}
                    max={59}
                  />
                  <button
                    className='op-timer-btn reset'
                    style={{ minHeight: '30px', padding: '4px 12px', fontSize: '11px', borderRadius: '6px' }}
                    onClick={handleSetTime}
                  >
                    Set
                  </button>
                </div>
              </div>

              {/* Period Selection */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                {[
                  { val: 1, label: '1st Half' },
                  { val: 2, label: '2nd Half' },
                  { val: 3, label: 'Extra Time' }
                ].map(p => (
                  <button
                    key={p.val}
                    className={`op-period-btn-big ${period === p.val ? 'active' : ''}`}
                    onClick={() => handlePeriodChange(p.val)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── 2. SCORE & GOAL CONTROLS ── */}
        <div style={cardStyle}>
          <div style={{ ...headerStyle, borderBottom: scoresOpen ? `1px solid ${borderCol}` : 'none' }} onClick={() => setScoresOpen(!scoresOpen)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              📊 Score & Goal Controls
            </span>
            <i className={scoresOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} style={{ fontSize: '18px', color: labelColor }} />
          </div>
          {scoresOpen && (
            <div style={bodyStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* HOME Team */}
                <div className='op-team-score-card'>
                  <div className='op-team-score-header'>
                    <div className='op-team-score-logo' style={{ borderLeft: `3px solid ${data.homeColor || '#3b82f6'}` }}>
                      {data.homeLogo ? (
                        <img src={data.homeLogo} alt={homeName} />
                      ) : (
                        <span style={{ fontSize: '18px', fontWeight: '800', color: data.homeColor || '#3b82f6' }}>
                          {homeName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className='op-team-score-name'>{homeName}</div>
                      <div className='op-team-score-label'>Home</div>
                    </div>
                  </div>

                  {/* Score display */}
                  <div className='op-score-display'>
                    <button
                      className='op-score-adjust-btn'
                      onClick={() => actions.updateMatch({ homeScore: Math.max(0, homeScore - 1) })}
                    >
                      −
                    </button>
                    <span className='op-score-num-big'>{homeScore}</span>
                    <button
                      className='op-score-adjust-btn'
                      onClick={() => actions.updateMatch({ homeScore: Math.min(20, homeScore + 1) })}
                    >
                      +
                    </button>
                  </div>

                  {/* GOAL button */}
                  <button
                    className='op-goal-btn-big home'
                    onClick={() => actions.triggerGoal('home')}
                  >
                    <span className='op-goal-emoji'>⚽</span>
                    GOAL HOME
                  </button>
                </div>

                {/* AWAY Team */}
                <div className='op-team-score-card'>
                  <div className='op-team-score-header'>
                    <div className='op-team-score-logo' style={{ borderLeft: `3px solid ${data.awayColor || '#ef4444'}` }}>
                      {data.awayLogo ? (
                        <img src={data.awayLogo} alt={awayName} />
                      ) : (
                        <span style={{ fontSize: '18px', fontWeight: '800', color: data.awayColor || '#ef4444' }}>
                          {awayName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className='op-team-score-name'>{awayName}</div>
                      <div className='op-team-score-label'>Away</div>
                    </div>
                  </div>

                  {/* Score display */}
                  <div className='op-score-display'>
                    <button
                      className='op-score-adjust-btn'
                      onClick={() => actions.updateMatch({ awayScore: Math.max(0, awayScore - 1) })}
                    >
                      −
                    </button>
                    <span className='op-score-num-big'>{awayScore}</span>
                    <button
                      className='op-score-adjust-btn'
                      onClick={() => actions.updateMatch({ awayScore: Math.min(20, awayScore + 1) })}
                    >
                      +
                    </button>
                  </div>

                  {/* GOAL button */}
                  <button
                    className='op-goal-btn-big away'
                    onClick={() => actions.triggerGoal('away')}
                  >
                    <span className='op-goal-emoji'>⚽</span>
                    GOAL AWAY
                  </button>
                </div>
              </div>

              {/* ── Tukar Posisi (Switch Sides) ── */}
              <button
                className={data.switchSides ? 'op-period-btn-big active' : 'op-period-btn-big'}
                onClick={() => actions.updateMatch({ switchSides: !data.switchSides })}
                style={{ width: '100%', marginTop: '6px' }}
              >
                🔄 {data.switchSides ? 'Kiri-Kanan Ditukar' : 'Tukar Posisi Tim (Halftime)'}
              </button>

              {/* ── Reset Match ── */}
              <button
                className='op-reset-btn'
                onClick={() => {
                  if (typeof window !== 'undefined' && window.confirm('Reset skor pertandingan? Semua skor dan timer akan direset.')) {
                    actions.updateMatch({ homeScore: 0, awayScore: 0 })
                    actions.resetTimer()
                  }
                }}
                style={{ width: '100%', marginTop: '4px' }}
              >
                🔄 Reset Pertandingan
              </button>
            </div>
          )}
        </div>

        {/* ── 3. GOAL AUDIO CONTROLS ── */}
        <div style={cardStyle}>
          <div style={{ ...headerStyle, borderBottom: goalAudioOpen ? `1px solid ${borderCol}` : 'none' }} onClick={() => setGoalAudioOpen(!goalAudioOpen)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔊 Goal Audio Settings
            </span>
            <i className={goalAudioOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} style={{ fontSize: '18px', color: labelColor }} />
          </div>
          {goalAudioOpen && (
            <div style={bodyStyle}>
              <GoalAudioSettings
                data={data}
                updateMatch={actions.updateMatch}
                stopGoalAudio={actions.stopGoalAudio}
                previewGoalAudio={actions.previewGoalAudio}
              />
            </div>
          )}
        </div>

        {/* ── 4. THIRD TITLE CONTROLS ── */}
        <div style={cardStyle}>
          <div style={{ ...headerStyle, borderBottom: thirdContainerOpen ? `1px solid ${borderCol}` : 'none' }} onClick={() => setThirdContainerOpen(!thirdContainerOpen)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              📝 Third Title / Info Controls
            </span>
            <i className={thirdContainerOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} style={{ fontSize: '18px', color: labelColor }} />
          </div>
          {thirdContainerOpen && (
            <div style={bodyStyle}>
              <ThirdTitleControls data={data} actions={actions} theme={theme} />
            </div>
          )}
        </div>

        {/* ── Overlay Room URL (compact) ── */}
        <OverlayRoomControls showOverlay={isLive} toggleOverlay={actions.toggleOverlay} roomId={roomId} compact />
      </div>
    )
  }

  // ══════════════════════════════════════════════════════
  //  TAB 2: PENGATURAN TIM (Team settings, layout, audio)
  // ══════════════════════════════════════════════════════
  const renderSettingsTab = () => (
    <div className={`op-tab-pane ${activeTab === 'settings' ? 'active' : 'inactive'}`}>

      {/* ── Layout & Series ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '12px',
          borderBottom: `1px solid ${borderCol}`,
          paddingBottom: '14px'
        }}
      >
        <div>
          <LayoutSelector data={data} updateMatch={actions.updateMatch} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label className='op-label' style={{ marginBottom: '2px', color: labelColor }}>
            Format Match (Series)
          </label>
          <select
            className='op-input'
            value={data.seriesType || 'none'}
            onChange={e => actions.updateMatch({ seriesType: e.target.value, homeSeriesScore: 0, awaySeriesScore: 0 })}
            style={{
              width: '100%',
              height: '40px',
              padding: '0 10px',
              background: isLight ? '#ffffff' : '#090d16',
              border: `1px solid ${borderCol}`,
              borderRadius: '8px',
              color: isLight ? '#0f172a' : '#fff',
              fontSize: '13px'
            }}
          >
            <option value='none'>Single Match (Normal)</option>
            <option value='bo3'>Best of 3 (BO3)</option>
            <option value='bo5'>Best of 5 (BO5)</option>
          </select>
        </div>
      </div>

      {/* ── Home & Away Team Setup (side by side) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '16px',
          marginTop: '14px'
        }}
      >
        {/* HOME TEAM CARD */}
        <div
          style={{
            background: cardBg,
            border: cardBorder,
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#60a5fa', borderBottom: `1px solid ${borderCol}`, paddingBottom: '4px', margin: '0' }}>
            🏠 Home Team (Left Side)
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              onClick={() => openLogoPicker('home')}
              style={{
                width: '48px',
                height: '48px',
                background: isLight ? '#f8fafc' : '#0d0d0d',
                border: `1px solid ${borderCol}`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                flexShrink: 0
              }}
              title='Pilih Logo'
            >
              {data.homeLogo ? (
                <img src={data.homeLogo} alt='Home Logo' style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '10px', color: '#666' }}>Logo</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '6px', flex: 1, alignItems: 'center' }}>
              <input
                className='op-input'
                value={data.homeName || ''}
                onChange={e => actions.updateMatch({ homeName: e.target.value })}
                placeholder='Abbr'
                style={{ width: '55px', height: '32px', fontSize: '12px' }}
              />
              <input
                className='op-input'
                value={data.homeFullName || ''}
                onChange={e => actions.updateMatch({ homeFullName: e.target.value })}
                placeholder='Full Name'
                style={{ flex: 1, height: '32px', fontSize: '12px' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }} title="Pilih Warna">
                <input
                  type='color'
                  value={data.homeColor || data.homeBg || '#ff4b4b'}
                  onChange={e => handleHomeColorChange(e.target.value)}
                  style={{ border: 'none', width: '28px', height: '24px', padding: '0', background: 'transparent', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          {(data.seriesType === 'bo3' || data.seriesType === 'bo5') && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: `1px dashed ${borderCol}` }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: labelColor }}>Wins</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className='op-score-adjust-btn' style={{ width: '28px', height: '28px', fontSize: '14px' }} onClick={() => actions.updateMatch({ homeSeriesScore: Math.max(0, (data.homeSeriesScore || 0) - 1) })}>−</button>
                <span style={{ fontSize: '14px', fontWeight: '700', width: '16px', textAlign: 'center', color: labelColor }}>{data.homeSeriesScore || 0}</span>
                <button className='op-score-adjust-btn' style={{ width: '28px', height: '28px', fontSize: '14px' }} onClick={() => actions.updateMatch({ homeSeriesScore: Math.min(data.seriesType === 'bo3' ? 2 : 3, (data.homeSeriesScore || 0) + 1) })}>+</button>
              </div>
            </div>
          )}
        </div>

        {/* AWAY TEAM CARD */}
        <div
          style={{
            background: cardBg,
            border: cardBorder,
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#f87171', borderBottom: `1px solid ${borderCol}`, paddingBottom: '4px', margin: '0' }}>
            ✈️ Away Team (Right Side)
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              onClick={() => openLogoPicker('away')}
              style={{
                width: '48px',
                height: '48px',
                background: isLight ? '#f8fafc' : '#0d0d0d',
                border: `1px solid ${borderCol}`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                flexShrink: 0
              }}
              title='Pilih Logo'
            >
              {data.awayLogo ? (
                <img src={data.awayLogo} alt='Away Logo' style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '10px', color: '#666' }}>Logo</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '6px', flex: 1, alignItems: 'center' }}>
              <input
                className='op-input'
                value={data.awayName || ''}
                onChange={e => actions.updateMatch({ awayName: e.target.value })}
                placeholder='Abbr'
                style={{ width: '55px', height: '32px', fontSize: '12px' }}
              />
              <input
                className='op-input'
                value={data.awayFullName || ''}
                onChange={e => actions.updateMatch({ awayFullName: e.target.value })}
                placeholder='Full Name'
                style={{ flex: 1, height: '32px', fontSize: '12px' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }} title="Pilih Warna">
                <input
                  type='color'
                  value={data.awayColor || data.awayBg || '#b00024'}
                  onChange={e => handleAwayColorChange(e.target.value)}
                  style={{ border: 'none', width: '28px', height: '24px', padding: '0', background: 'transparent', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          {(data.seriesType === 'bo3' || data.seriesType === 'bo5') && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: `1px dashed ${borderCol}` }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: labelColor }}>Wins</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className='op-score-adjust-btn' style={{ width: '28px', height: '28px', fontSize: '14px' }} onClick={() => actions.updateMatch({ awaySeriesScore: Math.max(0, (data.awaySeriesScore || 0) - 1) })}>−</button>
                <span style={{ fontSize: '14px', fontWeight: '700', width: '16px', textAlign: 'center', color: labelColor }}>{data.awaySeriesScore || 0}</span>
                <button className='op-score-adjust-btn' style={{ width: '28px', height: '28px', fontSize: '14px' }} onClick={() => actions.updateMatch({ awaySeriesScore: Math.min(data.seriesType === 'bo3' ? 2 : 3, (data.awaySeriesScore || 0) + 1) })}>+</button>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* ── Overlay Room Admin ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          borderTop: `1px solid ${borderCol}`,
          marginTop: '14px',
          paddingTop: '14px'
        }}
      >
        <OverlayRoomControls showOverlay={data.showOverlay} toggleOverlay={actions.toggleOverlay} roomId={roomId} />
        <div className='op-section' style={{ margin: 0 }}>
          <Button
            className='op-btn'
            variant='outline'
            onClick={() => alert('Data tersinkronisasi otomatis dengan Realtime Database!')}
            style={{ fontSize: '11px' }}
          >
            🔄 Sync Semua Client
          </Button>
        </div>
      </div>

      {/* LOGO PICKER MODAL */}
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

  return (
    <div className='operator-b-controls' style={{ width: '100%', maxWidth: '100%' }}>
      {/* ── Tab Buttons ── */}
      <div className='op-tabs'>
        <button
          className={`op-tab-btn ${activeTab === 'scoreboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('scoreboard')}
        >
          <i className='ri-gamepad-line' />
          🎮 Scoreboard
        </button>
        <button
          className={`op-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <i className='ri-settings-3-line' />
          ⚙️ Pengaturan Tim
        </button>
      </div>

      <div className='op-tab-container'>
        {renderScoreboardTab()}
        {renderSettingsTab()}
      </div>
    </div>
  )
}
