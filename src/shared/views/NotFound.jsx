'use client'

import Link from 'next/link'

import Button from '@/components/ui/Button'
import Illustrations from '@/shared/components/Illustrations'

const NotFound = ({ mode }) => {
  const darkImg = '/images/pages/misc-mask-dark.png'
  const lightImg = '/images/pages/misc-mask-light.png'

  const miscBackground = mode === 'light' ? lightImg : darkImg

  return (
    <div className='flex items-center justify-center min-bs-[100dvh] relative p-6 overflow-x-hidden'>
      <div className='flex items-center flex-col text-center gap-10 bg-white p-12 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] z-10'>
        <div className='flex flex-col gap-2 is-[90vw] sm:is-[unset]'>
          <h1 className='font-black text-8xl text-[#ff3366] drop-shadow-[4px_4px_0_rgba(0,0,0,1)]'>
            404
          </h1>
          <h2 className='text-3xl font-black uppercase tracking-wider mt-4'>Page Not Found ⚠️</h2>
          <p className='font-bold text-slate-700'>We couldn&#39;t find the page you are looking for.</p>
        </div>
        <i className='ri-error-warning-line text-8xl text-[#ccff00] drop-shadow-[2px_2px_0_rgba(0,0,0,1)]'></i>
        <Link href="/">
          <Button variant='primary' size="lg">
            Back to Home
          </Button>
        </Link>
      </div>
      <Illustrations maskImg={{ src: miscBackground }} />
    </div>
  )
}

export default NotFound
