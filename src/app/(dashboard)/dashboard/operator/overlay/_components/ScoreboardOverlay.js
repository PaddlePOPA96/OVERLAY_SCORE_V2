'use client'

import { useEffect, useState, useRef } from 'react'

import { useScoreboard } from '@/features/match-simulation/hooks/useScoreboard'
import LayoutA from '../../_components/LayoutA'
import LayoutB from '../../_components/LayoutB'
import LayoutC from '../../_components/LayoutC'
import LayoutD from '../../_components/LayoutD'
import LayoutE from '../../_components/LayoutE'
import LayoutPildun from '../../_components/LayoutPildun'
import { useLayoutSettings } from '@/hooks/useLayoutSettings'
import ThirdTitleOverlay from './ThirdTitleOverlay'

export default function ScoreboardOverlay({ roomId = 'default' }) {
  const { data, isLoaded, displayTime, formatTime } = useScoreboard(roomId)
  const [isMounted, setIsMounted] = useState(false)
  const [playError, setPlayError] = useState(false)
  const [activeMediaSrc, setActiveMediaSrc] = useState(null)
  const [activeMediaVol, setActiveMediaVol] = useState(1)

  const prevGoalTrigger = useRef(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check for goal
  useEffect(() => {
    if (!isLoaded || !data) return

    if (prevGoalTrigger.current === null) {
      prevGoalTrigger.current = data.goalTrigger || 0
      return
    }

    const currentTrigger = data.goalTrigger || 0

    if (currentTrigger !== prevGoalTrigger.current && currentTrigger !== 0) {
      const vol = data.goalAudioVolume !== undefined ? data.goalAudioVolume : 1
      setActiveMediaVol(vol)
      
      // Force remount to re-trigger autoplay
      setActiveMediaSrc(null)
      setPlayError(false)
      
      setTimeout(() => {
        setActiveMediaSrc(data.goalAudioSource || '/sounds/goal.mp3')
      }, 50)
    }

    prevGoalTrigger.current = currentTrigger
  }, [data?.goalTrigger, isLoaded])

  // Listen for stop signal directly from data changes
  useEffect(() => {
    if (!data || !data.goalAudioStop) return
    setActiveMediaSrc(null)
  }, [data?.goalAudioStop])

  // Listen for preview audio signal
  const prevPreviewTrigger = useRef(null)

  useEffect(() => {
    if (!isLoaded || !data) return

    if (prevPreviewTrigger.current === null) {
      prevPreviewTrigger.current = data.previewAudioTrigger || 0
      return
    }

    const currentTrigger = data.previewAudioTrigger || 0

    if (currentTrigger !== prevPreviewTrigger.current && currentTrigger !== 0) {
      const vol = data.goalAudioVolume !== undefined ? data.goalAudioVolume : 1
      setActiveMediaVol(vol)
      
      setActiveMediaSrc(null)
      setPlayError(false)
      
      setTimeout(() => {
        setActiveMediaSrc(data.previewAudioSource || '/sounds/goal.mp3')
      }, 50)
    }

    prevPreviewTrigger.current = currentTrigger
  }, [data?.previewAudioTrigger, data?.previewAudioSource, isLoaded])

  const handleInteraction = () => {
    setPlayError(false)
    // Interaction unlocks the browser audio context.
    // If activeMediaSrc was set, we can just force it to remount to try playing again.
    if (activeMediaSrc) {
      const currentSrc = activeMediaSrc
      setActiveMediaSrc(null)
      setTimeout(() => setActiveMediaSrc(currentSrc), 50)
    }
  }

  // --- New Settings Hook ---
  const { settings } = useLayoutSettings()

  // Ensure values are numbers to prevent CSS errors
  const rawX = settings?.scoreboard?.x
  const rawY = settings?.scoreboard?.y
  const rawScale = settings?.scoreboard?.scale

  const x = isNaN(Number(rawX)) ? 0 : Number(rawX)
  const y = isNaN(Number(rawY)) ? 0 : Number(rawY)
  const scale = isNaN(Number(rawScale)) ? 1 : Number(rawScale)

  // Debug log to check if props are updating
  useEffect(() => {
    if (isMounted) {
      console.log('[ScoreboardOverlay] Received settings:', { x, y, scale })
    }
  }, [x, y, scale, isMounted])

  if (!isMounted) return null

  // Check if third title is showing to hide main layout
  const isThirdTitleShowing = data?.thirdTitle?.isShowing === true

  return (
    <div
      onClick={handleInteraction}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        transformOrigin: 'center center',
        transition: 'transform 0.1s linear',
        zIndex: 10
      }}
    >
      {/* Trick: Use video instead of audio tag dynamically mounted to bypass OBS Autoplay blocks */}
      {activeMediaSrc && (
        <video
          autoPlay
          src={activeMediaSrc}
          style={{ display: 'none' }}
          onEnded={() => setActiveMediaSrc(null)}
          ref={(el) => {
            if (el) {
              el.volume = activeMediaVol
              // Attempt programmatic play as a fallback and catch errors
              const p = el.play()
              if (p !== undefined) {
                p.catch(e => {
                  console.error('Media play error:', e)
                  if (e.name === 'NotAllowedError' || e.message.includes('interact')) {
                    setPlayError(true)
                  }
                })
              }
            }
          }}
        />
      )}
      {playError && (
        <div
          onClick={handleInteraction}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.4)',
            cursor: 'pointer'
          }}
        >
          <div
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '15px 30px',
              borderRadius: '30px',
              fontWeight: 'bold',
              fontFamily: '"Poppins", sans-serif',
              fontSize: '20px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
              textAlign: 'center'
            }}
          >
            ⚠️ Autoplay Blocked!
            <br />
            <span style={{ fontSize: '14px', fontWeight: 'normal' }}>
              Click anywhere on this screen to enable Goal Sound.
            </span>
          </div>
        </div>
      )}

      {/* Main Scoreboard Layout */}
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease',
          transform: isThirdTitleShowing ? 'translateY(-20px)' : 'translateY(0)',
          opacity: isThirdTitleShowing ? 0 : 1,
        }}
      >
        {data.layout === 'A' ? (
          <LayoutA data={data} displayTime={displayTime} formatTime={formatTime} />
        ) : data.layout === 'C' ? (
          <LayoutC data={data} displayTime={displayTime} formatTime={formatTime} />
        ) : data.layout === 'D' ? (
          <LayoutD data={data} displayTime={displayTime} formatTime={formatTime} />
        ) : data.layout === 'E' ? (
          <LayoutE data={data} displayTime={displayTime} formatTime={formatTime} />
        ) : data.layout === 'Pildun' ? (
          <LayoutPildun data={data} displayTime={displayTime} formatTime={formatTime} />
        ) : (
          <LayoutB data={data} displayTime={displayTime} formatTime={formatTime} />
        )}
      </div>

      {/* Third Title Overlay Layer */}
      <ThirdTitleOverlay data={data} />
    </div>
  )
}
