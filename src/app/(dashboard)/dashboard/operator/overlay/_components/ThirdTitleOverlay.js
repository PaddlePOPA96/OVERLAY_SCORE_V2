'use client'

import React, { useEffect, useState } from 'react'
import { getScale } from '@/features/match-simulation/components/operator/overlay-scale.config'

export default function ThirdTitleOverlay({ data }) {
  const { isShowing, eventType, playerName, playerImg, triggerId } = data.thirdTitle || {}
  const [renderState, setRenderState] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const [localData, setLocalData] = useState({ eventType, playerName, playerImg })

  // Manage mount/unmount and animation states smoothly
  useEffect(() => {
    let timeout1, timeout2, timeout3

    if (isShowing) {
      if (renderState) {
        // It's already showing, but user triggered an update!
        // We should animate out, update local data, and animate back in
        setAnimateIn(false)
        timeout1 = setTimeout(() => {
          setLocalData({ eventType, playerName, playerImg })
          setAnimateIn(true)
        }, 400)
      } else {
        // First time showing
        setLocalData({ eventType, playerName, playerImg })
        setRenderState(true)
        timeout2 = setTimeout(() => setAnimateIn(true), 50)
      }
    } else {
      // Hiding
      setAnimateIn(false)
      timeout3 = setTimeout(() => setRenderState(false), 500)
    }

    return () => {
      clearTimeout(timeout1)
      clearTimeout(timeout2)
      clearTimeout(timeout3)
    }
  }, [isShowing, triggerId]) // Listen to triggerId to re-run animation on update

  if (!renderState) return null

  // Styling dynamically based on eventType
  let eventIcon = '⚽'
  let eventText = 'GOAL'
  let bgGradient = 'linear-gradient(90deg, #065f46 0%, #10b981 100%)' // Emerald/Green for Goal
  let iconColor = '#10b981'
  let eventTextColor = '#ecfdf5'

  if (localData.eventType === 'yellow_card') {
    eventIcon = '🟨'
    eventText = 'YELLOW CARD'
    bgGradient = 'linear-gradient(90deg, #854d0e 0%, #eab308 100%)' // Yellow
    iconColor = '#eab308'
    eventTextColor = '#fefce8'
  } else if (localData.eventType === 'red_card') {
    eventIcon = '🟥'
    eventText = 'RED CARD'
    bgGradient = 'linear-gradient(90deg, #7f1d1d 0%, #ef4444 100%)' // Red
    iconColor = '#ef4444'
    eventTextColor = '#fef2f2'
  }

  // Fallback image handling
  const imageUrl = localData.playerImg || '/images/default-player.png'

  // Dynamic position adjustment based on layout
  const layoutType = data.layout || 'B'
  let customMarginTop = '260px' // Move down significantly for A, B, C, D, E
  if (layoutType === 'Pildun') {
    customMarginTop = '-40px' // Move up slightly for Pildun
  } else if (layoutType === 'Pildun2') {
    customMarginTop = '280px' // adjust for Pildun 2 position
  }

  const overlayScale = layoutType === 'Pildun2' ? getScale('PILDUN2', data.isPreview) * 1.35 : 1

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center', // Center vertically
        justifyContent: 'center',
        marginTop: customMarginTop, // Dynamic margin
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          height: layoutType === 'Pildun2' ? '120px' : '100px',
          width: 'auto',
          justifyContent: 'center',
          background: 'rgba(15, 23, 42, 0.95)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          transform: animateIn ? `translateY(0) scale(${overlayScale})` : `translateY(-20px) scale(${overlayScale * 0.95})`,
          opacity: animateIn ? 1 : 0,
          transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease',
        }}
      >
        {/* EVENT ICON SECTION */}
        <div
          style={{
            background: bgGradient,
            minWidth: '110px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 20px',
            borderTopLeftRadius: '16px',
            borderBottomLeftRadius: '16px',
            boxShadow: 'inset -5px 0 15px rgba(0,0,0,0.2)',
          }}
        >
          <span style={{ fontSize: layoutType === 'Pildun2' ? '50px' : '40px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
            {eventIcon}
          </span>
          <span style={{ fontSize: layoutType === 'Pildun2' ? '18px' : '14px', fontWeight: '800', letterSpacing: '1px', color: eventTextColor, marginTop: '4px', textAlign: 'center' }}>
            {eventText}
          </span>
        </div>

        {/* PLAYER INFO SECTION */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 45px 0 30px',
            gap: '30px',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: layoutType === 'Pildun2' ? '54px' : '36px', fontWeight: '800', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {localData.playerName || 'UNKNOWN PLAYER'}
            </span>
          </div>
          
          {/* PLAYER PHOTO */}
          <div
            style={{
              width: layoutType === 'Pildun2' ? '160px' : '140px',
              height: layoutType === 'Pildun2' ? '180px' : '160px',
              position: 'relative',
              marginTop: layoutType === 'Pildun2' ? '-60px' : '-60px',
              zIndex: 2,
              filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))',
            }}
          >
            <img
              src={imageUrl}
              alt={localData.playerName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'bottom',
              }}
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
