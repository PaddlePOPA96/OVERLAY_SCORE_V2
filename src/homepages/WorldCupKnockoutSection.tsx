'use client'

import { useEffect, useState } from 'react'
import { useWorldCupMatches } from '@/features/world-cup/hooks/useWorldCupData'
import { NeoBrutalBracket } from './NeoBrutalBracket'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export function WorldCupKnockoutSection() {
  const [isMounted, setIsMounted] = useState(false)
  const { wcMatches, loadingWcMatches, reloadWcMatches } = useWorldCupMatches()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <section className="w-full pt-32 pb-16 bg-[#F5F4F0] border-y-[3px] border-black relative z-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black text-black text-center tracking-tighter uppercase leading-tight">
            ROAD TO <br className="md:hidden" />
            <span className="text-[#1427c4] inline-block px-3 py-1 bg-[#D9FF00] border-[3px] border-black -rotate-2 shadow-[6px_6px_0_#000] ml-2">
              FINAL
            </span>
          </h2>
        </div>
        
        <div className="w-full mt-8 flex justify-center min-h-[600px]">
           <ErrorBoundary>
             {isMounted ? <NeoBrutalBracket matches={wcMatches} /> : <div className="text-black font-black text-2xl uppercase tracking-widest mt-20">Loading Bracket...</div>}
           </ErrorBoundary>
        </div>
      </div>
    </section>
  )
}
