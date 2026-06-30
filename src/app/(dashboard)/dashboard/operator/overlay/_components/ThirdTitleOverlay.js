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
        }, 500)
      } else {
        setLocalData({ eventType, playerName, playerImg })
        setRenderState(true)
        timeout2 = setTimeout(() => setAnimateIn(true), 50)
      }
    } else {
      setAnimateIn(false)
      timeout3 = setTimeout(() => setRenderState(false), 600)
    }

    return () => {
      clearTimeout(timeout1)
      clearTimeout(timeout2)
      clearTimeout(timeout3)
    }
  }, [isShowing, triggerId, renderState])

  if (!renderState) return null

  // Event icons mapping
  const eventIcons = {
    goal: { icon: '⚽', color: '#2ecc71' },
    yellow_card: { icon: '🟨', color: '#f39c12' },
    red_card: { icon: '🟥', color: '#e74c3c' },
    mvp: { icon: '⭐', color: '#f1c40f' }
  }

  const iconData = eventIcons[localData.eventType] || eventIcons.goal
  const imageUrl = localData.playerImg || '/images/default-player.png'
  const displayName = localData.playerName || 'UNKNOWN'

  const layoutType = data.layout || 'B'
  let customMarginTop = layoutType === 'Pildun2' ? '190px' : '260px'

  if (layoutType === 'Pildun') customMarginTop = '100px'

  const overlayScale = (layoutType === 'Pildun2' ? getScale('PILDUN2', data.isPreview) * 1.1 : 1) * 1.3

  const pipaLogoSvg = (color, withImage = false, imgUrl = '') => {
    const clipId = 'logoShape-clip'


    return (
      <svg viewBox="0 0 401 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
        {withImage && (
          <defs>
            <clipPath id={clipId}>
              <path d="M86.9853 1.29419C102.407 -0.497503 312.79 0.0929655 313.155 0.0939914C313.155 0.0939914 400.418 15.0406 400.418 104.119C400.418 184.809 328.819 199.275 315.332 201.284C315.878 201.373 316.446 201.466 317.034 201.569H400.418V300.213L396.049 298.969C396.056 299.291 396.059 299.457 396.059 299.457H308.202C308.364 299.474 396.059 308.507 396.059 397.504C396.058 486.506 307.169 499.713 307.015 499.736C307.015 499.736 98.6529 500.334 86.7802 499.736C74.9075 499.137 36.323 486.583 20.2948 460.278C4.26681 433.972 6.64153 442.341 2.48624 423.809C-1.66912 405.276 0.639563 276.206 0.639563 276.206C0.666723 276.113 9.05645 247.406 33.9482 224.725C45.9625 213.777 56.5982 207.967 64.9921 204.751L63.9823 204.464H2.09757C2.08238 204.537 -2.04351 224.199 6.25187 174.669C8.91376 161.388 14.2894 150.572 19.3124 142.984C43.0573 107.113 92.328 99.9348 92.328 99.9348H2.09757C2.09994 99.8888 3.89115 65.2419 23.4677 38.3567C43.0572 11.4536 71.5511 3.08744 86.9853 1.29419Z" />
            </clipPath>
          </defs>
        )}
        <path d="M86.9853 1.29419C102.407 -0.497503 312.79 0.0929655 313.155 0.0939914C313.155 0.0939914 400.418 15.0406 400.418 104.119C400.418 184.809 328.819 199.275 315.332 201.284C315.878 201.373 316.446 201.466 317.034 201.569H400.418V300.213L396.049 298.969C396.056 299.291 396.059 299.457 396.059 299.457H308.202C308.364 299.474 396.059 308.507 396.059 397.504C396.058 486.506 307.169 499.713 307.015 499.736C307.015 499.736 98.6529 500.334 86.7802 499.736C74.9075 499.137 36.323 486.583 20.2948 460.278C4.26681 433.972 6.64153 442.341 2.48624 423.809C-1.66912 405.276 0.639563 276.206 0.639563 276.206C0.666723 276.113 9.05645 247.406 33.9482 224.725C45.9625 213.777 56.5982 207.967 64.9921 204.751L63.9823 204.464H2.09757C2.08238 204.537 -2.04351 224.199 6.25187 174.669C8.91376 161.388 14.2894 150.572 19.3124 142.984C43.0573 107.113 92.328 99.9348 92.328 99.9348H2.09757C2.09994 99.8888 3.89115 65.2419 23.4677 38.3567C43.0572 11.4536 71.5511 3.08744 86.9853 1.29419Z" fill={color} />
        {withImage && (
          <image
            href={imgUrl}
            x="-110%"
            y="-2%"
            width="320%"
            height="320%"
            preserveAspectRatio="xMidYMin meet"
            clipPath={`url(#${clipId})`}
            style={{
              filter: 'drop-shadow(0px 0px 8px #ffffff) drop-shadow(0px 0px 3px #ffffff) drop-shadow(0px 0px 1px #ffffff)'
            }}
          />
        )}
      </svg>
    )
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 500,
        left: 750,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        marginTop: customMarginTop,
        paddingLeft: '40px',
        pointerEvents: 'none',
        zIndex: 50,
        fontFamily: '"Inter", "Outfit", system-ui, sans-serif',
      }}
    >
      <div style={{ transform: `scale(${overlayScale})`, display: 'flex', justifyContent: 'flex-start' }}>
        <style>{`


          /* ANIMASI BARU: Logo dari atas ke bawah */
          @keyframes slideInLogo {
            from { transform: translateY(-100px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          /* ANIMASI BARU: Bar keluar dari belakang kiri ke kanan */
          @keyframes slideInBar {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
          
          /* ANIMASI KELUAR: Kebalikan dari masuk */
          @keyframes slideOutLogo {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(-100px); opacity: 0; }
          }
          @keyframes slideOutBar {
            from { transform: translateX(0); }
            to { transform: translateX(-100%); }
          }

          .lower-third-container {
            display: flex;
            align-items: center;
            position: relative;
          }
          
          /* KONTROL TIMING ANIMASI */
          .lower-third-container.in .logo-stack {
            animation: slideInLogo 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          .lower-third-container.in .bar {
            animation: slideInBar 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both;
          }
          
          .lower-third-container.out .logo-stack {
            animation: slideOutLogo 0.4s cubic-bezier(0.55, 0, 1, 0.45) 0.3s forwards;
          }
          .lower-third-container.out .bar {
            animation: slideOutBar 0.4s cubic-bezier(0.55, 0, 1, 0.45) forwards;
          }
          
          /* INITIAL STATE SEBELUM ANIMASI (HINDARI FLASHING) */
          .lower-third-container.init .logo-stack {
            opacity: 0;
            transform: translateY(-100px);
          }
          .lower-third-container.init .bar {
            transform: translateX(-100%);
          }

          .logo-stack {
            position: relative;
            width: 100px;
            height: 125px;
            flex-shrink: 0;
            z-index: 10;
          }
          
          .logo-layer {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
          }
          .layer-blue { transform: translate(12px, 8px); }
          .layer-green { transform: translate(8px, 5px); }
          .layer-red { transform: translate(4px, 2px); }
          .layer-white { transform: translate(0, 0); }
          
          /* WRAPPER BAR UNTUK REVEAL EFFECT */
          .bar-wrapper {
            overflow: hidden;
            margin-left: -15px; /* Tuck under the logo */
            z-index: 5;
            padding-top: 10px;
            padding-bottom: 10px;
            padding-right: 20px;
          }
          
          .bar {
            background: #080b59ff;
            border-radius: 0 34px 34px 0;
            padding: 0 44px 0 38px;
            height: 68px;
            display: flex;
            align-items: center;
            gap: 20px;
            min-width: 280px;
            /* Translating on X inside overflow:hidden makes it slide from behind */
          }
          
          .event-icon {
            font-size: 32px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          
          .bar-name {
            font-size: 32px;
            font-weight: 900;
            color: #ffffffff;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            white-space: nowrap;
          }
        `}</style>

        <div className={`lower-third-container ${animateIn ? 'in' : (isShowing ? 'init' : 'out')}`}>
          {/* LOGO STACK */}
          <div className="logo-stack">
            <div className="logo-layer layer-blue">{pipaLogoSvg('#2050ff')}</div>
            <div className="logo-layer layer-green">{pipaLogoSvg('#20ff20')}</div>
            <div className="logo-layer layer-red">{pipaLogoSvg('#ff2020')}</div>

            {/* Base white logo with image inside SVG */}
            <div className="logo-layer layer-white">{pipaLogoSvg('#ff0000', true, imageUrl)}</div>
          </div>

          {/* NAME BAR WRAPPER FOR REVEAL ANIMATION */}
          <div className="bar-wrapper">
            <div className="bar">
              <div className="event-icon" style={{ color: iconData.color }}>
                {iconData.icon}
              </div>
              <span className="bar-name">{displayName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}