'use client'

import { useState } from 'react'

import { useColorScheme } from '@mui/material/styles'

import Button from '@mui/material/Button'

import ButtonGroup from '@mui/material/ButtonGroup'

import Grid from '@mui/material/Grid'

import {
  useChampionsLeagueMatches,
  useChampionsLeagueStandings
} from '@/features/champions-league/hooks/useChampionsLeagueData'
import { ChampionsLeagueTable, ChampionsLeagueMatches } from '@/features/champions-league/components/UCLSection'
import { ChampionsLeagueBracket } from '@/features/champions-league/components/ChampionsLeagueBracket'

// Sidebar imports (Shared from Premier League feature)
import { usePremierLeagueMatches, usePremierLeagueNews } from '@/features/premier-league/hooks/usePremierLeagueData'
import { PremierLeagueRight } from '@/features/premier-league/components/PremierLeagueSidebar'

// MUI Imports

export default function UCLTablePage() {
  const { mode } = useColorScheme()
  const isDark = mode === 'dark'

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
      <header className='mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-textPrimary'>UEFA Champions League</h1>
          <p className='text-textSecondary text-sm'>
            View Champions League tables, schedules, results, and bracket stages.
          </p>
        </div>
        <div className='flex gap-2 items-center'>
          <ButtonGroup variant='outlined' size='small' aria-label='UCL Display Mode'>
            <Button
              onClick={() => setUclMode('matches')}
              variant={uclMode === 'matches' ? 'contained' : 'outlined'}
              className='normal-case font-semibold text-xs'
            >
              Schedules &amp; Results
            </Button>
            <Button
              onClick={() => setUclMode('table')}
              variant={uclMode === 'table' ? 'contained' : 'outlined'}
              className='normal-case font-semibold text-xs'
            >
              UCL Table
            </Button>
            <Button
              onClick={() => setUclMode('bracket')}
              variant={uclMode === 'bracket' ? 'contained' : 'outlined'}
              className='normal-case font-semibold text-xs'
            >
              Playoffs Bracket
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
        {/* Left Column: UCL content */}
        <Grid item xs={12} lg={showSidebar ? 8 : 12}>
          <div
            style={{ background: 'var(--mui-palette-background-paper)' }}
            className='border border-slate-700/10 rounded-xl p-4 md:p-6 shadow-sm w-full h-full'
          >
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
