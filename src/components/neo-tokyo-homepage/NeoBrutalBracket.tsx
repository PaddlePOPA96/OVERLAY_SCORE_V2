'use client'

import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Medal } from 'lucide-react'

const resolveNationalLogo = (team: any) => {
  if (team?.crest) return team.crest
  const name = String(team?.name || '').toLowerCase().trim().replace(/\s+/g, '_')
  const map: Record<string, string> = {
    argentina: 'ar', brazil: 'br', france: 'fr', germany: 'de', spain: 'es',
    england: 'gb-eng', italy: 'it', netherlands: 'nl', portugal: 'pt',
    belgium: 'be', croatia: 'hr', uruguay: 'uy', morocco: 'ma', usa: 'us',
    colombia: 'co', mexico: 'mx', switzerland: 'ch', japan: 'jp', senegal: 'sn',
    denmark: 'dk', 'south korea': 'kr', australia: 'au', canada: 'ca', egypt: 'eg',
    ecuador: 'ec', ghana: 'gh', cameroon: 'cm', serbia: 'rs', poland: 'pl',
    wales: 'gb-wls', iran: 'ir', 'costa rica': 'cr', tunisia: 'tn', 'saudi arabia': 'sa'
  }
  return map[name] ? `https://flagcdn.com/w80/${map[name]}.png` : null
}

const formatDateTime = (match: any) => {
  if (!match?.utcDate) return 'TBD'
  const date = new Date(match.utcDate)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ', ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function NeoBrutalBracket({ matches }: { matches: any[] }) {
  const [activeTab, setActiveTab] = useState('ROUND_OF_32')

  const grouped = useMemo(() => {
    const knockoutMatches = (matches || []).filter(m => ['LAST_32', 'ROUND_OF_32', 'LAST_16', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL', 'THIRD_PLACE'].includes(m.stage))
    
    const g: Record<string, any[]> = {
      'ROUND_OF_32': [], 'ROUND_OF_16': [], 'QUARTER_FINALS': [], 'SEMI_FINALS': [], 'FINAL': [], 'THIRD_PLACE': []
    }

    knockoutMatches.forEach(m => {
      let s = m.stage
      if (s === 'LAST_32') s = 'ROUND_OF_32'
      if (s === 'LAST_16') s = 'ROUND_OF_16'
      if (g[s]) g[s].push(m)
    })

    Object.keys(g).forEach(k => {
      g[k].sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
    })

    return g
  }, [matches])

  const NeoBrutalCard = ({ match, title, isThirdPlace = false, isRtl = false }: { match: any, title?: string, isThirdPlace?: boolean, isRtl?: boolean }) => {
    const isFinished = match?.status === 'FINISHED'
    const isLive = match?.status === 'IN_PLAY' || match?.status === 'PAUSED'
    
    let homeWon = false, awayWon = false
    let homeScore = '-', awayScore = '-'
    let isPens = false
    
    if (match) {
      homeScore = match.score?.fullTime?.home ?? (isFinished || isLive ? 0 : '-')
      awayScore = match.score?.fullTime?.away ?? (isFinished || isLive ? 0 : '-')
      isPens = match.score?.penalties && (match.score.penalties.home > 0 || match.score.penalties.away > 0)
      
      if (isFinished) {
        if (match.score?.winner === 'HOME_TEAM') homeWon = true
        else if (match.score?.winner === 'AWAY_TEAM') awayWon = true
        else {
          if (isPens && match.score.penalties.home !== match.score.penalties.away) {
            homeWon = match.score.penalties.home > match.score.penalties.away
            awayWon = match.score.penalties.away > match.score.penalties.home
          } else {
            homeWon = homeScore > awayScore
            awayWon = awayScore > homeScore
          }
        }
      }
    }

    const homeLogo = resolveNationalLogo(match?.homeTeam)
    const awayLogo = resolveNationalLogo(match?.awayTeam)
    const homeName = match?.homeTeam?.shortName || match?.homeTeam?.name || 'TBD'
    const awayName = match?.awayTeam?.shortName || match?.awayTeam?.name || 'TBD'

    return (
      <div className={`group relative z-10 w-[200px] md:w-[240px] bg-white border-[3px] border-black shadow-[6px_6px_0_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0_#D9FF00] transition-all duration-200 cursor-default ${isRtl ? 'dir-rtl' : 'dir-ltr'}`}>
        {/* Header */}
        <div className={`flex justify-between items-center border-b-[3px] border-black px-2 py-1.5 bg-[#F5F4F0] ${isRtl ? 'flex-row-reverse' : ''}`}>
           <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-black">
             {title || (isThirdPlace ? 'THIRD PLACE' : 'MATCH')}
           </span>
           {match && match.id && (
             <span className={`text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 border-2 border-black ${isFinished ? 'bg-black text-white' : isLive ? 'bg-[#FF0055] text-white animate-pulse' : 'bg-[#D9FF00] text-black'}`}>
               {isFinished ? 'FT' : isLive ? 'LIVE' : formatDateTime(match)}
             </span>
           )}
        </div>

        {/* Content */}
        <div className="flex flex-col">
          {/* Home */}
          <div className={`flex items-center justify-between p-2 border-b-[3px] border-black ${homeWon ? 'bg-[#D9FF00]/20' : ''} ${isRtl ? 'flex-row-reverse' : ''}`}>
             <div className={`flex items-center gap-2 overflow-hidden w-[80%] ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
               {homeLogo ? (
                 <img src={homeLogo} alt={homeName} className="w-6 h-6 md:w-8 md:h-8 object-cover border-2 border-black bg-white" />
               ) : (
                 <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-black bg-gray-200" />
               )}
               <span className={`text-sm md:text-base truncate uppercase tracking-tight ${homeWon ? 'font-black' : 'font-bold'} text-black`}>
                 {homeName}
               </span>
             </div>
             <div className={`flex items-center gap-1 shrink-0 bg-black text-white px-2 py-0.5 transform ${isRtl ? 'skew-x-[10deg]' : 'skew-x-[-10deg]'}`}>
                <span className={`text-sm md:text-base font-black ${isRtl ? 'skew-x-[-10deg]' : 'skew-x-[10deg]'}`}>{homeScore}</span>
             </div>
          </div>
          
          {/* Away */}
          <div className={`flex items-center justify-between p-2 ${awayWon ? 'bg-[#D9FF00]/20' : ''} ${isRtl ? 'flex-row-reverse' : ''}`}>
             <div className={`flex items-center gap-2 overflow-hidden w-[80%] ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
               {awayLogo ? (
                 <img src={awayLogo} alt={awayName} className="w-6 h-6 md:w-8 md:h-8 object-cover border-2 border-black bg-white" />
               ) : (
                 <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-black bg-gray-200" />
               )}
               <span className={`text-sm md:text-base truncate uppercase tracking-tight ${awayWon ? 'font-black' : 'font-bold'} text-black`}>
                 {awayName}
               </span>
             </div>
             <div className={`flex items-center gap-1 shrink-0 bg-black text-white px-2 py-0.5 transform ${isRtl ? 'skew-x-[10deg]' : 'skew-x-[-10deg]'}`}>
                <span className={`text-sm md:text-base font-black ${isRtl ? 'skew-x-[-10deg]' : 'skew-x-[10deg]'}`}>{awayScore}</span>
             </div>
          </div>
        </div>
      </div>
    )
  }

  const MiniTree = ({ match1, match2, nextMatch, title1, titleNext, isRtl = false }: any) => {
    return (
      <div className="flex items-center justify-center w-full my-4 overflow-x-auto webkit-scrollbar-modern pb-4">
        <div className={`flex items-stretch min-w-max px-2 md:px-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="flex flex-col gap-6 relative z-10">
            <NeoBrutalCard match={match1} title={title1} isRtl={isRtl} />
            <NeoBrutalCard match={match2} title={title1} isRtl={isRtl} />
          </div>
          
          <div className="flex flex-col justify-between py-[60px] relative w-6 md:w-8 z-0">
            <div className="border-t-[4px] border-black w-full"></div>
            <div className="border-t-[4px] border-black w-full"></div>
            <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-[60px] bottom-[60px] w-[4px] bg-black`}></div>
            <div className={`absolute ${isRtl ? 'left-[-12px] md:left-[-16px]' : 'right-[-12px] md:right-[-16px]'} top-1/2 w-3 md:w-4 border-t-[4px] border-black`}></div>
          </div>
          
          <div className={`flex items-center relative z-10 ${isRtl ? 'mr-3 md:mr-4' : 'ml-3 md:ml-4'}`}>
            <NeoBrutalCard match={nextMatch} title={titleNext} isRtl={isRtl} />
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'ROUND_OF_32', label: '32 BESAR' },
    { id: 'ROUND_OF_16', label: '16 BESAR' },
    { id: 'QUARTER_FINALS', label: 'QUARTER FINAL' },
    { id: 'SEMI_FINAL_FINAL', label: 'SEMI FINAL & FINAL' },
  ]

  const renderContent = () => {
    if (activeTab === 'SEMI_FINAL_FINAL') {
      const sfMatches = [(grouped['SEMI_FINALS'] || [])[0] || null, (grouped['SEMI_FINALS'] || [])[1] || null]
      const finalMatch = (grouped['FINAL'] || [])[0] || null
      const thirdPlace = (grouped['THIRD_PLACE'] || [])[0] || null
      let displayFinal = finalMatch

      return (
        <div className="flex flex-col w-full items-center">
          <div className="w-full flex flex-col xl:flex-row justify-center items-center xl:items-stretch gap-8 xl:gap-0 min-h-[400px]">
             {/* Left SF */}
             <div className="flex items-center justify-center w-full xl:w-auto">
                <MiniTree 
                  match1={(grouped['QUARTER_FINALS'] || [])[0] || null} match2={(grouped['QUARTER_FINALS'] || [])[1] || null} nextMatch={sfMatches[0]} 
                  title1="QUARTER FINAL" titleNext="SEMI FINAL" isRtl={false} 
                />
             </div>

             {/* Center Final */}
             <div className="flex flex-col items-center justify-center relative z-20 px-8">
                <div className="mb-6">
                  <Trophy className="w-16 h-16 text-[#D9FF00] drop-shadow-[0_0_15px_rgba(217,255,0,0.8)]" />
                </div>
                <div className="transform md:scale-110">
                  <NeoBrutalCard match={displayFinal} title="GRAND FINAL" />
                </div>
             </div>

             {/* Right SF */}
             <div className="flex items-center justify-center w-full xl:w-auto">
                <MiniTree 
                  match1={(grouped['QUARTER_FINALS'] || [])[2] || null} match2={(grouped['QUARTER_FINALS'] || [])[3] || null} nextMatch={sfMatches[1]} 
                  title1="QUARTER FINAL" titleNext="SEMI FINAL" isRtl={true} 
                />
             </div>
          </div>

          <div className="mt-12 flex flex-col items-center">
            <div className="mb-6">
              <Medal className="w-12 h-12 text-[#b08d57] drop-shadow-[0_0_10px_rgba(176,141,87,0.8)]" />
            </div>
            <NeoBrutalCard match={thirdPlace} title="THIRD PLACE" isThirdPlace />
          </div>
        </div>
      )
    }

    let nextStage = ''
    let expectedCount = 0
    let expectedNextCount = 0

    if (activeTab === 'ROUND_OF_32') { nextStage = 'ROUND_OF_16'; expectedCount = 16; expectedNextCount = 8; }
    else if (activeTab === 'ROUND_OF_16') { nextStage = 'QUARTER_FINALS'; expectedCount = 8; expectedNextCount = 4; }
    else if (activeTab === 'QUARTER_FINALS') { nextStage = 'SEMI_FINALS'; expectedCount = 4; expectedNextCount = 2; }

    const currentMatches = Array.from({ length: expectedCount }).map((_, i) => (grouped[activeTab] || [])[i] || null)
    const nextMatches = Array.from({ length: expectedNextCount }).map((_, i) => (grouped[nextStage] || [])[i] || null)

    const trees = []
    for (let i = 0; i < expectedNextCount; i++) {
      const m1 = currentMatches[i * 2]
      const m2 = currentMatches[i * 2 + 1]
      let nMatch = nextMatches[i]

      const isRightBracket = i % 2 === 1

      trees.push(
        <MiniTree 
          key={`tree-${activeTab}-${i}`}
          match1={m1}
          match2={m2}
          nextMatch={nMatch}
          title1={activeTab.replace(/_/g, ' ')}
          titleNext={nextStage.replace(/_/g, ' ')}
          isRtl={isRightBracket}
        />
      )
    }

    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-4 w-full mt-8">
        {trees}
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col py-10 px-4 md:px-8 max-w-[1400px] mx-auto">
      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-4 mb-8 z-30 relative">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 border-[3px] border-black font-black uppercase tracking-widest transition-transform shadow-[4px_4px_0_#000] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0_#000] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[0px_0px_0_#000] ${activeTab === tab.id ? 'bg-[#D9FF00] text-black' : 'bg-white text-black'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="w-full flex justify-center min-h-[600px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
