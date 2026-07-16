'use client'

import { useEffect, useState, useRef } from 'react'
import { getScale } from './overlay-scale.config'
import AnimatedB2fLogo from '@/components/AnimatedB2fLogo'

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
        .f1 { --start-scale: calc(1 - 5 * 0.02); --glow-color: rgba(191, 0, 115, 0.5); color: #ffffff; z-index: 6; --open-delay: 1.00s; --close-delay: 0.70s; transition-delay: 0s; }
        .f2 { --start-scale: calc(1 - 4 * 0.02); --glow-color: rgba(0, 68, 255, 0.5); color: #0044ff; z-index: 5; --open-delay: 0.92s; --close-delay: 0.78s; transition-delay: 0s; }
        .f3 { --start-scale: calc(1 - 3 * 0.02); --glow-color: rgba(255, 0, 51, 0.5); color: #ff0033; z-index: 4; --open-delay: 0.84s; --close-delay: 0.86s; transition-delay: 0s; }
        .f4 { --start-scale: calc(1 - 2 * 0.02); --glow-color: rgba(0, 255, 102, 0.5); color: #00ff66; z-index: 3; --open-delay: 0.76s; --close-delay: 0.94s; transition-delay: 0s; }
        .f5 { --start-scale: calc(1 - 1 * 0.02); --glow-color: rgba(204, 255, 0, 0.5); color: #ccff00; z-index: 2; --open-delay: 0.68s; --close-delay: 1.02s; transition-delay: 0s; }
        .f6 { --start-scale: calc(1 - 0 * 0.02); --glow-color: rgba(0, 0, 0, 0.5); color: #000000; z-index: 1; --open-delay: 0.60s; --close-delay: 1.10s; transition-delay: 0s; }
        
        .animate-open {
          animation-name: smoothOpen;
          animation-duration: 0.6s;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
          animation-fill-mode: both;
          animation-delay: var(--open-delay);
        }
        
        @keyframes smoothOpen {
          0% { transform: scaleX(0) scaleY(1) translate3d(0,0,0); opacity: 0; }
          100% { transform: scaleX(var(--start-scale)) scaleY(1) translate3d(0,0,0); opacity: 1; }
        }

        .animate-close {
          animation-name: smoothClose;
          animation-duration: 0.6s;
          animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
          animation-fill-mode: both;
          animation-delay: var(--close-delay);
        }
        
        @keyframes smoothClose {
          0% { transform: scaleX(var(--start-scale)) scaleY(1) translate3d(0,0,0); opacity: 1; }
          100% { transform: scaleX(0) scaleY(1) translate3d(0,0,0); opacity: 0; }
        }

        @keyframes b2fSwitchZoom {
          0% { transform: scale(0.5); opacity: 0; animation-timing-function: ease; }
          25% { transform: scale(1.30); opacity: 1; animation-timing-function: ease; }
          60% { transform: scale(1.25); opacity: 1; animation-timing-function: ease; }
          90% { transform: scale(1.30); opacity: 1; animation-timing-function: ease; }
          100% { transform: scale(1); opacity: 1; animation-timing-function: ease; }
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

        /* -- 2D VECTOR TRAIL ANIMATION -- */
        .trail-scene {
            position: relative;
            width: 100%;
            height: 100%;
        }

        .trail-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }

        .trail-scene svg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: visible;
        }

        /* Base state for paths */
        .trail-scene svg path {
            opacity: 1; 
            transform: translateX(0px);
            clip-path: inset(0 -20% 0 -20%);
        }

        /* Disappear Animation */
        .trail-scene.anim-disappear svg path {
            animation: swooshLeft 1.2s cubic-bezier(0.85, 0, 0.15, 1) both;
            animation-delay: calc(var(--slice-delay) + var(--color-delay));
        }

        @keyframes swooshLeft {
            0% { 
                transform: translateX(0px); 
                clip-path: inset(0 -20% 0 -20%);
            }
            30% {
                transform: translateX(var(--target-x, 0px)); 
                clip-path: inset(0 -20% 0 -20%);
            }
            100% { 
                transform: translateX(var(--target-x, 0px)); 
                clip-path: inset(0 120% 0 -20%); 
            }
        }

        /* Appear Animation */
        .trail-scene.anim-appear svg path {
            animation: swooshRight 1.2s cubic-bezier(0.85, 0, 0.15, 1) both;
            /* Reverse the color delay so the back layer (black) appears first, ending with white on top */
            animation-delay: calc(var(--slice-delay) + (0.25s - var(--color-delay)));
        }

        @keyframes swooshRight {
            0% { 
                transform: translateX(var(--target-x, 0px)); 
                clip-path: inset(0 120% 0 -20%); 
            }
            70% {
                transform: translateX(var(--target-x, 0px)); 
                clip-path: inset(0 -20% 0 -20%);
            }
            100% { 
                transform: translateX(0px); 
                clip-path: inset(0 -20% 0 -20%);
            }
        }

        /* Slice Delays (Top to Bottom) */
        .trail-scene svg path:nth-child(1) { --slice-delay: 0s; }
        .trail-scene svg path:nth-child(2) { --slice-delay: 0.3s; }
        .trail-scene svg path:nth-child(3) { --slice-delay: 0.6s; }
        .trail-scene svg path:nth-child(5) { --slice-delay: 0.9s; } /* path 5 is mid-bottom visually */
        .trail-scene svg path:nth-child(4) { --slice-delay: 1.2s; } /* path 4 is bottom visually */

        /* Color Layers & Delays (Scaled down translations for smaller size) */
        .back-black path { fill: #000000; --color-delay: 0.25s; --target-x: 16px; }
        .back-yellow path { fill: #ccff00; --color-delay: 0.20s; --target-x: 13px; }
        .back-green path { fill: #00ff66; --color-delay: 0.15s; --target-x: 10px; }
        .back-red path { fill: #ff0033; --color-delay: 0.10s; --target-x: 7px; }
        .back-blue path { fill: #0044ff; --color-delay: 0.05s; --target-x: 3.5px; }
        .front path { fill: #ffffff; --color-delay: 0s; --target-x: 0px; }

        /* Fading Logo Overlay */
        .logo-fade-layer {
            opacity: 0;
            will-change: opacity;
        }
        .logo-fade-in {
            animation: fadeIn 0.4s ease forwards;
            animation-delay: 1.2s; /* Waits for the swooshes to mostly finish */
        }
        .logo-fade-out {
            animation: fadeOut 0.2s ease forwards;
            animation-delay: 0s; /* Hides instantly when disappearing, revealing the sweeping trails */
        }

        @keyframes fadeIn { to { opacity: 1; } }
        @keyframes fadeOut { to { opacity: 0; } }
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
            transition: animateIn ? 'transform 0s' : 'transform 0s ease 2s',
            willChange: 'transform',
          }}
        >
          <svg className={`frame-svg f6${animateIn ? ' animate-open' : ' animate-close'}`} viewBox="0 0 1000 120" fill="currentColor" preserveAspectRatio="none"><path d="M 30 10 H 970 Q 1000 10 1000 40 Q 970 45 970 60 Q 970 75 1000 75 Q 1000 110 970 110 H 30 Q 0 110 0 90 Q 30 75 30 60 Q 30 45 0 45 Q 0 10 30 10 Z" /></svg>
          <svg className={`frame-svg f5${animateIn ? ' animate-open' : ' animate-close'}`} viewBox="0 0 1000 120" fill="currentColor" preserveAspectRatio="none"><path d="M 30 10 H 970 Q 1000 10 1000 40 Q 970 45 970 60 Q 970 75 1000 75 Q 1000 110 970 110 H 30 Q 0 110 0 90 Q 30 75 30 60 Q 30 45 0 45 Q 0 10 30 10 Z" /></svg>
          <svg className={`frame-svg f4${animateIn ? ' animate-open' : ' animate-close'}`} viewBox="0 0 1000 120" fill="currentColor" preserveAspectRatio="none"><path d="M 30 10 H 970 Q 1000 10 1000 40 Q 970 45 970 60 Q 970 75 1000 75 Q 1000 110 970 110 H 30 Q 0 110 0 90 Q 30 75 30 60 Q 30 45 0 45 Q 0 10 30 10 Z" /></svg>
          <svg className={`frame-svg f3${animateIn ? ' animate-open' : ' animate-close'}`} viewBox="0 0 1000 120" fill="currentColor" preserveAspectRatio="none"><path d="M 30 10 H 970 Q 1000 10 1000 40 Q 970 45 970 60 Q 970 75 1000 75 Q 1000 110 970 110 H 30 Q 0 110 0 90 Q 30 75 30 60 Q 30 45 0 45 Q 0 10 30 10 Z" /></svg>
          <svg className={`frame-svg f2${animateIn ? ' animate-open' : ' animate-close'}`} viewBox="0 0 1000 120" fill="currentColor" preserveAspectRatio="none"><path d="M 30 10 H 970 Q 1000 10 1000 40 Q 970 45 970 60 Q 970 75 1000 75 Q 1000 110 970 110 H 30 Q 0 110 0 90 Q 30 75 30 60 Q 30 45 0 45 Q 0 10 30 10 Z" /></svg>
          <svg className={`frame-svg f1${animateIn ? ' animate-open' : ' animate-close'}`} viewBox="0 0 1000 120" fill="currentColor" preserveAspectRatio="none"><path d="M 30 10 H 970 Q 1000 10 1000 40 Q 970 45 970 60 Q 970 75 1000 75 Q 1000 110 970 110 H 30 Q 0 110 0 90 Q 30 75 30 60 Q 30 45 0 45 Q 0 10 30 10 Z" /></svg>
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
                opacity: animateIn ? 1 : 0,
                transformOrigin: 'center center',
                transition: animateIn
                  ? 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.3s, opacity 0.4s ease 0.3s'
                  : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 1.2s, opacity 0.4s ease 1.2s',
                willChange: 'transform, opacity',
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
                {/* 2D Vector Trail Animation OR B2F Image */}
                {data.useCustomFifaLogo ? (
                  <div
                    className={`trail-scene ${animateIn ? 'anim-appear' : 'anim-disappear'}`}
                    style={{
                      width: `${data.fifaLogoSize || 96}px`,
                      height: `${data.fifaLogoSize || 96}px`,
                    }}
                  >
                    {/* Black Layer (Backmost) */}
                    <div className="trail-layer back-black">
                      <svg viewBox="0 0 401 623">
                        <path d="M1 99.9345H91.2307H303.461L399.321 104.119C399.321 15.0403 312.059 0.0941371 312.059 0.0941371C312.059 0.0941371 101.322 -0.499329 85.8881 1.29392C70.4539 3.08718 41.96 11.4532 22.3704 38.3563C2.78086 65.2594 1 99.9345 1 99.9345Z" />
                        <path d="M92 99.9973C92 99.9973 41.9988 111.972 18.254 147.843C13.2309 155.431 7.85595 166.247 5.19408 179.529C-3.11658 229.15 1.03891 209.323 1.03891 209.323H49.5H178.5H242.5H312.097C312.097 209.323 399.5 193.872 399.5 104.793L345 99.9979C345 99.9979 296.434 98.2061 281 99.9994C265.566 101.793 228.5 99.9973 228.5 99.9973H178.5H92Z" />
                        <path d="M399.36 308.208V209.563H312.098C312.098 209.563 298 209.568 298 209.566C298 209.564 284.5 209.562 284.5 209.562L256 209.566L225.5 209.563L184 209.562L143.5 209.563H103.5H75L1.03906 209.562V308.208H399.36Z" />
                        <path d="M308.999 419.5H297.999L264.499 419.5L233 419C233 419 205.781 418.998 152 419C98.2184 419.002 125.719 419 89.4995 419H4.5C4.5 419 2.33005 527.596 6.48541 546.129C10.6408 564.661 8.26601 556.292 24.2941 582.597C40.3222 608.903 78.9072 621.457 90.7799 622.055C102.653 622.653 311.014 622.055 311.014 622.055C311.014 622.055 400.058 608.903 400.058 519.824C400.058 430.744 308.999 419.5 308.999 419.5Z" />
                        <path d="M312.41 419.775H400.266C400.266 419.775 400.266 391.676 383.644 358.196C367.022 324.716 311.222 320.532 311.222 320.532C311.222 320.532 92.769 319.335 87.4264 320.532C82.0838 321.729 63.0878 322.324 38.1557 345.042C13.2235 367.761 4.84717 396.524 4.84717 396.524L4.84917 419.775H64.7071C64.7071 419.775 137.834 419.177 149.707 419.775C161.58 420.373 238.707 419.775 238.707 419.775H277.207H312.41Z" />
                      </svg>
                    </div>

                    {/* Yellow Layer */}
                    <div className="trail-layer back-yellow">
                      <svg viewBox="0 0 401 623">
                        <path d="M1 99.9345H91.2307H303.461L399.321 104.119C399.321 15.0403 312.059 0.0941371 312.059 0.0941371C312.059 0.0941371 101.322 -0.499329 85.8881 1.29392C70.4539 3.08718 41.96 11.4532 22.3704 38.3563C2.78086 65.2594 1 99.9345 1 99.9345Z" />
                        <path d="M92 99.9973C92 99.9973 41.9988 111.972 18.254 147.843C13.2309 155.431 7.85595 166.247 5.19408 179.529C-3.11658 229.15 1.03891 209.323 1.03891 209.323H49.5H178.5H242.5H312.097C312.097 209.323 399.5 193.872 399.5 104.793L345 99.9979C345 99.9979 296.434 98.2061 281 99.9994C265.566 101.793 228.5 99.9973 228.5 99.9973H178.5H92Z" />
                        <path d="M399.36 308.208V209.563H312.098C312.098 209.563 298 209.568 298 209.566C298 209.564 284.5 209.562 284.5 209.562L256 209.566L225.5 209.563L184 209.562L143.5 209.563H103.5H75L1.03906 209.562V308.208H399.36Z" />
                        <path d="M308.999 419.5H297.999L264.499 419.5L233 419C233 419 205.781 418.998 152 419C98.2184 419.002 125.719 419 89.4995 419H4.5C4.5 419 2.33005 527.596 6.48541 546.129C10.6408 564.661 8.26601 556.292 24.2941 582.597C40.3222 608.903 78.9072 621.457 90.7799 622.055C102.653 622.653 311.014 622.055 311.014 622.055C311.014 622.055 400.058 608.903 400.058 519.824C400.058 430.744 308.999 419.5 308.999 419.5Z" />
                        <path d="M312.41 419.775H400.266C400.266 419.775 400.266 391.676 383.644 358.196C367.022 324.716 311.222 320.532 311.222 320.532C311.222 320.532 92.769 319.335 87.4264 320.532C82.0838 321.729 63.0878 322.324 38.1557 345.042C13.2235 367.761 4.84717 396.524 4.84717 396.524L4.84917 419.775H64.7071C64.7071 419.775 137.834 419.177 149.707 419.775C161.58 420.373 238.707 419.775 238.707 419.775H277.207H312.41Z" />
                      </svg>
                    </div>

                    {/* Green Layer */}
                    <div className="trail-layer back-green">
                      <svg viewBox="0 0 401 623">
                        <path d="M1 99.9345H91.2307H303.461L399.321 104.119C399.321 15.0403 312.059 0.0941371 312.059 0.0941371C312.059 0.0941371 101.322 -0.499329 85.8881 1.29392C70.4539 3.08718 41.96 11.4532 22.3704 38.3563C2.78086 65.2594 1 99.9345 1 99.9345Z" />
                        <path d="M92 99.9973C92 99.9973 41.9988 111.972 18.254 147.843C13.2309 155.431 7.85595 166.247 5.19408 179.529C-3.11658 229.15 1.03891 209.323 1.03891 209.323H49.5H178.5H242.5H312.097C312.097 209.323 399.5 193.872 399.5 104.793L345 99.9979C345 99.9979 296.434 98.2061 281 99.9994C265.566 101.793 228.5 99.9973 228.5 99.9973H178.5H92Z" />
                        <path d="M399.36 308.208V209.563H312.098C312.098 209.563 298 209.568 298 209.566C298 209.564 284.5 209.562 284.5 209.562L256 209.566L225.5 209.563L184 209.562L143.5 209.563H103.5H75L1.03906 209.562V308.208H399.36Z" />
                        <path d="M308.999 419.5H297.999L264.499 419.5L233 419C233 419 205.781 418.998 152 419C98.2184 419.002 125.719 419 89.4995 419H4.5C4.5 419 2.33005 527.596 6.48541 546.129C10.6408 564.661 8.26601 556.292 24.2941 582.597C40.3222 608.903 78.9072 621.457 90.7799 622.055C102.653 622.653 311.014 622.055 311.014 622.055C311.014 622.055 400.058 608.903 400.058 519.824C400.058 430.744 308.999 419.5 308.999 419.5Z" />
                        <path d="M312.41 419.775H400.266C400.266 419.775 400.266 391.676 383.644 358.196C367.022 324.716 311.222 320.532 311.222 320.532C311.222 320.532 92.769 319.335 87.4264 320.532C82.0838 321.729 63.0878 322.324 38.1557 345.042C13.2235 367.761 4.84717 396.524 4.84717 396.524L4.84917 419.775H64.7071C64.7071 419.775 137.834 419.177 149.707 419.775C161.58 420.373 238.707 419.775 238.707 419.775H277.207H312.41Z" />
                      </svg>
                    </div>

                    {/* Red Layer */}
                    <div className="trail-layer back-red">
                      <svg viewBox="0 0 401 623">
                        <path d="M1 99.9345H91.2307H303.461L399.321 104.119C399.321 15.0403 312.059 0.0941371 312.059 0.0941371C312.059 0.0941371 101.322 -0.499329 85.8881 1.29392C70.4539 3.08718 41.96 11.4532 22.3704 38.3563C2.78086 65.2594 1 99.9345 1 99.9345Z" />
                        <path d="M92 99.9973C92 99.9973 41.9988 111.972 18.254 147.843C13.2309 155.431 7.85595 166.247 5.19408 179.529C-3.11658 229.15 1.03891 209.323 1.03891 209.323H49.5H178.5H242.5H312.097C312.097 209.323 399.5 193.872 399.5 104.793L345 99.9979C345 99.9979 296.434 98.2061 281 99.9994C265.566 101.793 228.5 99.9973 228.5 99.9973H178.5H92Z" />
                        <path d="M399.36 308.208V209.563H312.098C312.098 209.563 298 209.568 298 209.566C298 209.564 284.5 209.562 284.5 209.562L256 209.566L225.5 209.563L184 209.562L143.5 209.563H103.5H75L1.03906 209.562V308.208H399.36Z" />
                        <path d="M308.999 419.5H297.999L264.499 419.5L233 419C233 419 205.781 418.998 152 419C98.2184 419.002 125.719 419 89.4995 419H4.5C4.5 419 2.33005 527.596 6.48541 546.129C10.6408 564.661 8.26601 556.292 24.2941 582.597C40.3222 608.903 78.9072 621.457 90.7799 622.055C102.653 622.653 311.014 622.055 311.014 622.055C311.014 622.055 400.058 608.903 400.058 519.824C400.058 430.744 308.999 419.5 308.999 419.5Z" />
                        <path d="M312.41 419.775H400.266C400.266 419.775 400.266 391.676 383.644 358.196C367.022 324.716 311.222 320.532 311.222 320.532C311.222 320.532 92.769 319.335 87.4264 320.532C82.0838 321.729 63.0878 322.324 38.1557 345.042C13.2235 367.761 4.84717 396.524 4.84717 396.524L4.84917 419.775H64.7071C64.7071 419.775 137.834 419.177 149.707 419.775C161.58 420.373 238.707 419.775 238.707 419.775H277.207H312.41Z" />
                      </svg>
                    </div>

                    {/* Blue Layer */}
                    <div className="trail-layer back-blue">
                      <svg viewBox="0 0 401 623">
                        <path d="M1 99.9345H91.2307H303.461L399.321 104.119C399.321 15.0403 312.059 0.0941371 312.059 0.0941371C312.059 0.0941371 101.322 -0.499329 85.8881 1.29392C70.4539 3.08718 41.96 11.4532 22.3704 38.3563C2.78086 65.2594 1 99.9345 1 99.9345Z" />
                        <path d="M92 99.9973C92 99.9973 41.9988 111.972 18.254 147.843C13.2309 155.431 7.85595 166.247 5.19408 179.529C-3.11658 229.15 1.03891 209.323 1.03891 209.323H49.5H178.5H242.5H312.097C312.097 209.323 399.5 193.872 399.5 104.793L345 99.9979C345 99.9979 296.434 98.2061 281 99.9994C265.566 101.793 228.5 99.9973 228.5 99.9973H178.5H92Z" />
                        <path d="M399.36 308.208V209.563H312.098C312.098 209.563 298 209.568 298 209.566C298 209.564 284.5 209.562 284.5 209.562L256 209.566L225.5 209.563L184 209.562L143.5 209.563H103.5H75L1.03906 209.562V308.208H399.36Z" />
                        <path d="M308.999 419.5H297.999L264.499 419.5L233 419C233 419 205.781 418.998 152 419C98.2184 419.002 125.719 419 89.4995 419H4.5C4.5 419 2.33005 527.596 6.48541 546.129C10.6408 564.661 8.26601 556.292 24.2941 582.597C40.3222 608.903 78.9072 621.457 90.7799 622.055C102.653 622.653 311.014 622.055 311.014 622.055C311.014 622.055 400.058 608.903 400.058 519.824C400.058 430.744 308.999 419.5 308.999 419.5Z" />
                        <path d="M312.41 419.775H400.266C400.266 419.775 400.266 391.676 383.644 358.196C367.022 324.716 311.222 320.532 311.222 320.532C311.222 320.532 92.769 319.335 87.4264 320.532C82.0838 321.729 63.0878 322.324 38.1557 345.042C13.2235 367.761 4.84717 396.524 4.84717 396.524L4.84917 419.775H64.7071C64.7071 419.775 137.834 419.177 149.707 419.775C161.58 420.373 238.707 419.775 238.707 419.775H277.207H312.41Z" />
                      </svg>
                    </div>

                    {/* Front Shape Layer (Topmost trail) */}
                    <div className="trail-layer front">
                      <svg viewBox="0 0 401 623">
                        <path d="M1 99.9345H91.2307H303.461L399.321 104.119C399.321 15.0403 312.059 0.0941371 312.059 0.0941371C312.059 0.0941371 101.322 -0.499329 85.8881 1.29392C70.4539 3.08718 41.96 11.4532 22.3704 38.3563C2.78086 65.2594 1 99.9345 1 99.9345Z" />
                        <path d="M92 99.9973C92 99.9973 41.9988 111.972 18.254 147.843C13.2309 155.431 7.85595 166.247 5.19408 179.529C-3.11658 229.15 1.03891 209.323 1.03891 209.323H49.5H178.5H242.5H312.097C312.097 209.323 399.5 193.872 399.5 104.793L345 99.9979C345 99.9979 296.434 98.2061 281 99.9994C265.566 101.793 228.5 99.9973 228.5 99.9973H178.5H92Z" />
                        <path d="M399.36 308.208V209.563H312.098C312.098 209.563 298 209.568 298 209.566C298 209.564 284.5 209.562 284.5 209.562L256 209.566L225.5 209.563L184 209.562L143.5 209.563H103.5H75L1.03906 209.562V308.208H399.36Z" />
                        <path d="M308.999 419.5H297.999L264.499 419.5L233 419C233 419 205.781 418.998 152 419C98.2184 419.002 125.719 419 89.4995 419H4.5C4.5 419 2.33005 527.596 6.48541 546.129C10.6408 564.661 8.26601 556.292 24.2941 582.597C40.3222 608.903 78.9072 621.457 90.7799 622.055C102.653 622.653 311.014 622.055 311.014 622.055C311.014 622.055 400.058 608.903 400.058 519.824C400.058 430.744 308.999 419.5 308.999 419.5Z" />
                        <path d="M312.41 419.775H400.266C400.266 419.775 400.266 391.676 383.644 358.196C367.022 324.716 311.222 320.532 311.222 320.532C311.222 320.532 92.769 319.335 87.4264 320.532C82.0838 321.729 63.0878 322.324 38.1557 345.042C13.2235 367.761 4.84717 396.524 4.84717 396.524L4.84917 419.775H64.7071C64.7071 419.775 137.834 419.177 149.707 419.775C161.58 420.373 238.707 419.775 238.707 419.775H277.207H312.41Z" />
                      </svg>
                    </div>

                    {/* FIFA Logo (Fades in over the front shape) */}
                    <div
                      className={`logo-fade-layer ${animateIn ? 'logo-fade-in' : 'logo-fade-out'}`}
                      style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <img
                        src='https://upload.wikimedia.org/wikipedia/id/thumb/1/17/2026_FIFA_World_Cup_emblem.svg/960px-2026_FIFA_World_Cup_emblem.svg.png'
                        alt='FIFA Logo'
                        style={{
                          width: `${data.fifaLogoSize || 96}px`,
                          height: `${data.fifaLogoSize || 96}px`,
                          objectFit: 'contain',
                          filter: 'brightness(0) invert(1)',
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      width: `${data.fifaLogoSize || 96}px`,
                      height: `${data.fifaLogoSize || 96}px`,
                      transform: animateIn ? 'scale(1)' : 'scale(0.5)',
                      opacity: animateIn ? 1 : 0,
                      animation: animateIn ? 'b2fSwitchZoom 0.6s ease 0.45s both' : 'none',
                      transition: animateIn
                        ? 'none'
                        : 'transform 0.4s ease-in 0.9s, opacity 0.3s ease 0.9s',
                      willChange: 'transform, opacity',
                    }}
                  >
                    <AnimatedB2fLogo triggerId={data.introId} />
                  </div>
                )}
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