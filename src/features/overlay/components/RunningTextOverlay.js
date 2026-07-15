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
    <div className='inline-flex items-center gap-4 px-6 text-[#fde047] font-black text-xl tracking-widest uppercase'>
      <span className='tracking-tighter'>[ {dateText} ]</span>
      <span className='text-[#fde047] font-black text-2xl'>/</span>
    </div>
  )
}

function ClockItem() {
  const [timeParts, setTimeParts] = useState({ h: '00', m: '00' })

  useEffect(() => {
    const updateTime = () => {
      const d = new Date()
      // format as hour and minute
      const formatter = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false })
      const parts = formatter.formatToParts(d)
      const h = parts.find(p => p.type === 'hour')?.value || '00'
      const m = parts.find(p => p.type === 'minute')?.value || '00'
      setTimeParts({ h, m })
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <span className='text-black font-sans font-black text-3xl tracking-wide whitespace-nowrap flex items-center justify-center'>
      <span>{timeParts.h}</span>
      <span className='animate-blink mx-1 -mt-1'>:</span>
      <span>{timeParts.m}</span>
    </span>
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
    homeLogo = match.homeTeam?.name ? resolveClubLogo('England - Premier League', match.homeTeam.name) : ''
    awayLogo = match.awayTeam?.name ? resolveClubLogo('England - Premier League', match.awayTeam.name) : ''
  } else if (activeSource === 'champions-league') {
    homeLogo = match.homeTeam?.name ? resolveAnyClubLogo(match.homeTeam.name) : ''
    awayLogo = match.awayTeam?.name ? resolveAnyClubLogo(match.awayTeam.name) : ''
  } else if (activeSource === 'world-cup') {
    homeLogo = match.homeTeam ? resolveNationalLogo(match.homeTeam) : ''
    awayLogo = match.awayTeam ? resolveNationalLogo(match.awayTeam) : ''
  }

  let timeText = 'VS'

  if (!showScore && match.utcDate) {
    const d = new Date(match.utcDate)

    timeText = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const homeName = match.homeTeam?.tla || match.homeTeam?.shortName || match.homeTeam?.name || 'TBA'
  const awayName = match.awayTeam?.tla || match.awayTeam?.shortName || match.awayTeam?.name || 'TBA'

  return (
    <div className='inline-flex items-center gap-4 px-6 h-full text-white font-black text-xl leading-none uppercase whitespace-nowrap'>
      {/* Home */}
      <span className='flex items-center gap-3'>
        {homeName}
        {homeLogo && <img src={homeLogo} alt='' className='w-8 h-8 object-contain drop-shadow-[2px_2px_0_rgba(255,255,255,0.5)]' />}
      </span>

      {/* Score Box */}
      <span className={`font-mono text-2xl px-4 ${isLive ? 'text-[#ff90e8] animate-pulse' : 'text-[#fde047]'}`}>
        {showScore
          ? `${match.score.fullTime.home ?? 0} - ${match.score.fullTime.away ?? 0}`
          : timeText
        }
        {isLive && <span className='ml-3 text-xs uppercase bg-[#ff90e8] text-black border-2 border-black px-1.5 py-0.5 tracking-tight shadow-[2px_2px_0_0_#fff] animate-none inline-block -translate-y-1'>LIVE</span>}
      </span>

      {/* Away */}
      <span className='flex items-center gap-3'>
        {awayLogo && <img src={awayLogo} alt='' className='w-8 h-8 object-contain drop-shadow-[2px_2px_0_rgba(255,255,255,0.5)]' />}
        {awayName}
      </span>

      <span className='ml-8 text-[#fde047] font-black text-2xl'>/</span>
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
    if (activeSource === 'custom-text') {
      const texts = settings?.runningText?.customTexts || (settings?.runningText?.customText ? [settings?.runningText?.customText] : ['YOUR CUSTOM TEXT HERE'])
      
      const newItems = texts.filter(t => t.trim()).map((text, idx) => ({
        isCustom: true,
        id: `custom-${idx}`,
        text: text
      }))
      
      if (newItems.length === 0) {
        newItems.push({ isCustom: true, id: 'custom-default', text: 'YOUR CUSTOM TEXT HERE' })
      }

      setTickerItems(newItems)
      return
    }

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
  }, [activeMatches, activeSource, settings?.runningText?.customText, settings?.runningText?.customTexts])

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
      <div className='w-full h-16 bg-black border-t-4 border-b-4 border-black flex items-center relative z-50 pointer-events-auto shadow-[0px_-4px_0px_0px_#fde047]'>
        {/* Label (Static) */}
        <div className='h-full bg-[#fde047] px-8 flex items-center justify-center z-20 shrink-0 relative min-w-[180px] border-r-8 border-black -skew-x-12 -ml-6 pl-10 shadow-[8px_0px_0px_0px_#fff]'>
          <div className='skew-x-12 flex items-center justify-center'>
            <ClockItem />
          </div>
        </div>

        {/* Ticker Content */}
        <div className='relative flex-1 h-full overflow-hidden flex items-center z-0'>
          <div className='ticker-track flex items-center whitespace-nowrap h-full'>
            {tickerItems.map((item, index) => {
              if (item.isCustom) {
                return (
                  <div key={item.id} className='inline-flex items-center gap-6 px-6 h-full'>
                    <span className='text-white font-black text-2xl uppercase tracking-widest'>
                      {item.text}
                    </span>
                    <span className='text-[#fde047] font-black text-2xl'>/</span>
                  </div>
                )
              }
              if (item.isSeparator) {
                return <SeparatorItem key={item.key || `sep-${index}`} dateText={item.dateText} />
              }

              return <MatchItem key={item.id} match={item} activeSource={activeSource} />
            })}
            {/* Duplicates for seamless loop  */}
            {tickerItems.map((item, index) => {
              if (item.isCustom) {
                return (
                  <div key={`dup-${item.id}`} className='inline-flex items-center gap-6 px-6 h-full'>
                    <span className='text-white font-black text-2xl uppercase tracking-widest'>
                      {item.text}
                    </span>
                    <span className='text-[#fde047] font-black text-2xl'>/</span>
                  </div>
                )
              }
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
            animation: marquee ${Math.max(40, tickerItems.length * 20)}s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
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
