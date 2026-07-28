'use client'

import { useEffect, useState, useRef } from 'react'

import AnimatedB2fLogo from '@/components/AnimatedB2fLogo'

export default function LayoutAFF2({ data, displayTime, formatTime }) {
  const isSwapped = !!data.switchSides

  const teamLeftNameRaw = isSwapped ? data.awayName || 'TIM B' : data.homeName || 'TIM A'
  const teamLeftName = teamLeftNameRaw.toUpperCase()
  const teamLeftScore = isSwapped ? data.awayScore ?? 0 : data.homeScore ?? 0
  const teamLeftLogo = isSwapped ? data.awayLogo : data.homeLogo
  const teamLeftColor = isSwapped ? (data.awayColor || '#FF0E0E') : (data.homeColor || '#0032FF')

  const teamRightNameRaw = isSwapped ? data.homeName || 'TIM A' : data.awayName || 'TIM B'
  const teamRightName = teamRightNameRaw.toUpperCase()
  const teamRightScore = isSwapped ? data.homeScore ?? 0 : data.awayScore ?? 0
  const teamRightLogo = isSwapped ? data.homeLogo : data.awayLogo
  const teamRightColor = isSwapped ? (data.homeColor || '#0032FF') : (data.awayColor || '#FF0E0E')

  const [isVisible, setIsVisible] = useState(data.showOverlay)
  const [isHiding, setIsHiding] = useState(false)
  const [pulseScoreA, setPulseScoreA] = useState(false)
  const [pulseScoreB, setPulseScoreB] = useState(false)

  const prevScoreA = useRef(0)
  const prevScoreB = useRef(0)

  // Goal animation states & refs
  const [goalEvent, setGoalEvent] = useState(null) // 'left' | 'right' | null
  const prevGoalScoreA = useRef(teamLeftScore)
  const prevGoalScoreB = useRef(teamRightScore)
  const goalTimeouts = useRef([])

  // Handle slide in/out
  useEffect(() => {
    if (data.showOverlay) {
      setIsVisible(true)
      setIsHiding(false)

      return
    }

    if (isVisible && !data.showOverlay) {
      setIsHiding(true)

      const timer = setTimeout(() => {
        setIsVisible(false)
        setIsHiding(false)
      }, 800)

      return () => clearTimeout(timer)
    }
  }, [data.showOverlay, isVisible])

  const waktuPertandingan = formatTime ? formatTime(displayTime) : "00:00"
  const aff2AccentColor = data.useCustomFifaLogo ? '#23A5CF' : '#23A5CF'

  // Pulse animation effect
  useEffect(() => {
    if (teamLeftScore !== prevScoreA.current) {
      setPulseScoreA(true)
      setTimeout(() => setPulseScoreA(false), 300)
      prevScoreA.current = teamLeftScore
    }
  }, [teamLeftScore])

  useEffect(() => {
    if (teamRightScore !== prevScoreB.current) {
      setPulseScoreB(true)
      setTimeout(() => setPulseScoreB(false), 300)
      prevScoreB.current = teamRightScore
    }
  }, [teamRightScore])

  // Goal event detection
  useEffect(() => {
    if (!isVisible) return

    const isLeftGoal = teamLeftScore > prevGoalScoreA.current
    const isRightGoal = teamRightScore > prevGoalScoreB.current

    if (isLeftGoal || isRightGoal) {
      goalTimeouts.current.forEach(clearTimeout)
      goalTimeouts.current = []

      const side = isLeftGoal ? 'left' : 'right'

      const t1 = setTimeout(() => setGoalEvent(side), 400)

      const t2 = setTimeout(() => {
        setGoalEvent(null)
      }, 5500)

      goalTimeouts.current.push(t1, t2)
    }

    prevGoalScoreA.current = teamLeftScore
    prevGoalScoreB.current = teamRightScore
  }, [teamLeftScore, teamRightScore, isVisible])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      goalTimeouts.current.forEach(clearTimeout)
    }
  }, [])

  if (!isVisible) return null

  // We adjust the scale so that it fits nicely on the screen just like LayoutAFF
  const transformScale = data.isPreview ? 'scale(0.8)' : 'scale(1.8)'

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      <div
        style={{
          transform: transformScale,
          transformOrigin: 'center center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          className="relative select-none"
          style={{ width: '576px', height: '204px' }}
        >
          {/* ==================================================== */}
          {/* CENTER LOGO BACKGROUND SHAPE                         */}
          {/* ==================================================== */}
          <div
            className={isHiding ? 'aff2-anim-logo-out' : 'aff2-anim-logo-in'}
            style={{ position: 'absolute', top: 0, left: 0, width: '576px', height: '204px', pointerEvents: 'none', zIndex: 1 }}
          >
            {/* SVG Background for Logo Shape */}
            <svg
              width="576"
              height="204"
              viewBox="0 0 576 204"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
            >
              {/* CENTER LOGO SHAPE */}
              <path d="M125 35 H451 L431 122 H145 Z" fill={aff2AccentColor} />
            </svg>
          </div>

          {/* ==================================================== */}
          {/* CENTER LOGO CONTENT (Overlays scores on exit/entry)  */}
          {/* ==================================================== */}
          <div
            className={isHiding ? 'aff2-anim-logo-out' : 'aff2-anim-logo-in'}
            style={{ position: 'absolute', top: 0, left: 0, width: '576px', height: '204px', pointerEvents: 'none', zIndex: 10 }}
          >
            {/* Logo Content */}
            <div
              style={{
                position: 'absolute',
                left: '243px',
                top: '22px',
                width: '90px',
                height: '90px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2
              }}
            >
              {data.useCustomFifaLogo ? (
                <img
                  key="logo-aff2-static"
                  src={data.customLogo || 'https://upload.wikimedia.org/wikipedia/en/7/76/2026_ASEAN_Championship_Logo.svg'}
                  alt="Logo"
                  style={{ width: '90px', height: '90px', objectFit: 'contain' }}
                />
              ) : (
                <div
                  key="logo-aff2-b2f"
                  style={{
                    width: '90px',
                    height: '90px',
                    backgroundColor: '#F9C725',
                    borderRadius: '100%',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ width: '70px', height: '70px' }}>
                    <AnimatedB2fLogo triggerId={data.introId} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ==================================================== */}
          {/* TIMER GROUP                                          */}
          {/* ==================================================== */}
          <div
            className={isHiding ? 'aff2-anim-timer-out' : 'aff2-anim-timer-in'}
            style={{ position: 'absolute', top: 0, left: 0, width: '576px', height: '204px', pointerEvents: 'none', zIndex: 2 }}
          >
            {/* SVG Background for Timer Shape */}
            <svg
              width="576"
              height="204"
              viewBox="0 0 576 204"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
            >
              {/* TIMER SHAPE */}
              <path d="M235 142 H341 L331 188 H245 Z" fill="#062258" />
            </svg>

            {/* Timer Content */}
            <div
              style={{
                position: 'absolute',
                left: '236px',
                top: '148px',
                width: '104px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                zIndex: 2
              }}
            >
              <span className="font-['Orbitron'] font-bold" style={{ fontSize: '20px', letterSpacing: '1px' }}>
                {waktuPertandingan}
              </span>
            </div>
          </div>

          {/* ==================================================== */}
          {/* LEFT SIDE GROUP                                      */}
          {/* ==================================================== */}
          <div
            className={isHiding ? 'aff2-anim-left-out' : 'aff2-anim-left-in'}
            style={{ position: 'absolute', top: 0, left: 0, width: '576px', height: '204px', pointerEvents: 'none', zIndex: 3 }}
          >
            {/* SVG Background for Left Side */}
            <svg
              width="576"
              height="204"
              viewBox="0 0 576 204"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
            >
              {/* Left Shape */}
              <path d="M0 49H122L135.5 115H24L0 49Z" fill="#062258" />
              {/* Left Accent */}
              <path d="M24 115H157.5V124H27L24 115Z" fill={aff2AccentColor} />
            </svg>

            {/* Content Layer (Left) */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}>
              {/* Left Team Name */}
              <div
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '49px',
                  width: '110px',
                  height: '66px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '22px',
                  letterSpacing: '1px'
                }}
              >
                {teamLeftName}
              </div>

              {/* Left Color Box (Jersey Color) */}
              <div
                style={{
                  position: 'absolute',
                  left: '122px',
                  top: '49px',
                  width: '28.5px',
                  height: '66px',
                  backgroundColor: isSwapped ? (data.awayColor || '#FF0E0E') : (data.homeColor || '#0032FF'),
                  clipPath: 'polygon(0% 0%, 47.37% 0%, 100% 100%, 47.37% 100%)',
                }}
              />

              {/* Left Score */}
              <div
                style={{
                  position: 'absolute',
                  left: '160px',
                  top: '49px',
                  width: '64px',
                  height: '66px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                <span
                  className={`font-['Poppins'] font-extrabold leading-none ${pulseScoreA ? 'score-pulse' : ''}`}
                  style={{ fontSize: '110px' }}
                >
                  {teamLeftScore}
                </span>
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* RIGHT SIDE GROUP                                     */}
          {/* ==================================================== */}
          <div
            className={isHiding ? 'aff2-anim-right-out' : 'aff2-anim-right-in'}
            style={{ position: 'absolute', top: 0, left: 0, width: '576px', height: '204px', pointerEvents: 'none', zIndex: 3 }}
          >
            {/* SVG Background for Right Side */}
            <svg
              width="576"
              height="204"
              viewBox="0 0 576 204"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
            >
              {/* Right Shape */}
              <path d="M575.5 49H453.5L440 115H551.241L575.5 49Z" fill="#062258" />
              {/* Right Accent */}
              <path d="M551 115H424L422 124H548L551 115Z" fill={aff2AccentColor} />
            </svg>

            {/* Content Layer (Right) */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}>
              {/* Right Score */}
              <div
                style={{
                  position: 'absolute',
                  left: '348px',
                  top: '49px',
                  width: '64px',
                  height: '66px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                <span
                  className={`font-['Poppins'] font-extrabold leading-none ${pulseScoreB ? 'score-pulse' : ''}`}
                  style={{ fontSize: '110px' }}
                >
                  {teamRightScore}
                </span>
              </div>

              {/* Right Color Box (Jersey Color) */}
              <div
                style={{
                  position: 'absolute',
                  left: '425px',
                  top: '49px',
                  width: '28.5px',
                  height: '66px',
                  backgroundColor: isSwapped ? (data.homeColor || '#0032FF') : (data.awayColor || '#FF0E0E'),
                  clipPath: 'polygon(52.63% 0%, 100% 0%, 52.63% 100%, 0% 100%)',
                }}
              />

              {/* Right Team Name */}
              <div
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '49px',
                  width: '110px',
                  height: '66px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '22px',
                  letterSpacing: '1px'
                }}
              >
                {teamRightName}
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* GOAL OVERLAY ANIMATION                               */}
          {/* ==================================================== */}
          {goalEvent && (
            <div
              className="goal-layer"
              style={{
                position: 'absolute',
                left: 0,
                top: '35px',
                width: '576px',
                height: '90px',
                zIndex: 50,
                overflow: 'hidden',
              }}
            >
              {/* Sliding Background Shape with dark blue body */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '-62px',
                  width: '120%',
                  height: '100%',
                  backgroundColor: '#062258', // Dark blue body matching scoreboard
                  transform: goalEvent === 'left' ? 'skewX(-11.5deg) translateX(-100%)' : 'skewX(-11.5deg) translateX(100%)',
                  animation: goalEvent === 'left' 
                    ? 'slideGoalLeftToRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' 
                    : 'slideGoalRightToLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  transformOrigin: goalEvent === 'left' ? 'left top' : 'right top',
                }}
              >
                {/* Slanted jersey color box on the leading edge */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: '35px',
                    backgroundColor: goalEvent === 'left' ? teamLeftColor : teamRightColor,
                    ...(goalEvent === 'left' ? { right: 0 } : { left: 0 })
                  }}
                />
              </div>
              
              {/* GOAL Text Trails */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  pointerEvents: 'none'
                }}
              >
                {/* LAYER 3: Blue (Back, delay 400ms) */}
                <span className="goal-text-layer" style={{ color: '#0044FF', zIndex: 1, animationDelay: '400ms' }}>
                  GOAL
                </span>
                {/* LAYER 2: Red (Middle, delay 250ms) */}
                <span className="goal-text-layer" style={{ color: '#FF0044', zIndex: 2, animationDelay: '250ms' }}>
                  GOAL
                </span>
                {/* LAYER 1: White (Front, delay 100ms) */}
                <span className="goal-text-layer" style={{ color: '#FFFFFF', zIndex: 3, animationDelay: '100ms' }}>
                  GOAL
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
