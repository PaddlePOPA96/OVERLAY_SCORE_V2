'use client'

import { useState, useEffect } from 'react'

import LogoPickerModal from '../LogoPickerModal'
import { makeTeamAbbr } from '@/data/logoData'
import { Button } from '@/shared/components/ui/button'
import LayoutSelector from './LayoutSelector'
import GoalAudioSettings from '../GoalAudioSettings'
import OverlayRoomControls from '../OverlayRoomControls'
import ThirdTitleControls from './ThirdTitleControls'

export default function UnifiedOperatorControls({ data, actions, displayTime, formatTime, roomId, theme = 'dark' }) {
  const [activeTab, setActiveTab] = useState('scoreboard')
  const [logoModalOpen, setLogoModalOpen] = useState(false)

  // Load persisted active tab on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('operatorActiveTab')

      if (savedTab === 'scoreboard' || savedTab === 'settings') {
        setActiveTab(savedTab)
      }
    }
  }, [])

  const changeTab = (tab) => {
    setActiveTab(tab)

    if (typeof window !== 'undefined') {
      localStorage.setItem('operatorActiveTab', tab)
    }
  }

  const [logoTarget, setLogoTarget] = useState('home')
  const [manualM, setManualM] = useState(0)
  const [manualS, setManualS] = useState(0)
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false)

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

  // Penalty shootout state and handlers
  const isPenaltyMode = data.isPenaltyMode || false
  const homePenalties = data.homePenalties || '2,2,2,2,2'
  const awayPenalties = data.awayPenalties || '2,2,2,2,2'

  const homePenList = homePenalties.split(',')
  const awayPenList = awayPenalties.split(',')

  const homePenScore = homePenList.filter(x => x === '1').length
  const awayPenScore = awayPenList.filter(x => x === '1').length

  const getActiveIndex = (homeList, awayList) => {
    let homeLast = -1

    for (let i = homeList.length - 1; i >= 0; i--) {
      if (homeList[i] !== '2') {
        homeLast = i
        break
      }
    }
    
    let awayLast = -1

    for (let i = awayList.length - 1; i >= 0; i--) {
      if (awayList[i] !== '2') {
        awayLast = i
        break
      }
    }
    
    const maxLast = Math.max(homeLast, awayLast)

    
return maxLast + 1
  }

  const activeIdx = getActiveIndex(homePenList, awayPenList)
  const startIndex = Math.floor(activeIdx / 5) * 5

  const getVisiblePenalties = (penList) => {
    const sliced = penList.slice(startIndex, startIndex + 5)

    while (sliced.length < 5) {
      sliced.push('2')
    }

    
return sliced
  }

  const visibleHomePens = getVisiblePenalties(homePenList)
  const visibleAwayPens = getVisiblePenalties(awayPenList)

  const handleRecordPenalty = (team, val) => {
    const listStr = team === 'home' ? homePenalties : awayPenalties
    const list = listStr.split(',')
    const activeIndex = list.indexOf('2')

    if (activeIndex !== -1) {
      list[activeIndex] = String(val)

      if (activeIndex === list.length - 1) {
        list.push('2')
      }

      actions.updateMatch({
        [team === 'home' ? 'homePenalties' : 'awayPenalties']: list.join(',')
      })
    } else {
      list.push(String(val))
      list.push('2')
      actions.updateMatch({
        [team === 'home' ? 'homePenalties' : 'awayPenalties']: list.join(',')
      })
    }
  }

  const handleUndoPenalty = (team) => {
    const listStr = team === 'home' ? homePenalties : awayPenalties
    const list = listStr.split(',')
    let activeIndex = list.indexOf('2')

    if (activeIndex === -1) {
      activeIndex = list.length
    }

    const undoIndex = activeIndex - 1

    if (undoIndex >= 0) {
      list[undoIndex] = '2'

      while (list.length > 5 && list[list.length - 1] === '2' && list[list.length - 2] === '2') {
        list.pop()
      }

      actions.updateMatch({
        [team === 'home' ? 'homePenalties' : 'awayPenalties']: list.join(',')
      })
    }
  }

  const handleResetPenalty = () => {
    actions.updateMatch({
      homePenalties: '2,2,2,2,2',
      awayPenalties: '2,2,2,2,2'
    })
  }

  const handleTogglePenaltyMode = () => {
    const nextMode = !isPenaltyMode

    actions.updateMatch({
      isPenaltyMode: nextMode,
      homePenalties: data.homePenalties || '2,2,2,2,2',
      awayPenalties: data.awayPenalties || '2,2,2,2,2'
    })
  }

  const homeScore = data.homeScore ?? 0
  const awayScore = data.awayScore ?? 0
  const homeName = data.homeName || 'HOME'
  const awayName = data.awayName || 'AWAY'
  const isRunning = data.timer?.isRunning || false
  const isLive = data.showOverlay || false
  const period = data.period || 1

  // ══════════════════════════════════════════════════════
  //  TAB 1: SCOREBOARD (Live match controls - BIG buttons)
  // ══════════════════════════════════════════════════════
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

        {/* ── Overlay Status Header Banner ── */}
        <div className="neo-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 12px 0', background: '#ffffff', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: isLive ? '#22c55e' : '#ff2a2a', border: '1.5px solid #000' }}></span>
            <div>
              <div style={{ fontWeight: '900', fontSize: '13px', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overlay Display</div>
              <span style={{ fontSize: '11px', fontWeight: '900', color: isLive ? '#22c55e' : '#ff2a2a' }}>
                {isLive ? 'LIVE ON AIR' : 'OFFLINE'}
              </span>
            </div>
          </div>
          <button
            className={`neo-btn-lg ${isLive ? 'neo-btn-danger' : 'neo-btn-primary'}`}
            style={{ padding: '8px 16px', fontSize: '11px', height: '36px' }}
            onClick={() => actions.toggleOverlay()}
          >
            {isLive ? 'TURN OFF' : 'GO LIVE'}
          </button>
        </div>

        {/* ── Responsive Columns Grid ── */}
        <div className="op-scoreboard-grid">

          {/* CARD 1: TIMER & PERIOD CONTROLS */}
          <div className="neo-card" style={{ marginBottom: '0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '950', borderBottom: '3px solid #000', paddingBottom: '6px', marginBottom: '8px', textTransform: 'uppercase' }}>
              ⏱️ Timer & Period Controls
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'space-between' }}>
              {/* Time Display Header Card (Vibrant high-contrast dark block) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#000000', border: '3px solid #000', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: '900', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.05em' }}>Match Time</div>
                  <span className='font-mono neon-timer-text' style={{ fontSize: '28px', color: '#FFE600', fontWeight: '950', lineHeight: 1 }}>{formatTime(displayTime)}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className={`neo-btn-lg ${isRunning ? 'neo-btn-secondary' : 'neo-btn-primary'}`}
                    onClick={() => actions.toggleTimer()}
                    style={{ height: '36px', padding: '0 12px', fontSize: '11px' }}
                  >
                    {isRunning ? 'Pause' : 'Start'}
                  </button>
                  <button
                    className='neo-btn-lg neo-btn-outline'
                    onClick={() => actions.resetTimer()}
                    style={{ height: '36px', padding: '0 12px', fontSize: '11px' }}
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Period Block */}
              <div>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>⏱️ Period Selection</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
                  {[
                    { val: 1, label: '1st Half' },
                    { val: 2, label: '2nd Half' },
                    { val: 3, label: 'Extra Time' }
                  ].map(p => (
                    <button
                      key={p.val}
                      className={`neo-btn-lg ${period === p.val ? 'neo-btn-primary' : 'neo-btn-outline'}`}
                      onClick={() => handlePeriodChange(p.val)}
                      style={{ fontSize: '11px', padding: '10px 4px' }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <button
                  className='neo-btn-lg neo-btn-outline'
                  onClick={() => setIsTimeModalOpen(true)}
                  style={{ width: '100%', height: '36px', fontSize: '12px' }}
                >
                  ⚙️ Set Manual Time
                </button>
              </div>

              {/* Match Control Block */}
              <div>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>🔄 Match Control</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    className={`neo-btn-lg ${data.switchSides ? 'neo-btn-primary' : 'neo-btn-outline'}`}
                    onClick={() => actions.updateMatch({ switchSides: !data.switchSides })}
                    style={{ fontSize: '12px', height: '40px' }}
                  >
                    🔄 Switch Sides
                  </button>

                  <button
                    className="neo-btn-lg neo-btn-danger"
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.confirm('Reset skor pertandingan? Semua skor dan timer akan direset.')) {
                        actions.updateMatch({ homeScore: 0, awayScore: 0 })
                        actions.resetTimer()
                      }
                    }}
                    style={{ fontSize: '12px', height: '40px' }}
                  >
                    ⚠️ Reset Match
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: SCORES & GOAL TRIGGERS */}
          <div className="neo-card" style={{ marginBottom: '0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #000', paddingBottom: '6px', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '950', textTransform: 'uppercase', margin: 0 }}>
                {isPenaltyMode ? '🎯 Penalty Shootout Controls' : '📊 Scores & Goal Triggers'}
              </h3>
              <button
                type="button"
                className={`neo-btn-lg ${isPenaltyMode ? 'neo-btn-danger' : 'neo-btn-outline'}`}
                style={{ padding: '4px 10px', fontSize: '10px', height: '28px' }}
                onClick={handleTogglePenaltyMode}
              >
                {isPenaltyMode ? '⏹ Exit Penalty' : '🎯 Go to Penalty'}
              </button>
            </div>

            {isPenaltyMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>

                {/* Shootout Columns (Home & Away side-by-side) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1 }}>

                  {/* HOME Penalty Shootout Box */}
                  <div style={{ background: '#f8fafc', border: '3px solid #000', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', borderRadius: '10px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '30px', height: '30px', border: '2px solid #000', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '6px' }}>
                        {data.homeLogo ? (
                          <img src={data.homeLogo} alt={homeName} style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: '11px', fontWeight: '900', color: data.homeColor || '#3b82f6' }}>
                            {homeName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '950', color: '#000000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px' }} title={homeName}>{homeName}</div>
                      </div>
                    </div>

                    {/* Circles Row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', minHeight: '26px', alignItems: 'center' }}>
                      {visibleHomePens.map((val, idx) => (
                        <div
                          key={`home-pen-${idx}`}
                          style={{
                            display: 'inline-flex',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: '2px solid #000',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '900',
                            fontSize: '9px',
                            background: val === '1' ? '#00E676' : val === '0' ? '#FF1744' : '#e2e8f0',
                            color: val === '0' ? '#ffffff' : '#000000'
                          }}
                        >
                          {val === '1' ? '✓' : val === '0' ? '✗' : ''}
                        </div>
                      ))}
                    </div>

                    {/* Total Penalty Score Display */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#000000', padding: '6px 12px', border: '2.5px solid #000', borderRadius: '6px' }}>
                      <span style={{ color: '#9ca3af', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }}>Goals</span>
                      <span className="neon-score-text font-mono" style={{ fontSize: '22px', fontWeight: '950', color: '#FFE600' }}>{homePenScore}</span>
                    </div>

                    {/* Record Trigger Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <button
                        type="button"
                        className="neo-btn-lg"
                        style={{ background: '#00E676', color: '#000000', border: '2px solid #000', fontSize: '10px', padding: '6px 0', height: '32px' }}
                        onClick={() => handleRecordPenalty('home', 1)}
                      >
                        ✓ Goal
                      </button>
                      <button
                        type="button"
                        className="neo-btn-lg"
                        style={{ background: '#FF1744', color: '#ffffff', border: '2px solid #000', fontSize: '10px', padding: '6px 0', height: '32px' }}
                        onClick={() => handleRecordPenalty('home', 0)}
                      >
                        ✗ Miss
                      </button>
                    </div>

                    <button
                      type="button"
                      className="neo-btn-lg neo-btn-outline"
                      style={{ width: '100%', fontSize: '10px', padding: '4px 0', height: '28px' }}
                      onClick={() => handleUndoPenalty('home')}
                    >
                      ↩ Undo
                    </button>
                  </div>

                  {/* AWAY Penalty Shootout Box */}
                  <div style={{ background: '#f8fafc', border: '3px solid #000', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', borderRadius: '10px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '30px', height: '30px', border: '2px solid #000', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '6px' }}>
                        {data.awayLogo ? (
                          <img src={data.awayLogo} alt={awayName} style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: '11px', fontWeight: '900', color: data.awayColor || '#ef4444' }}>
                            {awayName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '950', color: '#000000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px' }} title={awayName}>{awayName}</div>
                      </div>
                    </div>

                    {/* Circles Row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', minHeight: '26px', alignItems: 'center' }}>
                      {visibleAwayPens.map((val, idx) => (
                        <div
                          key={`away-pen-${idx}`}
                          style={{
                            display: 'inline-flex',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: '2px solid #000',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '900',
                            fontSize: '9px',
                            background: val === '1' ? '#00E676' : val === '0' ? '#FF1744' : '#e2e8f0',
                            color: val === '0' ? '#ffffff' : '#000000'
                          }}
                        >
                          {val === '1' ? '✓' : val === '0' ? '✗' : ''}
                        </div>
                      ))}
                    </div>

                    {/* Total Penalty Score Display */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#000000', padding: '6px 12px', border: '2.5px solid #000', borderRadius: '6px' }}>
                      <span style={{ color: '#9ca3af', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }}>Goals</span>
                      <span className="neon-score-text font-mono" style={{ fontSize: '22px', fontWeight: '950', color: '#FFE600' }}>{awayPenScore}</span>
                    </div>

                    {/* Record Trigger Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <button
                        type="button"
                        className="neo-btn-lg"
                        style={{ background: '#00E676', color: '#000000', border: '2px solid #000', fontSize: '10px', padding: '6px 0', height: '32px' }}
                        onClick={() => handleRecordPenalty('away', 1)}
                      >
                        ✓ Goal
                      </button>
                      <button
                        type="button"
                        className="neo-btn-lg"
                        style={{ background: '#FF1744', color: '#ffffff', border: '2px solid #000', fontSize: '10px', padding: '6px 0', height: '32px' }}
                        onClick={() => handleRecordPenalty('away', 0)}
                      >
                        ✗ Miss
                      </button>
                    </div>

                    <button
                      type="button"
                      className="neo-btn-lg neo-btn-outline"
                      style={{ width: '100%', fontSize: '10px', padding: '4px 0', height: '28px' }}
                      onClick={() => handleUndoPenalty('away')}
                    >
                      ↩ Undo
                    </button>
                  </div>
                </div>

                {/* Reset Penalties Button */}
                <button
                  type="button"
                  className="neo-btn-lg neo-btn-danger"
                  style={{ width: '100%', fontSize: '11px', height: '32px', marginTop: '4px' }}
                  onClick={handleResetPenalty}
                >
                  🔄 Reset Penalties
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1, alignItems: 'center' }}>
                {/* HOME Team Box */}
                <div style={{ background: '#f8fafc', border: '3px solid #000', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '38px', height: '38px', border: '2px solid #000', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '6px' }}>
                      {data.homeLogo ? (
                        <img src={data.homeLogo} alt={homeName} style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '13px', fontWeight: '900', color: data.homeColor || '#3b82f6' }}>
                          {homeName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '950', color: '#000000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90px' }} title={homeName}>{homeName}</div>
                      <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Home</div>
                    </div>
                  </div>

                  {/* Score display (High Contrast Black Block) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#000000', padding: '8px', border: '3px solid #000', borderRadius: '8px' }}>
                    <button
                      className='neo-btn-lg neo-btn-outline'
                      style={{ width: '36px', height: '36px', padding: 0, fontSize: '16px' }}
                      onClick={() => actions.updateMatch({ homeScore: Math.max(0, homeScore - 1) })}
                    >
                      −
                    </button>
                    <span className="neon-score-text" style={{ fontSize: '28px', fontWeight: '950', color: '#FFE600', minWidth: '40px', textAlign: 'center' }}>{homeScore}</span>
                    <button
                      className='neo-btn-lg neo-btn-outline'
                      style={{ width: '36px', height: '36px', padding: 0, fontSize: '16px' }}
                      onClick={() => actions.updateMatch({ homeScore: Math.min(20, homeScore + 1) })}
                    >
                      +
                    </button>
                  </div>

                  {/* GOAL Button */}
                  <button
                    className='neo-btn-lg'
                    onClick={() => actions.triggerGoal('home')}
                    style={{ background: '#00E676', color: '#000000', border: '3px solid #000', height: '48px', fontSize: '12px', fontWeight: '900' }}
                  >
                    ⚽ GOAL HOME
                  </button>
                </div>

                {/* AWAY Team Box */}
                <div style={{ background: '#f8fafc', border: '3px solid #000', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '38px', height: '38px', border: '2px solid #000', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '6px' }}>
                      {data.awayLogo ? (
                        <img src={data.awayLogo} alt={awayName} style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '13px', fontWeight: '900', color: data.awayColor || '#ef4444' }}>
                          {awayName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '950', color: '#000000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90px' }} title={awayName}>{awayName}</div>
                      <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Away</div>
                    </div>
                  </div>

                  {/* Score display (High Contrast Black Block) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#000000', padding: '8px', border: '3px solid #000', borderRadius: '8px' }}>
                    <button
                      className='neo-btn-lg neo-btn-outline'
                      style={{ width: '36px', height: '36px', padding: 0, fontSize: '16px' }}
                      onClick={() => actions.updateMatch({ awayScore: Math.max(0, awayScore - 1) })}
                    >
                      −
                    </button>
                    <span className="neon-score-text" style={{ fontSize: '28px', fontWeight: '950', color: '#FFE600', minWidth: '40px', textAlign: 'center' }}>{awayScore}</span>
                    <button
                      className='neo-btn-lg neo-btn-outline'
                      style={{ width: '36px', height: '36px', padding: 0, fontSize: '16px' }}
                      onClick={() => actions.updateMatch({ awayScore: Math.min(20, awayScore + 1) })}
                    >
                      +
                    </button>
                  </div>

                  {/* GOAL Button */}
                  <button
                    className='neo-btn-lg'
                    onClick={() => actions.triggerGoal('away')}
                    style={{ background: '#FF1744', color: '#ffffff', border: '3px solid #000', height: '48px', fontSize: '12px', fontWeight: '900' }}
                  >
                    ⚽ GOAL AWAY
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CARD 3: GOAL AUDIO SETTINGS */}
          <div className="neo-card" style={{ marginBottom: '0' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '950', borderBottom: '3px solid #000', paddingBottom: '6px', marginBottom: '12px', textTransform: 'uppercase' }}>
              🔊 Goal Audio Settings
            </h3>
            <GoalAudioSettings
              data={data}
              updateMatch={actions.updateMatch}
              stopGoalAudio={actions.stopGoalAudio}
              previewGoalAudio={actions.previewGoalAudio}
              theme={theme}
            />
          </div>

          {/* CARD 4: THIRD TITLE OVERLAY CONTROLS */}
          <div className="neo-card" style={{ marginBottom: '0' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '950', borderBottom: '3px solid #000', paddingBottom: '6px', marginBottom: '12px', textTransform: 'uppercase' }}>
              📝 Third Title / Info Controls
            </h3>
            <ThirdTitleControls data={data} actions={actions} theme={theme} />
          </div>

        </div>

        {/* ── Overlay Room URL (compact) ── */}
        <OverlayRoomControls showOverlay={isLive} toggleOverlay={actions.toggleOverlay} roomId={roomId} compact />
      </div>
    )
  }

  // ══════════════════════════════════════════════════════
  //  TAB 2: PENGATURAN TIM
  // ══════════════════════════════════════════════════════
  const renderSettingsTab = () => (
    <div className={`op-tab-pane ${activeTab === 'settings' ? 'active' : 'inactive'}`}>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '12px',
          borderBottom: `1px solid ${borderCol}`,
          paddingBottom: '14px'
        }}
      >
        <div><LayoutSelector data={data} updateMatch={actions.updateMatch} /></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label className='op-label' style={{ marginBottom: '2px', color: labelColor }}>Format Match (Series)</label>
          <select
            className='op-input'
            value={data.seriesType || 'none'}
            onChange={e => actions.updateMatch({ seriesType: e.target.value, homeSeriesScore: 0, awaySeriesScore: 0 })}
            style={{ width: '100%', height: '40px', padding: '0 10px', background: isLight ? '#ffffff' : '#090d16', border: `1px solid ${borderCol}`, borderRadius: '8px', color: isLight ? '#0f172a' : '#fff', fontSize: '13px' }}
          >
            <option value='none'>Single Match (Normal)</option>
            <option value='bo3'>Best of 3 (BO3)</option>
            <option value='bo5'>Best of 5 (BO5)</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '16px', marginTop: '14px' }}>
        {/* HOME TEAM */}
        <div style={{ background: cardBg, border: cardBorder, borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#60a5fa', borderBottom: `1px solid ${borderCol}`, paddingBottom: '4px', margin: '0' }}>🏠 Home Team (Left Side)</h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div onClick={() => openLogoPicker('home')} style={{ width: '48px', height: '48px', background: isLight ? '#f8fafc' : '#0d0d0d', border: `1px solid ${borderCol}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }} title='Pilih Logo'>
              {data.homeLogo ? <img src={data.homeLogo} alt='Home Logo' style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} /> : <span style={{ fontSize: '10px', color: '#666' }}>Logo</span>}
            </div>

            <div style={{ display: 'flex', gap: '6px', flex: 1, alignItems: 'center' }}>
              <input className='op-input' value={data.homeName || ''} onChange={e => actions.updateMatch({ homeName: e.target.value })} placeholder='Abbr' style={{ width: '55px', height: '32px', fontSize: '12px' }} />
              <input className='op-input' value={data.homeFullName || ''} onChange={e => actions.updateMatch({ homeFullName: e.target.value })} placeholder='Full Name' style={{ flex: 1, height: '32px', fontSize: '12px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }} title="Pilih Warna">
                <input type='color' value={data.homeColor || data.homeBg || '#ff4b4b'} onChange={e => handleHomeColorChange(e.target.value)} style={{ border: 'none', width: '28px', height: '24px', padding: '0', background: 'transparent', cursor: 'pointer' }} />
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

        {/* AWAY TEAM */}
        <div style={{ background: cardBg, border: cardBorder, borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#f87171', borderBottom: `1px solid ${borderCol}`, paddingBottom: '4px', margin: '0' }}>✈️ Away Team (Right Side)</h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div onClick={() => openLogoPicker('away')} style={{ width: '48px', height: '48px', background: isLight ? '#f8fafc' : '#0d0d0d', border: `1px solid ${borderCol}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }} title='Pilih Logo'>
              {data.awayLogo ? <img src={data.awayLogo} alt='Away Logo' style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} /> : <span style={{ fontSize: '10px', color: '#666' }}>Logo</span>}
            </div>

            <div style={{ display: 'flex', gap: '6px', flex: 1, alignItems: 'center' }}>
              <input className='op-input' value={data.awayName || ''} onChange={e => actions.updateMatch({ awayName: e.target.value })} placeholder='Abbr' style={{ width: '55px', height: '32px', fontSize: '12px' }} />
              <input className='op-input' value={data.awayFullName || ''} onChange={e => actions.updateMatch({ awayFullName: e.target.value })} placeholder='Full Name' style={{ flex: 1, height: '32px', fontSize: '12px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }} title="Pilih Warna">
                <input type='color' value={data.awayColor || data.awayBg || '#b00024'} onChange={e => handleAwayColorChange(e.target.value)} style={{ border: 'none', width: '28px', height: '24px', padding: '0', background: 'transparent', cursor: 'pointer' }} />
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

      {/* ── FIFA / CENTER LOGO SETTINGS ── */}
      <div style={{ background: cardBg, border: cardBorder, borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#fbbf24', borderBottom: `1px solid ${borderCol}`, paddingBottom: '4px', margin: '0' }}>🏆 Logo Tengah (FIFA / Turnamen)</h3>

        {/* Switch: Logo B2F vs Logo FIFA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: !data.useCustomFifaLogo ? '#fbbf24' : labelColor, opacity: !data.useCustomFifaLogo ? 1 : 0.5 }}>Logo B2F</span>
          <button
            onClick={() => actions.updateMatch({ useCustomFifaLogo: !data.useCustomFifaLogo })}
            style={{
              width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', position: 'relative',
              background: data.useCustomFifaLogo ? '#3b82f6' : '#374151', transition: 'background 0.2s ease'
            }}
          >
            <span style={{
              position: 'absolute', top: '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
              left: data.useCustomFifaLogo ? '22px' : '2px', transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }} />
          </button>
          <span style={{ fontSize: '12px', fontWeight: '600', color: data.useCustomFifaLogo ? '#3b82f6' : labelColor, opacity: data.useCustomFifaLogo ? 1 : 0.5 }}>Logo FIFA</span>
        </div>

        {/* Preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '56px', height: '56px', background: data.useCustomFifaLogo ? '#051B5E' : '#ffb901', border: `1px solid ${borderCol}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            <img
              src={data.useCustomFifaLogo ? 'https://upload.wikimedia.org/wikipedia/id/thumb/1/17/2026_FIFA_World_Cup_emblem.svg/960px-2026_FIFA_World_Cup_emblem.svg.png' : '/logob2f.jpg'}
              alt='Center Logo'
              style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', ...(data.useCustomFifaLogo && { filter: 'brightness(0) invert(1)' }) }}
              onError={e => { e.target.style.display = 'none' }}
            />
          </div>
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>{data.useCustomFifaLogo ? 'Menggunakan logo FIFA World Cup 2026' : 'Menggunakan logo B2F (logob2f.jpg)'}</span>
        </div>

        {/* Size Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '10px', fontWeight: '600', color: tinyColor, minWidth: '80px' }}>Ukuran (px)</label>
          <input
            type='range'
            min={32}
            max={256}
            step={4}
            value={data.fifaLogoSize || 96}
            onChange={e => actions.updateMatch({ fifaLogoSize: Number(e.target.value) })}
            style={{ flex: 1, accentColor: '#fbbf24', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '12px', fontWeight: '700', color: labelColor, minWidth: '40px', textAlign: 'right' }}>{data.fifaLogoSize || 96}px</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px', borderTop: `1px solid ${borderCol}`, marginTop: '14px', paddingTop: '14px' }}>
        <OverlayRoomControls showOverlay={data.showOverlay} toggleOverlay={actions.toggleOverlay} roomId={roomId} />
        <div className='op-section' style={{ margin: 0 }}>
          <Button className='op-btn' variant='outline' onClick={() => alert('Data tersinkronisasi otomatis dengan Realtime Database!')} style={{ fontSize: '11px' }}>🔄 Sync Semua Client</Button>
        </div>
      </div>

      <LogoPickerModal
        isOpen={logoModalOpen}
        onClose={() => setLogoModalOpen(false)}
        defaultClubName={logoTarget === 'home' ? data.homeFullName : data.awayFullName}
        theme={theme}
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
      <div className='op-tabs'>
        <button className={`op-tab-btn ${activeTab === 'scoreboard' ? 'active' : ''}`} onClick={() => changeTab('scoreboard')}>
          <i className='ri-gamepad-line' />
          🎮 Scoreboard
        </button>
        <button className={`op-tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => changeTab('settings')}>
          <i className='ri-settings-3-line' />
          ⚙️ Pengaturan Tim
        </button>
      </div>
      <div className='op-tab-container'>
        {renderScoreboardTab()}
        {renderSettingsTab()}
      </div>

      {isTimeModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: theme === 'light' ? '#ffffff' : '#0f172a', border: theme === 'light' ? '2px solid #cbd5e1' : '2px solid #334155', padding: '24px', borderRadius: '12px', width: '300px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: theme === 'light' ? '#000000' : '#ffffff' }}>Set Manual Time</h3>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: theme === 'light' ? '#000000' : '#ffffff', fontWeight: 'bold' }}>Menit</label>
                <input
                  type='number'
                  className='op-input'
                  value={manualM}
                  onChange={e => setManualM(e.target.value)}
                  style={{ width: '100%', marginTop: '4px', backgroundColor: theme === 'light' ? '#f8fafc' : '#1e293b', border: theme === 'light' ? '1px solid #cbd5e1' : '1px solid #475569', color: theme === 'light' ? '#000000' : '#ffffff', padding: '10px', borderRadius: '6px', outline: 'none' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: theme === 'light' ? '#000000' : '#ffffff', fontWeight: 'bold' }}>Detik</label>
                <input
                  type='number'
                  className='op-input'
                  value={manualS}
                  onChange={e => setManualS(e.target.value)}
                  style={{ width: '100%', marginTop: '4px', backgroundColor: theme === 'light' ? '#f8fafc' : '#1e293b', border: theme === 'light' ? '1px solid #cbd5e1' : '1px solid #475569', color: theme === 'light' ? '#000000' : '#ffffff', padding: '10px', borderRadius: '6px', outline: 'none' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className='neo-btn-lg neo-btn-outline' onClick={() => setIsTimeModalOpen(false)} style={{ padding: '8px 16px', fontSize: '12px', backgroundColor: theme === 'light' ? '#e2e8f0' : '#334155', border: 'none', color: theme === 'light' ? '#000' : '#fff' }}>Batal</button>
              <button
                className='neo-btn-lg neo-btn-primary'
                onClick={() => {
                  handleSetTime()
                  setIsTimeModalOpen(false)
                }}
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
