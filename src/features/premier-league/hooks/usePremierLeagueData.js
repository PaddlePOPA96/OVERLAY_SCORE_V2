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
                let errorMsg = response.statusText;
                try {
                    const errorBody = await response.json();
                    if (errorBody.error) errorMsg = errorBody.error;
                } catch { } // Ignore JSON parse error
                throw new Error(`API returned ${response.status}: ${errorMsg}`);
            }

            const data = await response.json();

            // Optimistic update: use the data directly from the API response
            // The API response for PL matches returns an object like { filters: {...}, resultSet: {...}, matches: [...] }
            // Or if our API wrapper returns just the raw data, we need to inspect it.
            // Based on route.js, it returns `data` which is the raw response from football-data.org.
            // So data.matches should be the array.
            if (data && Array.isArray(data.matches)) {
                // Check if the hook expects the wrapping object or just the matches array.
                // Looking at line 17: setMatches(Array.isArray(data) ? data : []);
                // But wait, the previous code on line 17 expects 'data' to be an array?
                // Let's look at how Firebase data is stored.
                // In route.js: await set(ref(db, "pl_data/matches"), { lastUpdated: ..., data });
                // In hook: const matchesRef = ref(db, "pl_data/matches/data/matches");
                // So 'data' in Firebase is the whole object, and 'data/matches' is the array.
                // The hook listens to .../matches/data/matches.
                // So the snapshot val() IS the array of matches.
                setMatches(data.matches);
            } else if (Array.isArray(data)) {
                // Fallback if structure is different
                setMatches(data);
            }

            console.log("✅ Premier League matches refreshed successfully");
        } catch (e) {
            console.error("❌ Failed to reload matches:", e.message);
            throw e;
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
                let errorMsg = response.statusText;
                try {
                    const errorBody = await response.json();
                    if (errorBody.error) errorMsg = errorBody.error;
                } catch { }
                throw new Error(`API returned ${response.status}: ${errorMsg}`);
            }

            console.log("✅ Premier League standings refreshed successfully");
        } catch (e) {
            console.error("❌ Failed to reload standings:", e.message);
            throw e;
        }
    };

    return { standings, loadingStandings: loading, reloadStandings };
}
