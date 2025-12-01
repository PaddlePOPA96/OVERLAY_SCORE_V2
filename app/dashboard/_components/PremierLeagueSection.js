"use client";

import { LOGO_DATA, buildLogoSrc } from "@/lib/logoData";

export function PremierLeagueMain({
  matches,
  loading,
  theme,
  standings,
  loadingStandings,
  mode, // "matches" | "table"
  isAdmin,
  onRefreshStandings,
}) {
  const isDark = theme === "dark";
  const liveMatches =
    matches?.filter(
      (m) => m.status === "IN_PLAY" || m.status === "PAUSED"
    ) || [];

  const featured = liveMatches[0] || null;

  const formatMatchTitle = (m) => {
    if (!m) return "Premier League Match";
    return `${m.homeTeam.shortName || m.homeTeam.name} vs ${
      m.awayTeam.shortName || m.awayTeam.name
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

  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);

  const todayMatches = [];
  const pastFinished = [];
  const futureMatches = [];

  (matches || []).forEach((m) => {
    if (!m.utcDate) return;
    const d = new Date(m.utcDate);
    const key = d.toISOString().slice(0, 10);

    if (key === todayKey) {
      todayMatches.push(m);
    }

    if (d < now && m.status === "FINISHED") {
      pastFinished.push(m);
    } else if (d >= now && m.status !== "FINISHED") {
      futureMatches.push(m);
    }
  });

  pastFinished.sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate));
  futureMatches.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

  const lastMatch = pastFinished[0] || null;
  const nextMatch = futureMatches[0] || null;

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
        {isMatchesMode && (
          <h3 className={sectionTitleClass}>Today Match</h3>
        )}

        {isMatchesMode ? (
          <div className={`${cardClass} rounded-xl p-4 space-y-4`}>
          {loading ? (
            <p className="text-center text-gray-400 text-sm">
              Memuat jadwal dan hasil...
            </p>
          ) : !matches || matches.length === 0 ? (
            <p className="text-center text-gray-400 text-sm">
              Tidak ada pertandingan yang tercatat.
            </p>
          ) : (
            <>
              <SectionLabel title="Today Match" />
              <div className="space-y-2">
                {(todayMatches.length ? todayMatches : matches.slice(0, 3)).map(
                  (m) => (
                    <PremierLeagueMatchRow
                      key={`today-${m.id}`}
                      match={m}
                      theme={theme}
                    />
                  )
                )}
              </div>

              <SectionLabel title="Next Match" />
              <div className="space-y-2">
                {nextMatch ? (
                  <PremierLeagueMatchRow
                    key={`next-${nextMatch.id}`}
                    match={nextMatch}
                    theme={theme}
                  />
                ) : (
                  <p className="text-xs text-gray-400">
                    Tidak ada jadwal mendatang dalam jendela waktu ini.
                  </p>
                )}
              </div>

              <SectionLabel title="Last Match" />
              <div className="space-y-2">
                {lastMatch ? (
                  <PremierLeagueMatchRow
                    key={`last-${lastMatch.id}`}
                    match={lastMatch}
                    theme={theme}
                  />
                ) : (
                  <p className="text-xs text-gray-400">
                    Belum ada hasil pertandingan dalam jendela waktu ini.
                  </p>
                )}
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
    ? "text-xs uppercase tracking-[0.16em] text-gray-100"
    : "text-xs uppercase tracking-[0.16em] text-gray-400";

  const thClass = isDark
    ? "text-left py-1 pr-1 font-semibold text-slate-200 text-sm"
    : "text-left py-1 pr-1 font-semibold text-slate-500 text-sm";

  const thCenterClass = `${thClass} text-center`;

  const posClass = isDark
    ? "py-1 pr-1 text-slate-300 text-sm"
    : "py-1 pr-1 text-slate-500 text-sm";

  const clubClass = isDark
    ? "py-1 pr-1 text-slate-50 font-medium text-sm"
    : "py-1 pr-1 text-slate-800 font-medium text-sm";

  const playedClass = isDark
    ? "py-1 px-1 text-center text-slate-200 text-sm"
    : "py-1 px-1 text-center text-slate-700 text-sm";

  const pointsClass = isDark
    ? "py-1 px-1 text-center font-bold text-white text-sm"
    : "py-1 px-1 text-center font-bold text-slate-900 text-sm";

  const logoBgClass = isDark
    ? "bg-slate-900"
    : "bg-white border border-slate-200";

  const league = "England - Premier League";

  return (
    <div
      className={`${cardClass} rounded-xl p-4 space-y-3 max-w-[720px] mx-auto`}
    >
      <div className="flex items-center justify-between">
        <p className={headingClass}>Klasemen</p>
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
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm leading-tight">
            <thead>
              <tr className="border-b border-slate-200/50">
                <th className={thClass}>#</th>
                <th className={thClass}>Klub</th>
                <th className={thCenterClass}>M</th>
                <th className={thCenterClass}>W</th>
                <th className={thCenterClass}>D</th>
                <th className={thCenterClass}>L</th>
                <th className={thCenterClass}>SG</th>
                <th className={thCenterClass}>Poin</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row) => (
                <tr key={row.team.id} className="border-b border-slate-100/40">
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
                  <td className={playedClass}>{row.goalDifference}</td>
                  <td className={pointsClass}>{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ title }) {
  return (
    <p className="text-xs uppercase tracking-[0.16em] text-gray-400 mt-1">
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

  return best ? buildLogoSrc(league, best) : "";
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
    <div className="flex items-center justify-between py-3 hover:bg-gray-700/50 rounded px-3 transition cursor-pointer group">
      <div className="flex items-center gap-4 w-1/3">
        <span
          className={`text-xs font-mono border px-1 rounded ${badgeClass}`}
        >
          {minute}
        </span>
        {homeLogoSrc && (
          <img
            src={homeLogoSrc}
            alt={homeFull}
            className="w-6 h-6 rounded-full bg-gray-800 object-contain"
          />
        )}
        <div className="flex flex-col">
          <span
            className={
              isDark
                ? "text-gray-200 group-hover:text-white"
                : "text-slate-800 group-hover:text-slate-900"
            }
          >
            {match.homeTeam.shortName || match.homeTeam.name}
          </span>
          {dateLabel && (
            <span className="text-[10px] text-gray-400">{dateLabel}</span>
          )}
        </div>
      </div>
      <div className="font-bold text-white bg-gray-900 px-3 py-1 rounded-lg">
        {isFinished
          ? `${match.score.fullTime.home} : ${match.score.fullTime.away}`
          : "VS"}
      </div>
      <div className="flex items-center gap-4 w-1/3 justify-end">
        <span
          className={
            isDark
              ? "text-gray-200 group-hover:text-white"
              : "text-slate-800 group-hover:text-slate-900"
          }
        >
          {match.awayTeam.shortName || match.awayTeam.name}
        </span>
        {awayLogoSrc && (
          <img
            src={awayLogoSrc}
            alt={awayFull}
            className="w-6 h-6 rounded-full bg-gray-800 object-contain"
          />
        )}
      </div>
    </div>
  );
}
