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
      timeout2 = setTimeout(() => setRenderState(false), 500)
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
      <div
        style={{
          width: '1400px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          /* 🚀 PERUBAHAN ANIMASI UTAMA:
            Saat OFF/Mulai: scaleX(0) akan membuat container menguncup ke tengah.
            Saat ON: scaleX(1) akan membuka lebar ke kiri dan ke kanan.
          */
          transform: animateIn
            ? `scaleX(1) translateY(0) scale(${overlayScale})`
            : `scaleX(0) translateY(-20px) scale(${overlayScale * 0.95})`,
          opacity: animateIn ? 1 : 0,
          // Efek cubic-bezier memberikan sedikit pantulan (bounce) yang smooth saat membuka
          transition: 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.4s ease',
          position: 'relative',
          transformOrigin: 'center center', // Memastikan poros pembukaannya tepat dari tengah-tengah logo FIFA
        }}
      >

        {/* ── 1. MAIN ROW CONTAINER (Timer, Red Strip, Navy Berdempetan Tanpa Sela) ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            width: '100%',
            height: '120px',
            position: 'relative',
            zIndex: 10,
          }}
        >

          {/* ── TIMER BLOCK ── */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '28px 0 0 28px',
              padding: '0 36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
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

          {/* ── MAIN NAVY SCOREBOARD CONTAINER ── */}
          <div
            style={{
              flex: 1,
              background: '#051B5E',
              borderRadius: '0 26px 26px 0',
              display: 'flex',
              alignItems: 'stretch',
              overflow: 'visible',
              position: 'relative',
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
                width: '120px',
                background: '#00FFD0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ color: '#000000', fontSize: '70px', fontWeight: 900 }}>
                {teamLeftScore}
              </span>
            </div>

            {/* ── CENTER: FIFA Logo column (overflows above) ── */}
            <div
              style={{
                width: '120px',
                background: '#051B5E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                position: 'relative',
                zIndex: 30,
                overflow: 'visible',
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

            {/* ── RIGHT SCORE (Cyan) ── */}
            <div
              style={{
                width: '120px',
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

        {/* ── 2. FULL GRADIENT UNDERLAY ── */}
        <div
          style={{
            position: 'absolute',
            left: '0',
            right: '0',
            bottom: '-12px',
            height: '42px',
            background: 'linear-gradient(to right, #FF0004 0%, #B7FF00 43.75%, #4400FF 100%)',
            borderRadius: '0 0 32px 32px',
            zIndex: 1,
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
          }}
        />

      </div>
    </div>
  )
}