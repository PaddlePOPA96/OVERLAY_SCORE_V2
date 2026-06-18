'use client'

import { useEffect, useState } from 'react'

import '@/app/(dashboard)/dashboard/operator/overlay/layoutD.css'
import { getScale } from './overlay-scale.config'

export default function LayoutD({ data, displayTime, formatTime }) {
  const [isVisible, setIsVisible] = useState(data.showOverlay)
  const [isHiding, setIsHiding] = useState(false)
  const [showGoal, setShowGoal] = useState(false)
  const [goalTeam, setGoalTeam] = useState('')

  useEffect(() => {
    if (data.showOverlay) {
      setIsVisible(true)
      setIsHiding(false)
    } else if (isVisible) {
      setIsHiding(true)

      const timer = setTimeout(() => {
        setIsVisible(false)
        setIsHiding(false)
      }, 600)

      
return () => clearTimeout(timer)
    }
  }, [data.showOverlay, isVisible])

  useEffect(() => {
    const now = Date.now()

    if (data.goalTrigger > 0 && now - data.goalTrigger < 5000) {
      setGoalTeam(data.goalTeam || '')
      setShowGoal(true)

      const timer = setTimeout(() => {
        setShowGoal(false)
        setGoalTeam('')
      }, 3500)

      
return () => clearTimeout(timer)
    }
  }, [data.goalTrigger, data.goalTeam])

  if (!isVisible) return null

  const isSwapped = !!data.switchSides
  const scale = getScale('D', data.isPreview)

  // ── Left side
  const homeName = (isSwapped ? data.awayName || 'NRG' : data.homeName || 'XLG').substring(0, 4).toUpperCase()
  const homeSeed = (isSwapped ? data.awayFullName || 'AMER#3' : data.homeFullName || 'CN#2').substring(0, 10).toUpperCase()
  const homeLogo = isSwapped ? data.awayLogo || '' : data.homeLogo || ''
  const homeScore = isSwapped ? data.awayScore ?? 0 : data.homeScore ?? 0
  const homeSeries = isSwapped ? data.awaySeriesScore || 0 : data.homeSeriesScore || 0
  const homeColor = isSwapped ? (data.awayColor || data.awayBg || '#ff4655') : (data.homeColor || data.homeBg || '#ff4655')

  // ── Right side
  const awayName = (isSwapped ? data.homeName || 'XLG' : data.awayName || 'NRG').substring(0, 4).toUpperCase()
  const awaySeed = (isSwapped ? data.homeFullName || 'CN#2' : data.awayFullName || 'AMER#3').substring(0, 10).toUpperCase()
  const awayLogo = isSwapped ? data.homeLogo || '' : data.awayLogo || ''
  const awayScore = isSwapped ? data.homeScore ?? 0 : data.awayScore ?? 0
  const awaySeries = isSwapped ? data.homeSeriesScore || 0 : data.awaySeriesScore || 0
  const awayColor = isSwapped ? (data.homeColor || data.homeBg || '#1ee3b5') : (data.awayColor || data.awayBg || '#1ee3b5')

  const round = data.period || 1
  const seriesLen = data.seriesType === 'bo5' ? 3 : data.seriesType === 'bo3' ? 2 : 0
  const timeStr = formatTime ? formatTime(displayTime) : (displayTime || '0:00')

  const homeGoal = showGoal && goalTeam === (isSwapped ? data.awayName : data.homeName)
  const awayGoal = showGoal && goalTeam === (isSwapped ? data.homeName : data.awayName)

  // SVG gradient IDs
  const homeGradId = 'vct-home-grad'
  const awayGradId = 'vct-away-grad'

  // Dim a hex color to a fraction of its brightness (solid, no opacity — looks same on any bg)
  const dimHex = (hex, factor = 0.38) => {
    if (!hex || !hex.startsWith('#') || hex.length < 7) return '#1a1a1a'
    const r = Math.round(parseInt(hex.slice(1, 3), 16) * factor)
    const g = Math.round(parseInt(hex.slice(3, 5), 16) * factor)
    const b = Math.round(parseInt(hex.slice(5, 7), 16) * factor)

    
return `rgb(${r},${g},${b})`
  }

  const homeDark = '#161515'
  const awayDark = '#161515'
  const homeAccent = dimHex(homeColor, 0.38)   // thin accent: 38% brightness of team color
  const awayAccent = dimHex(awayColor, 0.38)

  return (
    <div id='layout-d-root' style={{ '--overlay-scale': scale }}>
      <div className={`layout-d-container ${isHiding ? 'layout-d-hide' : ''}`}>
        <div className='vct-hud'>

          {/* ══════════════ BASE SVG (scorevct shape) ══════════════ */}
          <svg
            className='vct-base-svg'
            width='600'
            height='78'
            viewBox='0 0 600 78'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <defs>
              {/* Home gradient: dark → solid dimmed accent (consistent on any bg) */}
              <linearGradient id={homeGradId} x1='38.5' y1='32' x2='191.5' y2='48.5' gradientUnits='userSpaceOnUse'>
                <stop stopColor={homeDark} />
                <stop offset='0.45' stopColor={homeDark} />
                <stop offset='1' stopColor={homeAccent} />
              </linearGradient>

              {/* Away gradient: dark → solid dimmed accent (consistent on any bg) */}
              <linearGradient id={awayGradId} x1='561.5' y1='32' x2='408.5' y2='48.5' gradientUnits='userSpaceOnUse'>
                <stop stopColor={awayDark} />
                <stop offset='0.45' stopColor={awayDark} />
                <stop offset='1' stopColor={awayAccent} />
              </linearGradient>
            </defs>

            {/* Left panel */}
            <path
              d='M221.5 68H248.5L228.5 49.5L230.5 43L203.5 10H10L57 68H156.5L163.5 58H216L221.5 68Z'
              fill={`url(#${homeGradId})`}
              stroke={homeColor}
              strokeWidth='1'
              className={homeGoal ? 'panel-left-path flash' : 'panel-left-path'}
            />

            {/* Right panel */}
            <path
              d='M378.5 68H351.5L371.5 49.5L369.5 43L396.5 10H590L543 68H443.5L436.5 58H384L378.5 68Z'
              fill={`url(#${awayGradId})`}
              stroke={awayColor}
              strokeWidth='1'
              className={awayGoal ? 'panel-right-path flash' : 'panel-right-path'}
            />

          </svg>

          {/* ══════════════ LEFT TEAM CONTENT ══════════════ */}
          <div className='vct-left-content'>
            <div className='vct-logo'>
              {homeLogo
                ? <img src={homeLogo} alt={homeName} onError={e => { e.currentTarget.style.display = 'none' }} />
                : <span style={{ color: homeColor }}>{homeName.charAt(0)}</span>
              }
            </div>
            <div className='vct-info right-text'>
              <span className='vct-name' style={{ color: homeColor }}>{homeName}</span>
              <span className='vct-seed'>{homeSeed}</span>
            </div>
          </div>

          {/* ══════════════ LEFT SCORE ══════════════ */}
          <div className='vct-score-block left'>
            <span className='vct-num'>{homeScore}</span>
            {seriesLen > 0 && (
              <div className='vct-tray'>
                {Array.from({ length: seriesLen }).map((_, i) => (
                  <span
                    key={i}
                    className={`vct-dia ${i < homeSeries ? 'on' : ''}`}
                    style={i < homeSeries ? { background: homeColor, borderColor: homeColor, boxShadow: `0 0 5px ${homeColor}` } : {}}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ══════════════ CENTER ══════════════ */}
          <div className='vct-center'>
            <span className='vct-round'>ROUND {round}</span>
            <span className='vct-time'>{timeStr}</span>
          </div>

          {/* ══════════════ RIGHT SCORE ══════════════ */}
          <div className='vct-score-block right'>
            <span className='vct-num'>{awayScore}</span>
            {seriesLen > 0 && (
              <div className='vct-tray'>
                {Array.from({ length: seriesLen }).map((_, i) => (
                  <span
                    key={i}
                    className={`vct-dia ${i < awaySeries ? 'on' : ''}`}
                    style={i < awaySeries ? { background: awayColor, borderColor: awayColor, boxShadow: `0 0 5px ${awayColor}` } : {}}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ══════════════ RIGHT TEAM CONTENT ══════════════ */}
          <div className='vct-right-content'>
            <div className='vct-info left-text'>
              <span className='vct-name' style={{ color: awayColor }}>{awayName}</span>
              <span className='vct-seed'>{awaySeed}</span>
            </div>
            <div className='vct-logo'>
              {awayLogo
                ? <img src={awayLogo} alt={awayName} onError={e => { e.currentTarget.style.display = 'none' }} />
                : <span style={{ color: awayColor }}>{awayName.charAt(0)}</span>
              }
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
