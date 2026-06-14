'use client'

import { useEffect, useState } from 'react'

export default function LayoutPildun({ data, displayTime, formatTime }) {
  const [isVisible, setIsVisible] = useState(data.showOverlay)

  useEffect(() => {
    setIsVisible(data.showOverlay)
  }, [data.showOverlay])

  if (!isVisible) return null

  const isSwapped = !!data.switchSides

  const teamLeftNameRaw = isSwapped ? data.awayName || 'AWAY' : data.homeName || 'HOME'
  const teamLeftName = teamLeftNameRaw.toUpperCase()
  const teamLeftScore = isSwapped ? data.awayScore ?? 0 : data.homeScore ?? 0
  const teamLeftLogo = isSwapped ? data.awayLogo : data.homeLogo

  const teamRightNameRaw = isSwapped ? data.homeName || 'HOME' : data.awayName || 'AWAY'
  const teamRightName = teamRightNameRaw.toUpperCase()
  const teamRightScore = isSwapped ? data.homeScore ?? 0 : data.awayScore ?? 0
  const teamRightLogo = isSwapped ? data.homeLogo : data.awayLogo

  const waktuPertandingan = formatTime ? formatTime(displayTime) : "00:00"

  // Scale down heavily when previewed in the dashboard
  const transformScale = data.isPreview ? 'scale(0.4)' : 'scale(1)'

  return (
    <div 
      className="flex items-center justify-center p-4 pt-[80px] relative font-sans w-full"
      style={{ transform: transformScale, transformOrigin: 'top center' }}
    >
      
      {/* Container Utama - Maksimal Lebar 1200px */}
      <div className="w-[1200px] flex flex-col items-center justify-center relative z-10">
        
        {/* Wrapper Utama Scoreboard */}
        <div className="w-full flex items-end justify-center relative select-none">
          
          {/* 1. BLOK TIM KIRI (Biru Navy Premium) */}
          <div className="flex-1 h-[110px] bg-[#0b2545] rounded-l-[28px] flex items-center justify-between px-12 shadow-2xl z-10">
            {/* Bendera / Logo Kiri */}
            <div className="w-20 h-12 rounded-[10px] overflow-hidden flex items-center justify-center shadow-md ring-1 ring-white/10 shrink-0 bg-white/5">
              {teamLeftLogo ? (
                <img src={teamLeftLogo} alt={teamLeftName} className="w-full h-full object-contain" />
              ) : (
                <div className="flex w-full h-full">
                  <div className="w-1/3 bg-[#002395]" />
                  <div className="w-1/3 bg-[#ffffff]" />
                  <div className="w-1/3 bg-[#ed2939]" />
                </div>
              )}
            </div>
            {/* Nama Tim Kiri */}
            <span className="text-white text-5xl font-black tracking-wide ml-4 select-none">
              {teamLeftName}
            </span>
          </div>

          {/* 2. TRANSISI KURVA KIRI */}
          <div className="w-10 h-[110px] shrink-0 z-10 -ml-[1px]">
            <svg className="w-full h-full fill-[#0b2545]" viewBox="0 0 40 110" preserveAspectRatio="none">
              <path d="M 0,0 C 20,0 20,30 40,30 L 40,110 L 0,110 Z" />
            </svg>
          </div>

          {/* 3. BLOK TENGAH EMAS */}
          <div className="w-[380px] h-[80px] bg-[#dfc48c] rounded-t-[24px] flex items-center justify-between relative -ml-[1px] -mr-[1px] z-10 shadow-lg border-t border-white/20">
            {/* Skor Tim Kiri */}
            <div className="flex-1 flex justify-center items-center">
              <span className="text-white text-6xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                {teamLeftScore}
              </span>
            </div>
            
            {/* Spacer Tengah untuk Logo */}
            <div className="w-[110px] shrink-0" />
            
            {/* Skor Tim Kanan */}
            <div className="flex-1 flex justify-center items-center">
              <span className="text-white text-6xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                {teamRightScore}
              </span>
            </div>
          </div>

          {/* 4. TRANSISI KURVA KANAN */}
          <div className="w-10 h-[110px] shrink-0 z-10 -mr-[1px]">
            <svg className="w-full h-full fill-[#0b2545]" viewBox="0 0 40 110" preserveAspectRatio="none">
              <path d="M 0,30 C 20,30 20,0 40,0 L 40,110 L 0,110 Z" />
            </svg>
          </div>

          {/* 5. BLOK TIM KANAN (Biru Navy Premium) */}
          <div className="flex-1 h-[110px] bg-[#0b2545] rounded-r-[28px] flex items-center justify-between px-12 shadow-2xl z-10">
            {/* Nama Tim Kanan */}
            <span className="text-white text-5xl font-black tracking-wide mr-4 select-none">
              {teamRightName}
            </span>
            {/* Bendera / Logo Kanan */}
            <div className="w-20 h-12 rounded-[10px] overflow-hidden flex items-center justify-center shadow-md ring-1 ring-white/10 shrink-0 bg-white/5">
              {teamRightLogo ? (
                <img src={teamRightLogo} alt={teamRightName} className="w-full h-full object-contain" />
              ) : (
                <div className="flex w-full h-full">
                  <div className="w-1/3 bg-[#002395]" />
                  <div className="w-1/3 bg-[#ffffff]" />
                  <div className="w-1/3 bg-[#ed2939]" />
                </div>
              )}
            </div>
          </div>

          {/* 6. LOGO RESMI PIALA DUNIA FIFA 2026 */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[-16px] z-30 pointer-events-none">
            <img 
              src="https://upload.wikimedia.org/wikipedia/id/thumb/1/17/2026_FIFA_World_Cup_emblem.svg/960px-2026_FIFA_World_Cup_emblem.svg.png" 
              alt="FIFA World Cup 2026 Official Logo" 
              className="h-[165px] object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]"
            />
          </div>

        </div>

        {/* 7. BLOK TIMER / WAKTU */}
        <div className="w-[280px] h-[68px] bg-[#0f0f0f] rounded-b-[24px] flex items-center justify-center shadow-2xl border-t border-white/5 z-0">
          <span className="text-white text-4xl font-extrabold tracking-wide">
            {waktuPertandingan}
          </span>
        </div>

      </div>
    </div>
  )
}
