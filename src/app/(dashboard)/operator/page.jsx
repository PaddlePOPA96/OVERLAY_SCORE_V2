'use client'
import { useEffect, useState } from 'react'

import OperatorRoot from '@/app/(dashboard)/dashboard/operator/_components/OperatorRoot'
import { useAuth } from '@/shared/components/providers/AuthContext'

export default function OperatorPage() {
  const { user, loading, roomId: authRoomId } = useAuth()
  const activeTheme = 'light' // Default to light theme since MUI useTheme was removed

  // Allow URL query/hash to override the default roomId
  const [roomId, setRoomId] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const roomFromQuery = params.get('room') || ''
    const roomFromHash = window.location.hash.replace('#', '') || ''

    setRoomId(roomFromQuery || roomFromHash || authRoomId)
  }, [authRoomId])

  if (loading || !roomId) {
    return <div className='p-6 text-slate-500 font-bold text-sm'>Loading...</div>
  }

  if (!user) {
    return (
      <div className='p-6 bg-[#ffcc00] border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] m-4'>
        <h3 className='text-2xl font-black uppercase tracking-wider mb-2'>Access Restricted</h3>
        <p className='text-sm font-bold'>Please login to use the Scoreboard Operator.</p>
      </div>
    )
  }

  return (
    <div className='p-4 w-full'>
      <div className='mb-6 border-b-4 border-black pb-4'>
        <h1 className='text-4xl font-black uppercase tracking-wider text-black'>Scoreboard Operator</h1>
        <p className='text-slate-700 font-bold mt-2'>
          Manage, update scores, time, and customize scoreboard overlay live.
        </p>
      </div>
      <OperatorRoot initialRoomId={roomId} theme={activeTheme} />
    </div>
  )
}
