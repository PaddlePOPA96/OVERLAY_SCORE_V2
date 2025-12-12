/**
 * Dream Team API Service
 * Fetches player data from RapidAPI (API-Football v3)
 */

const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
const RAPIDAPI_HOST = "v3.football.api-sports.io";

/**
 * Fetch top players from Premier League with minimum rating
 * @param {number} minRating - Minimum player rating (default: 80)
 * @returns {Promise<Array>} Array of player objects
 */
export async function fetchPlayerRatings(minRating = 80) {
    try {
        // Fetch players from Premier League (league ID: 39, season: 2024)
        const response = await fetch(
            `https://${RAPIDAPI_HOST}/players?league=39&season=2024&page=1`,
            {
                method: "GET",
                headers: {
                    "x-rapidapi-key": RAPIDAPI_KEY,
                    "x-rapidapi-host": RAPIDAPI_HOST,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.response || !Array.isArray(data.response)) {
            console.warn("[dreamTeamApi] No players found in API response");
            return getFallbackPlayerRatings();
        }

        // Transform API response to our player format
        const players = data.response
            .map((item) => {
                const player = item.player;
                const statistics = item.statistics?.[0]; // Get first statistics entry

                if (!player) return null;

                // Calculate rating from statistics or use a default
                const rating = statistics?.games?.rating
                    ? parseFloat(statistics.games.rating) * 10 // Convert 7.5 to 75
                    : 75 + Math.random() * 15; // Random between 75-90

                // Map position
                const position = normalizePosition(statistics?.games?.position);

                return {
                    id: `api_${player.id}`,
                    name: player.name,
                    team: statistics?.team?.name || "",
                    position,
                    rating: Math.round(rating),
                    imgUrl: player.photo || null,
                    nationality: player.nationality || "",
                };
            })
            .filter(Boolean)
            .filter((p) => p.rating >= minRating);

        return players.length > 0 ? players : getFallbackPlayerRatings();
    } catch (error) {
        console.error("[dreamTeamApi] Error fetching player ratings:", error);
        return getFallbackPlayerRatings();
    }
}

/**
 * Search for players by name
 * @param {string} name - Player name to search
 * @returns {Promise<Array>} Array of matching player objects
 */
export async function searchPlayerByName(name) {
    if (!name || !name.trim()) {
        return [];
    }

    try {
        const response = await fetch(
            `https://${RAPIDAPI_HOST}/players?search=${encodeURIComponent(name)}`,
            {
                method: "GET",
                headers: {
                    "x-rapidapi-key": RAPIDAPI_KEY,
                    "x-rapidapi-host": RAPIDAPI_HOST,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.response || !Array.isArray(data.response)) {
            return [];
        }

        // Transform API response to our player format
        const players = data.response
            .map((item) => {
                const player = item.player;
                const statistics = item.statistics?.[0]; // Get first statistics entry

                if (!player) return null;

                // Calculate rating from statistics or use a default
                const rating = statistics?.games?.rating
                    ? parseFloat(statistics.games.rating) * 10
                    : 75 + Math.random() * 15;

                // Map position
                const position = normalizePosition(statistics?.games?.position);

                return {
                    id: `api_${player.id}`,
                    name: player.name,
                    team: statistics?.team?.name || "",
                    position,
                    rawPosition: statistics?.games?.position || "",
                    rating: Math.round(rating),
                    imgUrl: player.photo || null,
                    nationality: player.nationality || "",
                    mappedPos: position,
                };
            })
            .filter(Boolean);

        return players;
    } catch (error) {
        console.error("[dreamTeamApi] Error searching players:", error);
        throw error;
    }
}

/**
 * Normalize position from API format to our format
 * @param {string} position - Position from API
 * @returns {string} Normalized position (GK, DEF, MID, FWD)
 */
function normalizePosition(position) {
    if (!position) return "MID";

    const pos = position.toString().toUpperCase();

    if (pos.includes("GOALKEEPER") || pos === "GK") {
        return "GK";
    }
    if (pos.includes("DEFENDER") || pos.includes("BACK")) {
        return "DEF";
    }
    if (pos.includes("MIDFIELDER") || pos.includes("MID")) {
        return "MID";
    }
    if (pos.includes("ATTACKER") || pos.includes("FORWARD") || pos.includes("WINGER")) {
        return "FWD";
    }

    return "MID"; // Default fallback
}

/**
 * Get fallback player ratings when API fails
 * @returns {Array} Array of fallback player objects
 */
export function getFallbackPlayerRatings() {
    return [
        {
            id: "fallback_1",
            name: "Mohamed Salah",
            team: "Liverpool",
            position: "FWD",
            rating: 89,
            imgUrl: null,
        },
        {
            id: "fallback_2",
            name: "Kevin De Bruyne",
            team: "Manchester City",
            position: "MID",
            rating: 91,
            imgUrl: null,
        },
        {
            id: "fallback_3",
            name: "Erling Haaland",
            team: "Manchester City",
            position: "FWD",
            rating: 91,
            imgUrl: null,
        },
        {
            id: "fallback_4",
            name: "Virgil van Dijk",
            team: "Liverpool",
            position: "DEF",
            rating: 90,
            imgUrl: null,
        },
        {
            id: "fallback_5",
            name: "Alisson Becker",
            team: "Liverpool",
            position: "GK",
            rating: 89,
            imgUrl: null,
        },
    ];
}
