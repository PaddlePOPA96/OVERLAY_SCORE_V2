import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebaseDb";
import { auth } from "@/lib/firebaseAuth";

export function usePremierLeagueMatches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const matchesRef = ref(db, "pl_data/matches/data/matches");

        const unsubscribe = onValue(
            matchesRef,
            (snapshot) => {
                const data = snapshot.val();
                setMatches(Array.isArray(data) ? data : []);
                setLoading(false);
            },
            (error) => {
                console.error("Error reading matches from Firebase:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const reloadMatches = async () => {
        try {
            // Validate user is authenticated
            if (!auth.currentUser) {
                throw new Error("User must be logged in to refresh data");
            }

            const token = await auth.currentUser.getIdToken();
            if (!token) {
                throw new Error("Failed to get authentication token");
            }

            const response = await fetch("/api/premier-league/matches", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error(`API returned ${response.status}: ${response.statusText}`);
            }

            console.log("✅ Premier League matches refreshed successfully");
        } catch (e) {
            console.error("❌ Failed to reload matches:", e.message);
            throw e; // Re-throw to allow parent handler to show user feedback
        }
    };

    return { matches, loadingMatches: loading, reloadMatches };
}

export function usePremierLeagueNews() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                // News is public-ish but better to be consistent if user wants strict security.
                // However, news is usually loaded on mount automatically. 
                // If we require token, it might fail on initial load if auth isn't ready.
                // But let's check if the API requires it. User said "don't let others access".
                // We'll add the token if available.
                const token = await auth.currentUser?.getIdToken();
                const res = await fetch("/api/premier-league/news", {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (!cancelled) {
                    setNews(data.articles || []);
                }
            } catch {
                if (!cancelled) setNews([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    return { news, loadingNews: loading };
}

export function usePremierLeagueStandings() {
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const standingsRef = ref(db, "pl_data/standings/data/standings");

        const unsubscribe = onValue(
            standingsRef,
            (snapshot) => {
                const data = snapshot.val();
                if (Array.isArray(data)) {
                    const tableObj = data.find((s) => s.type === "TOTAL");
                    setStandings(Array.isArray(tableObj?.table) ? tableObj.table : []);
                } else {
                    setStandings([]);
                }
                setLoading(false);
            },
            (error) => {
                console.error("Error reading standings:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const reloadStandings = async () => {
        try {
            // Validate user is authenticated
            if (!auth.currentUser) {
                throw new Error("User must be logged in to refresh data");
            }

            const token = await auth.currentUser.getIdToken();
            if (!token) {
                throw new Error("Failed to get authentication token");
            }

            const response = await fetch("/api/premier-league/standings", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error(`API returned ${response.status}: ${response.statusText}`);
            }

            console.log("✅ Premier League standings refreshed successfully");
        } catch (e) {
            console.error("❌ Failed to reload standings:", e.message);
            throw e; // Re-throw to allow parent handler to show user feedback
        }
    };

    return { standings, loadingStandings: loading, reloadStandings };
}
