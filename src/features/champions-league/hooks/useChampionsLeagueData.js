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

    const reloadUclMatches = async () => {
        try {
            const token = await import("@/lib/firebaseAuth").then(m => m.auth.currentUser?.getIdToken());
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await fetch("/api/champions-league/matches", { headers });

            if (!response.ok) {
                let errorMsg = response.statusText;
                try {
                    const errorBody = await response.json();
                    if (errorBody.error) errorMsg = errorBody.error;
                } catch { }
                throw new Error(`UCL matches API returned ${response.status}: ${errorMsg}`);
            } else {
                const data = await response.json();
                // Similar logic to PL: route.js saves 'data' (whole object).
                // Hook listens to "ucl_data/matches/data/matches".
                // So we need data.matches
                if (data && Array.isArray(data.matches)) {
                    setMatches(data.matches);
                } else if (Array.isArray(data)) {
                    setMatches(data);
                }
                console.log("✅ Champions League matches refreshed successfully");
            }
        } catch (e) {
            console.error("❌ Failed to reload UCL matches:", e.message);
            throw e;
        }
    };

    return {
        uclMatches: matches,
        loadingUclMatches: loading,
        reloadUclMatches
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
            const token = await import("@/lib/firebaseAuth").then(m => m.auth.currentUser?.getIdToken());
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await fetch("/api/champions-league/standings", { headers });

            if (!response.ok) {
                let errorMsg = response.statusText;
                try {
                    const errorBody = await response.json();
                    if (errorBody.error) errorMsg = errorBody.error;
                } catch { }
                throw new Error(`UCL standings API returned ${response.status}: ${errorMsg}`);
            } else {
                console.log("✅ Champions League standings refreshed successfully");
            }
        } catch (e) {
            console.error("❌ Failed to reload UCL standings:", e.message);
            throw e;
        }
    };

    return { uclStandings, loadingUclStandings: loading, reloadUclStandings };
}
