'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'

import ScoreboardOverlay from '../_components/ScoreboardOverlay'
import TikTokOverlay from '@/app/(overlay)/[room]/tiktok/page'

export default function OverlayRoomPage() {
  const params = useParams()
  const rawRoom = params?.room
  const [showGrid, setShowGrid] = useState(false)

  const roomId =
    typeof rawRoom === 'string' ? rawRoom : Array.isArray(rawRoom) && rawRoom.length > 0 ? rawRoom[0] : 'default'

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('grid') === 'true' || urlParams.get('grid') === '1') {
        setShowGrid(true)
      } else {
        const saved = localStorage.getItem('scoreboard_grid_helper')
        if (saved === 'true') {
          setShowGrid(true)
        }
      }
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      
      if (e.key.toLowerCase() === 'g') {
        setShowGrid((prev) => {
          const newVal = !prev
          localStorage.setItem('scoreboard_grid_helper', String(newVal))
          return newVal
        })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleToggle = () => {
    setShowGrid((prev) => {
      const newVal = !prev
      localStorage.setItem('scoreboard_grid_helper', String(newVal))
      return newVal
    })
  }

  const gridLabels = [
    'Top Left', 'Top Center', 'Top Right',
    'Middle Left', 'Center', 'Middle Right',
    'Bottom Left', 'Bottom Center', 'Bottom Right'
  ]

  return (
    <>
      <ScoreboardOverlay roomId={roomId} />
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 50 }}>
        <TikTokOverlay roomId={roomId} />
      </div>

      {/* Floating Toggle Button */}
      <button
        onClick={handleToggle}
        style={{
          position: 'fixed',
          top: '15px',
          right: '15px',
          zIndex: 10000,
          background: showGrid ? '#ef4444' : 'rgba(15, 23, 42, 0.8)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '6px 12px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '11px',
          fontWeight: '600',
          fontFamily: 'system-ui, sans-serif',
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.2s',
          opacity: 0.35,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.35'
        }}
      >
        <span>🌐</span>
        <span>{showGrid ? 'Hide Grid (G)' : 'Show Grid (G)'}</span>
      </button>

      {/* 9-Grid Helper */}
      {showGrid && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          {gridLabels.map((label, index) => (
            <div
              key={index}
              style={{
                border: '1px dashed rgba(255, 255, 255, 0.25)',
                boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.25)',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.9)',
                fontSize: '11px',
                fontWeight: '500',
                fontFamily: 'monospace, system-ui',
                letterSpacing: '0.05em',
                pointerEvents: 'none',
              }}
            >
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
