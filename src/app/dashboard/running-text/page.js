"use client";

import { useEffect, useState } from "react";
import { usePremierLeagueMatches } from "@/features/premier-league/hooks/usePremierLeagueData";
import { LOGO_DATA, buildLogoSrc, buildOtherLogoSrc } from "@/lib/logoData";

export default function RunningTextOverlay() {
    const { matches, loadingMatches } = usePremierLeagueMatches();
    const [tickerItems, setTickerItems] = useState([]);

    useEffect(() => {
        if (!matches) return;

        // Filter Logic:
        // 1. Live Matches (IN_PLAY, PAUSED)
        // 2. Recent Finished Matches (Last 10 matches sorted by date)

        const live = [];
        const finished = [];

        matches.forEach((m) => {
            if (!m.utcDate) return;

            if (m.status === "IN_PLAY" || m.status === "PAUSED") {
                live.push(m);
            } else if (m.status === "FINISHED") {
                finished.push(m);
            }
        });

        // Sort finished by date descending (newest first)
        finished.sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate));

        // Take top 10 recent finished matches
        const recent = finished.slice(0, 10);

        // Combine
        setTickerItems([...live, ...recent]);

    }, [matches]);

    // If loading or no data matches
    if (loadingMatches) return <div className="text-white p-2 font-mono text-xs">Loading data...</div>;
    if (!tickerItems.length) return <div className="text-white p-2 font-mono text-xs">No active or recent matches found.</div>;

    return (
        <div className="fixed inset-0 overflow-hidden flex flex-col justify-end bg-transparent pb-8">
            {/* 
        Marquee Container 
        Placed at bottom (lower third style)
      */}
            <div className="w-full h-16 bg-gradient-to-r from-slate-900/95 to-slate-800/95 border-y border-purple-500/30 flex items-center shadow-2xl backdrop-blur-md relative z-50">

                {/* Label (Static) */}
                <div className="h-full bg-purple-800 px-6 flex items-center justify-center z-20 shadow-lg shrink-0 border-r border-purple-500/30 relative">
                    <span className="text-white font-bold uppercase tracking-widest text-sm text-shadow">
                        {tickerItems.some(i => i.status === 'IN_PLAY') ? "LIVE SCORES" : "LATEST RESULTS"}
                    </span>
                </div>

                {/* Ticker Content */}
                <div className="relative flex-1 h-full overflow-hidden flex items-center z-0">
                    {/* Inner slider must take content width */}
                    <div className="ticker-track flex items-center whitespace-nowrap pl-4">
                        {tickerItems.map((m) => (
                            <MatchItem key={m.id} match={m} />
                        ))}
                        {/* Duplicates for seamless loop  */}
                        {tickerItems.map((m) => (
                            <MatchItem key={`dup-${m.id}`} match={m} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Plain Style Tag to ensure it works without styled-jsx parser issues */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .ticker-track {
            display: inline-flex;
            width: max-content; /* Ensure it takes full width of content */
            animation: marquee ${Math.max(20, tickerItems.length * 10)}s linear infinite;
        }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } 
        }

        .text-shadow {
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }
      `}} />
        </div>
    );
}

function MatchItem({ match }) {
    const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";

    // Resolve Logos
    const league = "England - Premier League";
    const homeLogo = resolveClubLogo(league, match.homeTeam.name);
    const awayLogo = resolveClubLogo(league, match.awayTeam.name);

    return (
        <div className="inline-flex items-center gap-4 px-8 border-r border-white/10 h-10">

            {/* Home */}
            <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg leading-none">{match.homeTeam.tla || match.homeTeam.shortName}</span>
                {homeLogo && <img src={homeLogo} alt="" className="w-6 h-6 object-contain" />}
            </div>

            {/* Score Box */}
            <div className={`px-3 py-0.5 rounded flex items-center gap-2 ${isLive ? 'bg-red-600/90 text-white animate-pulse' : 'bg-slate-700/50 text-yellow-400'}`}>
                <span className="font-mono font-bold text-xl leading-none">
                    {match.score.fullTime.home ?? 0}-{match.score.fullTime.away ?? 0}
                </span>
                {isLive && <span className="text-[10px] uppercase font-bold tracking-tight">LIVE</span>}
            </div>

            {/* Away */}
            <div className="flex items-center gap-2">
                {awayLogo && <img src={awayLogo} alt="" className="w-6 h-6 object-contain" />}
                <span className="text-white font-bold text-lg leading-none">{match.awayTeam.tla || match.awayTeam.shortName}</span>
            </div>
        </div>
    );
}


// --- Logo Helper ---

const TEAM_STOP_WORDS = new Set(["fc", "afc", "cf", "sc", "club", "football", "the"]);

function normalizeTeamName(name) {
    if (!name) return "";
    return name.replace(/[()]/g, " ").replace(/[^A-Za-z0-9\s]/g, " ").split(/\s+/).filter((w) => !TEAM_STOP_WORDS.has(w.toLowerCase())).join(" ").toLowerCase().trim();
}

function resolveClubLogo(league, apiName) {
    if (!league || !apiName) return "";
    const clubs = LOGO_DATA[league] || [];
    const target = normalizeTeamName(apiName);
    if (!target) return "";

    let best = clubs.find((club) => normalizeTeamName(club) === target);
    if (!best) best = clubs.find((club) => normalizeTeamName(club).includes(target));
    if (!best) best = clubs.find((club) => target.includes(normalizeTeamName(club)));

    if (best) return buildLogoSrc(league, best);
    return buildOtherLogoSrc(apiName);
}
