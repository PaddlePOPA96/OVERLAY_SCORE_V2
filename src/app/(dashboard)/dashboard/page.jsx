'use client'

import { useState, useEffect, Suspense } from 'react'

import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'

import { useColorScheme } from '@mui/material/styles'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Grid from '@mui/material/Grid'

import { ref, onValue } from 'firebase/database'

import { useAuth } from '@/shared/components/providers/AuthContext'
import { useUserRole } from '@/features/iam/hooks/useUserRole'
import { db } from '@/services/firebase/db'
import {
  usePremierLeagueMatches,
  usePremierLeagueStandings,
  usePremierLeagueNews
} from '@/features/premier-league/hooks/usePremierLeagueData'
import {
  useChampionsLeagueMatches,
  useChampionsLeagueStandings
} from '@/features/champions-league/hooks/useChampionsLeagueData'
import { useWorldCupMatches, useWorldCupStandings } from '@/features/world-cup/hooks/useWorldCupData'


// Pre-load all section components at startup (no on-demand compile lag)
const OperatorRoot = dynamic(() => import('@/app/(dashboard)/dashboard/operator/_components/OperatorRoot'), {
  ssr: false
})

const StreamsOperatorSection = dynamic(() => import('@/features/match-simulation/components/operator/StreamsOperatorSection'), {
  ssr: false
})

const StreamsPreviewDashboard = dynamic(() => import('@/features/match-simulation/components/operator/StreamsPreviewDashboard'), {
  ssr: false
})

const CountdownTimer = dynamic(() => import('@/features/countdown/components/CountdownTimer'), { ssr: false })

const TikTokOverlayControl = dynamic(() => import('@/features/tiktok/components/TikTokOverlayControl'), {
  ssr: false
})

const FormationOverlayControl = dynamic(() => import('@/features/formation/components/FormationOverlayControl'), {
  ssr: false
})

const PremierLeagueMain = dynamic(
  () =>
    import('@/features/premier-league/components/PremierLeagueSection').then(m => ({ default: m.PremierLeagueMain })),
  { ssr: false }
)

const PremierLeagueRight = dynamic(
  () =>
    import('@/features/premier-league/components/PremierLeagueSidebar').then(m => ({ default: m.PremierLeagueRight })),
  { ssr: false }
)

const ChampionsLeagueMatches = dynamic(
  () => import('@/features/champions-league/components/UCLSection').then(m => ({ default: m.ChampionsLeagueMatches })),
  { ssr: false }
)

const ChampionsLeagueTable = dynamic(
  () => import('@/features/champions-league/components/UCLSection').then(m => ({ default: m.ChampionsLeagueTable })),
  { ssr: false }
)

const ChampionsLeagueBracket = dynamic(
  () =>
    import('@/features/champions-league/components/ChampionsLeagueBracket').then(m => ({
      default: m.ChampionsLeagueBracket
    })),
  { ssr: false }
)

const RunningTextSetupContent = dynamic(
  () => import('@/app/(dashboard)/running-text-setup/page'),
  { ssr: false }
)

const AdminUserManagement = dynamic(() => import('@/app/(dashboard)/admin/create-user/page'), { ssr: false })

const WorldCupMain = dynamic(
  () => import('@/features/world-cup/components/WorldCupSection').then(m => ({ default: m.WorldCupMain })),
  { ssr: false }
)

const RequireLogin = ({ children, title }) => {
  const { user, loading: loadingAuth } = useAuth()

  if (loadingAuth) return <div className='p-6 text-textSecondary text-sm'>Loading {title}...</div>
  if (!user)
    return (
      <div className='p-6 bg-[#D9FF00] border-4 border-black shadow-[4px_4px_0px_#000] rounded-none text-black mb-6 max-w-2xl'>
        <h3 className='font-black mb-2 text-xl uppercase'>Access Restricted</h3>
        <p className='text-sm mb-4 font-bold'>You must be logged in to use the {title}.</p>
        <Button variant='contained' href='/login' color='primary' className='normal-case font-black'>
          Go to Login Page
        </Button>
      </div>
    )

  return children
}

function DashboardPageInner() {
  const searchParams = useSearchParams()
  const activeSection = searchParams.get('s') || 'operator'
  const { mode } = useColorScheme()
  const isDark = mode === 'dark'
  const theme = isDark ? 'dark' : 'light'
  const { roomId, user } = useAuth()
  const { role, loading: loadingRole } = useUserRole(user)
  const [rolePermissions, setRolePermissions] = useState({})

  useEffect(() => {
    const permsRef = ref(db, 'ucl_data/settings/roles_permissions')

    const unsubscribe = onValue(permsRef, snapshot => {
      const val = snapshot.val()

      if (val) {
        setRolePermissions(val)
      }
    })

    
return () => unsubscribe()
  }, [])

  const hasPermission = (permissionKey) => {
    if (loadingRole) return true // Let it load without flash
    if (role === 'superadmin') return true
    if (!rolePermissions || Object.keys(rolePermissions).length === 0) return true
    const roleConfig = rolePermissions[role]

    if (!roleConfig) return true
    
return !!roleConfig[permissionKey]
  }

  const renderRestricted = (title) => (
    <div className='p-6 bg-red-500/10 border-4 border-black shadow-[4px_4px_0px_#000] text-red-500 mb-6 max-w-2xl rounded-none'>
      <h3 className='font-black mb-2 text-xl uppercase'>Access Restricted</h3>
      <p className='text-sm font-bold'>You do not have permission to access the {title}. Please contact Superadmin.</p>
    </div>
  )

  // Only load PL data when on PL or UCL sections
  const loadSports = activeSection === 'premier-league' || activeSection === 'ucl-table'
  const { matches, loadingMatches, reloadMatches } = usePremierLeagueMatches()
  const { standings, loadingStandings, reloadStandings } = usePremierLeagueStandings()
  const { news, loadingNews, reloadNews } = usePremierLeagueNews()
  const { uclMatches, loadingUclMatches, reloadUclMatches } = useChampionsLeagueMatches()
  const { uclStandings, loadingUclStandings, reloadUclStandings } = useChampionsLeagueStandings()
  const { wcMatches, loadingWcMatches, reloadWcMatches } = useWorldCupMatches()
  const { wcStandings, loadingWcStandings, reloadWcStandings } = useWorldCupStandings()

  const [plMode, setPlMode] = useState('matches')
  const [uclMode, setUclMode] = useState('matches')
  const [wcMode, setWcMode] = useState('matches')

  const [showEplSidebar, setShowEplSidebar] = useState(true)
  const [showUclSidebar, setShowUclSidebar] = useState(true)
  const [showWcSidebar, setShowWcSidebar] = useState(true)

  const paperBg = { background: '#ffffff' }
  const panelClass = 'border-4 border-black shadow-[6px_6px_0px_#000] rounded-none p-4 md:p-6 w-full h-full'

  return (
    <div className='p-4 w-full'>
      {/* ── OPERATOR ── */}
      {activeSection === 'operator' && (
        <div>
          <header className='mb-4'>
            <h1 className='text-2xl font-bold text-textPrimary'>Scoreboard Operator</h1>
            <p className='text-textSecondary text-sm'>Control the live scoreboard in real-time.</p>
          </header>
          <RequireLogin title='Scoreboard Operator'>
            {hasPermission('operator') ? (
              <OperatorRoot initialRoomId={roomId} requireAuth={false} theme={theme} />
            ) : renderRestricted('Scoreboard Operator')}
          </RequireLogin>
        </div>
      )}

      {/* ── STREAMS OPERATOR ── */}
      {activeSection === 'streams-operator' && (
        <div>
          <header className='mb-4'>
            <h1 className='text-2xl font-bold text-textPrimary'>Live Streams Config</h1>
            <p className='text-textSecondary text-sm'>Manage global stream URL, moderate chat, and monitor live viewers.</p>
          </header>
          <RequireLogin title='Live Streams Config'>
            {hasPermission('streams_operator') ? (
              <StreamsOperatorSection theme={theme} />
            ) : renderRestricted('Live Streams Config')}
          </RequireLogin>
        </div>
      )}

      {/* ── LIVE STREAMS PREVIEW (DASHBOARD EMBED) ── */}
      {activeSection === 'streams' && (
        <RequireLogin title='Live Streams Preview'>
          {hasPermission('streams') ? (
            <StreamsPreviewDashboard roomId={roomId} theme={theme} />
          ) : renderRestricted('Live Streams Preview')}
        </RequireLogin>
      )}

      {activeSection === 'countdown-timer' && (
        <RequireLogin title='Countdown Timer'>
          {hasPermission('countdown_timer') ? (
            <CountdownTimer theme={theme} roomId={roomId} />
          ) : renderRestricted('Countdown Timer')}
        </RequireLogin>
      )}

      {/* ── FORMATION OVERLAY ── */}
      {activeSection === 'formation' && (
        <div>
          <header className='mb-4'>
            <h1 className='text-2xl font-bold text-textPrimary'>Team Formation Overlay</h1>
            <p className='text-textSecondary text-sm'>Configure and set team formation for the OBS overlay.</p>
          </header>
          <RequireLogin title='Team Formation Overlay'>
            {hasPermission('tiktok_overlay') ? (
              <FormationOverlayControl theme={theme} roomId={roomId} />
            ) : renderRestricted('Team Formation Overlay')}
          </RequireLogin>
        </div>
      )}

      {/* ── TIKTOK & IG OVERLAY ── */}
      {activeSection === 'tiktok-overlay' && (
        <div>
          <header className='mb-4'>
            <h1 className='text-2xl font-bold text-textPrimary'>Tiktok & IG Video Overlay</h1>
            <p className='text-textSecondary text-sm'>Configure and trigger TikTok and Instagram video overlays for OBS.</p>
          </header>
          <RequireLogin title='Tiktok & IG Video Overlay'>
            {hasPermission('tiktok_overlay') ? (
              <TikTokOverlayControl theme={theme} roomId={roomId} />
            ) : renderRestricted('Tiktok & IG Video Overlay')}
          </RequireLogin>
        </div>
      )}

      {/* ── RUNNING TEXT SETUP ── */}
      {activeSection === 'running-text' && (
        <div>
          <header className='mb-6'>
            <h1 className='text-2xl font-bold text-textPrimary'>Running Text (OBS)</h1>
            <p className='text-textSecondary text-sm'>Configure the ticker overlay for OBS broadcast.</p>
          </header>
          <RequireLogin title='Running Text Setup'>
            {hasPermission('running_text') ? (
              <RunningTextSetupContent />
            ) : renderRestricted('Running Text Setup')}
          </RequireLogin>
        </div>
      )}

      {/* ── PREMIER LEAGUE ── */}
      {activeSection === 'premier-league' && (
        <RequireLogin title='Premier League Dashboard'>
          {hasPermission('premier_league') ? (
            <div>
              <header className='mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                <div>
                  <h1 className='text-2xl font-bold text-textPrimary'>Premier League</h1>
                  <p className='text-textSecondary text-sm'>View schedules, scores, standings, and results.</p>
                </div>
                <div className='flex gap-2 items-center'>
                  <ButtonGroup variant='outlined' size='small'>
                    <Button
                      onClick={() => setPlMode('matches')}
                      variant={plMode === 'matches' ? 'contained' : 'outlined'}
                      className='normal-case font-semibold text-xs'
                    >
                      Schedules & Results
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
                    onClick={() => setShowEplSidebar(!showEplSidebar)}
                    variant='outlined'
                    color='primary'
                    size='small'
                    className='normal-case font-semibold text-xs'
                  >
                    {showEplSidebar ? '📋 Hide Sidebar' : '📋 Show Sidebar'}
                  </Button>
                  <Button
                    onClick={() => {
                      reloadMatches()
                      reloadStandings()
                      reloadNews?.()
                    }}
                    variant='text'
                    color='secondary'
                    size='small'
                    className='normal-case text-xs'
                  >
                    🔄 Refresh
                  </Button>
                </div>
              </header>
              <Grid container spacing={6}>
                <Grid item xs={12} lg={showEplSidebar ? 8 : 12}>
                  <div style={paperBg} className={panelClass}>
                    <PremierLeagueMain
                      matches={matches}
                      loading={loadingMatches}
                      theme={theme}
                      standings={standings}
                      loadingStandings={loadingStandings}
                      mode={plMode}
                      isAdmin={false}
                      onRefreshStandings={reloadStandings}
                      onRefreshMatches={reloadMatches}
                    />
                  </div>
                </Grid>
                {showEplSidebar && (
                  <Grid item xs={12} lg={4}>
                    <div style={paperBg} className={panelClass + ' flex flex-col gap-6'}>
                      <PremierLeagueRight
                        matches={matches}
                        loading={loadingMatches}
                        news={news}
                        loadingNews={loadingNews}
                        theme={theme}
                      />
                    </div>
                  </Grid>
                )}
              </Grid>
            </div>
          ) : renderRestricted('Premier League Dashboard')}
        </RequireLogin>
      )}

      {/* ── UCL ── */}
      {activeSection === 'ucl-table' && (
        <RequireLogin title='UEFA Champions League Dashboard'>
          {hasPermission('ucl') ? (
            <div>
              <header className='mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                <div>
                  <h1 className='text-2xl font-bold text-textPrimary'>UEFA Champions League</h1>
                  <p className='text-textSecondary text-sm'>View UCL tables, schedules, results, and bracket stages.</p>
                </div>
                <div className='flex gap-2 items-center'>
                  <ButtonGroup variant='outlined' size='small'>
                    <Button
                      onClick={() => setUclMode('matches')}
                      variant={uclMode === 'matches' ? 'contained' : 'outlined'}
                      className='normal-case font-semibold text-xs'
                    >
                      Schedules & Results
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
                    onClick={() => setShowUclSidebar(!showUclSidebar)}
                    variant='outlined'
                    color='primary'
                    size='small'
                    className='normal-case font-semibold text-xs'
                  >
                    {showUclSidebar ? '📋 Hide Sidebar' : '📋 Show Sidebar'}
                  </Button>
                  <Button
                    onClick={() => {
                      reloadUclMatches()
                      reloadUclStandings()
                    }}
                    variant='text'
                    color='secondary'
                    size='small'
                    className='normal-case text-xs'
                  >
                    🔄 Refresh
                  </Button>
                </div>
              </header>
              <Grid container spacing={6}>
                <Grid item xs={12} lg={showUclSidebar ? 8 : 12}>
                  <div style={paperBg} className={panelClass}>
                    {uclMode === 'matches' && (
                      <ChampionsLeagueMatches
                        matches={uclMatches}
                        loadingMatches={loadingUclMatches}
                        theme={theme}
                        onRefreshMatches={reloadUclMatches}
                        isAdmin={false}
                      />
                    )}
                    {uclMode === 'table' && (
                      <ChampionsLeagueTable
                        standings={uclStandings}
                        loadingStandings={loadingUclStandings}
                        theme={theme}
                        isAdmin={false}
                        onRefreshStandings={reloadUclStandings}
                      />
                    )}
                    {uclMode === 'bracket' && (
                      <ChampionsLeagueBracket
                        matches={uclMatches}
                        loadingMatches={loadingUclMatches}
                        theme={theme}
                        isAdmin={false}
                        onRefreshMatches={reloadUclMatches}
                      />
                    )}
                  </div>
                </Grid>
                {showUclSidebar && (
                  <Grid item xs={12} lg={4}>
                    <div style={paperBg} className={panelClass + ' flex flex-col gap-6'}>
                      <PremierLeagueRight
                        matches={matches}
                        loading={loadingMatches}
                        news={news}
                        loadingNews={loadingNews}
                        theme={theme}
                      />
                    </div>
                  </Grid>
                )}
              </Grid>
            </div>
          ) : renderRestricted('UEFA Champions League Dashboard')}
        </RequireLogin>
      )}

      {/* ── WORLD CUP 2026 ── */}
      {activeSection === 'world-cup' && (
        <RequireLogin title='FIFA World Cup 2026 Dashboard'>
          {hasPermission('world_cup') ? (
            <div>
              <header className='mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                <div>
                  <h1 className='text-2xl font-bold text-textPrimary'>FIFA World Cup 2026</h1>
                  <p className='text-textSecondary text-sm'>View World Cup group tables, schedules, and results.</p>
                </div>
                <div className='flex gap-2 items-center'>
                  <ButtonGroup variant='outlined' size='small'>
                    <Button
                      onClick={() => setWcMode('matches')}
                      variant={wcMode === 'matches' ? 'contained' : 'outlined'}
                      className='normal-case font-semibold text-xs'
                    >
                      Schedules & Results
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
                    onClick={() => setShowWcSidebar(!showWcSidebar)}
                    variant='outlined'
                    color='primary'
                    size='small'
                    className='normal-case font-semibold text-xs'
                  >
                    {showWcSidebar ? '📋 Hide Sidebar' : '📋 Show Sidebar'}
                  </Button>
                  <Button
                    onClick={() => {
                      reloadWcMatches()
                      reloadWcStandings()
                    }}
                    variant='text'
                    color='secondary'
                    size='small'
                    className='normal-case text-xs'
                  >
                    🔄 Refresh
                  </Button>
                </div>
              </header>
              <Grid container spacing={6}>
                <Grid item xs={12} lg={showWcSidebar ? 8 : 12}>
                  <div style={paperBg} className={panelClass}>
                    <WorldCupMain
                      matches={wcMatches}
                      loading={loadingWcMatches}
                      theme={theme}
                      standings={wcStandings}
                      loadingStandings={loadingWcStandings}
                      mode={wcMode}
                      isAdmin={false}
                      onRefreshStandings={reloadWcStandings}
                      onRefreshMatches={reloadWcMatches}
                    />
                  </div>
                </Grid>
                {showWcSidebar && (
                  <Grid item xs={12} lg={4}>
                    <div style={paperBg} className={panelClass + ' flex flex-col gap-6'}>
                      <PremierLeagueRight
                        matches={matches}
                        loading={loadingMatches}
                        news={news}
                        loadingNews={loadingNews}
                        theme={theme}
                      />
                    </div>
                  </Grid>
                )}
              </Grid>
            </div>
          ) : renderRestricted('FIFA World Cup 2026 Dashboard')}
        </RequireLogin>
      )}

      {/* ── MANAGE USERS & ADMIN CONSOLES ── */}
      {(activeSection === 'manage-users' || activeSection === 'create-user' || activeSection === 'active-leagues' || activeSection === 'role-permissions') && (
        <AdminUserManagement activeTab={activeSection} />
      )}
    </div>
  )
}

// useSearchParams requires Suspense boundary
export default function UnifiedDashboardPage() {
  return (
    <Suspense fallback={<div className='p-6 text-textSecondary text-sm'>Loading...</div>}>
      <DashboardPageInner />
    </Suspense>
  )
}
