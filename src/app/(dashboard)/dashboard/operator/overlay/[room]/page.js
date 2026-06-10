'use client'

import { useParams } from 'next/navigation'

import ScoreboardOverlay from '@/features/match-simulation/components/overlay/ScoreboardOverlay'
import TikTokOverlay from '@/app/[room]/tiktok/page'

export default function OverlayRoomPage() {
  const params = useParams()
  const rawRoom = params?.room

  const roomId =
    typeof rawRoom === 'string' ? rawRoom : Array.isArray(rawRoom) && rawRoom.length > 0 ? rawRoom[0] : 'default'

  return (
    <>
      <ScoreboardOverlay roomId={roomId} />
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 50 }}>
        <TikTokOverlay roomId={roomId} />
      </div>
    </>
  )
}
