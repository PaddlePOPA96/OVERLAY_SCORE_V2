'use client'

import { useEffect, useState, useRef } from 'react'

import { useParams } from 'next/navigation'

import { ref, onValue } from 'firebase/database'

import { db } from '@/lib/firebase/index'

export default function TimerOverlay() {
  const params = useParams()
  const roomId = params.room

  const [targetTime, setTargetTime] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [remainingMs, setRemainingMs] = useState(0)
  const [timerColor, setTimerColor] = useState('#ffffff')
  const [borderColor, setBorderColor] = useState('transparent')
  const [fillColor, setFillColor] = useState('transparent')
  const [timerTitle, setTimerTitle] = useState('')
  const [audioVolume, setAudioVolume] = useState(1)
  const [audioSource, setAudioSource] = useState('/sounds/brr-brr-patapim-alarm-clock.mp3')

  const [currentRemaining, setCurrentRemaining] = useState(0)
  const [playError, setPlayError] = useState(false)

  const audioRef = useRef(null)
  const prevIsRunningRef = useRef(false)
  const playedTargetRef = useRef(null)
  const serverTimeOffsetRef = useRef(0)

  useEffect(() => {
    const offsetRef = ref(db, '.info/serverTimeOffset')
    const unsubscribe = onValue(offsetRef, snap => {
      serverTimeOffsetRef.current = snap.val() || 0
    })
    return () => unsubscribe()
  }, [])

  const handleInteraction = () => {
    setPlayError(false)

    if (audioRef.current) {
      // Just a silent play/pause to unlock audio context without playing the actual sound
      audioRef.current.volume = 0
      const playPromise = audioRef.current.play()

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            audioRef.current.pause()
            audioRef.current.volume = audioVolume
          })
          .catch(() => {})
      }
    }
  }

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume
      audioRef.current.currentTime = 0
      const playPromise = audioRef.current.play()

      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.error('Audio play error:', e)

          if (e.name === 'NotAllowedError' || e.message.includes('interact')) {
            setPlayError(true)
          }
        })
      }
    }
  }

  useEffect(() => {
    if (prevIsRunningRef.current === true && isRunning === false && targetTime !== null && remainingMs === 0) {
      if (playedTargetRef.current !== targetTime) {
        playedTargetRef.current = targetTime
        playSound()
      }
    }

    prevIsRunningRef.current = isRunning
  }, [isRunning, targetTime, remainingMs])

  useEffect(() => {
    if (!roomId) return
    const timerPath = `match_live/${roomId}/countdown_timer`
    const timerRef = ref(db, timerPath)

    const unsubscribe = onValue(timerRef, snapshot => {
      const data = snapshot.val()

      if (data) {
        setTargetTime(data.targetTime || null)
        setIsRunning(data.isRunning || false)
        setRemainingMs(data.remainingMs || 0)
        setTimerColor(data.color || '#ffffff')
        setBorderColor(data.borderColor || 'transparent')
        setFillColor(data.fillColor || 'transparent')
        setTimerTitle(data.title || '')
        setAudioVolume(data.audioVolume !== undefined ? data.audioVolume : 1)
        setAudioSource(data.audioSource || '/sounds/brr-brr-patapim-alarm-clock.mp3')
      } else {
        setTargetTime(null)
        setIsRunning(false)
        setRemainingMs(0)
        setTimerColor('#ffffff')
        setBorderColor('transparent')
        setFillColor('transparent')
        setTimerTitle('')
        setAudioVolume(1)
        setAudioSource('/sounds/brr-brr-patapim-alarm-clock.mp3')
      }
    })

    return () => unsubscribe()
  }, [roomId])

  useEffect(() => {
    let interval

    if (isRunning && targetTime) {
      interval = setInterval(() => {
        const now = Date.now() + serverTimeOffsetRef.current
        const diff = targetTime - now

        if (diff <= 0) {
          setCurrentRemaining(0)

          if (playedTargetRef.current !== targetTime) {
            playedTargetRef.current = targetTime
            playSound()
          }
        } else {
          setCurrentRemaining(diff)
        }
      }, 100)
    } else {
      setCurrentRemaining(remainingMs)
    }

    return () => clearInterval(interval)
  }, [isRunning, targetTime, remainingMs])

  const formatTime = ms => {
    if (ms <= 0) return { d: '00', h: '00', m: '00', s: '00' }
    const totalSeconds = Math.floor(ms / 1000)
    const d = Math.floor(totalSeconds / 86400)
    const h = Math.floor((totalSeconds % 86400) / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60

    return {
      d: String(d).padStart(2, '0'),
      h: String(h).padStart(2, '0'),
      m: String(m).padStart(2, '0'),
      s: String(s).padStart(2, '0')
    }
  }

  const timeParts = formatTime(currentRemaining)

  // Compute fill/border for card boxes
  const boxBg = fillColor !== 'transparent' ? fillColor : 'rgba(255,255,255,0.15)'
  const boxBorder = borderColor !== 'transparent' ? borderColor : 'transparent'
  const boxBorderWidth = borderColor !== 'transparent' ? '4px' : '0px'

  // Card-style digit box component (inline)
  const DigitBox = ({ value, label }) => (
    <div className='flex flex-col items-center gap-3'>
      <div
        style={{
          backgroundColor: boxBg,
          borderColor: boxBorder,
          borderWidth: boxBorderWidth,
          borderStyle: 'solid',
          color: timerColor,
          fontSize: '7rem',
          lineHeight: 1,
          minWidth: '160px',
          textAlign: 'center',
          borderRadius: '1.5rem',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          fontFamily: 'inherit',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle inner highlight */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'rgba(255,255,255,0.07)',
            borderRadius: '1.5rem 1.5rem 0 0',
            pointerEvents: 'none'
          }}
        />
        <span style={{ position: 'relative', zIndex: 1 }}>{value}</span>
      </div>
      <span
        style={{
          color: timerColor,
          opacity: 0.7,
          fontSize: '1.1rem',
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          textShadow: '0 2px 8px rgba(0,0,0,0.6)'
        }}
      >
        {label}
      </span>
    </div>
  )

  // Colon separator
  const Colon = () => (
    <div
      style={{
        color: timerColor,
        fontSize: '5rem',
        fontWeight: 900,
        lineHeight: 1,
        paddingBottom: '2.8rem',
        opacity: 0.85,
        textShadow: '0 4px 10px rgba(0,0,0,0.5)',
        userSelect: 'none'
      }}
    >
      :
    </div>
  )

  // Return a transparent overlay for OBS
  return (
    <div
      onClick={handleInteraction}
      className='w-screen h-screen flex flex-col items-center justify-center bg-transparent overflow-hidden font-sans cursor-pointer'
    >
      <audio ref={audioRef} src={audioSource} preload='auto' />

      {timerTitle && (
        <h1
          className='font-black tracking-widest uppercase text-center mb-6 relative z-10'
          style={{
            fontSize: '2.5rem',
            color: timerColor,
            textShadow: '0 4px 12px rgba(0,0,0,0.8)',
            letterSpacing: '0.25em'
          }}
        >
          {timerTitle}
        </h1>
      )}

      {/* Card-style DD:HH:MM:SS layout */}
      <div className='flex items-end gap-3'>
        {timeParts.d !== '00' && (
          <>
            <DigitBox value={timeParts.d} label='Days' />
            <Colon />
          </>
        )}
        <DigitBox value={timeParts.h} label='Hours' />
        <Colon />
        <DigitBox value={timeParts.m} label='Mins' />
        <Colon />
        <DigitBox value={timeParts.s} label='Secs' />
      </div>
    </div>
  )
}
