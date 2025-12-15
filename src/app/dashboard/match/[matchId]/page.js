"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebaseAuth";
import { db } from "@/lib/firebaseDb";
import { ref, get, set, push } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, useParams } from "next/navigation";
import AnimatedMatchField from "@/features/match-simulation/components/AnimatedMatchField";

export default function MatchSimulationPage() {
    const router = useRouter();
    const params = useParams();
    const opponentId = params.matchId;

    const [currentUserId, setCurrentUserId] = useState(null);
    const [homeTeam, setHomeTeam] = useState(null);
    const [awayTeam, setAwayTeam] = useState(null);
    const [matchStatus, setMatchStatus] = useState("loading"); // loading, ready, simulating, finished
    const [matchResult, setMatchResult] = useState(null);
    const [matchEvents, setMatchEvents] = useState([]);

    // Listen to auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUserId(user?.uid || null);
        });
        return () => unsubscribe();
    }, []);

    // Load both teams from Firebase (ONE-TIME READ to reduce spam)
    useEffect(() => {
        if (!currentUserId || !opponentId) return;

        const loadTeams = async () => {
            try {
                // Load home team (one-time read)
                const homeRef = ref(db, `dream_team/${currentUserId}`);
                const homeSnapshot = await get(homeRef);
                if (homeSnapshot.exists()) {
                    const data = homeSnapshot.val();
                    console.log('[Match] Home team data:', data);
                    setHomeTeam(data);
                }

                // Load away team (one-time read)
                const awayRef = ref(db, `dream_team/${opponentId}`);
                const awaySnapshot = await get(awayRef);
                if (awaySnapshot.exists()) {
                    const data = awaySnapshot.val();
                    console.log('[Match] Away team data:', data);
                    setAwayTeam(data);
                    setMatchStatus("ready");
                }
            } catch (error) {
                console.error('[Match] Error loading teams:', error);
                setMatchStatus("error");
            }
        };

        loadTeams();
    }, [currentUserId, opponentId]);

    // Calculate team rating
    const calculateTeamRating = (team) => {
        if (!team || !team.players) return 0;
        const totalRating = team.players.reduce((sum, p) => sum + (p.rating || 75), 0);
        return Math.round(totalRating / team.players.length);
    };

    // Simulate match
    const simulateMatch = () => {
        setMatchStatus("simulating");
        setMatchEvents([]);

        const homeRating = calculateTeamRating(homeTeam);
        const awayRating = calculateTeamRating(awayTeam);

        // Simple simulation based on ratings
        const homeChance = homeRating / (homeRating + awayRating);
        const events = [];
        let homeScore = 0;
        let awayScore = 0;

        // Simulate 10 key moments
        for (let i = 0; i < 10; i++) {
            const minute = Math.floor(Math.random() * 90) + 1;
            const random = Math.random();

            if (random < homeChance * 0.3) {
                // Home team scores
                homeScore++;
                const scorer = homeTeam.players[Math.floor(Math.random() * homeTeam.players.length)];
                events.push({
                    minute,
                    type: "goal",
                    team: "home",
                    player: scorer.name,
                    message: `⚽ GOAL! ${scorer.name} scores for your team!`,
                });
            } else if (random > 1 - (1 - homeChance) * 0.3) {
                // Away team scores
                awayScore++;
                const scorer = awayTeam.players[Math.floor(Math.random() * awayTeam.players.length)];
                events.push({
                    minute,
                    type: "goal",
                    team: "away",
                    player: scorer.name,
                    message: `⚽ Goal by ${scorer.name} (Opponent)`,
                });
            }
        }

        // Sort events by minute
        events.sort((a, b) => a.minute - b.minute);

        // Animate events
        let eventIndex = 0;
        const interval = setInterval(() => {
            if (eventIndex < events.length) {
                setMatchEvents((prev) => [...prev, events[eventIndex]]);
                eventIndex++;
            } else {
                clearInterval(interval);
                setMatchStatus("finished");
                setMatchResult({ homeScore, awayScore });
                saveMatchResult(homeScore, awayScore, events);
            }
        }, 1000);
    };

    // Save match result to Firebase
    const saveMatchResult = async (homeScore, awayScore, events) => {
        if (!currentUserId) return;

        const matchData = {
            homeUserId: currentUserId,
            awayUserId: opponentId,
            homeScore,
            awayScore,
            events,
            timestamp: Date.now(),
            winner: homeScore > awayScore ? "home" : awayScore > homeScore ? "away" : "draw",
        };

        try {
            const matchesRef = ref(db, "matches");
            await push(matchesRef, matchData);
            console.log("Match result saved to Firebase");
        } catch (error) {
            console.error("Error saving match result:", error);
        }
    };

    if (!currentUserId) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Please Login</h2>
                </div>
            </div>
        );
    }

    if (matchStatus === "error") {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="text-center text-white bg-red-900/20 border border-red-800 p-8 rounded-xl max-w-md">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold mb-2">Failed to Load Match</h2>
                    <p className="text-slate-300 mb-6">
                        We couldn't load the team data. This usually happens if an ad-blocker or network firewall is blocking the connection.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-700 hover:bg-red-600 px-6 py-2 rounded-lg font-bold transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (matchStatus === "loading") {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="animate-spin text-6xl mb-4">⚽</div>
                    <p className="text-xl">Loading match...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push("/dashboard/match")}
                        className="text-cyan-400 hover:text-cyan-300 mb-4 flex items-center gap-2"
                    >
                        ← Back to Match Selection
                    </button>
                    <h1 className="text-4xl font-bold text-white mb-2">Match Simulation</h1>
                </div>

                {/* Match Info */}
                <div className="bg-slate-900 rounded-xl p-8 mb-6 border border-slate-800">
                    <div className="grid grid-cols-3 gap-4 items-center">
                        {/* Home Team */}
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-cyan-400 mb-2">Your Team</h3>
                            <div className="text-4xl font-bold text-white mb-2">
                                {matchResult ? matchResult.homeScore : "-"}
                            </div>
                            <div className="text-sm text-slate-400">
                                Rating: {calculateTeamRating(homeTeam)}
                            </div>
                            <div className="text-xs text-slate-500">
                                {homeTeam?.players?.length || 0} players
                            </div>
                        </div>

                        {/* VS */}
                        <div className="text-center">
                            <div className="text-6xl mb-2">⚔️</div>
                            <div className="text-xl font-bold text-slate-400">VS</div>
                        </div>

                        {/* Away Team */}
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-orange-400 mb-2">Opponent</h3>
                            <div className="text-4xl font-bold text-white mb-2">
                                {matchResult ? matchResult.awayScore : "-"}
                            </div>
                            <div className="text-sm text-slate-400">
                                Rating: {calculateTeamRating(awayTeam)}
                            </div>
                            <div className="text-xs text-slate-500">
                                {awayTeam?.players?.length || 0} players
                            </div>
                        </div>
                    </div>

                    {/* Start Button - Removed, animation starts automatically */}
                    {matchStatus === "ready" && (
                        <div className="mt-8 text-center">
                            <p className="text-slate-400">Click Play button on the field to start the match</p>
                        </div>
                    )}

                    {/* Match Result */}
                    {matchStatus === "finished" && matchResult && (
                        <div className="mt-8 text-center">
                            <div className="text-3xl font-bold mb-4">
                                {matchResult.homeScore > matchResult.awayScore && (
                                    <span className="text-emerald-400">🏆 You Win!</span>
                                )}
                                {matchResult.homeScore < matchResult.awayScore && (
                                    <span className="text-red-400">😢 You Lose</span>
                                )}
                                {matchResult.homeScore === matchResult.awayScore && (
                                    <span className="text-yellow-400">🤝 Draw</span>
                                )}
                            </div>
                            <button
                                onClick={() => router.push("/dashboard/match")}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                            >
                                Play Another Match
                            </button>
                        </div>
                    )}
                </div>

                {/* Animated Match Field - Always show */}
                {matchStatus === "ready" && (
                    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                        <h3 className="text-xl font-bold text-white mb-4">Live Match</h3>
                        <AnimatedMatchField
                            homeTeam={homeTeam}
                            awayTeam={awayTeam}
                            onMatchEnd={(finalScore) => {
                                setMatchStatus("finished");
                                setMatchResult({ homeScore: finalScore.home, awayScore: finalScore.away });
                                saveMatchResult(finalScore.home, finalScore.away, matchEvents);
                            }}
                            onGoal={(team, currentScore) => {
                                const scorer = team === "home"
                                    ? homeTeam.players[Math.floor(Math.random() * homeTeam.players.length)]
                                    : awayTeam.players[Math.floor(Math.random() * awayTeam.players.length)];
                                const event = {
                                    minute: Math.floor(Math.random() * 90),
                                    type: "goal",
                                    team,
                                    player: scorer.name,
                                    message: team === "home"
                                        ? `⚽ GOAL! ${scorer.name} scores!`
                                        : `⚽ Goal by ${scorer.name} (Opponent)`,
                                };
                                setMatchEvents(prev => [...prev, event]);
                            }}
                        />
                    </div>
                )}

                {/* Match Events */}
                {matchEvents.length > 0 && (
                    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mt-6">
                        <h3 className="text-xl font-bold text-white mb-4">Match Events</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {matchEvents.filter(Boolean).map((event, idx) => (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-lg border ${event.team === "home"
                                        ? "bg-cyan-900/20 border-cyan-700"
                                        : "bg-orange-900/20 border-orange-700"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-mono text-slate-400">
                                            {event.minute}'
                                        </span>
                                        <span className="text-white">{event.message}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
