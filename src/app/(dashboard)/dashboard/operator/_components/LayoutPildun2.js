'use client'

import { useEffect, useState, useRef } from 'react'

import { getScale } from './overlay-scale.config'

export default function LayoutPildun2({ data, displayTime, formatTime }) {
  const [renderState, setRenderState] = useState(data.showOverlay)
  const [animateIn, setAnimateIn] = useState(data.showOverlay)

  // -- STATE & REF UNTUK ANIMASI GOAL --
  const [goalEvent, setGoalEvent] = useState(null) // 'left' | 'right' | null
  const [hideTimer, setHideTimer] = useState(false)

  const isSwapped = !!data.switchSides

  const teamLeftName = (isSwapped ? data.awayName || 'AWAY' : data.homeName || 'HOME').toUpperCase()
  const teamLeftScore = isSwapped ? data.awayScore ?? 0 : data.homeScore ?? 0
  const teamLeftLogo = isSwapped ? data.awayLogo : data.homeLogo
  const teamLeftColor = isSwapped ? (data.awayColor || data.awayBg || '#06278D') : (data.homeColor || data.homeBg || '#06278D')

  const teamRightName = (isSwapped ? data.homeName || 'HOME' : data.awayName || 'AWAY').toUpperCase()
  const teamRightScore = isSwapped ? data.homeScore ?? 0 : data.awayScore ?? 0
  const teamRightLogo = isSwapped ? data.homeLogo : data.awayLogo
  const teamRightColor = isSwapped ? (data.homeColor || data.homeBg || '#06278D') : (data.awayColor || data.awayBg || '#06278D')

  const prevLeftScore = useRef(teamLeftScore)
  const prevRightScore = useRef(teamRightScore)
  const goalTimeouts = useRef([])

  // Effect untuk inisialisasi / unmount
  useEffect(() => {
    let timeout1, timeout2

    if (data.showOverlay) {
      setRenderState(true)
      timeout1 = setTimeout(() => setAnimateIn(true), 50)
    } else {
      setAnimateIn(false)
      timeout2 = setTimeout(() => setRenderState(false), 2000)
    }

    return () => {
      clearTimeout(timeout1)
      clearTimeout(timeout2)
    }
  }, [data.showOverlay])

  // Effect untuk mendeteksi Gol
  useEffect(() => {
    if (!animateIn) return

    const isLeftGoal = teamLeftScore > prevLeftScore.current
    const isRightGoal = teamRightScore > prevRightScore.current

    if (isLeftGoal || isRightGoal) {
      goalTimeouts.current.forEach(clearTimeout)
      goalTimeouts.current = []

      const side = isLeftGoal ? 'left' : 'right'

      setHideTimer(true)

      const t1 = setTimeout(() => setGoalEvent(side), 400)

      // Durasi event goal diperpanjang menjadi 5.5 detik agar animasi 3x loop yang lebih lambat bisa selesai
      const t2 = setTimeout(() => {
        setGoalEvent(null)
        const t3 = setTimeout(() => setHideTimer(false), 600)

        goalTimeouts.current.push(t3)
      }, 5500)

      goalTimeouts.current.push(t1, t2)
    }

    prevLeftScore.current = teamLeftScore
    prevRightScore.current = teamRightScore
  }, [teamLeftScore, teamRightScore, animateIn])

  if (!renderState) return null

  const waktuPertandingan = formatTime ? formatTime(displayTime) : '00:00'
  const overlayScale = getScale('PILDUN2', data.isPreview)

  const showTimerUI = animateIn && !hideTimer

  let logoTranslateX = '-50%'

  if (goalEvent === 'left') logoTranslateX = 'calc(-50% - 320px)'
  if (goalEvent === 'right') logoTranslateX = 'calc(-50% + 320px)'

  return (
    <div className='absolute inset-0 flex items-center justify-center pointer-events-none font-sans'>
      <style>{`
        .frame-svg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transform-origin: center;
          transform: scaleX(var(--start-scale)) scaleY(1) translate3d(0,0,0);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
          filter: drop-shadow(0 0 8px var(--glow-color));
          will-change: transform, opacity; 
          overflow: visible; 
          pointer-events: none;
        }
        .f1 { --start-scale: calc(1 - 3 * 0.01); --glow-color: rgba(255, 53, 3, 0.5); color: #FF3503; z-index: 4; animation-delay: 0.7s; transition-delay: 0.24s; }
        .f2 { --start-scale: calc(1 - 2 * 0.01); --glow-color: rgba(133, 179, 250, 0.5); color: #85B3FA; z-index: 3; animation-delay: 0.92s; transition-delay: 0.16s; }
        .f3 { --start-scale: calc(1 - 1 * 0.01); --glow-color: rgba(0, 194, 75, 0.5); color: #00C24B; z-index: 2; animation-delay: 1.14s; transition-delay: 0.08s; }
        .f4 { --start-scale: calc(1 - 0 * 0.01); --glow-color: rgba(90, 14, 19, 0.5); color: #5A0E13; z-index: 1; animation-delay: 1.36s; transition-delay: 0s; }
        
        .animate-close {
          animation-name: smoothClose;
          animation-duration: 0.6s;
          animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
          animation-fill-mode: forwards;
        }
        
        @keyframes smoothClose {
          0% { transform: scaleX(var(--start-scale)) scaleY(1) translate3d(0,0,0); opacity: 1; }
          100% { transform: scaleX(0) scaleY(1) translate3d(0,0,0); opacity: 0; }
        }

        /* -- ANIMASI GOAL DARI ATAS KE BAWAH (DIPERHALUS & DIPERPANJANG) -- */
        .goal-layer {
          animation: fadeLayerIn 0.4s ease forwards;
        }

        .goal-text-layer {
          position: absolute;
          font-size: 200px;
          font-weight: 900;
          letter-spacing: 0em;
          text-shadow: 2px 4px 0px rgba(0,0,0,0.15);
          transform: translateY(-150%);
          /* Durasi diperpanjang ke 1.5s per loop, bezier lebih smooth */
          animation: dropDownTrail 1.5s cubic-bezier(0.22, 1, 0.36, 1) 3 forwards;
        }

        @keyframes fadeLayerIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes dropDownTrail {
          0% { transform: translateY(-130%); }
          35% { transform: translateY(0); } /* Jatuh dengan mulus di 35% waktu (sekitar 0.5s) */
          100% { transform: translateY(0); } /* Diam sebentar menahan posisi sebelum loop lagi */
        }
      `}</style>

      <div
        style={{
          width: '1400px',
          height: '140px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transform: `scale(${overlayScale})`,
          opacity: animateIn ? 1 : 0,
          transition: animateIn ? 'opacity 0.4s ease' : 'opacity 0.4s ease 1.3s',
          position: 'relative',
          transformOrigin: 'center center',
        }}
      >
        {/* ── TIMER BLOCK ── */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '330px',
            height: '120px',
            background: '#ffffff',
            borderRadius: '28px 0 0 28px',
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
            zIndex: 5,
            transform: showTimerUI ? 'scaleX(1) scaleY(1) translate3d(0,0,0)' : 'scaleX(0) scaleY(1) translate3d(0,0,0)',
            transformOrigin: 'right center',
            transition: showTimerUI
              ? 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.5s'
              : 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1) 0s',
            willChange: 'transform',
          }}
        >
          <span style={{ color: '#000000', fontSize: '72px', fontWeight: 900, letterSpacing: '0.05em', lineHeight: 1, whiteSpace: 'nowrap' }}>
            {waktuPertandingan}
          </span>
        </div>

        {/* ── SVG FRAMES WRAPPER ── */}
        <div
          style={{
            position: 'absolute',
            left: '285px',
            right: '-15px',
            top: 0,
            bottom: '9px',
            zIndex: 3,
            transform: animateIn ? 'scaleX(1) scaleY(1) translate3d(0,0,0)' : 'scaleX(0) scaleY(1) translate3d(0,0,0)',
            transformOrigin: 'center center',
            transition: animateIn ? 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.3s' : 'transform 0s ease 2s',
            willChange: 'transform',
          }}
        >
          <svg className={`frame-svg f4${!animateIn ? ' animate-close' : ''}`} viewBox="0 0 1000 120" fill="currentColor" preserveAspectRatio="none"><path d="M 30 10 H 970 Q 1000 10 1000 40 Q 970 45 970 60 Q 970 75 1000 75 Q 1000 110 970 110 H 30 Q 0 110 0 90 Q 30 75 30 60 Q 30 45 0 45 Q 0 10 30 10 Z" /></svg>
          <svg className={`frame-svg f3${!animateIn ? ' animate-close' : ''}`} viewBox="0 0 1000 120" fill="currentColor" preserveAspectRatio="none"><path d="M 30 10 H 970 Q 1000 10 1000 40 Q 970 45 970 60 Q 970 75 1000 75 Q 1000 110 970 110 H 30 Q 0 110 0 90 Q 30 75 30 60 Q 30 45 0 45 Q 0 10 30 10 Z" /></svg>
          <svg className={`frame-svg f2${!animateIn ? ' animate-close' : ''}`} viewBox="0 0 1000 120" fill="currentColor" preserveAspectRatio="none"><path d="M 30 10 H 970 Q 1000 10 1000 40 Q 970 45 970 60 Q 970 75 1000 75 Q 1000 110 970 110 H 30 Q 0 110 0 90 Q 30 75 30 60 Q 30 45 0 45 Q 0 10 30 10 Z" /></svg>
          <svg className={`frame-svg f1${!animateIn ? ' animate-close' : ''}`} viewBox="0 0 1000 120" fill="currentColor" preserveAspectRatio="none"><path d="M 30 10 H 970 Q 1000 10 1000 40 Q 970 45 970 60 Q 970 75 1000 75 Q 1000 110 970 110 H 30 Q 0 110 0 90 Q 30 75 30 60 Q 30 45 0 45 Q 0 10 30 10 Z" /></svg>
        </div>

        {/* ── MAIN SCOREBOARD CONTENT WRAPPER ── */}
        <div
          style={{
            position: 'absolute',
            left: '300px',
            right: 0,
            top: 0,
            height: '120px',
            display: 'flex',
            alignItems: 'stretch',
            zIndex: 10,
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'stretch',
              overflow: 'visible',
              position: 'relative',
              zIndex: 10,
            }}
          >

            {/* ── GOAL OVERLAY ANIMATION ── */}
            {goalEvent && (
              <div
                className="goal-layer"
                style={{
                  position: 'absolute',

                  // Menarik div menembus batas kiri wrapper untuk nge-pass gradient
                  // Wrapper start di 300px, Gradient start di 285px -> butuh -15px
                  left: '-15px',
                  right: '-15px',
                  top: 0,
                  bottom: 0,
                  background: '#EAE1FF',
                  borderRadius: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 25,
                  overflow: 'hidden',
                  boxShadow: 'inset 0 0 12px rgba(255,255,255,0.8)'
                }}
              >
                {/* LAYER 3: Biru (Paling Belakang, Delay paling lama) */}
                <span className="goal-text-layer" style={{ color: '#0044FF', zIndex: 1, animationDelay: '400ms' }}>
                  GOAL
                </span>

                {/* LAYER 2: Merah (Tengah) */}
                <span className="goal-text-layer" style={{ color: '#FF0044', zIndex: 2, animationDelay: '250ms' }}>
                  GOAL
                </span>

                {/* LAYER 1: Putih (Paling Depan, Eksekusi pertama) */}
                <span className="goal-text-layer" style={{ color: '#FFFFFF', zIndex: 3, animationDelay: '100ms' }}>
                  GOAL
                </span>
              </div>
            )}

            {/* ── LEFT HALF ── */}
            <div
              style={{
                flex: 1,
                background: '#051B5E',
                borderRadius: '26px 0 0 26px',
                display: 'flex',
                alignItems: 'stretch',
                boxShadow: '-10px 0 20px rgba(0,0,0,0.3)',
                transform: animateIn ? 'scaleX(1) translate3d(0,0,0)' : 'scaleX(0) translate3d(0,0,0)',
                transformOrigin: 'right center',
                transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.3s, opacity 0.4s ease 0.3s',
                willChange: 'transform',
              }}
            >
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', overflow: 'hidden' }}>
                <div style={{ width: '90px', height: '60px', borderRadius: '6px', background: '#D9D9D9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                  {teamLeftLogo && <img src={teamLeftLogo} alt={teamLeftName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0, background: teamLeftColor, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} />
                <span style={{ color: '#ffffff', fontSize: '58px', fontWeight: 900, letterSpacing: '0.08em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {teamLeftName}
                </span>
              </div>
              <div style={{ width: '100px', borderRadius: '16px 0 0 16px', background: '#00FFD0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#000000', fontSize: '70px', fontWeight: 900 }}>{teamLeftScore}</span>
              </div>
            </div>

            {/* ── CENTER: FIFA Logo column ── */}
            <div
              style={{
                width: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                position: 'relative',
                zIndex: 30,
                overflow: 'visible',
                transform: animateIn ? 'scale(1) translate3d(0,0,0)' : 'scale(0) translate3d(0,0,0)',
                transformOrigin: 'center center',
                transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.3s, opacity 0.4s ease 0.3s',
                willChange: 'transform',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  bottom: '-28px',
                  left: '50%',
                  transform: `translateX(${logoTranslateX}) translate3d(0,0,0)`,
                  transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)', // Efek geser logo juga sedikit dilambatkan agar selaras
                  width: '128px',
                  height: '170px',
                  background: data.useCustomFifaLogo ? '#051B5E' : '#ffb901',
                  borderRadius: '40px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  willChange: 'transform',
                }}
              >
                <img
                  src={data.useCustomFifaLogo ? 'https://upload.wikimedia.org/wikipedia/id/thumb/1/17/2026_FIFA_World_Cup_emblem.svg/960px-2026_FIFA_World_Cup_emblem.svg.png' : '/logob2f.jpg'}
                  alt='Center Logo'
                  style={{
                    width: `${data.fifaLogoSize || 96}px`,
                    height: `${data.fifaLogoSize || 96}px`,
                    objectFit: 'contain',
                    ...(data.useCustomFifaLogo && { filter: 'brightness(0) invert(1)' }),
                  }}
                />
              </div>
            </div>

            {/* ── RIGHT HALF ── */}
            <div
              style={{
                flex: 1,
                background: '#051B5E',
                borderRadius: '0 26px 26px 0',
                display: 'flex',
                alignItems: 'stretch',
                boxShadow: '10px 0 20px rgba(0,0,0,0.3)',
                transform: animateIn ? 'scaleX(1) translate3d(0,0,0)' : 'scaleX(0) translate3d(0,0,0)',
                transformOrigin: 'left center',
                transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.3s, opacity 0.4s ease 0.3s',
                willChange: 'transform',
              }}
            >
              <div style={{ width: '100px', borderRadius: '0 16px 16px 0', background: '#00FFD0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#000000', fontSize: '70px', fontWeight: 900 }}>{teamRightScore}</span>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', overflow: 'hidden' }}>
                <span style={{ color: '#ffffff', fontSize: '58px', fontWeight: 900, letterSpacing: '0.08em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {teamRightName}
                </span>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0, background: teamRightColor, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} />
                <div style={{ width: '90px', height: '60px', borderRadius: '6px', background: '#D9D9D9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                  {teamRightLogo && <img src={teamRightLogo} alt={teamRightName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── FULL GRADIENT UNDERLAY ── */}
        <div
          style={{
            position: 'absolute',
            left: '285px',
            right: '-15px',
            top: '0',
            bottom: '9px',
            background: 'linear-gradient(to right, #FF0004 0%, #B7FF00 43.75%, #4400FF 100%)',
            borderRadius: '26px 26px 32px 32px',
            zIndex: 5,
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
            transform: animateIn ? 'scaleX(1) translate3d(0,0,0)' : 'scaleX(0) translate3d(0,0,0)',
            transformOrigin: 'center center',
            transition: animateIn ? 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.3s' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.3s',
            willChange: 'transform',
          }}
        />

      </div>
    </div>
  )
}