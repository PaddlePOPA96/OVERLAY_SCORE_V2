"use client";

import { LOGO_DATA, buildLogoSrc } from "@/lib/logoData";

export function ChampionsLeagueTable({
  standings,
  loadingStandings,
  theme,
  isAdmin,
  onRefreshStandings,
}) {
  const isDark = theme === "dark";

  const cardClass = isDark
    ? "bg-gray-800/60 border border-gray-700/60"
    : "bg-white border border-slate-200 shadow-lg";

  const headingClass = isDark
    ? "text-[11px] md:text-xs uppercase tracking-[0.16em] text-gray-100"
    : "text-[11px] md:text-xs uppercase tracking-[0.16em] text-gray-500";

  const thClass = isDark
    ? "text-left py-2 px-2 font-semibold text-slate-200 text-[13px]"
    : "text-left py-2 px-2 font-semibold text-slate-600 text-[13px]";

  const thCenterClass = `${thClass} text-center`;

  const cellText = isDark
    ? "py-2 pr-2 text-slate-100 text-sm"
    : "py-2 pr-2 text-slate-800 text-sm";

  const cellCenter = `${cellText} text-center`;

  const groups = Array.isArray(standings)
    ? standings.filter((s) => s.type === "TOTAL")
    : [];

  const logoBgClass = isDark
    ? "bg-slate-900"
    : "bg-white border border-slate-200";

  const formatGroupName = (group) => {
    if (!group) return "Group";
    const match = group.match(/GROUP_([A-H])/);
    if (match) return `Group ${match[1]}`;
    return group.replace(/_/g, " ");
  };

  const TEAM_STOP_WORDS = new Set([
    "fc",
    "afc",
    "cf",
    "sc",
    "club",
    "football",
    "the",
  ]);

  const normalizeTeamName = (name) => {
    if (!name) return "";
    return name
      .replace(/[()]/g, " ")
      .replace(/[^A-Za-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => !TEAM_STOP_WORDS.has(w.toLowerCase()))
      .join(" ")
      .toLowerCase()
      .trim();
  };

  const CLUB_ALIAS = {
    "bayern m nchen": "bayern munich",
    bayern: "bayern munich",
    "fc kopenhavn": "fc copenhagen",
    "kobenhavn": "fc copenhagen",
    "k benhavn": "fc copenhagen",
    kbenhavn: "fc copenhagen",
    "sport lisboa e benfica": "sl benfica",
    "olympique de marseille": "olympique marseille",
    "galatasaray sk": "galatasaray",
     "pae olympiakos sfp": "olympiacos piraeus",
     "sk slavia praha": "sk slavia prague",
     "qaraba a dam": "qarabagh",
    "sporting clube de portugal": "sporting cp",
    "sporting lisbon": "sporting cp",
    sporting: "sporting cp",
    olympiakos: "olympiacos piraeus",
    olympiacos: "olympiacos piraeus",
    inter: "inter milan",
    internazionale: "inter milan",
    "internazionale milano": "inter milan",
  };

  const resolveAnyClubLogo = (apiName) => {
    if (!apiName) return "";
    const rawTarget = normalizeTeamName(apiName);
    if (!rawTarget) return "";

    const target = CLUB_ALIAS[rawTarget] || rawTarget;

    let bestLeague = null;
    let bestClub = null;

    for (const [league, clubs] of Object.entries(LOGO_DATA)) {
      if (!Array.isArray(clubs)) continue;

      let match = clubs.find(
        (club) => normalizeTeamName(club) === target
      );
      if (match) {
        bestLeague = league;
        bestClub = match;
        break;
      }

      match = clubs.find((club) =>
        normalizeTeamName(club).includes(target)
      );
      if (match && !bestClub) {
        bestLeague = league;
        bestClub = match;
      }

      if (!bestClub) {
        match = clubs.find((club) =>
          target.includes(normalizeTeamName(club))
        );
        if (match) {
          bestLeague = league;
          bestClub = match;
        }
      }
    }

    return bestLeague && bestClub
      ? buildLogoSrc(bestLeague, bestClub)
      : "";
  };

  return (
    <div
      className={`${cardClass} rounded-xl p-5 space-y-5 w-full max-w-[1040px] mx-auto`}
    >
      <div className="flex items-center justify-between">
        <p className={headingClass}>UEFA Champions League - Group Stage</p>
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
          Memuat klasemen UCL...
        </p>
      ) : !groups.length ? (
        <p className="text-center text-gray-400 text-sm">
          Data klasemen UCL tidak tersedia.
        </p>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div
              key={group.group || group.stage || `group-${group.type}`}
              className="rounded-lg border border-slate-700/60 bg-slate-900/40 overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-slate-700/60 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-100">
                  {formatGroupName(group.group)}
                </p>
                <span className="text-[10px] text-slate-400">
                  {group.table?.length || 0} tim
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700/50">
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
                    {(group.table || []).map((row) => (
                      <tr
                        key={row.team.id}
                        className="border-b border-slate-800/60"
                      >
                        <td className={cellCenter}>{row.position}</td>
                        <td className={cellText}>
                          <div className="flex items-center gap-2">
                            {(() => {
                              const logoSrc = resolveAnyClubLogo(
                                row.team.name,
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
                        <td className={cellCenter}>{row.playedGames}</td>
                        <td className={cellCenter}>{row.won}</td>
                        <td className={cellCenter}>{row.draw}</td>
                        <td className={cellCenter}>{row.lost}</td>
                        <td className={cellCenter}>{row.goalsFor}</td>
                        <td className={cellCenter}>{row.goalsAgainst}</td>
                        <td className={cellCenter}>{row.goalDifference}</td>
                        <td className={cellCenter}>{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ChampionsLeagueMatches({
  matches,
  loadingMatches,
  theme,
}) {
  const isDark = theme === "dark";

  const cardClass = isDark
    ? "bg-gray-800/40 border border-gray-700/50"
    : "bg-white border border-slate-200 shadow-sm";

  const headingClass = isDark
    ? "text-xs uppercase tracking-[0.16em] text-gray-100"
    : "text-xs uppercase tracking-[0.16em] text-gray-500";

  const badgeBase =
    "text-sm font-mono border px-4 py-[4px] rounded-full";

  const TEAM_STOP_WORDS = new Set([
    "fc",
    "afc",
    "cf",
    "sc",
    "club",
    "football",
    "the",
  ]);

  const normalizeTeamName = (name) => {
    if (!name) return "";
    return name
      .replace(/[()]/g, " ")
      .replace(/[^A-Za-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => !TEAM_STOP_WORDS.has(w.toLowerCase()))
      .join(" ")
      .toLowerCase()
      .trim();
  };

  const CLUB_ALIAS = {
    "bayern m nchen": "bayern munich",
    bayern: "bayern munich",
    "fc kopenhavn": "fc copenhagen",
    "kobenhavn": "fc copenhagen",
    "k benhavn": "fc copenhagen",
    kbenhavn: "fc copenhagen",
    "sport lisboa e benfica": "sl benfica",
    "olympique de marseille": "olympique marseille",
    "galatasaray sk": "galatasaray",
     "pae olympiakos sfp": "olympiacos piraeus",
     "sk slavia praha": "sk slavia prague",
     "qaraba a dam": "qarabagh",
    "sporting clube de portugal": "sporting cp",
    "sporting lisbon": "sporting cp",
    sporting: "sporting cp",
    olympiakos: "olympiacos piraeus",
    olympiacos: "olympiacos piraeus",
    inter: "inter milan",
    internazionale: "inter milan",
    "internazionale milano": "inter milan",
  };

  const resolveAnyClubLogo = (apiName) => {
    if (!apiName) return "";
    const rawTarget = normalizeTeamName(apiName);
    if (!rawTarget) return "";

    const target = CLUB_ALIAS[rawTarget] || rawTarget;

    let bestLeague = null;
    let bestClub = null;

    for (const [league, clubs] of Object.entries(LOGO_DATA)) {
      if (!Array.isArray(clubs)) continue;

      let match = clubs.find(
        (club) => normalizeTeamName(club) === target
      );
      if (match) {
        bestLeague = league;
        bestClub = match;
        break;
      }

      match = clubs.find((club) =>
        normalizeTeamName(club).includes(target)
      );
      if (match && !bestClub) {
        bestLeague = league;
        bestClub = match;
      }

      if (!bestClub) {
        match = clubs.find((club) =>
          target.includes(normalizeTeamName(club))
        );
        if (match) {
          bestLeague = league;
          bestClub = match;
        }
      }
    }

    return bestLeague && bestClub
      ? buildLogoSrc(bestLeague, bestClub)
      : "";
  };

  const logoBgClass = isDark
    ? "bg-slate-900"
    : "bg-white border border-slate-200";

  const liveMatches =
    matches?.filter(
      (m) => m.status === "IN_PLAY" || m.status === "PAUSED"
    ) || [];

  const upcomingMatches =
    matches?.filter(
      (m) =>
        m.status === "TIMED" ||
        m.status === "SCHEDULED" ||
        m.status === "POSTPONED"
    ) || [];

  const finishedMatches =
    matches?.filter((m) => m.status === "FINISHED") || [];

  const sortByDate = (list, asc = true) =>
    [...list].sort((a, b) =>
      asc
        ? new Date(a.utcDate) - new Date(b.utcDate)
        : new Date(b.utcDate) - new Date(a.utcDate)
    );

  const formatDateTime = (m) => {
    if (!m.utcDate) return "";
    const d = new Date(m.utcDate);
    return d.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderRow = (match) => {
    const isFinished = match.status === "FINISHED";
    const isLive =
      match.status === "IN_PLAY" || match.status === "PAUSED";

    const badgeClass = isFinished
      ? `${badgeBase} text-yellow-400 border-yellow-400/40`
      : isLive
      ? `${badgeBase} text-green-400 border-green-400/40`
      : `${badgeBase} text-gray-300 border-gray-500/40`;

    const homeLogo = resolveAnyClubLogo(match.homeTeam.name);
    const awayLogo = resolveAnyClubLogo(match.awayTeam.name);

    return (
      <div
        key={match.id}
        className="flex items-center justify-between py-5 px-5 rounded-2xl hover:bg-slate-800/80 transition-colors"
      >
        <div className="flex items-center gap-5 w-2/5">
          <span className={badgeClass}>
            {isFinished ? "FT" : isLive ? "LIVE" : "UPCOMING"}
          </span>
          <div className="flex items-center gap-2">
            {homeLogo && (
              <img
                src={homeLogo}
                alt={match.homeTeam.name}
                className={`w-10 h-10 rounded-full object-contain ${logoBgClass}`}
              />
            )}
            <span
              className={
                isDark
                  ? "text-slate-50 text-base md:text-lg"
                  : "text-slate-900 text-base md:text-lg"
              }
            >
              {match.homeTeam.shortName || match.homeTeam.name}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-1/5">
          <span className="text-xs md:text-sm text-slate-400">
            {formatDateTime(match)}
          </span>
          <span className="mt-1 text-xl md:text-2xl font-semibold text-slate-50 bg-slate-950 px-5 py-2 rounded-2xl shadow-lg">
            {isFinished
              ? `${match.score.fullTime.home} : ${match.score.fullTime.away}`
              : "VS"}
          </span>
        </div>
        <div className="flex items-center justify-end gap-5 w-2/5">
          <span
            className={
              isDark
                ? "text-slate-50 text-base md:text-lg"
                : "text-slate-900 text-base md:text-lg"
            }
          >
            {match.awayTeam.shortName || match.awayTeam.name}
          </span>
          {awayLogo && (
            <img
              src={awayLogo}
              alt={match.awayTeam.name}
              className={`w-10 h-10 rounded-full object-contain ${logoBgClass}`}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${cardClass} rounded-xl p-4 space-y-4 w-full max-w-[1040px] mx-auto`}
    >
      <p className={headingClass}>Jadwal &amp; Hasil UCL (−7 sampai +7 hari)</p>

      {loadingMatches ? (
        <p className="text-center text-gray-400 text-sm">
          Memuat jadwal dan hasil UCL...
        </p>
      ) : !matches || matches.length === 0 ? (
        <p className="text-center text-gray-400 text-sm">
          Tidak ada data pertandingan UCL untuk jendela waktu ini.
        </p>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-400 mb-1">
              Live Match
            </p>
            {liveMatches.length ? (
              <div className="space-y-1">
                {sortByDate(liveMatches).map(renderRow)}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                Tidak ada pertandingan yang sedang berlangsung.
              </p>
            )}
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-sky-400 mb-1">
              Jadwal Mendatang
            </p>
            {upcomingMatches.length ? (
              <div className="space-y-1">
                {sortByDate(upcomingMatches)
                  .slice(0, 8)
                  .map(renderRow)}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                Tidak ada jadwal mendatang dalam 7 hari ke depan.
              </p>
            )}
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-yellow-400 mb-1">
              Hasil Terbaru
            </p>
            {finishedMatches.length ? (
              <div className="space-y-1">
                {sortByDate(finishedMatches, false)
                  .slice(0, 8)
                  .map(renderRow)}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                Belum ada hasil pertandingan dalam jendela waktu ini.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
