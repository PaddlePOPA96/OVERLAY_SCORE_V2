import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebaseDb";

export function useChampionsLeagueMatches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const matchesRef = ref(db, "ucl_data/matches/data/matches");
        const unsubscribe = onValue(matchesRef, (snapshot) => {
            const data = snapshot.val();
            setMatches(Array.isArray(data) ? data : []);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return {
        uclMatches: matches, loadingUclMatches: loading, reloadUclMatches: async () => {
            try {
                await fetch("/api/champions-league/matches");
            } catch (e) {
                console.error(e)
            }
        }
    };
}

export function useChampionsLeagueStandings() {
    const [uclStandings, setUclStandings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const standingsRef = ref(db, "ucl_data/standings/data/standings");
        const unsubscribe = onValue(standingsRef, (snapshot) => {
            const data = snapshot.val();
            setUclStandings(Array.isArray(data) ? data : []);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const reloadUclStandings = async () => {
        try {
            await fetch("/api/champions-league/standings");
        } catch (e) {
            console.error("Failed to reload UCL standings", e);
        }
    };

    return { uclStandings, loadingUclStandings: loading, reloadUclStandings };
}
