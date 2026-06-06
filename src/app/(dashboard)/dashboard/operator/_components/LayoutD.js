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
  // Default: #ff4655 (merah khas Valorant)
  const homeColor = isSwapped ? (data.awayColor || data.awayBg || '#ff4655') : (data.homeColor || data.homeBg || '#ff4655')

  // ── Right side
  const awayName = (isSwapped ? data.homeName || 'XLG' : data.awayName || 'NRG').substring(0, 4).toUpperCase()
  const awaySeed = (isSwapped ? data.homeFullName || 'CN#2' : data.awayFullName || 'AMER#3').substring(0, 10).toUpperCase()
  const awayLogo = isSwapped ? data.homeLogo || '' : data.awayLogo || ''
  const awayScore = isSwapped ? data.homeScore ?? 0 : data.awayScore ?? 0
  const awaySeries = isSwapped ? data.homeSeriesScore || 0 : data.awaySeriesScore || 0
  // Default: #1ee3b5 (hijau toska)
  const awayColor = isSwapped ? (data.homeColor || data.homeBg || '#1ee3b5') : (data.awayColor || data.awayBg || '#1ee3b5')

  const round = data.period || 1
  const seriesLen = data.seriesType === 'bo5' ? 3 : data.seriesType === 'bo3' ? 2 : 0
  const timeStr = formatTime ? formatTime(displayTime) : (displayTime || '0:00')

  const homeGoal = showGoal && goalTeam === (isSwapped ? data.awayName : data.homeName)
  const awayGoal = showGoal && goalTeam === (isSwapped ? data.homeName : data.awayName)

  return (
    <div id='layout-d-root' style={{ '--overlay-scale': scale }}>
      <div className={`layout-d-container ${isHiding ? 'layout-d-hide' : ''}`}>
        <div className='vct-hud'>

          {/* ══════════════ LEFT SIDE ══════════════ */}
          <div className='vct-side'>

            {/* Team panel left */}
            <div className='vct-panel left'>
              {/* Skewed background */}
              <div
                className='vct-panel-bg'
                style={{
                  background: `linear-gradient(90deg, color-mix(in srgb, ${homeColor} 28%, #041a24) 0%, #0f1922 100%)`,
                  borderBottom: `2.5px solid ${homeColor}`,
                }}
              />
              {/* Upright content */}
              <div className='vct-panel-inner left'>
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
            </div>

            {/* Score left */}
            <div className={`vct-score left ${homeGoal ? 'flash' : ''}`}>
              <div
                className='vct-score-bg left'
                style={{ borderBottom: `3px solid ${homeColor}` }}
              />
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

          </div>

          {/* ══════════════ CENTER SHIELD ══════════════ */}
          <div className='vct-shield'>
            <svg className='vct-shield-svg' viewBox='0 0 180 84' preserveAspectRatio='none'>
              {/* Shield fill */}
              <path d='M 22 0 L 158 0 L 138 72 L 90 84 L 42 72 Z' fill='#0c1219' />
              {/* Left accent line */}
              <path d={`M 22 0 L 42 72`} stroke={homeColor} strokeWidth='3.5' strokeLinecap='round' />
              {/* Right accent line */}
              <path d={`M 158 0 L 138 72`} stroke={awayColor} strokeWidth='3.5' strokeLinecap='round' />
            </svg>
            <div className='vct-shield-info'>
              <span className='vct-round'>ROUND {round}</span>
              <span className='vct-time'>{timeStr}</span>
            </div>
          </div>

          {/* ══════════════ RIGHT SIDE ══════════════ */}
          <div className='vct-side'>

            {/* Score right */}
            <div className={`vct-score right ${awayGoal ? 'flash' : ''}`}>
              <div
                className='vct-score-bg right'
                style={{ borderBottom: `3px solid ${awayColor}` }}
              />
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

            {/* Team panel right */}
            <div className='vct-panel right'>
              <div
                className='vct-panel-bg right'
                style={{
                  background: `linear-gradient(-90deg, color-mix(in srgb, ${awayColor} 28%, #041a24) 0%, #0f1922 100%)`,
                  borderBottom: `2.5px solid ${awayColor}`,
                }}
              />
              <div className='vct-panel-inner right'>
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
      </div>
    </div>
  )
}
