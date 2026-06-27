'use client'

import React, { useEffect, useState } from 'react'
import { getScale } from '../../_components/overlay-scale.config'

export default function ThirdTitleOverlay({ data }) {
  const { isShowing, eventType, playerName, playerImg, triggerId } = data.thirdTitle || {}
  const [renderState, setRenderState] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const [localData, setLocalData] = useState({ eventType, playerName, playerImg })

  useEffect(() => {
    let timeout1, timeout2, timeout3

    if (isShowing) {
      if (renderState) {
        setAnimateIn(false)
        timeout1 = setTimeout(() => {
          setLocalData({ eventType, playerName, playerImg })
          setAnimateIn(true)
        }, 400)
      } else {
        setLocalData({ eventType, playerName, playerImg })
        setRenderState(true)
        timeout2 = setTimeout(() => setAnimateIn(true), 50)
      }
    } else {
      setAnimateIn(false)
      timeout3 = setTimeout(() => setRenderState(false), 500)
    }

    return () => {
      clearTimeout(timeout1)
      clearTimeout(timeout2)
      clearTimeout(timeout3)
    }
  }, [isShowing, triggerId])

  if (!renderState) return null

  // Styling dinamis
  let eventText = 'GOAL'
  let offsetGradient = 'linear-gradient(135deg, #00b09b, #96c93d)'
  let eventColor = '#96c93d'

  if (localData.eventType === 'yellow_card') {
    eventText = 'YELLOW CARD'
    offsetGradient = 'linear-gradient(135deg, #ff0000 0%, #ffff00 100%)'
    eventColor = '#f8b500'
  } else if (localData.eventType === 'red_card') {
    eventText = 'RED CARD'
    offsetGradient = 'linear-gradient(135deg, #cb2d3e, #ef473a)'
    eventColor = '#ef473a'
  } else if (localData.eventType === 'mvp') {
    eventText = 'MOTM'
    offsetGradient = 'linear-gradient(135deg, #667eea, #764ba2)'
    eventColor = '#764ba2'
  }

  const imageUrl = localData.playerImg || '/images/default-player.png'
  const layoutType = data.layout || 'B'
  let customMarginTop = layoutType === 'Pildun2' ? '190px' : '260px'
  if (layoutType === 'Pildun') customMarginTop = '100px'

  const overlayScale = layoutType === 'Pildun2' ? getScale('PILDUN2', data.isPreview) * 1.1 : 1

  return (
    <div
      style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: customMarginTop,
        pointerEvents: 'none', zIndex: 50,
        fontFamily: '"Inter", "Outfit", system-ui, sans-serif',
      }}
    >
      <div style={{ transform: `scale(${overlayScale})`, display: 'flex', justifyContent: 'center' }}>

        {/* CSS KEYFRAMES UNTUK SHINE EFFECT */}
        <style>{`
          @keyframes shineSweep {
            0% { left: -100% }
            20% { left: 200% }
            100% { left: 200% }
          }
        `}</style>

        {/* WRAPPER LUAR (Efek Offset / Extend) */}
        <div
          style={{
            background: offsetGradient,
            borderRadius: '24px',
            padding: '0 0 14px 14px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            transform: animateIn ? 'translate3d(0, 0, 0)' : 'translate3d(0, 40px, 0)',
            opacity: animateIn ? 1 : 0,
            transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease',
            willChange: 'transform, opacity',
          }}
        >
          {/* KOTAK DALAM */}
          <div
            style={{
              backgroundColor: '#0a1024',
              borderRadius: '20px',
              display: 'flex', alignItems: 'center',
              padding: '20px 50px 20px 24px',
              gap: '30px',
              minWidth: '550px',
              position: 'relative',
              overflow: 'hidden', // Penting agar teks dan efek shine tidak bocor keluar
            }}
          >
            {/* EFEK SHINE / KILAP */}
            <div style={{
              position: 'absolute',
              top: 0, left: '-100%', width: '30%', height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              transform: 'skewX(-25deg)',
              animation: animateIn ? 'shineSweep 2.5s infinite 1s' : 'none',
              pointerEvents: 'none'
            }} />

            {/* FOTO PEMAIN (Atau Bendera) */}
            <div
              style={{
                width: '120px', height: '85px',
                borderRadius: '12px', overflow: 'hidden',
                backgroundColor: '#1a243d',
                border: '3px solid rgba(255,255,255,0.1)',
                position: 'relative', zIndex: 2
              }}
            >
              <img
                src={imageUrl} alt={localData.playerName}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center',
                  transform: animateIn ? 'scale(1)' : 'scale(1.2)',
                  transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s',
                }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
            </div>

            {/* EVENT INDICATOR DOT (Animasi Pop-in) */}
            <div
              style={{
                width: '20px', height: '20px', borderRadius: '50%',
                backgroundColor: eventColor,
                boxShadow: `0 0 15px ${eventColor}`,
                transform: animateIn ? 'scale(1)' : 'scale(0)',
                opacity: animateIn ? 1 : 0,
                transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s, opacity 0.3s ease 0.3s',
                position: 'relative', zIndex: 2
              }}
            />

            {/* INFORMASI TEKS */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2 }}>

              {/* ANIMASI LAYER EVENT TEKS ("GOAL" ala Pildun) */}
              <div style={{ position: 'relative', height: '28px', marginBottom: '2px' }}>
                {/* Layer 3 (Paling Belakang, Delay Terlama) */}
                <span style={{
                  position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap',
                  fontSize: '22px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase',
                  color: eventColor, opacity: animateIn ? 0.3 : 0,
                  transform: animateIn ? 'translateY(0)' : 'translateY(-20px)',
                  transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.5s, opacity 0.4s ease 0.5s'
                }}>
                  {eventText}
                </span>

                {/* Layer 2 (Tengah) */}
                <span style={{
                  position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap',
                  fontSize: '22px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase',
                  color: eventColor, opacity: animateIn ? 0.6 : 0,
                  transform: animateIn ? 'translateY(0)' : 'translateY(-20px)',
                  transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.4s, opacity 0.4s ease 0.4s'
                }}>
                  {eventText}
                </span>

                {/* Layer 1 (Paling Depan, Muncul Pertama) */}
                <span style={{
                  position: 'relative', whiteSpace: 'nowrap',
                  fontSize: '22px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase',
                  color: eventColor, opacity: animateIn ? 1 : 0,
                  transform: animateIn ? 'translateY(0)' : 'translateY(-20px)',
                  transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.3s, opacity 0.4s ease 0.3s',
                  display: 'inline-block'
                }}>
                  {eventText}
                </span>
              </div>

              {/* NAMA PEMAIN (Animasi Slide Up) */}
              <div style={{ overflow: 'hidden', padding: '5px 0' }}>
                <div style={{
                  fontSize: '48px', fontWeight: '900', color: '#ffffff',
                  textTransform: 'uppercase', letterSpacing: '2px', lineHeight: '1',
                  transform: animateIn ? 'translateY(0)' : 'translateY(100%)',
                  opacity: animateIn ? 1 : 0,
                  transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.4s, opacity 0.6s ease 0.4s'
                }}>
                  {localData.playerName || 'UNKNOWN PLAYER'}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}