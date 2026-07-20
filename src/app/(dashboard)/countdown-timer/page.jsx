'use client'

import dynamic from 'next/dynamic'
import { useAuth } from '@/shared/components/providers/AuthContext'

const CountdownTimer = dynamic(() => import('@/features/countdown/components/CountdownTimer'), {
  ssr: false,
  loading: () => <div className='text-sm text-slate-500 font-bold'>Loading Countdown Timer...</div>
})

export default function CountdownTimerPage() {
  const { user, loading, roomId } = useAuth()
  const activeTheme = 'light' // Default for Neobrutalism

  if (loading) {
    return <div className='p-6 text-slate-500 font-bold text-sm'>Loading...</div>
  }

  if (!user) {
    return (
      <div className='p-6 bg-[#ffcc00] border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] m-4 max-w-2xl'>
        <h3 className='font-black uppercase tracking-wider mb-2 text-2xl'>Access Restricted</h3>
        <p className='text-sm font-bold'>Please login to control the Countdown Timer.</p>
      </div>
    )
  }

  return (
    <div className='p-4 w-full'>
      <div className='mb-6 border-b-4 border-black pb-4'>
        <h1 className='text-4xl font-black uppercase tracking-wider text-black'>Countdown Timer</h1>
        <p className='text-slate-700 font-bold mt-2'>
          Configure timer duration, start, pause, and generate overlay link for OBS.
        </p>
      </div>
      <CountdownTimer theme={activeTheme} roomId={roomId} />
    </div>
  )
}
