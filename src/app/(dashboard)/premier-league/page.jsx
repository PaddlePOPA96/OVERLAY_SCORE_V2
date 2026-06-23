'use client'

import { useState } from 'react'

import { useColorScheme } from '@mui/material/styles'

import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Grid from '@mui/material/Grid'

import {
  usePremierLeagueMatches,
  usePremierLeagueStandings,
  usePremierLeagueNews
} from '@/features/premier-league/hooks/usePremierLeagueData'
import { PremierLeagueMain } from '@/features/premier-league/components/PremierLeagueSection'
import { PremierLeagueRight } from '@/features/premier-league/components/PremierLeagueSidebar'
import { useAuth } from '@/shared/components/providers/AuthContext'

export default function PremierLeaguePage() {
  const { mode } = useColorScheme()
  const isDark = mode === 'dark'
  const { user, loading: loadingAuth } = useAuth()

  const { matches, loadingMatches, reloadMatches } = usePremierLeagueMatches()
  const { standings, loadingStandings, reloadStandings } = usePremierLeagueStandings()
  const { news, loadingNews, reloadNews } = usePremierLeagueNews()

  const [plMode, setPlMode] = useState('matches') // "matches" | "table"
  const [showSidebar, setShowSidebar] = useState(true)

  const handleRefresh = () => {
    reloadMatches()
    reloadStandings()
    if (reloadNews) reloadNews()
  }

  if (loadingAuth) {
    return <div className='p-6 text-textSecondary text-sm'>Loading Premier League Dashboard...</div>
  }

  if (!user) {
    return (
      <div className='p-4 w-full'>
        <div className='p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 mb-6 max-w-2xl'>
          <h3 className='font-semibold mb-2 text-lg'>Access Restricted</h3>
          <p className='text-sm mb-4'>You must be logged in to use the Premier League Dashboard.</p>
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
          <h1 className='text-2xl font-bold text-textPrimary'>Premier League</h1>
          <p className='text-textSecondary text-sm'>View schedules, scores, standings, and update soccer results.</p>
        </div>
        <div className='flex gap-2 items-center'>
          <ButtonGroup variant='outlined' size='small' aria-label='Premier League Display Mode'>
            <Button
              onClick={() => setPlMode('matches')}
              variant={plMode === 'matches' ? 'contained' : 'outlined'}
              className='normal-case font-semibold text-xs'
            >
              Schedules &amp; Results
            </Button>
            <Button
              onClick={() => setPlMode('table')}
              variant={plMode === 'table' ? 'contained' : 'outlined'}
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
        {/* Left Column: Matches or Table */}
        <Grid item xs={12} lg={showSidebar ? 8 : 12}>
          <div
            style={{ background: 'var(--mui-palette-background-paper)' }}
            className='border border-slate-700/10 rounded-xl p-4 md:p-6 shadow-sm w-full h-full'
          >
            <PremierLeagueMain
              matches={matches}
              loading={loadingMatches}
              theme={isDark ? 'dark' : 'light'}
              standings={standings}
              loadingStandings={loadingStandings}
              mode={plMode}
              isAdmin={false}
              onRefreshStandings={reloadStandings}
              onRefreshMatches={reloadMatches}
            />
          </div>
        </Grid>

        {/* Right Column: Latest News & Live Match */}
        {showSidebar && (
          <Grid item xs={12} lg={4}>
            <div
              style={{ background: 'var(--mui-palette-background-paper)' }}
              className='border border-slate-700/10 rounded-xl p-5 shadow-sm w-full h-full flex flex-col gap-6'
            >
              <PremierLeagueRight
                matches={matches}
                loading={loadingMatches}
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
