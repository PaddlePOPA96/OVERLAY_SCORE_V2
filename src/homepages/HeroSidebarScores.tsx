'use client'

import { useState, useEffect } from 'react'

import { motion, AnimatePresence, Variants } from 'framer-motion'

import { useWorldCupMatches } from '@/features/world-cup/hooks/useWorldCupData'

const resolveNationalLogo = (team: any) => {
  if (team?.crest) return team.crest

  const countryMap: Record<string, string> = {
    argentina: 'ar', brazil: 'br', france: 'fr', germany: 'de', spain: 'es', england: 'gb-eng',
    italy: 'it', netherlands: 'nl', portugal: 'pt', belgium: 'be', uruguay: 'uy', croatia: 'hr',
    senegal: 'sn', usa: 'us', mexico: 'mx', canada: 'ca', morocco: 'ma', japan: 'jp',
    'south korea': 'kr', australia: 'au', saudi_arabia: 'sa', switzerland: 'ch', denmark: 'dk',
    poland: 'pl', ukraine: 'ua', sweden: 'se', wales: 'gb-wls', ecuador: 'ec', qatar: 'qa',
    iran: 'ir', ghana: 'gh', cameroon: 'cm', tunisia: 'tn', serbia: 'rs', costa_rica: 'cr'
  }

  const name = String(team?.name || '').toLowerCase().trim().replace(/\s+/g, '_')
  const code = countryMap[name]

  if (code) return `https://flagcdn.com/w80/${code}.png`
  
return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'><path fill='%2394a3b8' d='M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 4C10.74 4 9.53995 4.31006 8.47998 4.87012L9.96997 7.84998C10.6 7.42004 11.37 7.17004 12.2 7.19006C13.56 7.22009 14.74 8.16998 15.11 9.47998C15.48 10.79 14.92 12.16 13.82 12.91L13.11 11.49C12.75 10.77 12.03 10.31 11.23 10.29C10.42 10.27 9.68005 10.7 9.30005 11.4L7.54999 10.23C7.51996 10.82 7.59 11.41 7.73999 11.98C7.81995 12.29 7.94006 12.59 8.08997 12.87L5.12 11.38C4.39996 13.06 4.35999 14.93 5.01 16.63L7.96997 15.15C7.94 15.65 8.02997 16.14 8.21997 16.6C8.56995 17.43 9.25 18.06 10.1 18.32L10.81 16.9C11.17 16.18 11.89 15.72 12.69 15.74C13.5 15.76 14.24 16.19 14.62 16.89L16.37 17.72C16.51 17.15 16.52 16.56 16.4 15.98C16.32 15.58 16.17 15.2 15.98 14.85L18.91 16.32C19.6 14.67 19.61 12.83 18.96 11.17L16.03 12.64C16.05 12.18 15.96 11.71 15.79 11.27C15.55 10.63 15.08 10.12 14.47 9.82L13.78 11.2C13.42 11.92 12.7 12.38 11.9 12.36C11.09 12.34 10.35 11.91 9.96997 11.21L8.21997 10.04C8.07996 10.63 8.04999 11.24 8.12994 11.85L11.09 13.33C11.82 12.97 12.69 12.98 13.41 13.34L14.12 14.76C14.48 15.48 15.2 15.94 16 15.92C16.81 15.9 17.55 15.47 17.93 14.77L19.68 15.6C19.8 14.43 19.53 13.25 18.91 12.22L15.95 13.7C15.98 13.2 15.89 12.71 15.7 12.25C15.35 11.42 14.67 10.79 13.82 10.53L13.11 11.95C12.75 12.67 12.03 13.13 11.23 13.11C10.42 13.09 9.68005 12.66 9.30005 11.96L7.54999 11.13C7.47998 11.66 7.48999 12.2 7.57996 12.73L10.51 14.2C11.23 13.84 12.1 13.85 12.82 14.21L13.53 15.63C13.89 16.35 14.61 16.81 15.41 16.79C16.22 16.77 16.96 16.34 17.34 15.64L19.09 16.47C18.95 17.64 18.42 18.73 17.57 19.59L14.61 18.11C14.64 17.61 14.55 17.12 14.36 16.66C14.01 15.83 13.33 15.2 12.48 14.94L11.77 16.36C11.41 17.08 10.69 17.54 9.89 17.52C9.08 17.5 8.34 17.07 7.96 16.37L6.21 17.2C6.49 18.24 7.07 19.17 7.89 19.86L10.82 18.4C10.89 17.8 11.08 17.23 11.37 16.7L12.08 18.12C12.44 18.84 13.16 19.3 13.96 19.28C14.77 19.26 15.51 18.83 15.89 18.13L17.64 18.96C17.15 19.95 16.34 20.73 15.35 21.18L12.43 19.72C12.55 19.15 12.54 18.56 12.39 17.98C12.24 17.43 11.95 16.94 11.55 16.55L12.26 15.13C12.62 14.41 13.34 13.95 14.14 13.97C14.95 13.99 15.69 14.42 16.07 15.12L17.82 15.95C17.69 17.12 17.16 18.21 16.31 19.07L13.35 17.59C13.38 17.09 13.29 16.6 13.1 16.14C12.75 15.31 12.07 14.68 11.22 14.42L10.51 15.84C10.15 16.56 9.43 17.02 8.63 17C7.82 16.98 7.08 16.55 6.7 15.85L4.95 16.68C5.09 17.85 5.62 18.94 6.47 19.8L9.43 18.32C9.4 18.82 9.49 19.31 9.68 19.77C10.03 20.6 10.71 21.23 11.56 21.49L12.27 20.07C12.63 19.35 13.35 18.89 14.15 18.91C14.96 18.93 15.7 19.36 16.08 20.06L17.83 20.89C17.69 22.06 17.16 23.15 16.31 24.01L13.35 22.53C13.38 22.03 13.29 21.54 13.1 21.08C12.75 20.25 12.07 19.62 11.22 19.36L10.51 20.78C10.15 21.5 9.43 21.96 8.63 21.94C7.82 21.92 7.08 21.49 6.7 20.79L4.95 21.62C5.09 22.79 5.62 23.88 6.47 24.74L9.43 23.26C9.4 23.76 9.49 24.25 9.68 24.71C10.03 25.54 10.71 26.17 11.56 26.43L12.27 25.01C12.63 24.29 13.35 23.83 14.15 23.85C14.96 23.87 15.7 24.3 16.08 25L17.83 25.83C17.69 27 17.16 28.09 16.31 28.95L13.35 27.47C13.38 26.97 13.29 26.48 13.1 26.02C12.75 25.19 12.07 24.56 11.22 24.3L10.51 25.72C10.15 26.44 9.43 26.9 8.63 26.88C7.82 26.86 7.08 26.43 6.7 25.73L4.95 26.56C5.09 27.73 5.62 28.82 6.47 29.68L9.43 28.2C9.4 28.7 9.49 29.19 9.68 29.65C10.03 30.48 10.71 31.11 11.56 31.37L12.27 29.95C12.63 29.23 13.35 28.77 14.15 28.79C14.96 28.81 15.7 29.24 16.08 29.94L17.83 30.77C17.69 31.94 17.16 33.03 16.31 33.89L13.35 32.41C13.38 31.91 13.29 31.42 13.1 30.96C12.75 30.13 12.07 29.5 11.22 29.24L10.51 30.66C10.15 31.38 9.43 31.84 8.63 31.82C7.82 31.8 7.08 31.37 6.7 30.67L4.95 31.5C5.09 32.67 5.62 33.76 6.47 34.62L9.43 33.14C9.4 33.64 9.49 34.13 9.68 34.59C10.03 35.42 10.71 36.05 11.56 36.31L12.27 34.89C12.63 34.17 13.35 33.71 14.15 33.73C14.96 33.75 15.7 34.18 16.08 34.88L17.83 35.71C17.69 36.88 17.16 37.97 16.31 38.83L13.35 37.35C13.38 36.85 13.29 36.36 13.1 35.9M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z'/></svg>"
}

export function HeroSidebarScores() {
  const { wcMatches, loadingWcMatches } = useWorldCupMatches()
  const [page, setPage] = useState(0)

  // Filter for finished and live matches to show scores
  const isKnownMatch = (m: any) =>
    !!(m.homeTeam?.name || m.homeTeam?.shortName) && !!(m.awayTeam?.name || m.awayTeam?.shortName)

  const finishedOrLiveMatches = wcMatches?.filter((m: any) => (m.status === 'FINISHED' || m.status === 'IN_PLAY' || m.status === 'PAUSED') && isKnownMatch(m)) || []
  const displayMatches = finishedOrLiveMatches.length > 0 ? finishedOrLiveMatches : wcMatches?.filter(isKnownMatch) || []

  // Ensure we have a continuous loop by chunking into groups of 3
  const ITEMS_PER_PAGE = 3
  const totalPages = Math.ceil(displayMatches.length / ITEMS_PER_PAGE)

  useEffect(() => {
    if (totalPages <= 1) return

    const timer = setInterval(() => {
      setPage((prev) => (prev + 1) % totalPages)
    }, 8000) // Change data every 8 seconds

    
return () => clearInterval(timer)
  }, [totalPages])

  if (loadingWcMatches || displayMatches.length === 0) return null

  // Get current page items
  const startIdx = page * ITEMS_PER_PAGE
  const currentItems = displayMatches.slice(startIdx, startIdx + ITEMS_PER_PAGE)

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    },
    exit: {
      opacity: 0,
      transition: { staggerChildren: 0.08, staggerDirection: -1 }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -120, y: -30 },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { type: "spring", stiffness: 140, damping: 15 }
    },
    exit: { opacity: 0, x: 80, y: 30 }
  }

  return (
    <div className="absolute left-4 md:left-6 lg:left-8 top-[25%] md:top-[30%] h-auto w-64 z-30 pointer-events-none">      <div className="relative w-full h-[450px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          className="flex flex-col gap-4 w-full absolute top-0 left-0"
        >
          {currentItems.map((match: any, index: number) => {
            const homeLogo = resolveNationalLogo(match.homeTeam)
            const awayLogo = resolveNationalLogo(match.awayTeam)
            const homeName = match.homeTeam?.shortName || match.homeTeam?.name || 'TBD'
            const awayName = match.awayTeam?.shortName || match.awayTeam?.name || 'TBD'

            const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED'
            const isFinished = match.status === 'FINISHED'

            return (
              <motion.div
                variants={itemVariants}
                key={`${match.id}-${index}`}
                className="w-full bg-[#F5F4F0] border-4 border-black p-3 shadow-[4px_4px_0px_#000] shrink-0 pointer-events-auto"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black bg-[#D9FF00] text-black">
                    {isLive ? 'LIVE' : isFinished ? 'FT' : 'NEXT'}
                  </span>
                  <span className="text-[10px] font-bold text-black uppercase">{match.stage?.replace(/_/g, ' ') || 'GROUP'}</span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <img src={homeLogo} alt={homeName} className="w-6 h-4 border border-black object-cover" />
                      <span className="font-bold text-black text-sm uppercase">{homeName}</span>
                    </div>
                    <span className="font-black text-lg text-black">{(isLive || isFinished) ? (match.score?.fullTime?.home ?? 0) : '-'}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <img src={awayLogo} alt={awayName} className="w-6 h-4 border border-black object-cover" />
                      <span className="font-bold text-black text-sm uppercase">{awayName}</span>
                    </div>
                    <span className="font-black text-lg text-black">{(isLive || isFinished) ? (match.score?.fullTime?.away ?? 0) : '-'}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
    </div>
  )
}
