'use client'

import { useEffect, useState, useRef } from 'react'
import AnimatedB2fLogo from '@/components/AnimatedB2fLogo'

const flagPresets = {
  id: (
    <svg viewBox="0 0 50 40" width="100%" height="100%">
      <rect width="50" height="20" fill="#ED2939" />
      <rect y="20" width="50" height="20" fill="#FFFFFF" />
    </svg>
  ),
  th: (
    <svg viewBox="0 0 50 40" width="100%" height="100%">
      <rect width="50" height="40" fill="#FFFFFF" />
      <rect width="50" height="6.6" fill="#A51931" />
      <rect y="6.6" width="50" height="6.6" fill="#FFFFFF" />
      <rect y="13.2" width="50" height="13.2" fill="#2D2A4A" />
      <rect y="26.4" width="50" height="6.6" fill="#FFFFFF" />
      <rect y="33" width="50" height="7" fill="#A51931" />
    </svg>
  ),
  my: (
    <svg viewBox="0 0 50 40" width="100%" height="100%">
      <rect width="50" height="40" fill="#FFFFFF" />
      <rect width="50" height="2.8" fill="#CC0000" /><rect y="5.6" width="50" height="2.8" fill="#CC0000" /><rect y="11.2" width="50" height="2.8" fill="#CC0000" /><rect y="16.8" width="50" height="2.8" fill="#CC0000" /><rect y="22.4" width="50" height="2.8" fill="#CC0000" /><rect y="28" width="50" height="2.8" fill="#CC0000" /><rect y="33.6" width="50" height="2.8" fill="#CC0000" /><rect y="39.2" width="50" height="0.8" fill="#CC0000" />
      <rect y="2.8" width="50" height="2.8" fill="#FFFFFF" /><rect y="8.4" width="50" height="2.8" fill="#FFFFFF" /><rect y="14" width="50" height="2.8" fill="#FFFFFF" /><rect y="19.6" width="50" height="2.8" fill="#FFFFFF" /><rect y="25.2" width="50" height="2.8" fill="#FFFFFF" /><rect y="30.8" width="50" height="2.8" fill="#FFFFFF" /><rect y="36.4" width="50" height="2.8" fill="#FFFFFF" />
      <rect width="25" height="22.4" fill="#000066" />
      <path d="M 11 5 A 6 6 0 1 0 11 17 A 5.2 5.2 0 1 1 11 5 Z" fill="#FFCC00" />
      <polygon points="17,11 18,9 19,11 21,11 19.5,12 20.5,14 18,12.5 15.5,14 16.5,12 15,11" fill="#FFCC00" />
    </svg>
  ),
  vn: (
    <svg viewBox="0 0 50 40" width="100%" height="100%">
      <rect width="50" height="40" fill="#DA251D" />
      <polygon points="25,9 27.5,17 35.5,17 29,22 31.5,30 25,25 18.5,30 21,22 14.5,17 22.5,17" fill="#FFFF00" />
    </svg>
  ),
  sg: (
    <svg viewBox="0 0 50 40" width="100%" height="100%">
      <rect width="50" height="20" fill="#EF3A38" />
      <rect y="20" width="50" height="20" fill="#FFFFFF" />
      <path d="M 11 15 A 5 5 0 1 0 11 5 A 4 4 0 1 1 11 15 Z" fill="#FFFFFF" />
      <polygon points="13,8 13.3,9 14.3,9 13.5,9.6 13.8,10.6 13,10 12.2,10.6 12.5,9.6 11.7,9 12.7,9" fill="#FFFFFF" />
      <polygon points="16,11 16.3,12 17.3,12 16.5,12.6 16.8,13.6 16,13 15.2,13.6 15.5,12.6 14.7,12 15.7,12" fill="#FFFFFF" />
      <polygon points="10,11 10.3,12 11.3,12 10.5,12.6 10.8,13.6 10,13 9.2,13.6 9.5,12.6 8.7,12 9.7,12" fill="#FFFFFF" />
      <polygon points="8,8 8.3,9 9.3,9 8.5,9.6 8.8,10.6 8,10 7.2,10.6 7.5,9.6 6.7,9 7.7,9" fill="#FFFFFF" />
      <polygon points="10.5,6 10.8,7 11.8,7 11,7.6 11.3,8.6 10.5,8 9.7,8.6 10,7.6 9.2,7 10.2,7" fill="#FFFFFF" />
    </svg>
  ),
  ph: (
    <svg viewBox="0 0 50 40" width="100%" height="100%">
      <rect width="50" height="20" fill="#0038A8" />
      <rect y="20" width="50" height="20" fill="#CE1126" />
      <polygon points="0,0 20,20 0,40" fill="#FFFFFF" />
      <circle cx="7" cy="20" r="3.2" fill="#FCD116" />
      <circle cx="3" cy="7" r="1" fill="#FCD116" />
      <circle cx="3" cy="33" r="1" fill="#FCD116" />
      <circle cx="16" cy="20" r="1" fill="#FCD116" />
    </svg>
  ),
  mm: (
    <svg viewBox="0 0 50 40" width="100%" height="100%">
      <rect width="50" height="13.3" fill="#FECB00" />
      <rect y="13.3" width="50" height="13.4" fill="#109B48" />
      <rect y="26.7" width="50" height="13.3" fill="#EA2839" />
      <polygon points="25,9 28.5,19 38.5,19 30.5,25 33.5,35 25,29 16.5,35 19.5,25 11.5,19 21.5,19" fill="#FFFFFF" />
    </svg>
  ),
  kh: (
    <svg viewBox="0 0 50 40" width="100%" height="100%">
      <rect width="50" height="40" fill="#032A96" />
      <rect y="10" width="50" height="20" fill="#E21B1B" />
      <path d="M 20,26 L 20,23 L 22,23 L 22,20 L 23,20 L 23,17 L 24,17 L 24,15 L 26,15 L 26,17 L 27,17 L 27,20 L 28,20 L 28,23 L 30,23 L 30,26 Z" fill="#FFFFFF" />
      <path d="M 16,26 L 16,23 L 17,23 L 17,21 L 18,21 L 18,18 L 19,18 L 19,21 L 20,21 L 20,23 L 21,23 L 21,26 Z" fill="#FFFFFF" />
      <path d="M 29,26 L 29,23 L 30,23 L 30,21 L 31,21 L 31,18 L 32,18 L 32,21 L 33,21 L 33,23 L 34,23 L 34,26 Z" fill="#FFFFFF" />
    </svg>
  ),
  la: (
    <svg viewBox="0 0 50 40" width="100%" height="100%">
      <rect width="50" height="10" fill="#CE1126" />
      <rect y="10" width="50" height="20" fill="#002F6C" />
      <rect y="30" width="50" height="10" fill="#CE1126" />
      <circle cx="25" cy="20" r="7.5" fill="#FFFFFF" />
    </svg>
  ),
  bn: (
    <svg viewBox="0 0 50 40" width="100%" height="100%">
      <rect width="50" height="40" fill="#FCD116" />
      <polygon points="0,7 50,33 50,40 0,14" fill="#FFFFFF" />
      <polygon points="0,14 50,40 50,40 0,14" fill="#000000" />
      <circle cx="25" cy="18" r="3" fill="#E21C21" />
      <path d="M 21 20 C 21 25, 29 25, 29 20" stroke="#E21C21" strokeWidth="1.5" fill="none" />
    </svg>
  ),
  tl: (
    <svg viewBox="0 0 50 40" width="100%" height="100%">
      <rect width="50" height="40" fill="#FFC72C" />
      <polygon points="0,0 50,20 0,40" fill="#FFC72C" />
      <polygon points="0,0 35,20 0,40" fill="#111111" />
      <polygon points="0,0 20,20 0,40" fill="#FFFFFF" />
      <polygon points="6,20 8.5,19 9,16 9.5,19 12,20 9.5,21 9,24 8.5,21" fill="#FFFFFF" transform="rotate(-15 9 20)" />
    </svg>
  )
}

function FlagRenderer({ logo, abbr }) {
  if (logo) {
    return <img src={logo} alt={abbr} className="w-full h-full object-cover" />
  }

  // Try to match abbr (e.g., INA -> id, THA -> th)
  const codeMap = {
    'INA': 'id', 'IDN': 'id',
    'THA': 'th', 'MAS': 'my', 'VIE': 'vn', 'SIN': 'sg',
    'PHI': 'ph', 'MYA': 'mm', 'CAM': 'kh', 'LAO': 'la',
    'BRU': 'bn', 'TLS': 'tl'
  }

  const code = abbr ? codeMap[abbr.toUpperCase()] : null

  if (code && flagPresets[code]) {
    return flagPresets[code]
  }

  return <div className="w-full h-full bg-[#a1a1a1]" />
}



export default function LayoutAFF({ data, displayTime, formatTime }) {
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

  const tournamentTitle = data.tournamentName || 'AFF CHAMPIONSHIP 2026'
  const waktuPertandingan = formatTime ? formatTime(displayTime) : "00:00"
  const isTimerRunning = data.timerStatus === 'running'

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

  const transformScale = data.isPreview ? 'scale(1.2)' : 'scale(2.5)'

  return (
    <>
      <div
        className="flex items-center justify-center p-4 pt-[80px] relative w-full"
        style={{ transform: transformScale, transformOrigin: 'top center', fontFamily: "'Inter', sans-serif" }}
      >
        <div
          className={`relative select-none ${isHiding ? 'aff-animate-out' : 'aff-animate-in'}`}
          style={{ width: '404px', height: '104px' }}
        >
          {/* Top Capsule: Tournament Title */}
          <div
            className="absolute bg-[#050101] text-white flex justify-center items-center rounded-[9px] z-[2]"
            style={{ left: '83px', top: '0', width: '240px', height: '25px' }}
          >
            <span style={{ fontWeight: 750, fontSize: '8.5px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              {tournamentTitle}
            </span>
          </div>

          {/* Main Row */}
          <div
            className="absolute flex items-start"
            style={{ top: '25px', left: '0', width: '404px', height: '40px' }}
          >
            {/* Left Side: Team A Name, Flag, and Score */}
            <div className="absolute flex items-start" style={{ top: '0', height: '40px', left: '0.5px', width: '182.5px' }}>
              {/* Team Name Box */}
              <div
                className="bg-[#050101] text-white flex justify-center items-center"
                style={{ width: '82px', height: '39px', marginTop: '0.5px', borderBottomLeftRadius: '12px' }}
              >
                <span style={{ fontWeight: 750, fontSize: '13.5px', letterSpacing: '0.2px' }}>{teamLeftName}</span>
              </div>
              {/* Flag Box */}
              <div
                className="bg-[#D9D9D9] flex justify-center items-center overflow-hidden relative"
                style={{ width: '50px', height: '40px' }}
              >
                <FlagRenderer logo={teamLeftLogo} abbr={teamLeftName} />
              </div>
              {/* Score Box */}
              <div
                className="bg-white text-black flex justify-center items-center"
                style={{ width: '50px', height: '40px', borderTopRightRadius: '16px' }}
              >
                <span
                  className={`font-['Orbitron'] font-bold leading-none text-center transition-transform duration-100 ${pulseScoreA ? 'score-pulse' : ''}`}
                  style={{ fontSize: '25px' }}
                >
                  {teamLeftScore}
                </span>
              </div>
            </div>

            {/* Center Logo Overlay */}
            <div
              className="absolute flex justify-center items-center z-10 shadow-[0_4px_8px_rgba(0,0,0,0.3)]"
              style={{
                left: '170px',
                top: '-4px',
                width: '66px',
                height: '55px',
                borderRadius: '5.8px',
                backgroundColor: data.useCustomFifaLogo ? 'black' : '#ffb901'
              }}
            >
              {data.useCustomFifaLogo ? (
                <img
                  key="logo-aff-static"
                  src={data.customLogo || 'https://upload.wikimedia.org/wikipedia/en/7/76/2026_ASEAN_Championship_Logo.svg'}
                  alt="Logo"
                  className="logo-anim-in"
                  style={{ width: '36px', height: '49px', objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : (
                <div key="logo-aff-b2f" className="logo-anim-in" style={{ width: '36px', height: '36px' }}>
                  <AnimatedB2fLogo triggerId={data.introId} />
                </div>
              )}
              <div style={{ display: 'none', color: 'white', fontSize: '10px' }}>LOGO</div>
            </div>

            {/* Right Side: Score, Flag, and Team B Name */}
            <div className="absolute flex items-start" style={{ top: '0', height: '40px', right: '0.5px', width: '180.5px' }}>
              {/* Score Box */}
              <div
                className="bg-white text-black flex justify-center items-center"
                style={{ width: '50px', height: '40px', borderTopLeftRadius: '16px' }}
              >
                <span
                  className={`font-['Orbitron'] font-bold leading-none text-center transition-transform duration-100 ${pulseScoreB ? 'score-pulse' : ''}`}
                  style={{ fontSize: '25px' }}
                >
                  {teamRightScore}
                </span>
              </div>
              {/* Flag Box */}
              <div
                className="bg-[#D9D9D9] flex justify-center items-center overflow-hidden relative"
                style={{ width: '50px', height: '40px' }}
              >
                <FlagRenderer logo={teamRightLogo} abbr={teamRightName} />
              </div>
              {/* Team Name Box */}
              <div
                className="bg-[#050101] text-white flex justify-center items-center"
                style={{ width: '80.5px', height: '39px', marginTop: '0.5px', borderBottomRightRadius: '12px' }}
              >
                <span style={{ fontWeight: 750, fontSize: '13.5px', letterSpacing: '0.2px' }}>{teamRightName}</span>
              </div>
            </div>
          </div>

          {/* Bottom Timer */}
          <div
            className={`absolute flex justify-center items-center z-[5] bg-[#016C5C] shadow-[0_2px_5px_rgba(0,0,0,0.15)] ${isTimerRunning ? 'timer-running' : ''}`}
            style={{ left: '143px', top: '65px', width: '120px', height: '39px', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}
          >
            <span
              className="font-['Orbitron'] font-bold text-white tracking-[0.5px]"
              style={{ fontSize: '19px', textShadow: '0 0 10px rgba(255,255,255,0.2)' }}
            >
              {waktuPertandingan}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
