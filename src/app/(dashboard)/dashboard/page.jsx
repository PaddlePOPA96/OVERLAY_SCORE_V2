'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { ref, onValue } from 'firebase/database'

import Button from '@/components/ui/Button'
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

// Pre-load all section components at startup
const OperatorRoot = dynamic(() => import('@/app/(dashboard)/dashboard/operator/_components/OperatorRoot'), { ssr: false })
const StreamsOperatorSection = dynamic(() => import('@/features/match-simulation/components/operator/StreamsOperatorSection'), { ssr: false })
const StreamsPreviewDashboard = dynamic(() => import('@/features/match-simulation/components/operator/StreamsPreviewDashboard'), { ssr: false })
const CountdownTimer = dynamic(() => import('@/features/countdown/components/CountdownTimer'), { ssr: false })
const TikTokOverlayControl = dynamic(() => import('@/features/tiktok/components/TikTokOverlayControl'), { ssr: false })
const CamlinkOverlayControl = dynamic(() => import('@/features/camlink/components/CamlinkOverlayControl'), { ssr: false })
const FormationOverlayControl = dynamic(() => import('@/features/formation/components/FormationOverlayControl'), { ssr: false })
const PremierLeagueMain = dynamic(() => import('@/features/premier-league/components/PremierLeagueSection').then(m => ({ default: m.PremierLeagueMain })), { ssr: false })
const PremierLeagueRight = dynamic(() => import('@/features/premier-league/components/PremierLeagueSidebar').then(m => ({ default: m.PremierLeagueRight })), { ssr: false })
const ChampionsLeagueMatches = dynamic(() => import('@/features/champions-league/components/UCLSection').then(m => ({ default: m.ChampionsLeagueMatches })), { ssr: false })
const ChampionsLeagueTable = dynamic(() => import('@/features/champions-league/components/UCLSection').then(m => ({ default: m.ChampionsLeagueTable })), { ssr: false })
const ChampionsLeagueBracket = dynamic(() => import('@/features/champions-league/components/ChampionsLeagueBracket').then(m => ({ default: m.ChampionsLeagueBracket })), { ssr: false })
const RunningTextSetupContent = dynamic(() => import('@/app/(dashboard)/running-text-setup/page'), { ssr: false })
const AdminUserManagement = dynamic(() => import('@/app/(dashboard)/admin/create-user/page'), { ssr: false })
const WorldCupMain = dynamic(() => import('@/features/world-cup/components/WorldCupSection').then(m => ({ default: m.WorldCupMain })), { ssr: false })

const RequireLogin = ({ children, title }) => {
  const { user, loading: loadingAuth } = useAuth()

  if (loadingAuth) return <div className='p-6 text-slate-500 font-bold text-sm'>Loading {title}...</div>
  if (!user)
    return (
      <div className='p-6 bg-[#D9FF00] border-4 border-black shadow-[4px_4px_0px_#000] rounded-none text-black mb-6 max-w-2xl'>
        <h3 className='font-black mb-2 text-xl uppercase'>Access Restricted</h3>
        <p className='text-sm mb-4 font-bold'>You must be logged in to use the {title}.</p>
        <a href='/login'>
          <Button variant='primary'>Go to Login Page</Button>
        </a>
      </div>
    )

  return children
}

function DashboardPageInner() {
  const searchParams = useSearchParams()
  const activeSection = searchParams.get('s') || 'operator'
  const isDark = false
  const theme = 'light'
  const { roomId, user } = useAuth()
  const { role, loading: loadingRole } = useUserRole(user)
  const [rolePermissions, setRolePermissions] = useState({})

  useEffect(() => {
    const permsRef = ref(db, 'ucl_data/settings/roles_permissions')
    const unsubscribe = onValue(permsRef, snapshot => {
      const val = snapshot.val()
      if (val) setRolePermissions(val)
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
    <div className='p-6 bg-[#ff3366] border-4 border-black shadow-[4px_4px_0px_#000] text-white mb-6 max-w-2xl rounded-none'>
      <h3 className='font-black mb-2 text-xl uppercase'>Access Restricted</h3>
      <p className='text-sm font-bold'>You do not have permission to access the {title}. Please contact Superadmin.</p>
    </div>
  )

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

  const panelClass = 'bg-white border-4 border-black shadow-[6px_6px_0px_#000] rounded-none p-4 md:p-6 w-full h-full'

  return (
    <div className='p-4 w-full'>
      {/* ── OPERATOR ── */}
      {activeSection === 'operator' && (
        <div>
          <header className='mb-4 border-b-4 border-black pb-4'>
            <h1 className='text-3xl font-black uppercase text-black'>Scoreboard Operator</h1>
            <p className='text-slate-700 font-bold mt-2'>Control the live scoreboard in real-time.</p>
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
          <header className='mb-4 border-b-4 border-black pb-4'>
            <h1 className='text-3xl font-black uppercase text-black'>Live Streams Config</h1>
            <p className='text-slate-700 font-bold mt-2'>Manage global stream URL, moderate chat, and monitor live viewers.</p>
          </header>
          <RequireLogin title='Live Streams Config'>
            {hasPermission('streams_operator') ? (
              <StreamsOperatorSection theme={theme} />
            ) : renderRestricted('Live Streams Config')}
          </RequireLogin>
        </div>
      )}

      {/* ── LIVE STREAMS PREVIEW ── */}
      {activeSection === 'streams' && (
        <RequireLogin title='Live Streams Preview'>
          {hasPermission('streams') ? (
            <StreamsPreviewDashboard roomId={roomId} theme={theme} />
          ) : renderRestricted('Live Streams Preview')}
        </RequireLogin>
      )}

      {/* ── COUNTDOWN TIMER ── */}
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
          <header className='mb-4 border-b-4 border-black pb-4'>
            <h1 className='text-3xl font-black uppercase text-black'>Team Formation Overlay</h1>
            <p className='text-slate-700 font-bold mt-2'>Configure and set team formation for the OBS overlay.</p>
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
          <header className='mb-4 border-b-4 border-black pb-4'>
            <h1 className='text-3xl font-black uppercase text-black'>Tiktok & IG Video Overlay</h1>
            <p className='text-slate-700 font-bold mt-2'>Configure and trigger TikTok and Instagram video overlays for OBS.</p>
          </header>
          <RequireLogin title='Tiktok & IG Video Overlay'>
            {hasPermission('tiktok_overlay') ? (
              <TikTokOverlayControl theme={theme} roomId={roomId} />
            ) : renderRestricted('Tiktok & IG Video Overlay')}
          </RequireLogin>
        </div>
      )}

      {/* ── CAMLINK OVERLAY ── */}
      {activeSection === 'camlink-overlay' && (
        <div>
          <header className='mb-4 border-b-4 border-black pb-4'>
            <h1 className='text-3xl font-black uppercase text-black'>Camlink Overlay (OBS)</h1>
            <p className='text-slate-700 font-bold mt-2'>Configure and set camera layouts for the OBS overlay.</p>
          </header>
          <RequireLogin title='Camlink Overlay'>
            {hasPermission('tiktok_overlay') ? (
              <CamlinkOverlayControl theme={theme} roomId={roomId} />
            ) : renderRestricted('Camlink Overlay')}
          </RequireLogin>
        </div>
      )}

      {/* ── RUNNING TEXT SETUP ── */}
      {activeSection === 'running-text' && (
        <div>
          <header className='mb-6 border-b-4 border-black pb-4'>
            <h1 className='text-3xl font-black uppercase text-black'>Running Text (OBS)</h1>
            <p className='text-slate-700 font-bold mt-2'>Configure the ticker overlay for OBS broadcast.</p>
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
              <header className='mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-black pb-4'>
                <div>
                  <h1 className='text-3xl font-black uppercase text-black'>Premier League</h1>
                  <p className='text-slate-700 font-bold mt-2'>View schedules, scores, standings, and results.</p>
                </div>
                <div className='flex flex-wrap gap-2 items-center'>
                  <div className='flex bg-white border-2 border-black'>
                    <button onClick={() => setPlMode('matches')} className={`px-4 py-2 font-bold uppercase text-xs border-r-2 border-black transition-colors ${plMode === 'matches' ? 'bg-[#00ffff]' : 'hover:bg-slate-100'}`}>Schedules & Results</button>
                    <button onClick={() => setPlMode('table')} className={`px-4 py-2 font-bold uppercase text-xs transition-colors ${plMode === 'table' ? 'bg-[#00ffff]' : 'hover:bg-slate-100'}`}>Standings Table</button>
                  </div>
                  <Button onClick={() => setShowEplSidebar(!showEplSidebar)} variant='outline' className='bg-white'>{showEplSidebar ? '📋 Hide Sidebar' : '📋 Show Sidebar'}</Button>
                  <Button onClick={() => { reloadMatches(); reloadStandings(); reloadNews?.() }} variant='outline' className='bg-[#ccff00]'>🔄 Refresh</Button>
                </div>
              </header>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className={`w-full ${showEplSidebar ? 'lg:w-2/3' : 'lg:w-full'}`}>
                  <div className={panelClass}>
                    <PremierLeagueMain matches={matches} loading={loadingMatches} theme={theme} standings={standings} loadingStandings={loadingStandings} mode={plMode} isAdmin={false} onRefreshStandings={reloadStandings} onRefreshMatches={reloadMatches} />
                  </div>
                </div>
                {showEplSidebar && (
                  <div className="w-full lg:w-1/3">
                    <div className={`${panelClass} flex flex-col gap-6`}>
                      <PremierLeagueRight matches={matches} loading={loadingMatches} news={news} loadingNews={loadingNews} theme={theme} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : renderRestricted('Premier League Dashboard')}
        </RequireLogin>
      )}

      {/* ── UCL ── */}
      {activeSection === 'ucl-table' && (
        <RequireLogin title='UEFA Champions League Dashboard'>
          {hasPermission('ucl') ? (
            <div>
              <header className='mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-black pb-4'>
                <div>
                  <h1 className='text-3xl font-black uppercase text-black'>UEFA Champions League</h1>
                  <p className='text-slate-700 font-bold mt-2'>View UCL tables, schedules, results, and bracket stages.</p>
                </div>
                <div className='flex flex-wrap gap-2 items-center'>
                  <div className='flex bg-white border-2 border-black'>
                    <button onClick={() => setUclMode('matches')} className={`px-4 py-2 font-bold uppercase text-xs border-r-2 border-black transition-colors ${uclMode === 'matches' ? 'bg-[#00ffff]' : 'hover:bg-slate-100'}`}>Schedules & Results</button>
                    <button onClick={() => setUclMode('table')} className={`px-4 py-2 font-bold uppercase text-xs border-r-2 border-black transition-colors ${uclMode === 'table' ? 'bg-[#00ffff]' : 'hover:bg-slate-100'}`}>UCL Table</button>
                    <button onClick={() => setUclMode('bracket')} className={`px-4 py-2 font-bold uppercase text-xs transition-colors ${uclMode === 'bracket' ? 'bg-[#00ffff]' : 'hover:bg-slate-100'}`}>Playoffs Bracket</button>
                  </div>
                  <Button onClick={() => setShowUclSidebar(!showUclSidebar)} variant='outline' className='bg-white'>{showUclSidebar ? '📋 Hide Sidebar' : '📋 Show Sidebar'}</Button>
                  <Button onClick={() => { reloadUclMatches(); reloadUclStandings(); }} variant='outline' className='bg-[#ccff00]'>🔄 Refresh</Button>
                </div>
              </header>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className={`w-full ${showUclSidebar ? 'lg:w-2/3' : 'lg:w-full'}`}>
                  <div className={panelClass}>
                    {uclMode === 'matches' && <ChampionsLeagueMatches matches={uclMatches} loadingMatches={loadingUclMatches} theme={theme} onRefreshMatches={reloadUclMatches} isAdmin={false} />}
                    {uclMode === 'table' && <ChampionsLeagueTable standings={uclStandings} loadingStandings={loadingUclStandings} theme={theme} isAdmin={false} onRefreshStandings={reloadUclStandings} />}
                    {uclMode === 'bracket' && <ChampionsLeagueBracket matches={uclMatches} loadingMatches={loadingUclMatches} theme={theme} isAdmin={false} onRefreshMatches={reloadUclMatches} />}
                  </div>
                </div>
                {showUclSidebar && (
                  <div className="w-full lg:w-1/3">
                    <div className={`${panelClass} flex flex-col gap-6`}>
                      <PremierLeagueRight matches={matches} loading={loadingMatches} news={news} loadingNews={loadingNews} theme={theme} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : renderRestricted('UEFA Champions League Dashboard')}
        </RequireLogin>
      )}

      {/* ── WORLD CUP 2026 ── */}
      {activeSection === 'world-cup' && (
        <RequireLogin title='FIFA World Cup 2026 Dashboard'>
          {hasPermission('world_cup') ? (
            <div>
              <header className='mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-black pb-4'>
                <div>
                  <h1 className='text-3xl font-black uppercase text-black'>FIFA World Cup 2026</h1>
                  <p className='text-slate-700 font-bold mt-2'>View World Cup group tables, schedules, and results.</p>
                </div>
                <div className='flex flex-wrap gap-2 items-center'>
                  <div className='flex bg-white border-2 border-black'>
                    <button onClick={() => setWcMode('matches')} className={`px-4 py-2 font-bold uppercase text-xs border-r-2 border-black transition-colors ${wcMode === 'matches' ? 'bg-[#00ffff]' : 'hover:bg-slate-100'}`}>Schedules & Results</button>
                    <button onClick={() => setWcMode('table')} className={`px-4 py-2 font-bold uppercase text-xs border-r-2 border-black transition-colors ${wcMode === 'table' ? 'bg-[#00ffff]' : 'hover:bg-slate-100'}`}>Standings Table</button>
                    <button onClick={() => setWcMode('knockout')} className={`px-4 py-2 font-bold uppercase text-xs transition-colors ${wcMode === 'knockout' ? 'bg-[#00ffff]' : 'hover:bg-slate-100'}`}>Knockout Stage</button>
                  </div>
                  <Button onClick={() => setShowWcSidebar(!showWcSidebar)} variant='outline' className='bg-white'>{showWcSidebar ? '📋 Hide Sidebar' : '📋 Show Sidebar'}</Button>
                  <Button onClick={() => { reloadWcMatches(); reloadWcStandings(); }} variant='outline' className='bg-[#ccff00]'>🔄 Refresh</Button>
                </div>
              </header>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className={`w-full ${showWcSidebar ? 'lg:w-2/3' : 'lg:w-full'}`}>
                  <div className={panelClass}>
                    <WorldCupMain matches={wcMatches} loading={loadingWcMatches} theme={theme} standings={wcStandings} loadingStandings={loadingWcStandings} mode={wcMode} isAdmin={false} onRefreshStandings={reloadWcStandings} onRefreshMatches={reloadWcMatches} />
                  </div>
                </div>
                {showWcSidebar && (
                  <div className="w-full lg:w-1/3">
                    <div className={`${panelClass} flex flex-col gap-6`}>
                      <PremierLeagueRight matches={matches} loading={loadingMatches} news={news} loadingNews={loadingNews} theme={theme} />
                    </div>
                  </div>
                )}
              </div>
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

export default function UnifiedDashboardPage() {
  return (
    <Suspense fallback={<div className='p-6 text-slate-500 font-bold text-sm'>Loading...</div>}>
      <DashboardPageInner />
    </Suspense>
  )
}
