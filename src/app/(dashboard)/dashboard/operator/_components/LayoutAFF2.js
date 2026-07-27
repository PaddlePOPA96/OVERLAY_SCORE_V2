'use client'

import { useEffect, useState, useRef } from 'react'
import AnimatedB2fLogo from '@/components/AnimatedB2fLogo'

export default function LayoutAFF2({ data, displayTime, formatTime }) {
  const [isVisible, setIsVisible] = useState(data.showOverlay)
  const [isHiding, setIsHiding] = useState(false)
  const [pulseScoreA, setPulseScoreA] = useState(false)
  const [pulseScoreB, setPulseScoreB] = useState(false)

  const prevScoreA = useRef(0)
  const prevScoreB = useRef(0)

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
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [data.showOverlay, isVisible])

  const isSwapped = !!data.switchSides

  const teamLeftNameRaw = isSwapped ? data.awayName || 'TIM B' : data.homeName || 'TIM A'
  const teamLeftName = teamLeftNameRaw.toUpperCase()
  const teamLeftScore = isSwapped ? data.awayScore ?? 0 : data.homeScore ?? 0
  const teamLeftLogo = isSwapped ? data.awayLogo : data.homeLogo

  const teamRightNameRaw = isSwapped ? data.homeName || 'TIM A' : data.awayName || 'TIM B'
  const teamRightName = teamRightNameRaw.toUpperCase()
  const teamRightScore = isSwapped ? data.homeScore ?? 0 : data.awayScore ?? 0
  const teamRightLogo = isSwapped ? data.homeLogo : data.awayLogo

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
          className={`relative select-none ${isHiding ? 'aff-animate-out' : 'aff-animate-in'}`}
          style={{ width: '576px', height: '204px' }}
        >
          {/* Background SVG exactly matching the provided design */}
          <svg
            width="576"
            height="204"
            viewBox="0 0 576 204"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
          >
            <path d="M135 49H440L409.674 175.657C407.519 184.655 399.475 191 390.223 191H186.116C176.938 191 168.939 184.754 166.713 175.851L135 49Z" fill={aff2AccentColor} />
            <path d="M0 49H122L135.5 115H24L0 49Z" fill="#062258" />
            <path d="M575.5 49H453.5L440 115H551.241L575.5 49Z" fill="#042358" />
            <path d="M24 115H157.5V124H27L24 115Z" fill={aff2AccentColor} />
            <path d="M551 115H424L422 124H548L551 115Z" fill={aff2AccentColor} />
          </svg>

          {/* Content Layer */}
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

            {/* Center Logo */}
            <div
              style={{
                position: 'absolute',
                left: '244px',
                top: '25px',
                width: '85px',
                height: '113px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {data.useCustomFifaLogo ? (
                <img
                  key="logo-aff2-static"
                  src={data.customLogo || 'https://upload.wikimedia.org/wikipedia/en/7/76/2026_ASEAN_Championship_Logo.svg'}
                  alt="Logo"
                  className="logo-anim-in"
                  style={{ width: '85px', height: '113px', objectFit: 'contain' }}
                />
              ) : (
                <div
                  key="logo-aff2-b2f"
                  className="logo-anim-in"
                  style={{
                    width: '120px',
                    height: '120px',
                    backgroundColor: '#F9C725',
                    borderRadius: '100%',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ width: '90px', height: '90px' }}>
                    <AnimatedB2fLogo triggerId={data.introId} />
                  </div>
                </div>
              )}
            </div>

            {/* Timer */}
            <div
              style={{
                position: 'absolute',
                left: '214px',
                top: '143px',
                width: '144px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
              }}
            >
              <span className="font-['Orbitron'] font-bold" style={{ fontSize: '24px', letterSpacing: '1px' }}>
                {waktuPertandingan}
              </span>
            </div>

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
      </div>
    </div>
  )
}
