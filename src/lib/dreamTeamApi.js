/**
 * Dream Team API Service
 * Fetches player data from RapidAPI (API-Football v3) with API-Football fallback
 */

const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
const RAPIDAPI_HOST = "v3.football.api-sports.io";
const APIFOOTBALL_KEY = process.env.NEXT_PUBLIC_APIFOOTBALL_KEY;
const APIFOOTBALL_HOST = "v3.football.api-sports.io";

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
        // First try: TheSportsDB (free API, good coverage for all players)
        console.log('[dreamTeamApi] Trying TheSportsDB first...');

        try {
            const sportsDbResponse = await fetch(
                `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(name)}`
            );

            console.log('[dreamTeamApi] TheSportsDB response status:', sportsDbResponse.status);

            if (sportsDbResponse.ok) {
                const sportsDbData = await sportsDbResponse.json();
                console.log('[dreamTeamApi] TheSportsDB data:', sportsDbData);

                if (sportsDbData.player && Array.isArray(sportsDbData.player)) {
                    // Transform TheSportsDB response
                    const sportsDbPlayers = sportsDbData.player
                        .filter(p => p.strSport === 'Soccer') // Only soccer players
                        .map((player) => {
                            // Map position from TheSportsDB format
                            let position = 'MID';
                            const pos = player.strPosition?.toLowerCase() || '';
                            if (pos.includes('goalkeeper') || pos.includes('keeper')) position = 'GK';
                            else if (pos.includes('defender') || pos.includes('defence')) position = 'DEF';
                            else if (pos.includes('midfielder') || pos.includes('midfield')) position = 'MID';
                            else if (pos.includes('forward') || pos.includes('striker') || pos.includes('attacker')) position = 'FWD';

                            return {
                                id: `sportsdb_${player.idPlayer}`,
                                name: player.strPlayer,
                                team: player.strTeam || '',
                                position,
                                rawPosition: player.strPosition || '',
                                rating: 75, // TheSportsDB doesn't have ratings
                                imgUrl: player.strThumb || player.strCutout || null,
                                nationality: player.strNationality || '',
                                mappedPos: position,
                            };
                        })
                        .filter(Boolean);

                    if (sportsDbPlayers.length > 0) {
                        console.log('[dreamTeamApi] Found', sportsDbPlayers.length, 'players from TheSportsDB');
                        return sportsDbPlayers;
                    }
                }
            }
        } catch (sportsDbError) {
            console.warn('[dreamTeamApi] TheSportsDB error:', sportsDbError);
        }

        // Second try: RapidAPI (for ratings if available)
        console.log('[dreamTeamApi] TheSportsDB returned no results, trying RapidAPI...');

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

        console.log('[dreamTeamApi] RapidAPI response status:', response.status);

        if (!response.ok) {
            console.error('[dreamTeamApi] RapidAPI error:', response.status, response.statusText);
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('[dreamTeamApi] RapidAPI data:', data);

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
                    : 75; // Default rating if API doesn't provide one

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

        // If RapidAPI returns results, use them
        if (players.length > 0) {
            return players;
        }

        // Fallback to API-Football if RapidAPI returns no results
        console.log("[dreamTeamApi] RapidAPI returned no results, trying API-Football...");

        const fallbackResponse = await fetch(
            `https://${APIFOOTBALL_HOST}/players?search=${encodeURIComponent(name)}`,
            {
                method: "GET",
                headers: {
                    "x-apisports-key": APIFOOTBALL_KEY,
                },
            }
        );

        console.log('[dreamTeamApi] API-Football response status:', fallbackResponse.status);

        if (!fallbackResponse.ok) {
            console.warn("[dreamTeamApi] API-Football also failed:", fallbackResponse.status, fallbackResponse.statusText);
            return [];
        }

        const fallbackData = await fallbackResponse.json();
        console.log('[dreamTeamApi] API-Football data:', fallbackData);

        if (!fallbackData.response || !Array.isArray(fallbackData.response)) {
            return [];
        }

        // Transform API-Football response (same format as RapidAPI)
        const fallbackPlayers = fallbackData.response
            .map((item) => {
                const player = item.player;
                const statistics = item.statistics?.[0];

                if (!player) return null;

                const rating = statistics?.games?.rating
                    ? parseFloat(statistics.games.rating) * 10
                    : 75;

                const position = normalizePosition(statistics?.games?.position);

                return {
                    id: `apifb_${player.id}`,
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

        if (fallbackPlayers.length > 0) {
            return fallbackPlayers;
        }

        // Third fallback: TheSportsDB (free API, good for legendary players)
        console.log('[dreamTeamApi] API-Football also returned no results, trying TheSportsDB...');

        try {
            const sportsDbResponse = await fetch(
                `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(name)}`
            );

            console.log('[dreamTeamApi] TheSportsDB response status:', sportsDbResponse.status);

            if (!sportsDbResponse.ok) {
                console.warn('[dreamTeamApi] TheSportsDB failed:', sportsDbResponse.status);
                return [];
            }

            const sportsDbData = await sportsDbResponse.json();
            console.log('[dreamTeamApi] TheSportsDB data:', sportsDbData);

            if (!sportsDbData.player || !Array.isArray(sportsDbData.player)) {
                return [];
            }

            // Transform TheSportsDB response
            const sportsDbPlayers = sportsDbData.player
                .filter(p => p.strSport === 'Soccer') // Only soccer players
                .map((player) => {
                    // Map position from TheSportsDB format
                    let position = 'MID';
                    const pos = player.strPosition?.toLowerCase() || '';
                    if (pos.includes('goalkeeper') || pos.includes('keeper')) position = 'GK';
                    else if (pos.includes('defender') || pos.includes('defence')) position = 'DEF';
                    else if (pos.includes('midfielder') || pos.includes('midfield')) position = 'MID';
                    else if (pos.includes('forward') || pos.includes('striker') || pos.includes('attacker')) position = 'FWD';

                    return {
                        id: `sportsdb_${player.idPlayer}`,
                        name: player.strPlayer,
                        team: player.strTeam || '',
                        position,
                        rawPosition: player.strPosition || '',
                        rating: 75, // TheSportsDB doesn't have ratings
                        imgUrl: player.strThumb || player.strCutout || null,
                        nationality: player.strNationality || '',
                        mappedPos: position,
                    };
                })
                .filter(Boolean);

            return sportsDbPlayers;
        } catch (sportsDbError) {
            console.error('[dreamTeamApi] TheSportsDB error:', sportsDbError);
            return [];
        }
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
