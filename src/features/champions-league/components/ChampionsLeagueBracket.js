"use client";

import { LOGO_DATA, buildLogoSrc, buildOtherLogoSrc } from "@/lib/logoData";

const TEAM_STOP_WORDS = new Set([
    "fc",
    "afc",
    "cf",
    "sc",
    "club",
    "football",
    "the",
]);

const normalizeTeamName = (name) => {
    if (!name) return "";
    return name
        .replace(/[()]/g, " ")
        .replace(/[^A-Za-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => !TEAM_STOP_WORDS.has(w.toLowerCase()))
        .join(" ")
        .toLowerCase()
        .trim();
};

const resolveAnyClubLogo = (apiName) => {
    if (!apiName) return "";
    const rawTarget = normalizeTeamName(apiName);
    return buildOtherLogoSrc(apiName);
};

export function ChampionsLeagueBracket({
    matches,
    loadingMatches,
    theme,
    isAdmin,
    onRefreshMatches,
}) {
    const isDark = theme === "dark";

    const cardClass = isDark
        ? "bg-black/40 border border-slate-800"
        : "bg-white border border-slate-200 shadow-sm";

    const headingClass = isDark
        ? "text-xs uppercase tracking-[0.16em] text-gray-100"
        : "text-xs uppercase tracking-[0.16em] text-gray-500";

    // Filter for knockout stages
    const knockoutStages = ["ROUND_OF_16", "QUARTER_FINALS", "SEMI_FINALS", "FINAL"];

    const bracketMatches = matches?.filter(m => knockoutStages.includes(m.stage)) || [];

    // Group by stage
    const matchesByStage = knockoutStages.reduce((acc, stage) => {
        acc[stage] = bracketMatches.filter(m => m.stage === stage);
        return acc;
    }, {});

    const renderMatchCard = (match) => {
        const homeName = match.homeTeam?.shortName || match.homeTeam?.name || "TBD";
        const awayName = match.awayTeam?.shortName || match.awayTeam?.name || "TBD";
        const isFinished = match.status === "FINISHED";
        const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";

        // Logic for score display using optional chaining
        const homeScore = match.score?.fullTime?.home ?? "-";
        const awayScore = match.score?.fullTime?.away ?? "-";

        return (
            <div key={match.id} className={`flex flex-col gap-2 p-3 rounded-lg border my-2 ${isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-white"}`}>
                {/* Date / Status Header */}
                <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-700/50 mb-1">
                    <span className="text-[9px] text-slate-500 font-mono">
                        {match.utcDate ? new Date(match.utcDate).toLocaleDateString() : ""}
                    </span>
                    <span className={`text-[9px] font-bold uppercase ${isLive ? "text-red-400" : "text-slate-500"}`}>
                        {match.status}
                    </span>
                </div>

                {/* Home Team */}
                <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                        {/* Placeholder logo if resolving logic is complex without shared util */}
                        <div className="w-4 h-4 rounded-full bg-slate-700 shrink-0">
                            <img src={resolveAnyClubLogo(match.homeTeam?.name)} alt="" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                        <span className={`truncate ${isDark ? "text-slate-200" : "text-slate-800"}`}>{homeName}</span>
                    </div>
                    <span className={`font-mono font-bold ${isDark ? "text-white" : "text-black"}`}>{homeScore}</span>
                </div>

                {/* Away Team */}
                <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-4 h-4 rounded-full bg-slate-700 shrink-0">
                            <img src={resolveAnyClubLogo(match.awayTeam?.name)} alt="" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                        <span className={`truncate ${isDark ? "text-slate-200" : "text-slate-800"}`}>{awayName}</span>
                    </div>
                    <span className={`font-mono font-bold ${isDark ? "text-white" : "text-black"}`}>{awayScore}</span>
                </div>
            </div>
        );
    };

    const renderStageColumn = (stageName, label) => {
        const stageMatches = matchesByStage[stageName] || [];

        return (
            <div className="min-w-[200px] flex flex-col h-full mx-2">
                <div className={`text-center py-2 mb-4 rounded border ${isDark ? "bg-slate-900 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"} text-[10px] font-bold uppercase tracking-widest`}>
                    {label}
                </div>
                <div className="flex flex-col justify-center gap-4 flex-grow py-4">
                    {stageMatches.length > 0 ? (
                        stageMatches.map(renderMatchCard)
                    ) : (
                        <div className="flex items-center justify-center p-4 border border-dashed border-slate-800 rounded opacity-30 text-[10px] uppercase">
                            TBD
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- Sub Table Styles ---
    const thClass = isDark
        ? "text-left py-3 px-4 font-semibold text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800"
        : "text-left py-3 px-4 font-semibold text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-200";

    const cellClass = isDark
        ? "py-3 px-4 text-slate-300 text-xs border-b border-slate-800/50"
        : "py-3 px-4 text-slate-700 text-xs border-b border-slate-100";

    return (
        <div className="space-y-8 w-full animate-in fade-in duration-500">

            {/* Visual Bracket Section */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className={headingClass}>Knockout Bracket</h3>
                    {isAdmin && (
                        <button
                            onClick={onRefreshMatches}
                            disabled={loadingMatches}
                            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded transition"
                        >
                            Refresh
                        </button>
                    )}
                </div>

                <div className={`${cardClass} rounded-2xl p-6 overflow-x-auto custom-scrollbar`}>
                    {loadingMatches ? (
                        <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                            Loading Bracket Data...
                        </div>
                    ) : (
                        <div className="flex flex-nowrap justify-between gap-8 min-w-[800px]">
                            {renderStageColumn("ROUND_OF_16", "Round of 16")}
                            {renderStageColumn("QUARTER_FINALS", "Quarter Finals")}
                            {renderStageColumn("SEMI_FINALS", "Semi Finals")}
                            {renderStageColumn("FINAL", "Final")}
                        </div>
                    )}
                </div>
            </section>

            {/* Sub Table Section */}
            <section>
                <div className="mb-4">
                    <h3 className={headingClass}>Match Details (Sub Table)</h3>
                </div>
                <div className={`${cardClass} rounded-2xl overflow-hidden`}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className={thClass}>Stage</th>
                                    <th className={thClass}>Date</th>
                                    <th className={thClass}>Matchup</th>
                                    <th className={thClass}>Score</th>
                                    <th className={thClass}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingMatches ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-slate-500 text-xs">Loading...</td></tr>
                                ) : bracketMatches.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-slate-500 text-xs italic">No knockout matches scheduled yet.</td></tr>
                                ) : (
                                    bracketMatches.map(m => (
                                        <tr key={m.id} className={`transition-colors ${isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50"}`}>
                                            <td className={cellClass}>
                                                <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded text-[10px] uppercase font-bold">
                                                    {m.stage?.replace(/_/g, " ")}
                                                </span>
                                            </td>
                                            <td className={cellClass}>
                                                {m.utcDate ? (
                                                    <>
                                                        {new Date(m.utcDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        <div className="text-[10px] text-slate-500 mt-0.5">
                                                            {new Date(m.utcDate).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </>
                                                ) : "-"}
                                            </td>
                                            <td className={cellClass}>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={m.score?.winner === "HOME_TEAM" ? "text-yellow-400 font-bold" : ""}>
                                                            {m.homeTeam?.shortName || m.homeTeam?.name || "TBD"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={m.score?.winner === "AWAY_TEAM" ? "text-yellow-400 font-bold" : ""}>
                                                            {m.awayTeam?.shortName || m.awayTeam?.name || "TBD"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={cellClass}>
                                                <div className="flex flex-col gap-1 font-mono">
                                                    <span>{m.score?.fullTime?.home ?? "-"}</span>
                                                    <span>{m.score?.fullTime?.away ?? "-"}</span>
                                                </div>
                                            </td>
                                            <td className={cellClass}>
                                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${m.status === "FINISHED" ? "bg-green-500" :
                                                    m.status === "IN_PLAY" || m.status === "PAUSED" ? "bg-red-500 animate-pulse" :
                                                        "bg-slate-500"
                                                    }`}></span>
                                                {m.status}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
}
