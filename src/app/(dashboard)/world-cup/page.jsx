'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

import { useWorldCupMatches, useWorldCupStandings } from '@/features/world-cup/hooks/useWorldCupData'
import { WorldCupMain } from '@/features/world-cup/components/WorldCupSection'

// Sidebar imports (Shared from Premier League feature)
import { usePremierLeagueMatches, usePremierLeagueNews } from '@/features/premier-league/hooks/usePremierLeagueData'
import { PremierLeagueRight } from '@/features/premier-league/components/PremierLeagueSidebar'
import { useAuth } from '@/shared/components/providers/AuthContext'

export default function WorldCupPage() {
  const isDark = false // Neobrutalism default
  const { user, loading: loadingAuth } = useAuth()

  const { wcMatches, loadingWcMatches, reloadWcMatches } = useWorldCupMatches()
  const { wcStandings, loadingWcStandings, reloadWcStandings } = useWorldCupStandings()

  // Sidebar hooks for news & live matches
  const {
    matches: plMatches,
    loadingMatches: loadingPlMatches,
    reloadMatches: reloadPlMatches
  } = usePremierLeagueMatches()

  const { news, loadingNews, reloadNews } = usePremierLeagueNews()

  const [wcMode, setWcMode] = useState('matches') // "matches" | "table"
  const [showSidebar, setShowSidebar] = useState(true)

  const handleRefresh = () => {
    reloadWcMatches()
    reloadWcStandings()
    reloadPlMatches()
    if (reloadNews) reloadNews()
  }

  if (loadingAuth) {
    return <div className='p-6 text-slate-500 font-bold text-sm'>Loading FIFA World Cup Dashboard...</div>
  }

  if (!user) {
    return (
      <div className='p-4 w-full'>
        <div className='p-6 bg-[#ffcc00] border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] mb-6 max-w-2xl'>
          <h3 className='font-black uppercase tracking-wider mb-2 text-2xl'>Access Restricted</h3>
          <p className='text-sm mb-4 font-bold'>You must be logged in to use the FIFA World Cup Dashboard.</p>
          <a href="/login">
            <Button variant='primary'>Go to Login Page</Button>
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className='p-4 w-full'>
      <header className='mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-black pb-4'>
        <div>
          <h1 className='text-4xl font-black uppercase tracking-wider text-black'>FIFA World Cup 2026</h1>
          <p className='text-slate-700 font-bold mt-2'>View World Cup group standings, schedules, and matches.</p>
        </div>
        <div className='flex flex-wrap gap-2 items-center'>
          <div className='flex bg-white border-2 border-black'>
            <button
              onClick={() => setWcMode('matches')}
              className={`px-4 py-2 font-bold uppercase text-xs border-r-2 border-black transition-colors ${wcMode === 'matches' ? 'bg-[#00ffff]' : 'hover:bg-slate-100'}`}
            >
              Schedules &amp; Results
            </button>
            <button
              onClick={() => setWcMode('table')}
              className={`px-4 py-2 font-bold uppercase text-xs border-r-2 border-black transition-colors ${wcMode === 'table' ? 'bg-[#00ffff]' : 'hover:bg-slate-100'}`}
            >
              Standings Table
            </button>
            <button
              onClick={() => setWcMode('knockout')}
              className={`px-4 py-2 font-bold uppercase text-xs transition-colors ${wcMode === 'knockout' ? 'bg-[#00ffff]' : 'hover:bg-slate-100'}`}
            >
              Knockout Stage
            </button>
          </div>
          <Button
            onClick={() => setShowSidebar(!showSidebar)}
            variant='outline'
            className='bg-white'
          >
            {showSidebar ? '📋 Hide Sidebar' : '📋 Show Sidebar'}
          </Button>
          <Button
            onClick={handleRefresh}
            variant='outline'
            className='bg-[#ccff00]'
          >
            🔄 Refresh
          </Button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: World Cup content */}
        <div className={`w-full ${showSidebar ? 'lg:w-2/3' : 'lg:w-full'}`}>
          <div className='bg-white border-4 border-black rounded-none p-4 md:p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] w-full h-full'>
            <WorldCupMain
              matches={wcMatches}
              loading={loadingWcMatches}
              theme={isDark ? 'dark' : 'light'}
              standings={wcStandings}
              loadingStandings={loadingWcStandings}
              mode={wcMode}
              isAdmin={false}
              onRefreshStandings={reloadWcStandings}
              onRefreshMatches={reloadWcMatches}
            />
          </div>
        </div>

        {/* Right Column: Shared News & Live Matches */}
        {showSidebar && (
          <div className="w-full lg:w-1/3">
            <div className='bg-white border-4 border-black rounded-none p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)] w-full h-full flex flex-col gap-6'>
              <PremierLeagueRight
                matches={plMatches}
                loading={loadingPlMatches}
                news={news}
                loadingNews={loadingNews}
                theme={isDark ? 'dark' : 'light'}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
