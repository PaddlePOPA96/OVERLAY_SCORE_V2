'use client'

import { useEffect, useState, useRef } from 'react'

import { useParams } from 'next/navigation'

import { ref, onValue, update } from 'firebase/database'

import { db } from '@/services/firebase/index'

export default function TikTokOverlay(props) {
  const params = useParams()

  // Pakai prop jika tersedia (ketika dipakai sebagai komponen embed),
  // fallback ke useParams ketika dirender sebagai standalone page /[room]/tiktok
  const roomIdProp = props?.roomId
  const roomId = roomIdProp || params?.room

  // State values from Firebase
  const [videoId, setVideoId] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [sender, setSender] = useState('')
  const [message, setMessage] = useState('')
  const [volume, setVolume] = useState(0.1)
  const [showDuration, setShowDuration] = useState(25)
  const [layout, setLayout] = useState('glassmorphism')
  const [platform, setPlatform] = useState('tiktok')
  const [isPlaying, setIsPlaying] = useState(false)
  const [triggeredAt, setTriggeredAt] = useState(0)

  // Local control states
  const [visible, setVisible] = useState(false)
  const [progressStart, setProgressStart] = useState(false)
  const [playError, setPlayError] = useState(false)

  const videoRef = useRef(null)
  const lastTriggeredRef = useRef(0)
  const timerRef = useRef(null)
  const exitTimerRef = useRef(null)

  // Handle interaction to unlock video playback if blocked
  const handleInteraction = () => {
    setPlayError(false)

    if (videoRef.current) {
      videoRef.current.muted = false
      videoRef.current.volume = volume
      videoRef.current.play().catch(err => {
        console.error('Interaction play failed:', err)
      })
    }
  }

  // Sync video element volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume
    }
  }, [volume, videoUrl])

  // Try to play video programmatically when it changes
  useEffect(() => {
    if (visible && videoUrl && videoRef.current) {
      videoRef.current.volume = volume
      
      const playPromise = videoRef.current.play()

      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('Video autoplay blocked by browser policy, attempting muted play:', err)
          setPlayError(true)
          
          // Fallback to muted playback so visual alert still runs
          if (videoRef.current) {
            videoRef.current.muted = true
            videoRef.current.play().catch(muteErr => {
              console.error('Even muted play failed:', muteErr)
            })
          }
        })
      }
    }
  }, [visible, videoUrl, volume])

  // Global listener to unlock audio on first user gesture anywhere on screen
  useEffect(() => {
    const unlock = () => {
      setPlayError(false)

      if (videoRef.current) {
        videoRef.current.muted = false
        videoRef.current.volume = volume
        videoRef.current.play().catch(() => {})
      }

      window.removeEventListener('click', unlock)
      window.removeEventListener('keypress', unlock)
    }

    window.addEventListener('click', unlock)
    window.addEventListener('keypress', unlock)

    
return () => {
      window.removeEventListener('click', unlock)
      window.removeEventListener('keypress', unlock)
    }
  }, [volume])

  // Subscribe to Firebase Realtime DB updates
  useEffect(() => {
    if (!roomId) return
    const dbRef = ref(db, `match_live/${roomId}/tiktok_overlay`)

    const unsubscribe = onValue(dbRef, snapshot => {
      const data = snapshot.val()

      if (data) {
        setVideoId(data.videoId || '')
        setVideoUrl(data.videoUrl || '')
        setSender(data.sender || '')
        setMessage(data.message || '')
        setVolume(data.volume !== undefined ? data.volume : 0.1)
        setLayout(data.layout || 'glassmorphism')
        setPlatform(data.platform || 'tiktok')
        setIsPlaying(data.isPlaying || false)
        setTriggeredAt(data.triggeredAt || 0)
      } else {
        setIsPlaying(false)
      }
    })

    return () => unsubscribe()
  }, [roomId])

  // Handle overlay completion and update Firebase state
  const handleOverlayEnd = () => {
    setVisible(false)
    setProgressStart(false)

    if (timerRef.current) clearTimeout(timerRef.current)
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current)

    if (roomId) {
      update(ref(db, `match_live/${roomId}/tiktok_overlay`), { isPlaying: false }).catch(console.error)
    }
  }

  // Trigger animations when triggeredAt changes
  useEffect(() => {
    if (triggeredAt > 0 && isPlaying && videoId) {
      // Avoid re-triggering if it is the same event
      if (triggeredAt === lastTriggeredRef.current) return
      lastTriggeredRef.current = triggeredAt

      // Avoid triggering old alerts on mount/refresh (e.g. older than duration + 10s)
      const ageMs = Date.now() - triggeredAt
      const durationMs = showDuration * 1000

      if (ageMs > durationMs + 10000) {
        console.log('Skipping old alert trigger on load:', ageMs, 'ms old')

        return
      }

      // Reset any active timers
      if (timerRef.current) clearTimeout(timerRef.current)
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current)

      setPlayError(false)
      setVisible(false)
      setProgressStart(false)

      // Start animations immediately
      setVisible(true)
      setProgressStart(true)

      // Hide overlay when duration ends (e.g. 500ms before removing DOM element to allow exit animation)
      timerRef.current = setTimeout(() => {
        setVisible(false)
      }, durationMs - 500)

      // Fully clear state
      exitTimerRef.current = setTimeout(() => {
        handleOverlayEnd()
      }, durationMs)
    }
  }, [triggeredAt, isPlaying, videoId, showDuration, roomId])

  // Force close overlay if operator turns off isPlaying manually
  useEffect(() => {
    if (!isPlaying) {
      setVisible(false)
      setProgressStart(false)

      if (timerRef.current) clearTimeout(timerRef.current)
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
    }
  }, [isPlaying])

  if (!isPlaying || !videoId) return null

  // Styles definitions for layouts
  const getLayoutStyles = () => {
    switch (layout) {
      case 'neon':
        return {
          cardBg: 'rgba(10, 10, 15, 0.95)',
          border: '2px solid #ff007f',
          boxShadow: '0 0 20px rgba(255, 0, 127, 0.4), 0 0 40px rgba(0, 240, 255, 0.2)',
          senderColor: '#ff007f',
          textColor: '#ffffff',
          messageBg: 'rgba(255, 255, 255, 0.05)',
          progressBg: 'linear-gradient(90deg, #ff007f, #00f0ff)'
        }
      case 'dark':
        return {
          cardBg: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          senderColor: '#a78bfa',
          textColor: '#f8fafc',
          messageBg: 'rgba(0, 0, 0, 0.3)',
          progressBg: '#8b5cf6'
        }
      case 'light':
        return {
          cardBg: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          senderColor: '#7c3aed',
          textColor: '#1e293b',
          messageBg: 'rgba(0, 0, 0, 0.03)',
          progressBg: '#7c3aed'
        }
      case 'glassmorphism':
      default:
        return {
          cardBg: 'rgba(15, 10, 25, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px 0 rgba(139, 92, 246, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
          senderColor: '#d8b4fe',
          textColor: '#f3e8ff',
          messageBg: 'rgba(255, 255, 255, 0.06)',
          progressBg: 'linear-gradient(90deg, #8b5cf6, #ec4899)'
        }
    }
  }

  const styles = getLayoutStyles()

  return (
    <div
      onClick={handleInteraction}
      className="w-screen h-screen bg-transparent overflow-hidden font-sans relative flex items-center justify-center cursor-pointer"
    >

      {/* Slider Widget Card */}
      <div
        style={{
          background: styles.cardBg,
          border: styles.border,
          boxShadow: styles.boxShadow,
          borderRadius: '24px',
          width: '420px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(150px) scale(0.9)',
          opacity: visible ? 1 : 0,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        }}
      >
        {/* Donor Banner Info Header */}
        {(sender || message) && (
          <div className="p-5 flex flex-col gap-1.5 border-b border-white/5 relative">
            <div className="flex items-center justify-between">
              <span
                style={{ color: styles.senderColor }}
                className="text-lg font-black tracking-wide drop-shadow-md truncate max-w-[280px]"
              >
                {sender}
              </span>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-violet-500/20 text-violet-300 rounded border border-violet-500/30">
                {platform === 'instagram' || videoUrl?.includes('instagram') || videoUrl?.includes('fbcdn') ? 'Instagram Post' : 'TikTok Video'}
              </span>
            </div>

            {message && (
              <div
                style={{
                  background: styles.messageBg,
                  color: styles.textColor,
                  borderLeft: `3px solid ${styles.senderColor}`
                }}
                className="px-3 py-2 rounded-r-lg text-xs leading-relaxed italic font-medium break-words max-h-16 overflow-y-auto"
              >
                {message}
              </div>
            )}
          </div>
        )}

        {/* Embedded TikTok Video Wrapper (9:16 Aspect Ratio) */}
        <div className="bg-black/95 relative w-full h-[580px] overflow-hidden flex items-center justify-center">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              playsInline
              controls={false}
              onEnded={handleOverlayEnd}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : platform === 'instagram' ? (
            <div className="w-full h-full relative overflow-hidden bg-white flex items-center justify-center">
              <iframe
                src={`https://www.instagram.com/p/${videoId}/embed`}
                className="w-full border-none absolute"
                allow="autoplay; encrypted-media; picture-in-picture"
                title="Instagram Alert"
                style={{
                  height: 'calc(100% + 110px)',
                  top: '-55px',
                  left: 0
                }}
              />
              {/* Overlay transparent div to prevent clicking on iframe */}
              <div className="absolute inset-0 z-10 bg-transparent"></div>
            </div>
          ) : (
            <iframe
              src={`https://www.tiktok.com/embed/v2/${videoId}`}
              className="w-full h-full border-none absolute inset-0"
              allow="autoplay; encrypted-media; picture-in-picture"
              title="TikTok Alert Video"
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </div>

        {/* Progress Bar Loader indicating display time */}
        <div className="w-full bg-black/40 h-1.5 relative overflow-hidden">
          <div
            style={{
              height: '100%',
              background: styles.progressBg,
              width: progressStart ? '0%' : '100%',
              transition: progressStart ? `width ${showDuration}s linear` : 'none'
            }}
          />
        </div>
      </div>
    </div>
  )
}
