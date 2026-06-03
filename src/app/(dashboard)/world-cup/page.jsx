'use client'

import { useState } from 'react'

import { useColorScheme } from '@mui/material/styles'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Grid from '@mui/material/Grid'

import { useWorldCupMatches, useWorldCupStandings } from '@/features/world-cup/hooks/useWorldCupData'
import { WorldCupMain } from '@/features/world-cup/components/WorldCupSection'

// Sidebar imports (Shared from Premier League feature)
import { usePremierLeagueMatches, usePremierLeagueNews } from '@/features/premier-league/hooks/usePremierLeagueData'
import { PremierLeagueRight } from '@/features/premier-league/components/PremierLeagueSidebar'
import { useAuth } from '@/contexts/AuthContext'

export default function WorldCupPage() {
  const { mode } = useColorScheme()
  const isDark = mode === 'dark'
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
    return <div className='p-6 text-textSecondary text-sm'>Loading FIFA World Cup Dashboard...</div>
  }

  if (!user) {
    return (
      <div className='p-4 w-full'>
        <div className='p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 mb-6 max-w-2xl'>
          <h3 className='font-semibold mb-2 text-lg'>Access Restricted</h3>
          <p className='text-sm mb-4'>You must be logged in to use the FIFA World Cup Dashboard.</p>
          <Button variant='contained' href='/login' color='warning' className='normal-case shadow-none font-bold'>
            Go to Login Page
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='p-4 w-full'>
      <header className='mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-textPrimary'>FIFA World Cup 2026</h1>
          <p className='text-textSecondary text-sm'>View World Cup group standings, schedules, and matches.</p>
        </div>
        <div className='flex gap-2 items-center'>
          <ButtonGroup variant='outlined' size='small' aria-label='World Cup Display Mode'>
            <Button
              onClick={() => setWcMode('matches')}
              variant={wcMode === 'matches' ? 'contained' : 'outlined'}
              className='normal-case font-semibold text-xs'
            >
              Schedules &amp; Results
            </Button>
            <Button
              onClick={() => setWcMode('table')}
              variant={wcMode === 'table' ? 'contained' : 'outlined'}
              className='normal-case font-semibold text-xs'
            >
              Standings Table
            </Button>
          </ButtonGroup>
          <Button
            onClick={() => setShowSidebar(!showSidebar)}
            variant='outlined'
            color='primary'
            size='small'
            className='normal-case font-semibold text-xs'
          >
            {showSidebar ? '📋 Hide Sidebar' : '📋 Show Sidebar'}
          </Button>
          <Button
            onClick={handleRefresh}
            variant='text'
            color='secondary'
            size='small'
            className='normal-case font-semibold text-xs'
          >
            🔄 Refresh
          </Button>
        </div>
      </header>

      <Grid container spacing={6}>
        {/* Left Column: World Cup content */}
        <Grid item xs={12} lg={showSidebar ? 8 : 12}>
          <div
            style={{ background: 'var(--mui-palette-background-paper)' }}
            className='border border-slate-700/10 rounded-xl p-4 md:p-6 shadow-sm w-full h-full'
          >
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
        </Grid>

        {/* Right Column: Shared News & Live Matches */}
        {showSidebar && (
          <Grid item xs={12} lg={4}>
            <div
              style={{ background: 'var(--mui-palette-background-paper)' }}
              className='border border-slate-700/10 rounded-xl p-5 shadow-sm w-full h-full flex flex-col gap-6'
            >
              <PremierLeagueRight
                matches={plMatches}
                loading={loadingPlMatches}
                news={news}
                loadingNews={loadingNews}
                theme={isDark ? 'dark' : 'light'}
              />
            </div>
          </Grid>
        )}
      </Grid>
    </div>
  )
}
