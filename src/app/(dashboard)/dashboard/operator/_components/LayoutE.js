'use client'

import { useEffect, useState, useRef } from 'react'
import '@/app/(dashboard)/dashboard/operator/overlay/layoutE.css'

export default function LayoutE({ data, displayTime, formatTime }) {
  const [isVisible, setIsVisible] = useState(data.showOverlay)
  const [isHiding, setIsHiding] = useState(false)
  const [showGoal, setShowGoal] = useState(false)
  const [goalTeam, setGoalTeam] = useState('')
  const lastTriggerRef = useRef(data.goalTrigger || 0)

  // Manage visibility state transitions
  useEffect(() => {
    if (data.showOverlay) {
      setIsVisible(true)
      setIsHiding(false)
    } else if (isVisible) {
      setIsHiding(true)

      const timer = setTimeout(() => {
        setIsVisible(false)
        setIsHiding(false)
      }, 600) // matches the layoutEOut duration

      return () => clearTimeout(timer)
    }
  }, [data.showOverlay, isVisible])

  // Goal Trigger Logic
  useEffect(() => {
    if (data.goalTrigger > 0 && data.goalTrigger !== lastTriggerRef.current) {
      lastTriggerRef.current = data.goalTrigger
      setGoalTeam(data.goalTeam || '')
      setShowGoal(true)

      const timer = setTimeout(() => {
        setShowGoal(false)
        setGoalTeam('')
      }, 3500)

      return () => clearTimeout(timer)
    }
  }, [data.goalTrigger, data.goalTeam])

  if (!isVisible) return null

  const isSwapped = !!data.switchSides

  // Visual Left side (Team 1)
  const teamLeftNameRaw = isSwapped ? data.awayName || 'HLV' : data.homeName || 'FNC'
  const teamLeftName = teamLeftNameRaw.substring(0, 4).toUpperCase()
  const teamLeftFullName = isSwapped ? data.awayFullName || '#1 Seed' : data.homeFullName || '#2 Seed'
  const teamLeftLogo = isSwapped ? data.awayLogo : data.homeLogo

  const teamLeftColor = isSwapped
    ? data.awayColor || data.awayBg || '#ff4655'
    : data.homeColor || data.homeBg || '#00f5a0'

  const teamLeftScore = isSwapped ? data.awayScore ?? 0 : data.homeScore ?? 0
  const teamLeftSeriesScore = isSwapped ? data.awaySeriesScore || 0 : data.homeSeriesScore || 0

  // Visual Right side (Team 2)
  const teamRightNameRaw = isSwapped ? data.homeName || 'FNC' : data.awayName || 'HLV'
  const teamRightName = teamRightNameRaw.substring(0, 4).toUpperCase()
  const teamRightFullName = isSwapped ? data.homeFullName || '#2 Seed' : data.awayFullName || '#1 Seed'
  const teamRightLogo = isSwapped ? data.homeLogo : data.awayLogo

  const teamRightColor = isSwapped
    ? data.homeColor || data.homeBg || '#00f5a0'
    : data.awayColor || data.awayBg || '#ff4655'

  const teamRightScore = isSwapped ? data.homeScore ?? 0 : data.awayScore ?? 0
  const teamRightSeriesScore = isSwapped ? data.homeSeriesScore || 0 : data.awaySeriesScore || 0

  // Dynamic Series Type Indicator
  const seriesType = data.seriesType || 'bo3'
  const maxDiamonds = seriesType === 'bo5' ? 3 : 2

  // Dynamic Scale Override: Lock to 1.0 in operator preview, and set scale to 1.25 to fit OBS 800x600 browser source perfectly
  const overlayScale = data.isPreview ? '1.0' : '1.25'

  const boardStyles = {
    '--overlay-scale': overlayScale
  }

  return (
    <div id='layout-e-root' style={boardStyles}>
      {/* VCT OVERLAY WRAPPER */}
      <div className={`layout-e-container ${isHiding ? 'layout-e-hide' : ''}`}>
        {/* HUD CORE ROW - SCALED FOR SLEEK COMPACT VCT SHAPES */}
        <div className='flex items-stretch justify-between w-[591px]'>
          {/* ==================== SISI TIM KIRI ==================== */}
          <div className='flex items-center justify-end mr-[3px]'>
            {/* 1. Kotak Informasi Tim (Teks Rapat di Kanan, Dekat Skor) */}
            <div
              className='bg-[#111519] text-white flex items-center justify-end py-2.5 pl-6 pr-3 relative overflow-hidden'
              style={{
                width: '155px',
                height: '48px',
                clipPath: 'polygon(10px 0%, 100% 0%, 100% 100%, 10px 100%, 0% 50%)'
              }}
            >
              {/* Logo Container (Di Kiri Grup - Lebih Kecil) */}
              <div
                className='w-[26px] h-[26px] border rounded-full flex items-center justify-center mr-2.5 shrink-0 shadow-md relative overflow-hidden'
                style={{
                  backgroundColor: `color-mix(in srgb, ${teamLeftColor} 10%, #111519)`,
                  borderColor: `color-mix(in srgb, ${teamLeftColor} 20%, transparent)`
                }}
              >
                {teamLeftLogo ? (
                  <img src={teamLeftLogo} alt={teamLeftName} className='w-[18px] h-[18px] object-contain' />
                ) : (
                  <span className='text-[11px] font-black'>{teamLeftName.substring(0, 2).toUpperCase()}</span>
                )}
              </div>

              {/* Teks Nama & Keterangan Seed (Rapat di Kanan, Rata Kiri menuju Logo) */}
              <div className='flex flex-col justify-center leading-none text-left flex-1'>
                <span className='text-[16px] font-black tracking-widest font-sans uppercase'>{teamLeftName}</span>
                <span className='text-[10px] text-gray-300 font-bold mt-1 font-sans uppercase tracking-wider'>
                  {teamLeftFullName}
                </span>
              </div>
            </div>

            {/* Garis Pembatas Vertikal Menyala */}
            <div
              className='w-[2.5px] h-[48px]'
              style={{
                backgroundColor: teamLeftColor,
                boxShadow: `0 0 10px ${teamLeftColor}, 0 0 5px ${teamLeftColor}`
              }}
            ></div>

            {/* 2. Kotak Skor Kiri */}
            <div
              className={`text-white flex items-center justify-center font-bold text-[26px] font-mono transition-all duration-300 ${
                showGoal && goalTeam === teamLeftName ? 'goal-flash-glow' : ''
              }`}
              style={{
                width: '60px',
                height: '48px',
                clipPath: 'polygon(0% 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0% 100%)',
                backgroundColor: `color-mix(in srgb, ${teamLeftColor} 18%, #111519)`,
                '--team-color': teamLeftColor,
                '--score-bg': `color-mix(in srgb, ${teamLeftColor} 18%, #111519)`
              }}
            >
              <span className='mr-1 text-white font-black'>{teamLeftScore}</span>
            </div>
          </div>

          {/* ==================== BLOK TENGAH KOSONG / GOAL BANNER ==================== */}
          <div className='w-[150px] h-[48px] flex items-center justify-center relative overflow-visible'>
            {showGoal ? (
              <div
                className='absolute bg-[#11151d]/95 border border-white/20 rounded-md py-1 px-4 flex items-center justify-center shadow-lg font-black tracking-widest text-[12px] text-white animate-pulse'
                style={{
                  boxShadow: `0 0 20px ${goalTeam === teamLeftName ? teamLeftColor : teamRightColor}, inset 0 0 10px rgba(255, 255, 255, 0.1)`,
                  borderColor: goalTeam === teamLeftName ? teamLeftColor : teamRightColor
                }}
              >
                <span className='uppercase font-sans text-center'>{goalTeam ? `${goalTeam} WIN` : 'ROUND WIN'}</span>
              </div>
            ) : null}
          </div>

          {/* ==================== SISI TIM KANAN ==================== */}
          <div className='flex items-center justify-start ml-[3px]'>
            {/* 1. Kotak Skor Kanan */}
            <div
              className={`text-white flex items-center justify-center font-bold text-[26px] font-mono transition-all duration-300 ${
                showGoal && goalTeam === teamRightName ? 'goal-flash-glow' : ''
              }`}
              style={{
                width: '60px',
                height: '48px',
                clipPath: 'polygon(10px 0%, 100% 0%, 100% 100%, 10px 100%, 0% 50%)',
                backgroundColor: `color-mix(in srgb, ${teamRightColor} 18%, #111519)`,
                '--team-color': teamRightColor,
                '--score-bg': `color-mix(in srgb, ${teamRightColor} 18%, #111519)`
              }}
            >
              <span className='ml-1 text-white font-black'>{teamRightScore}</span>
            </div>

            {/* Garis Pembatas Vertikal Menyala */}
            <div
              className='w-[2.5px] h-[48px]'
              style={{
                backgroundColor: teamRightColor,
                boxShadow: `0 0 10px ${teamRightColor}, 0 0 5px ${teamRightColor}`
              }}
            ></div>

            {/* 2. Kotak Informasi Tim (Teks Rapat di Kiri, Dekat Skor) */}
            <div
              className='bg-[#111519] text-white flex items-center justify-start py-2.5 pl-3 pr-6 relative overflow-hidden'
              style={{
                width: '155px',
                height: '48px',
                clipPath: 'polygon(0% 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0% 100%)'
              }}
            >
              {/* Teks Nama & Keterangan Seed (Rapat di Kiri, Rata Kanan menuju Logo) */}
              <div className='flex flex-col justify-center leading-none text-right flex-1'>
                <span className='text-[16px] font-black tracking-widest font-sans uppercase'>{teamRightName}</span>
                <span className='text-[10px] text-gray-300 font-bold mt-1 font-sans uppercase tracking-wider'>
                  {teamRightFullName}
                </span>
              </div>

              {/* Logo Container (Di Kanan Grup - Lebih Kecil) */}
              <div
                className='w-[26px] h-[26px] border rounded-full flex items-center justify-center ml-2.5 shrink-0 shadow-md relative overflow-hidden'
                style={{
                  backgroundColor: `color-mix(in srgb, ${teamRightColor} 10%, #111519)`,
                  borderColor: `color-mix(in srgb, ${teamRightColor} 20%, transparent)`
                }}
              >
                {teamRightLogo ? (
                  <img src={teamRightLogo} alt={teamRightName} className='w-[18px] h-[18px] object-contain' />
                ) : (
                  <span className='text-[11px] font-black'>{teamRightName.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ==================== BARIS BAWAH (VCT DIAMONDS SERIES WINS) ==================== */}
        <div className='w-[591px] flex justify-between items-start mt-1.5'>
          {/* Diamond Tim Kiri - Centered EXACTLY under the 60px Left Score Box */}
          <div className='flex justify-center gap-2 pt-1' style={{ width: '217.5px', paddingLeft: '157.5px' }}>
            {Array.from({ length: maxDiamonds }).map((_, i) => {
              const isActive = i < teamLeftSeriesScore

              return isActive ? (
                <div
                  key={i}
                  className='w-2.5 h-2.5 rotate-45 border border-gray-100 bg-gray-200 shadow-[0_0_5px_rgba(255,255,255,0.6)] transition-all duration-300'
                ></div>
              ) : (
                <div
                  key={i}
                  className='w-2.5 h-2.5 rotate-45 border border-gray-700/80 bg-[#12161c] transition-all duration-300'
                ></div>
              )
            })}
          </div>

          {/* Spacer Tengah Bawah */}
          <div className='w-[150px] h-2'></div>

          {/* Diamond Tim Kanan - Centered EXACTLY under the 60px Right Score Box */}
          <div className='flex justify-center gap-2 pt-1' style={{ width: '217.5px', paddingRight: '157.5px' }}>
            {Array.from({ length: maxDiamonds }).map((_, i) => {
              const isActive = i < teamRightSeriesScore

              return isActive ? (
                <div
                  key={i}
                  className='w-2.5 h-2.5 rotate-45 border border-gray-100 bg-gray-200 shadow-[0_0_5px_rgba(255,255,255,0.6)] transition-all duration-300'
                ></div>
              ) : (
                <div
                  key={i}
                  className='w-2.5 h-2.5 rotate-45 border border-gray-700/80 bg-[#12161c] transition-all duration-300'
                ></div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
