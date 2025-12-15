import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebaseDb";

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
            await fetch("/api/premier-league/matches");
        } catch (e) {
            console.error("Failed to reload matches", e);
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
                const res = await fetch("/api/premier-league/news");
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
            await fetch("/api/premier-league/standings");
        } catch (e) {
            console.error("Failed to reload standings", e);
        }
    };

    return { standings, loadingStandings: loading, reloadStandings };
}
