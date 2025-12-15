"use client";

import { LOGO_DATA, buildLogoSrc, buildOtherLogoSrc } from "@/lib/logoData";

export function PremierLeagueMain({
  matches,
  loading,
  theme,
  standings,
  loadingStandings,
  mode, // "matches" | "table"
  isAdmin,
  onRefreshStandings,
  onRefreshMatches,
}) {
  const isDark = theme === "dark";
  const liveMatches =
    matches?.filter(
      (m) => m.status === "IN_PLAY" || m.status === "PAUSED"
    ) || [];

  const featured = liveMatches[0] || null;

  const formatMatchTitle = (m) => {
    if (!m) return "Premier League Match";
    return `${m.homeTeam.shortName || m.homeTeam.name} vs ${m.awayTeam.shortName || m.awayTeam.name
      }`;
  };

  const formatMatchVenue = (m) => {
    if (!m || !m.utcDate) return "Premier League Stadium";
    const date = new Date(m.utcDate);
    return `${date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`;
  };

  // Gunakan waktu lokal user untuk penentuan hari
  const now = new Date();

  // Helper untuk mendapatkan string tanggal lokal (YYYY-MM-DD)
  // Kita gunakan locale "id-ID" atau "sv-SE" (ISO-like) untuk konsistensi, 
  // tapi yang penting adalah konsistensi format antara 'now' dan 'match date'.
  const getLocalDateString = (dateObj) => {
    return dateObj.toLocaleDateString("en-CA"); // YYYY-MM-DD format local
  };

  const todayStr = getLocalDateString(now);

  const todayMatches = [];
  const pastFinished = [];
  const futureMatches = [];

  (matches || []).forEach((m) => {
    if (!m.utcDate) return;
    const matchDate = new Date(m.utcDate);
    const matchDateStr = getLocalDateString(matchDate);

    // Grouping Logic:
    // 1. Today: Match date string === Today date string
    // 2. Future: Match date string > Today date string (TOMORROW etc)
    // 3. Past: Match date string < Today date string (YESTERDAY etc) OR (Match is today but FINISHED? User wanted "nanti malam masuk today", so keep Today strictly by date)

    if (matchDateStr === todayStr) {
      todayMatches.push(m);
    } else if (matchDateStr > todayStr) {
      futureMatches.push(m);
    } else {
      // Past date
      if (m.status === "FINISHED") {
        pastFinished.push(m);
      }
    }
  });

  // Sort logic
  // Past: Descending (terbaru di atas)
  pastFinished.sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate));
  // Future: Ascending (terdekat di atas)
  futureMatches.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
  // Today: Ascending (biar urut jam main)
  todayMatches.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

  // Tampilkan max 5 match terakhir
  const recentMatches = pastFinished.slice(0, 5);
  const nextMatches = futureMatches.slice(0, 5);

  const sectionTitleClass = isDark
    ? "text-lg font-semibold text-white"
    : "text-lg font-semibold text-slate-900";

  const cardClass = isDark
    ? "bg-gray-800/40 border border-gray-700/50"
    : "bg-white border border-slate-200 shadow-sm";

  const isMatchesMode = mode !== "table";

  return (
    <>
      {isMatchesMode && (
        <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-2xl p-8 mb-8 relative overflow-hidden h-64 flex items-center shadow-lg shadow-purple-900/20">
          <div className="w-2/3 z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs text-white">
                Match of the Day
              </span>
              {isAdmin && (
                <button
                  type="button"
                  onClick={onRefreshMatches}
                  className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-xs text-white transition disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh Data"}
                </button>
              )}
            </div>
            <h2 className="text-3xl text-white font-bold mb-4">
              {featured
                ? formatMatchTitle(featured)
                : "Tidak ada pertandingan live"}
            </h2>
            <div className="space-y-1 text-sm text-gray-200 mb-6">
              {featured ? (
                <>
                  <p className="flex items-center gap-2">
                    📅 {formatMatchVenue(featured)}
                  </p>
                  <p className="flex items-center gap-2">
                    🏟{" "}
                    {featured?.venue ||
                      featured?.competition?.name ||
                      "Stadium informasi belum tersedia"}
                  </p>
                </>
              ) : (
                <p className="flex items-center gap-2">
                  Tidak ada pertandingan Premier League yang sedang berlangsung.
                </p>
              )}
            </div>
            <button
              type="button"
              className="bg-white text-purple-900 font-bold px-6 py-2 rounded-full hover:bg-gray-100 transition text-sm"
            >
              Match Detail →
            </button>
          </div>
          <div className="absolute right-0 bottom-0 w-1/3 h-full bg-black/20 flex items-end justify-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg"
              alt="Cristiano Ronaldo"
              className="h-5/6 w-auto object-cover opacity-90 pb-4 rounded-lg"
            />
          </div>
        </div>
      )}

      <div className="space-y-6">


        {isMatchesMode ? (
          <div className="space-y-8">
            {loading ? (
              <div className={`${cardClass} rounded-xl p-8`}>
                <p className="text-center text-gray-400 text-sm">
                  Memuat jadwal dan hasil...
                </p>
              </div>
            ) : !matches || matches.length === 0 ? (
              <div className={`${cardClass} rounded-xl p-8`}>
                <p className="text-center text-gray-400 text-sm">
                  Tidak ada pertandingan yang tercatat.
                </p>
              </div>
            ) : (
              <>
                {/* Today Match Container */}
                <div className={`${cardClass} rounded-xl p-5`}>
                  <div className="mb-4">
                    <SectionLabel title="Today Match" />
                  </div>
                  <div className="space-y-2">
                    {todayMatches.length > 0 ? (
                      todayMatches.map((m) => (
                        <PremierLeagueMatchRow
                          key={`today-${m.id}`}
                          match={m}
                          theme={theme}
                        />
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        Tidak ada pertandingan hari ini.
                      </p>
                    )}
                  </div>
                </div>

                {/* Recent Matches Container */}
                <div className={`${cardClass} rounded-xl p-5`}>
                  <div className="mb-4">
                    <SectionLabel title="Recent Matches" />
                  </div>
                  <div className="space-y-2">
                    {recentMatches.length > 0 ? (
                      recentMatches.map((m) => (
                        <PremierLeagueMatchRow
                          key={`last-${m.id}`}
                          match={m}
                          theme={theme}
                        />
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        Belum ada hasil pertandingan dalam jendela waktu ini.
                      </p>
                    )}
                  </div>
                </div>

                {/* Next Match Container */}
                <div className={`${cardClass} rounded-xl p-5`}>
                  <div className="mb-4">
                    <SectionLabel title="Next Match" />
                  </div>
                  <div className="space-y-2">
                    {nextMatches.length ? (
                      nextMatches.map((m) => (
                        <PremierLeagueMatchRow
                          key={`next-${m.id}`}
                          match={m}
                          theme={theme}
                        />
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        Tidak ada jadwal mendatang dalam 7 hari ke depan.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <PremierLeagueTableCard
            standings={standings}
            loadingStandings={loadingStandings}
            cardClass={cardClass}
            isDark={isDark}
            isAdmin={isAdmin}
            onRefreshStandings={onRefreshStandings}
          />
        )}
      </div>
    </>
  );
}

function PremierLeagueTableCard({
  standings,
  loadingStandings,
  cardClass,
  isDark,
  isAdmin,
  onRefreshStandings,
}) {
  const headingClass = isDark
    ? "text-[11px] md:text-xs uppercase tracking-[0.16em] text-gray-100"
    : "text-[11px] md:text-xs uppercase tracking-[0.16em] text-gray-500";

  const thClass = isDark
    ? "text-left py-2 px-2 font-semibold text-slate-200 text-[13px]"
    : "text-left py-2 px-2 font-semibold text-slate-600 text-[13px]";

  const thCenterClass = `${thClass} text-center`;

  const posClass = isDark
    ? "py-2 px-2 text-slate-300 text-sm"
    : "py-2 px-2 text-slate-600 text-sm";

  const clubClass = isDark
    ? "py-2 pr-2 text-slate-50 font-medium text-sm"
    : "py-2 pr-2 text-slate-800 font-medium text-sm";

  const playedClass = isDark
    ? "py-2 px-2 text-center text-slate-200 text-sm"
    : "py-2 px-2 text-center text-slate-700 text-sm";

  const pointsClass = isDark
    ? "py-2 px-2 text-center font-bold text-white text-sm"
    : "py-2 px-2 text-center font-bold text-slate-900 text-sm";

  const logoBgClass = isDark
    ? "bg-slate-900"
    : "bg-white border border-slate-200";

  const league = "England - Premier League";

  const uclSpots = standings.slice(0, 4);

  return (
    <div
      className={`${cardClass} rounded-xl p-5 space-y-5 max-w-[1040px] mx-auto`}
    >
      <div className="flex items-center justify-between">
        <p className={headingClass}>Klasemen Premier League</p>
        {isAdmin && (
          <button
            type="button"
            onClick={onRefreshStandings}
            className="text-[10px] px-2 py-1 rounded-full border border-slate-500 text-slate-200 hover:bg-slate-700 transition disabled:opacity-60"
            disabled={loadingStandings}
          >
            {loadingStandings ? "Refreshing..." : "Refresh"}
          </button>
        )}
      </div>
      {loadingStandings ? (
        <p className="text-center text-gray-400 text-sm">
          Memuat klasemen Premier League...
        </p>
      ) : !standings || standings.length === 0 ? (
        <p className="text-center text-gray-400 text-sm">
          Data klasemen tidak tersedia.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm leading-tight">
              <thead>
                <tr className="border-b border-slate-200/50">
                  <th className={thClass}>#</th>
                  <th className={thClass}>Klub</th>
                  <th className={thCenterClass}>T</th>
                  <th className={thCenterClass}>M</th>
                  <th className={thCenterClass}>S</th>
                  <th className={thCenterClass}>K</th>
                  <th className={thCenterClass}>GM</th>
                  <th className={thCenterClass}>GK</th>
                  <th className={thCenterClass}>SG</th>
                  <th className={thCenterClass}>Poin</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row) => (
                  <tr
                    key={row.team.id}
                    className="border-b border-slate-100/40"
                  >
                    <td className={posClass}>{row.position}</td>
                    <td className={clubClass}>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const logoSrc = resolveClubLogo(
                            league,
                            row.team.name
                          );
                          if (!logoSrc) return null;
                          return (
                            <img
                              src={logoSrc}
                              alt={row.team.name}
                              className={`w-7 h-7 rounded-full object-contain ${logoBgClass}`}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          );
                        })()}
                        <span>{row.team.name}</span>
                      </div>
                    </td>
                    <td className={playedClass}>{row.playedGames}</td>
                    <td className={playedClass}>{row.won}</td>
                    <td className={playedClass}>{row.draw}</td>
                    <td className={playedClass}>{row.lost}</td>
                    <td className={playedClass}>{row.goalsFor}</td>
                    <td className={playedClass}>{row.goalsAgainst}</td>
                    <td className={playedClass}>{row.goalDifference}</td>
                    <td className={pointsClass}>{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-slate-700/50 mt-3">
            <p className={headingClass}>UCL Spots (Top 4)</p>
            <ul className="mt-2 space-y-1">
              {uclSpots.map((row) => (
                <li
                  key={`ucl-${row.team.id}`}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-[11px] text-slate-400">
                      {row.position}.
                    </span>
                    <span className="font-medium text-slate-100">
                      {row.team.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">
                    {row.points} pts
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function SectionLabel({ title }) {
  return (
    <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 mt-1">
      {title}
    </p>
  );
}

const TEAM_STOP_WORDS = new Set([
  "fc",
  "afc",
  "cf",
  "sc",
  "club",
  "football",
  "the",
]);

function normalizeTeamName(name) {
  if (!name) return "";
  return name
    .replace(/[()]/g, " ")
    .replace(/[^A-Za-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => !TEAM_STOP_WORDS.has(w.toLowerCase()))
    .join(" ")
    .toLowerCase()
    .trim();
}

function resolveClubLogo(league, apiName) {
  if (!league || !apiName) return "";
  const clubs = LOGO_DATA[league] || [];
  const target = normalizeTeamName(apiName);
  if (!target) return "";

  let best = clubs.find(
    (club) => normalizeTeamName(club) === target
  );

  if (!best) {
    best = clubs.find((club) =>
      normalizeTeamName(club).includes(target)
    );
  }

  if (!best) {
    best = clubs.find((club) =>
      target.includes(normalizeTeamName(club))
    );
  }
  if (best) {
    return buildLogoSrc(league, best);
  }

  // Fallback: pakai logo di /logo/other jika ada
  return buildOtherLogoSrc(apiName);
}

export function PremierLeagueMatchRow({ match, theme }) {
  const isFinished = match.status === "FINISHED";
  const minute =
    match.status === "IN_PLAY" || match.status === "PAUSED"
      ? "LIVE"
      : isFinished
        ? "FT"
        : "UPCOMING";

  const isDark = theme === "dark";

  const badgeClass = isFinished
    ? "text-yellow-400 border-yellow-400/30"
    : minute === "LIVE"
      ? "text-green-400 border-green-400/30"
      : "text-gray-300 border-gray-500/40";

  const league = "England - Premier League";
  const homeFull = match.homeTeam.name;
  const awayFull = match.awayTeam.name;

  const homeLogoSrc = resolveClubLogo(league, homeFull);
  const awayLogoSrc = resolveClubLogo(league, awayFull);

  const dateLabel = match.utcDate
    ? new Date(match.utcDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    : "";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between py-3 hover:bg-gray-700/50 rounded px-3 transition cursor-pointer group gap-3 sm:gap-4">
      {/* Home Team */}
      <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 w-full sm:flex-1 sm:min-w-0">
        <span
          className={`text-[10px] sm:text-xs font-mono border px-1 rounded ${badgeClass}`}
        >
          {minute}
        </span>
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-center sm:justify-start">
          {homeLogoSrc && (
            <img
              src={homeLogoSrc}
              alt={homeFull}
              className="w-8 h-8 sm:w-6 sm:h-6 rounded-full bg-gray-800 object-contain flex-shrink-0"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <div className="flex flex-col min-w-0 text-center sm:text-left">
            <span
              className={`truncate text-sm sm:text-base ${isDark
                ? "text-gray-200 group-hover:text-white"
                : "text-slate-800 group-hover:text-slate-900"
                }`}
            >
              {match.homeTeam.shortName || match.homeTeam.name}
            </span>
            {dateLabel && (
              <span className="text-[10px] text-gray-400 truncate">
                {dateLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* VS / Score */}
      <div className="font-bold text-white bg-gray-900 px-4 py-1 rounded-lg text-sm sm:text-base flex-shrink-0">
        {isFinished || minute === "LIVE"
          ? `${match.score.fullTime.home ?? 0} : ${match.score.fullTime.away ?? 0}`
          : "VS"}
      </div>

      {/* Away Team */}
      <div className="flex items-center justify-center sm:justify-end gap-3 sm:gap-4 w-full sm:flex-1 sm:min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-center sm:justify-end">
          <span
            className={`truncate text-sm sm:text-base order-2 sm:order-1 ${isDark
              ? "text-gray-200 group-hover:text-white"
              : "text-slate-800 group-hover:text-slate-900"
              }`}
          >
            {match.awayTeam.shortName || match.awayTeam.name}
          </span>
          {awayLogoSrc && (
            <img
              src={awayLogoSrc}
              alt={awayFull}
              className="w-8 h-8 sm:w-6 sm:h-6 rounded-full bg-gray-800 object-contain flex-shrink-0 order-1 sm:order-2"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = "none";
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
