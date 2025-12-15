"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebaseAuth";
import { db } from "@/lib/firebaseDb";
import { ref, get } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function MatchPage() {
    const router = useRouter();
    const [currentUserId, setCurrentUserId] = useState(null);
    const [opponents, setOpponents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Listen to auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUserId(user?.uid || null);
        });
        return () => unsubscribe();
    }, []);

    // Load available opponents (ONE-TIME READ)
    useEffect(() => {
        if (!currentUserId) return;

        const loadOpponents = async () => {
            try {
                const dreamTeamsRef = ref(db, 'dream_team');
                const snapshot = await get(dreamTeamsRef);

                if (snapshot.exists()) {
                    const teams = [];
                    snapshot.forEach((childSnapshot) => {
                        const userId = childSnapshot.key;
                        if (userId !== currentUserId) {
                            const teamData = childSnapshot.val();
                            teams.push({
                                userId: userId,
                                lineup: teamData.lineup || [],
                                players: teamData.players || [],
                                updatedAt: teamData.updatedAt || 0,
                            });
                        }
                    });
                    setOpponents(teams.filter(opp => opp.players.length > 0));
                }
            } catch (error) {
                console.error('[Match] Error loading opponents:', error);
            } finally {
                setLoading(false);
            }
        };

        loadOpponents();
    }, [currentUserId]);

    const handleStartMatch = (opponentId) => {
        // Navigate to match simulation page
        router.push(`/dashboard/match/${opponentId}`);
    };

    if (!currentUserId) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Please Login</h2>
                    <p className="text-slate-400">You need to login to play matches</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="text-cyan-400 hover:text-cyan-300 mb-4 flex items-center gap-2"
                    >
                        ← Back to Builder
                    </button>
                    <h1 className="text-4xl font-bold text-white mb-2">Play Match</h1>
                    <p className="text-slate-400">Choose an opponent to play against</p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center text-white py-12">
                        <div className="animate-spin text-4xl mb-4">⚽</div>
                        <p>Loading opponents...</p>
                    </div>
                )}

                {/* No Opponents */}
                {!loading && opponents.length === 0 && (
                    <div className="bg-slate-900 rounded-xl p-8 text-center border border-slate-800">
                        <p className="text-slate-400 text-lg">No opponents available</p>
                        <p className="text-slate-500 text-sm mt-2">
                            Wait for other users to create their dream teams
                        </p>
                    </div>
                )}

                {/* Opponents List */}
                {!loading && opponents.length > 0 && (
                    <div className="grid gap-4">
                        {opponents.map((opponent) => (
                            <div
                                key={opponent.userId}
                                className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-cyan-500 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-2">
                                            User: {opponent.userId.slice(0, 8)}...
                                        </h3>
                                        <div className="flex gap-4 text-sm text-slate-400">
                                            <span>⚽ {opponent.players.length} Players</span>
                                            <span>
                                                📅{" "}
                                                {new Date(opponent.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex gap-2">
                                            {opponent.players.slice(0, 5).map((player, idx) => (
                                                <div
                                                    key={idx}
                                                    className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center"
                                                >
                                                    {player.imgUrl ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={player.imgUrl}
                                                            alt={player.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-xs text-slate-500">
                                                            {player.name?.charAt(0)}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                            {opponent.players.length > 5 && (
                                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-400">
                                                    +{opponent.players.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleStartMatch(opponent.userId)}
                                        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 flex items-center gap-2"
                                    >
                                        <span>⚔️</span>
                                        <span>Play VS</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
