'use client'

import dynamic from 'next/dynamic'

import { useTheme } from '@mui/material/styles'

import { useAuth } from '@/components/providers/AuthContext'

const CountdownTimer = dynamic(() => import('@/features/countdown/components/CountdownTimer'), {
  ssr: false,
  loading: () => <div className='text-sm text-textSecondary'>Loading Countdown Timer...</div>
})

export default function CountdownTimerPage() {
  const { user, loading, roomId } = useAuth()
  const theme = useTheme()
  const activeTheme = theme.palette.mode

  if (loading) {
    return <div className='p-6 text-textSecondary text-sm'>Loading...</div>
  }

  if (!user) {
    return (
      <div className='p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600'>
        <h3 className='font-semibold mb-1'>Access Restricted</h3>
        <p className='text-xs'>Please login to control the Countdown Timer.</p>
      </div>
    )
  }

  return (
    <div className='p-4 w-full'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-textPrimary'>Countdown Timer</h1>
        <p className='text-textSecondary text-sm'>
          Configure timer duration, start, pause, and generate overlay link for OBS.
        </p>
      </div>
      <CountdownTimer theme={activeTheme} roomId={roomId} />
    </div>
  )
}
