'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

import {
  useChampionsLeagueMatches,
  useChampionsLeagueStandings
} from '@/features/champions-league/hooks/useChampionsLeagueData'
import { ChampionsLeagueTable, ChampionsLeagueMatches } from '@/features/champions-league/components/UCLSection'
import { ChampionsLeagueBracket } from '@/features/champions-league/components/ChampionsLeagueBracket'

// Sidebar imports (Shared from Premier League feature)
import { usePremierLeagueMatches, usePremierLeagueNews } from '@/features/premier-league/hooks/usePremierLeagueData'
import { PremierLeagueRight } from '@/features/premier-league/components/PremierLeagueSidebar'

export default function UCLTablePage() {
  const isDark = false // Neobrutalism default

  const { uclMatches, loadingUclMatches, reloadUclMatches } = useChampionsLeagueMatches()
  const { uclStandings, loadingUclStandings, reloadUclStandings } = useChampionsLeagueStandings()

  // Sidebar hooks for news & live matches
  const {
    matches: plMatches,
    loadingMatches: loadingPlMatches,
    reloadMatches: reloadPlMatches
  } = usePremierLeagueMatches()

  const { news, loadingNews, reloadNews } = usePremierLeagueNews()

  const [uclMode, setUclMode] = useState('matches') // "matches" | "table" | "bracket"
  const [showSidebar, setShowSidebar] = useState(true)

  const handleRefresh = () => {
    reloadUclMatches()
    reloadUclStandings()
    reloadPlMatches()
    if (reloadNews) reloadNews()
  }

  return (
    <div className='p-4 w-full'>
      <header className='mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-black pb-4'>
        <div>
          <h1 className='text-4xl font-black uppercase tracking-wider text-black'>UEFA Champions League</h1>
          <p className='text-slate-700 font-bold mt-2'>
            View Champions League tables, schedules, results, and bracket stages.
          </p>
        </div>
        <div className='flex flex-wrap gap-2 items-center'>
          <div className='flex bg-white border-2 border-black'>
            <button
              onClick={() => setUclMode('matches')}
              className={`px-4 py-2 font-bold uppercase text-xs border-r-2 border-black transition-colors ${uclMode === 'matches' ? 'bg-[#00ffff]' : 'hover:bg-slate-100'}`}
            >
              Schedules &amp; Results
            </button>
            <button
              onClick={() => setUclMode('table')}
              className={`px-4 py-2 font-bold uppercase text-xs border-r-2 border-black transition-colors ${uclMode === 'table' ? 'bg-[#00ffff]' : 'hover:bg-slate-100'}`}
            >
              UCL Table
            </button>
            <button
              onClick={() => setUclMode('bracket')}
              className={`px-4 py-2 font-bold uppercase text-xs transition-colors ${uclMode === 'bracket' ? 'bg-[#00ffff]' : 'hover:bg-slate-100'}`}
            >
              Playoffs Bracket
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
        {/* Left Column: UCL content */}
        <div className={`w-full ${showSidebar ? 'lg:w-2/3' : 'lg:w-full'}`}>
          <div className='bg-white border-4 border-black rounded-none p-4 md:p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] w-full h-full'>
            {uclMode === 'matches' ? (
              <ChampionsLeagueMatches
                matches={uclMatches}
                loadingMatches={loadingUclMatches}
                theme={isDark ? 'dark' : 'light'}
                onRefreshMatches={reloadUclMatches}
                isAdmin={false}
              />
            ) : uclMode === 'table' ? (
              <ChampionsLeagueTable
                standings={uclStandings}
                loadingStandings={loadingUclStandings}
                theme={isDark ? 'dark' : 'light'}
                isAdmin={false}
                onRefreshStandings={reloadUclStandings}
              />
            ) : (
              <ChampionsLeagueBracket
                matches={uclMatches}
                loadingMatches={loadingUclMatches}
                theme={isDark ? 'dark' : 'light'}
                isAdmin={false}
                onRefreshMatches={reloadUclMatches}
              />
            )}
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
