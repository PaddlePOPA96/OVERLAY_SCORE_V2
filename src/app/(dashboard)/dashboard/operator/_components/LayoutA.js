'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'

import '@/app/(dashboard)/dashboard/operator/overlay/layoutA.css'
import { getScale } from './overlay-scale.config'

const getContrastYIQ = (hexcolor) => {
  if (!hexcolor) return '#ffffff'
  hexcolor = hexcolor.replace('#', '')
  if (hexcolor.length === 3) {
    hexcolor = hexcolor.split('').map(x => x + x).join('')
  }
  const r = parseInt(hexcolor.substr(0, 2), 16) || 0
  const g = parseInt(hexcolor.substr(2, 2), 16) || 0
  const b = parseInt(hexcolor.substr(4, 2), 16) || 0
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
  return yiq >= 128 ? '#000000' : '#ffffff'
}

export default function LayoutA({ data, displayTime, formatTime }) {
  const [showGoal, setShowGoal] = useState(false)
  const [goalTeam, setGoalTeam] = useState('')
  const [animateIn, setAnimateIn] = useState(false)
  const [lastIntroId, setLastIntroId] = useState(0)
  const [isVisible, setIsVisible] = useState(data.showOverlay)
  const [isHiding, setIsHiding] = useState(false)

  // Trigger animasi GOAL sederhana
  useEffect(() => {
    const now = Date.now()

    // Hanya tampilkan GOAL jika trigger masih "baru" (misalnya < 5 detik)
    if (data.goalTrigger > 0 && now - data.goalTrigger < 5000) {
      setGoalTeam(data.goalTeam || '')
      setShowGoal(true)

      const timer = setTimeout(() => {
        setShowGoal(false)
        setGoalTeam('')
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [data.goalTrigger, data.goalTeam])

  // Animasi saat overlay A ditampilkan (toggle show/hide)
  useEffect(() => {
    if (data.showOverlay && data.introId !== lastIntroId) {
      setLastIntroId(data.introId)
      setAnimateIn(true)

      // biarkan class animasi aktif sedikit lebih lama supaya efek lebih halus
      const timer = setTimeout(() => setAnimateIn(false), 1800)

      return () => clearTimeout(timer)
    }
  }, [data.showOverlay, data.introId, lastIntroId])

  // Kelola visible state supaya saat HIDE ada animasi keluar dulu
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
      }, 700) // durasi animasi hide di CSS

      return () => clearTimeout(timer)
    }
  }, [data.showOverlay, isVisible])

  const overlayScale = getScale('A', data.isPreview)

  const dynamicStyles = {
    '--score-left-color': data.homeColor || '#0040a0',
    '--score-right-color': data.awayColor || '#b00024',
    '--score-left-text': getContrastYIQ(data.homeColor || '#0040a0'),
    '--score-right-text': getContrastYIQ(data.awayColor || '#b00024'),
    '--overlay-scale': overlayScale
  }

  const homeScoreText = String(data.homeScore ?? 0)
  const awayScoreText = String(data.awayScore ?? 0)

  const renderLeftContent = () => {
    if (showGoal && goalTeam === data.homeName) {
      return <span className='goal-text-anim'>GOAL</span>
    }

    return <span className='layout-a-team-name'>{data.homeName}</span>
  }

  const renderRightContent = () => {
    if (showGoal && goalTeam === data.awayName) {
      return <span className='goal-text-anim'>GOAL</span>
    }

    return <span className='layout-a-team-name'>{data.awayName}</span>
  }

  // Jika sudah selesai animasi hide, jangan render Layout A di overlay
  if (!isVisible) {
    return null
  }

  return (
    <div id='layout-a-root' style={dynamicStyles}>
      <style>{`
        #layout-a-root .layout-a-team-left { color: var(--score-left-text); }
        #layout-a-root .layout-a-team-right { color: var(--score-right-text); }
        #layout-a-root .layout-a-team-left .goal-text-anim { color: var(--score-left-text) !important; }
        #layout-a-root .layout-a-team-right .goal-text-anim { color: var(--score-right-text) !important; }
      `}</style>
      <div className={`slide16-9 ${animateIn ? 'layout-a-animate-in' : ''} ${isHiding ? 'layout-a-hide' : ''}`}>
          <div 
          className={`layout-a-board ${showGoal ? 'goal-anim' : ''}`}
          style={{
            background: 'transparent',
            borderRadius: '6px'
          }}
        >
          {/* Left Solid Background */}
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: '50%',
            background: 'var(--score-left-color)',
            zIndex: 1,
            borderRadius: '6px 0 0 6px'
          }} />
          
          {/* Right Solid Background */}
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: '50%',
            background: 'var(--score-right-color)',
            zIndex: 1,
            borderRadius: '0 6px 6px 0'
          }} />

          {/* Middle Gradient Overlay with Custom SVG Zigzag Shape */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), linear-gradient(90deg, var(--score-left-color) 25.72%, var(--score-right-color) 75.09%)',
            clipPath: 'polygon(25.72% 0%, 65.67% 0%, 69.2% 22.5%, 65.67% 45%, 75.09% 100%, 35.02% 100%, 28.35% 76.67%, 32.13% 59.17%)',
            zIndex: 2,
          }} />

          <div
            className={`layout-a-team layout-a-team-left ${
              showGoal && goalTeam === data.homeName ? 'goal-center' : ''
            }`}
            style={{ zIndex: 3, background: 'transparent' }}
          >
            {renderLeftContent()}
          </div>

          <div className='layout-a-center' style={{ zIndex: 4 }}>
            <div className='layout-a-center-logo'>
              <Image
                src='/logo/logo-epl.svg'
                alt='PL'
                width={64}
                height={64}
                className='w-full h-full object-contain'
                priority
                loading='eager'
                fetchPriority='high'
              />
            </div>
            <div className='layout-a-score-overlay'>
              <span
                className={`layout-a-score-num layout-a-score-left ${
                  homeScoreText.length > 1 ? 'layout-a-score-num-double' : ''
                } ${showGoal && goalTeam === data.homeName ? 'score-hidden' : ''}`}
              >
                {homeScoreText}
              </span>
              <span
                className={`layout-a-score-num layout-a-score-right ${
                  awayScoreText.length > 1 ? 'layout-a-score-num-double' : ''
                } ${showGoal && goalTeam === data.awayName ? 'score-hidden' : ''}`}
              >
                {awayScoreText}
              </span>
            </div>
          </div>

          <div
            className={`layout-a-team layout-a-team-right ${
              showGoal && goalTeam === data.awayName ? 'goal-center' : ''
            }`}
            style={{ zIndex: 3, background: 'transparent' }}
          >
            {renderRightContent()}
          </div>
        </div>

        <div className='layout-a-time-pill'>{formatTime(displayTime)}</div>
      </div>
    </div>
  )
}
