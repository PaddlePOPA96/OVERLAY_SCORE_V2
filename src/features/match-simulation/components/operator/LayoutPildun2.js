'use client'

import { useEffect, useState } from 'react'

import { getScale } from './overlay-scale.config'

export default function LayoutPildun2({ data, displayTime, formatTime }) {
  const [renderState, setRenderState] = useState(data.showOverlay)
  const [animateIn, setAnimateIn] = useState(data.showOverlay)

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

  if (!renderState) return null

  const isSwapped = !!data.switchSides

  const teamLeftName = (isSwapped ? data.awayName || 'AWAY' : data.homeName || 'HOME').toUpperCase()
  const teamLeftScore = isSwapped ? data.awayScore ?? 0 : data.homeScore ?? 0
  const teamLeftLogo = isSwapped ? data.awayLogo : data.homeLogo
  const teamLeftColor = isSwapped ? (data.awayColor || data.awayBg || '#06278D') : (data.homeColor || data.homeBg || '#06278D')

  const teamRightName = (isSwapped ? data.homeName || 'HOME' : data.awayName || 'AWAY').toUpperCase()
  const teamRightScore = isSwapped ? data.homeScore ?? 0 : data.awayScore ?? 0
  const teamRightLogo = isSwapped ? data.homeLogo : data.awayLogo
  const teamRightColor = isSwapped ? (data.homeColor || data.homeBg || '#06278D') : (data.awayColor || data.awayBg || '#06278D')

  const waktuPertandingan = formatTime ? formatTime(displayTime) : '00:00'
  const overlayScale = getScale('PILDUN2', data.isPreview)

  return (
    <div
      className='absolute inset-0 flex items-center justify-center pointer-events-none font-sans'
    >
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
        .f1 { 
          --start-scale: calc(1 - 3 * 0.01); 
          --glow-color: rgba(255, 53, 3, 0.5); 
          color: #FF3503; 
          z-index: 4; 
          animation-delay: 0.7s;
          transition-delay: 0.24s;
        }
        .f2 { 
          --start-scale: calc(1 - 2 * 0.01); 
          --glow-color: rgba(133, 179, 250, 0.5); 
          color: #85B3FA; 
          z-index: 3; 
          animation-delay: 0.92s;
          transition-delay: 0.16s;
        }
        .f3 { 
          --start-scale: calc(1 - 1 * 0.01); 
          --glow-color: rgba(0, 194, 75, 0.5); 
          color: #00C24B; 
          z-index: 2; 
          animation-delay: 1.14s;
          transition-delay: 0.08s;
        }
        .f4 { 
          --start-scale: calc(1 - 0 * 0.01); 
          --glow-color: rgba(90, 14, 19, 0.5); 
          color: #5A0E13; 
          z-index: 1; 
          animation-delay: 1.36s;
          transition-delay: 0s;
        }
        .animate-close {
          animation-name: smoothClose;
          animation-duration: 0.6s;
          animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
          animation-fill-mode: forwards;
        }
        @keyframes smoothClose {
          0% {
            transform: scaleX(var(--start-scale)) scaleY(1) translate3d(0,0,0);
            opacity: 1;
          }
          100% {
            transform: scaleX(0) scaleY(1) translate3d(0,0,0);
            opacity: 0;
          }
        }
      `}</style>
      <div
        style={{
          width: '1400px',
          height: '140px', // defined height to hold absolute children
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
        {/* ── TIMER BLOCK (Separated Absolute Container) ── */}
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
            transform: animateIn ? 'scaleX(1) scaleY(1)' : 'scaleX(0) scaleY(1)',
            transformOrigin: 'right center',
            transition: animateIn
              ? 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.7s'
              : 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1) 0s',
          }}
        >
          <span
            style={{
              color: '#000000',
              fontSize: '72px',
              fontWeight: 900,
              letterSpacing: '0.05em',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {waktuPertandingan}
          </span>
        </div>

        {/* ── SVG FRAMES WRAPPER (Animated Background layers) ── */}
        <div
          style={{
            position: 'absolute',
            left: '285px',
            right: '-15px',
            top: 0,
            bottom: '9px',
            zIndex: 3,
            transform: animateIn ? 'scaleX(1) scaleY(1)' : 'scaleX(0) scaleY(1)',
            transformOrigin: 'center center',
            transition: animateIn
              ? 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.3s'
              : 'transform 0s ease 2s', // keep wrapper open during exit animations, unmount takes care of final removal
          }}
        >
          {/* LAPISAN 4 (Hitam - 100% Lebar) */}
          <svg className={`frame-svg f4${!animateIn ? ' animate-close' : ''}`} viewBox="0 0 1000 120" fill="currentColor" preserveAspectRatio="none">
            <path d="M 30 10 H 970 Q 1000 10 1000 40 Q 970 45 970 60 Q 970 75 1000 75 Q 1000 110 970 110 H 30 Q 0 110 0 90 Q 30 75 30 60 Q 30 45 0 45 Q 0 10 30 10 Z" />
          </svg>

          {/* LAPISAN 3 (Hijau Toska - 99% Lebar) */}
          <svg className={`frame-svg f3${!animateIn ? ' animate-close' : ''}`} viewBox="0 0 1000 120" fill="currentColor" preserveAspectRatio="none">
            <path d="M 30 10 H 970 Q 1000 10 1000 40 Q 970 45 970 60 Q 970 75 1000 75 Q 1000 110 970 110 H 30 Q 0 110 0 90 Q 30 75 30 60 Q 30 45 0 45 Q 0 10 30 10 Z" />
          </svg>

          {/* LAPISAN 2 (Biru - 98% Lebar) */}
          <svg className={`frame-svg f2${!animateIn ? ' animate-close' : ''}`} viewBox="0 0 1000 120" fill="currentColor" preserveAspectRatio="none">
            <path d="M 30 10 H 970 Q 1000 10 1000 40 Q 970 45 970 60 Q 970 75 1000 75 Q 1000 110 970 110 H 30 Q 0 110 0 90 Q 30 75 30 60 Q 30 45 0 45 Q 0 10 30 10 Z" />
          </svg>

          {/* LAPISAN 1 (Merah - 97% Lebar) */}
          <svg className={`frame-svg f1${!animateIn ? ' animate-close' : ''}`} viewBox="0 0 1000 120" fill="currentColor" preserveAspectRatio="none">
            <path d="M 30 10 H 970 Q 1000 10 1000 40 Q 970 45 970 60 Q 970 75 1000 75 Q 1000 110 970 110 H 30 Q 0 110 0 90 Q 30 75 30 60 Q 30 45 0 45 Q 0 10 30 10 Z" />
          </svg>
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
          {/* ── MAIN NAVY SCOREBOARD CONTAINER ── */}
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
            {/* ── LEFT HALF (Left Team Section + Left Score) ── */}
            <div
              style={{
                flex: 1,
                background: '#051B5E',
                borderRadius: '26px 0 0 26px',
                display: 'flex',
                alignItems: 'stretch',
                boxShadow: '-10px 0 20px rgba(0,0,0,0.3)',
                transform: animateIn ? 'scaleX(1)' : 'scaleX(0)',
                transformOrigin: 'right center',
                transition: animateIn
                  ? 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.3s, opacity 0.4s ease 0.3s'
                  : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.3s, opacity 0.4s ease 0.3s',
              }}
            >
              {/* ── LEFT TEAM SECTION ── */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  paddingLeft: '20px',
                  gap: '16px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '68px',
                    height: '44px',
                    borderRadius: '6px',
                    flexShrink: 0,
                    background: teamLeftColor,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                />
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: '#D9D9D9',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {teamLeftLogo && (
                    <img
                      src={teamLeftLogo}
                      alt={teamLeftName}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                    />
                  )}
                </div>
                <span
                  style={{
                    color: '#ffffff',
                    fontSize: '58px',
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {teamLeftName}
                </span>
              </div>

              {/* ── LEFT SCORE (Cyan) ── */}
              <div
                style={{
                  width: '100px',
                  background: '#00FFD0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '16px 0 0 16px',
                  flexShrink: 0,
                }}
              >
                <span style={{ color: '#000000', fontSize: '70px', fontWeight: 900 }}>
                  {teamLeftScore}
                </span>
              </div>
            </div>

            {/* ── CENTER: FIFA Logo column (overflows above) ── */}
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
                transform: animateIn ? 'scale(1)' : 'scale(0)',
                transformOrigin: 'center center',
                transition: animateIn
                  ? 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.3s, opacity 0.4s ease 0.3s'
                  : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.3s, opacity 0.4s ease 0.3s',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  bottom: '-28px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '128px',
                  height: '170px',
                  background: '#051B5E',
                  borderRadius: '40px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <img
                  src='https://upload.wikimedia.org/wikipedia/id/thumb/1/17/2026_FIFA_World_Cup_emblem.svg/960px-2026_FIFA_World_Cup_emblem.svg.png'
                  alt='FIFA World Cup 2026'
                  style={{
                    height: '96px',
                    objectFit: 'contain',
                    filter: 'brightness(0) invert(1)',
                  }}
                />
                <span
                  style={{
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '14px',
                    letterSpacing: '0.2em',
                  }}
                >
                  FIFA
                </span>
              </div>
            </div>

            {/* ── RIGHT HALF (Right Score + Right Team Section) ── */}
            <div
              style={{
                flex: 1,
                background: '#051B5E',
                borderRadius: '0 26px 26px 0',
                display: 'flex',
                alignItems: 'stretch',
                boxShadow: '10px 0 20px rgba(0,0,0,0.3)',
                transform: animateIn ? 'scaleX(1)' : 'scaleX(0)',
                transformOrigin: 'left center',
                transition: animateIn
                  ? 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.3s, opacity 0.4s ease 0.3s'
                  : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.3s, opacity 0.4s ease 0.3s',
              }}
            >
              {/* ── RIGHT SCORE (Cyan) ── */}
              <div
                style={{
                  width: '100px',
                  borderRadius: '0 16px 16px 0',
                  background: '#00FFD0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ color: '#000000', fontSize: '70px', fontWeight: 900 }}>
                  {teamRightScore}
                </span>
              </div>

              {/* ── RIGHT TEAM SECTION ── */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '20px',
                  gap: '16px',
                  overflow: 'hidden',
                }}
              >
                <span
                  style={{
                    color: '#ffffff',
                    fontSize: '58px',
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {teamRightName}
                </span>
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: '#D9D9D9',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {teamRightLogo && (
                    <img
                      src={teamRightLogo}
                      alt={teamRightName}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                    />
                  )}
                </div>
                <div
                  style={{
                    width: '68px',
                    height: '44px',
                    borderRadius: '6px',
                    flexShrink: 0,
                    background: teamRightColor,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* ── 2. FULL GRADIENT UNDERLAY ── */}
        <div
          style={{
            position: 'absolute',
            left: '285px', // shifted right to align with shifted scoreboard wrapper
            right: '-15px',
            top: '0',
            bottom: '9px',
            background: 'linear-gradient(to right, #FF0004 0%, #B7FF00 43.75%, #4400FF 100%)',
            borderRadius: '26px 26px 32px 32px',
            zIndex: 5,
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
            transform: animateIn ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'center center',
            transition: animateIn
              ? 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.3s'
              : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.3s',
          }}
        />

      </div>
    </div>
  )
}