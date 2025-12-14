
const API_KEY = "0ea6f9faf31246dcb907c52fa33062b6";
const BASE_URL = "https://api.football-data.org/v4";

function formatDate(date) {
    return date.toISOString().split("T")[0];
}

async function run() {
    console.log("Starting fetch...");
    const today = new Date("2025-12-14"); // Force date to user's date
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 7);
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 7);

    const url = `${BASE_URL}/competitions/PL/matches?dateFrom=${formatDate(pastDate)}&dateTo=${formatDate(futureDate)}`;
    console.log("Fetching URL:", url);

    const res = await fetch(url, {
        headers: { "X-Auth-Token": API_KEY },
        cache: "no-store",
    });

    console.log("Status:", res.status);
    if (!res.ok) {
        console.log("Error body:", await res.text());
        return;
    }

    const data = await res.json();
    console.log("Count:", data.count);
    // console.log("Matches:", JSON.stringify(data.matches, null, 2));

    // Check for Sunderland vs Newcastle
    const target = data.matches.find(m =>
        (m.homeTeam.name.includes("Sunderland") || m.awayTeam.name.includes("Sunderland")) &&
        (m.homeTeam.name.includes("Newcastle") || m.awayTeam.name.includes("Newcastle"))
    );

    if (target) {
        console.log("FOUND TARGET MATCH:");
        console.log(JSON.stringify(target, null, 2));
    } else {
        console.log("Target match Sunderland vs Newcastle NOT FOUND in API response.");
    }
}

run();
