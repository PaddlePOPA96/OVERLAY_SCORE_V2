'use client'

import { useEffect, useState } from 'react'

import { usePremierLeagueMatches } from '@/features/premier-league/hooks/usePremierLeagueData'
import { useChampionsLeagueMatches } from '@/features/champions-league/hooks/useChampionsLeagueData'
import { useWorldCupMatches } from '@/features/world-cup/hooks/useWorldCupData'
import { LOGO_DATA, buildLogoSrc, buildOtherLogoSrc, resolveAnyClubLogo } from '@/data/logoData'
import { useLayoutSettings } from '@/shared/hooks/useLayoutSettings'

// ─── Helpers ────────────────────────────────────────────────────────────────

function getIndonesianDateString(utcDateStr) {
  if (!utcDateStr) return ''
  const date = new Date(utcDateStr)

  try {
    return date
      .toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
      .toUpperCase()
  } catch (e) {
    return date.toDateString().toUpperCase()
  }
}

function resolveNationalLogo(team) {
  if (team?.crest) return team.crest
  
return buildLogoSrc('FIFA World Cup', team?.name || team?.shortName)
}

const TEAM_STOP_WORDS = new Set(['fc', 'afc', 'cf', 'sc', 'club', 'football', 'the'])

function normalizeTeamName(name) {
  if (!name) return ''

  return name
    .replace(/[()]/g, ' ')
    .replace(/[^A-Za-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => !TEAM_STOP_WORDS.has(w.toLowerCase()))
    .join(' ')
    .toLowerCase()
    .trim()
}

function resolveClubLogo(league, apiName) {
  if (!league || !apiName) return ''
  const clubs = LOGO_DATA[league] || []
  const target = normalizeTeamName(apiName)

  if (!target) return ''

  let best = clubs.find(club => normalizeTeamName(club) === target)

  if (!best) best = clubs.find(club => normalizeTeamName(club).includes(target))
  if (!best) best = clubs.find(club => target.includes(normalizeTeamName(club)))

  if (best) return buildLogoSrc(league, best)

  return buildOtherLogoSrc(apiName)
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SeparatorItem({ dateText }) {
  return (
    <div className='inline-flex items-center gap-1.5 px-4 py-1 mx-2 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300 font-bold text-xs tracking-wider uppercase shadow-inner'>
      <span>📅</span>
      <span>{dateText}</span>
    </div>
  )
}

function MatchItem({ match, activeSource }) {
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const isFinished = match.status === 'FINISHED'
  const showScore = isLive || isFinished

  // Resolve Logos
  let homeLogo = ''
  let awayLogo = ''

  if (activeSource === 'premier-league') {
    homeLogo = resolveClubLogo('England - Premier League', match.homeTeam.name)
    awayLogo = resolveClubLogo('England - Premier League', match.awayTeam.name)
  } else if (activeSource === 'champions-league') {
    homeLogo = resolveAnyClubLogo(match.homeTeam.name)
    awayLogo = resolveAnyClubLogo(match.awayTeam.name)
  } else if (activeSource === 'world-cup') {
    homeLogo = resolveNationalLogo(match.homeTeam)
    awayLogo = resolveNationalLogo(match.awayTeam)
  }

  let timeText = 'VS'

  if (!showScore && match.utcDate) {
    const d = new Date(match.utcDate)

    timeText = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const homeName = match.homeTeam.tla || match.homeTeam.shortName || match.homeTeam.name
  const awayName = match.awayTeam.tla || match.awayTeam.shortName || match.awayTeam.name

  return (
    <div className='inline-flex items-center gap-4 px-8 border-r border-white/10 h-10'>
      {/* Home */}
      <div className='flex items-center gap-2'>
        <span className='text-white font-bold text-lg leading-none'>
          {homeName}
        </span>
        {homeLogo && <img src={homeLogo} alt='' className='w-6 h-6 object-contain' />}
      </div>

      {/* Score Box */}
      <div
        className={`px-3 py-0.5 rounded flex items-center gap-2 ${
          isLive
            ? 'bg-red-600/90 text-white animate-pulse'
            : showScore
              ? 'bg-slate-700/50 text-yellow-400'
              : 'bg-slate-800/80 text-slate-300 border border-slate-700/50'
        }`}
      >
        <span className='font-mono font-bold text-xl leading-none'>
          {showScore
            ? `${match.score.fullTime.home ?? 0}-${match.score.fullTime.away ?? 0}`
            : timeText
          }
        </span>
        {isLive && <span className='text-[10px] uppercase font-bold tracking-tight'>LIVE</span>}
      </div>

      {/* Away */}
      <div className='flex items-center gap-2'>
        {awayLogo && <img src={awayLogo} alt='' className='w-6 h-6 object-contain' />}
        <span className='text-white font-bold text-lg leading-none'>
          {awayName}
        </span>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * RunningTextOverlay
 *
 * @param {boolean} [isPageMode=false]
 *   Set true when rendered as a standalone page (shows loading/empty states).
 *   Set false (default) when embedded inside the overlay iframe (silently returns null).
 */
export default function RunningTextOverlay({ isPageMode = false }) {
  // Load settings
  const { settings, loading: loadingSettings } = useLayoutSettings()

  // Load matches from all three competition sources
  const { matches: plMatches, loadingMatches: loadingPl } = usePremierLeagueMatches()
  const { uclMatches, loadingUclMatches: loadingUcl } = useChampionsLeagueMatches()
  const { wcMatches, loadingWcMatches: loadingWc } = useWorldCupMatches()

  const [tickerItems, setTickerItems] = useState([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeSource = settings?.runningText?.source || 'premier-league'

  let activeMatches = []
  let loadingMatches = false

  if (activeSource === 'premier-league') {
    activeMatches = plMatches || []
    loadingMatches = loadingPl
  } else if (activeSource === 'champions-league') {
    activeMatches = uclMatches || []
    loadingMatches = loadingUcl
  } else if (activeSource === 'world-cup') {
    activeMatches = wcMatches || []
    loadingMatches = loadingWc
  }

  useEffect(() => {
    if (!activeMatches || activeMatches.length === 0) {
      setTickerItems([])
      
return
    }

    if (activeSource === 'world-cup') {
      const live = []
      const finished = []
      const upcoming = []

      activeMatches.forEach(m => {
        if (!m.utcDate) return

        if (m.status === 'IN_PLAY' || m.status === 'PAUSED') {
          live.push(m)
        } else if (m.status === 'FINISHED') {
          finished.push(m)
        } else if (m.status === 'TIMED' || m.status === 'SCHEDULED' || m.status === 'POSTPONED') {
          upcoming.push(m)
        }
      })

      // Sort finished by date descending (newest first) to get the most recent 10
      finished.sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate))
      const recentFinished = finished.slice(0, 10)

      // Sort upcoming by date ascending (soonest first) to get the next 10
      upcoming.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
      const soonestUpcoming = upcoming.slice(0, 10)

      // Combine and sort chronologically (ascending)
      const combined = [...live, ...recentFinished, ...soonestUpcoming]

      combined.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))

      // Group and insert separators
      const itemsWithSeparators = []
      let lastDateStr = null

      combined.forEach(m => {
        const dateStr = getIndonesianDateString(m.utcDate)

        if (dateStr && dateStr !== lastDateStr) {
          itemsWithSeparators.push({
            isSeparator: true,
            key: `sep-${dateStr}-${m.id}`,
            dateText: dateStr
          })
          lastDateStr = dateStr
        }

        itemsWithSeparators.push(m)
      })

      setTickerItems(itemsWithSeparators)
    } else {
      const live = []
      const finished = []

      activeMatches.forEach(m => {
        if (!m.utcDate) return

        if (m.status === 'IN_PLAY' || m.status === 'PAUSED') {
          live.push(m)
        } else if (m.status === 'FINISHED') {
          finished.push(m)
        }
      })

      finished.sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate))
      const recent = finished.slice(0, 10)

      setTickerItems([...live, ...recent])
    }
  }, [activeMatches, activeSource])

  // Guard: avoid hydration mismatch
  if (!mounted) return null

  // Guard: loading & empty states
  if (loadingMatches || loadingSettings) {
    return isPageMode ? <div className='text-white p-2 font-mono text-xs'>Loading data...</div> : null
  }

  if (!tickerItems.length) {
    return isPageMode ? (
      <div className='text-white p-2 font-mono text-xs'>No active or recent matches found.</div>
    ) : null
  }

  const rawY = settings?.runningText?.y
  const rawScale = settings?.runningText?.scale

  const safeY = isNaN(Number(rawY)) ? 0 : Number(rawY)
  const safeScale = isNaN(Number(rawScale)) ? 1 : Number(rawScale)

  // Resolve active static header text based on active source and live matches
  const hasLive = tickerItems.some(i => !i.isSeparator && (i.status === 'IN_PLAY' || i.status === 'PAUSED'))
  let labelText = ''

  if (activeSource === 'premier-league') {
    labelText = hasLive ? 'EPL LIVE' : 'PREMIER LEAGUE'
  } else if (activeSource === 'champions-league') {
    labelText = hasLive ? 'UCL LIVE' : 'CHAMPIONS LEAGUE'
  } else {
    labelText = hasLive ? 'WORLD CUP LIVE' : 'WORLD CUP'
  }

  return (
    <div
      className='fixed inset-0 overflow-hidden flex flex-col justify-end bg-transparent pb-8 pointer-events-none'
      style={{
        transform: `translate(0, ${safeY}px) scale(${safeScale})`,
        transformOrigin: 'bottom left',
        transition: 'transform 0.1s linear',
        zIndex: 20
      }}
    >
      <div className='w-full h-16 bg-gradient-to-r from-slate-900/95 to-slate-800/95 border-y border-purple-500/30 flex items-center shadow-2xl backdrop-blur-md relative z-50 pointer-events-auto'>
        {/* Label (Static) */}
        <div className='h-full bg-purple-800 px-6 flex items-center justify-center z-20 shadow-lg shrink-0 border-r border-purple-500/30 relative'>
          <span className='text-white font-bold uppercase tracking-widest text-sm text-shadow'>
            {labelText}
          </span>
        </div>

        {/* Ticker Content */}
        <div className='relative flex-1 h-full overflow-hidden flex items-center z-0'>
          <div className='ticker-track flex items-center whitespace-nowrap pl-4'>
            {tickerItems.map((item, index) => {
              if (item.isSeparator) {
                return <SeparatorItem key={item.key || `sep-${index}`} dateText={item.dateText} />
              }

              
return <MatchItem key={item.id} match={item} activeSource={activeSource} />
            })}
            {/* Duplicates for seamless loop  */}
            {tickerItems.map((item, index) => {
              if (item.isSeparator) {
                return <SeparatorItem key={`dup-${item.key || `sep-${index}`}`} dateText={item.dateText} />
              }

              
return <MatchItem key={`dup-${item.id}`} match={item} activeSource={activeSource} />
            })}
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .ticker-track {
            display: inline-flex;
            width: max-content;
            animation: marquee ${Math.max(20, tickerItems.length * 10)}s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .text-shadow {
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }
      `
        }}
      />
    </div>
  )
}
