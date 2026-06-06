'use client'

import { useEffect, useState, useRef } from 'react'
import '@/app/(dashboard)/dashboard/operator/overlay/layoutC.css'
import { getScale } from './overlay-scale.config'

export default function LayoutC({ data, displayTime, formatTime }) {
  const [isVisible, setIsVisible] = useState(data.showOverlay)
  const [isHiding, setIsHiding] = useState(false)
  const lastTriggerRef = useRef(data.goalTrigger || 0)
  const [showGoal, setShowGoal] = useState(false)

  // Visibility & Hiding Animation Logic
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

  // Goal Animation Trigger (Only on NEW triggers)
  useEffect(() => {
    if (data.goalTrigger > 0 && data.goalTrigger !== lastTriggerRef.current) {
      lastTriggerRef.current = data.goalTrigger
      setShowGoal(true)

      // Banner stays for 3 seconds, then slides back out
      const timer = setTimeout(() => setShowGoal(false), 3000)

      return () => clearTimeout(timer)
    }
  }, [data.goalTrigger])

  if (!isVisible) return null

  // Use short name (abbreviation) as requested
  const homeDisplayName = data.homeName || 'HOME'
  const awayDisplayName = data.awayName || 'AWAY'

  const overlayScale = getScale('C', data.isPreview)

  const boardStyle = {
    '--overlay-scale': overlayScale
  }

  return (
    <div id='layout-c-root' style={boardStyle}>
      <div className={`layout-c-container ${isHiding ? 'layout-c-hide' : ''} ${showGoal ? 'layout-c-goal-pulse' : ''}`}>
        {/* League Logo Box
        <div className="layout-c-league-box">
          <Image
            src="/logo/logo-epl.svg"
            alt="League"
            width={60}
            height={60}
            className="layout-c-league-logo"
            priority
          />
        </div> */}

        {/* Timer Box */}
        <div className='layout-c-timer-box'>{formatTime(displayTime)}</div>

        {/* Main Scoreboard Bar */}
        <div className='layout-c-main-bar'>
          {/* Home Team Section */}
          <div
            className={`layout-c-team layout-c-team-home ${showGoal && data.goalTeam === data.homeName ? 'show-goal-banner' : ''}`}
          >
            <span className='layout-c-team-name'>{homeDisplayName}</span>
            <img
              src={data.homeLogo || '/logo/placeholder.png'}
              alt={homeDisplayName}
              width={60}
              height={60}
              className='layout-c-team-logo'
            />
            <div className='layout-c-goal-banner'>GOAL</div>
          </div>

          {/* Score Section */}
          <div className='layout-c-score-box'>
            <span>{data.homeScore ?? 0}</span>
            <span className='layout-c-score-divider'>|</span>
            <span>{data.awayScore ?? 0}</span>
          </div>

          {/* Away Team Section */}
          <div
            className={`layout-c-team layout-c-team-away ${showGoal && data.goalTeam === data.awayName ? 'show-goal-banner' : ''}`}
          >
            <span className='layout-c-team-name'>{awayDisplayName}</span>
            <img
              src={data.awayLogo || '/logo/placeholder.png'}
              alt={awayDisplayName}
              width={60}
              height={60}
              className='layout-c-team-logo'
            />
            <div className='layout-c-goal-banner'>GOAL</div>
          </div>
        </div>
      </div>
    </div>
  )
}
