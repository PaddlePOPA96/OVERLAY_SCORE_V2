"use client";

export function PremierLeagueRight({
  matches,
  loading,
  news,
  loadingNews,
  theme,
}) {
  const isDark = theme === "dark";
  const headingClass = isDark
    ? "text-gray-400"
    : "text-slate-700";

  const liveMatch =
    matches?.find(
      (m) => m.status === "IN_PLAY" || m.status === "PAUSED"
    ) || null;

  let scoreText = "0 : 0";
  let statusLabel = "Preview";
  if (liveMatch) {
    if (liveMatch.status === "FINISHED") {
      scoreText = `${liveMatch.score.fullTime.home ?? 0} : ${
        liveMatch.score.fullTime.away ?? 0
      }`;
      statusLabel = "FT";
    } else if (
      liveMatch.status === "IN_PLAY" ||
      liveMatch.status === "PAUSED"
    ) {
      scoreText = `${liveMatch.score.fullTime.home ?? "-"} : ${
        liveMatch.score.fullTime.away ?? "-"
      }`;
      statusLabel = "Live";
    } else {
      scoreText = "VS";
      statusLabel = "Preview";
    }
  }

  return (
    <>
      <div>
        <div
          className={`${headingClass} mb-4 text-sm font-semibold tracking-wide`}
        >
          LIVE MATCHES
        </div>
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-5 text-center shadow-lg">
          <div className="flex justify-between items-center mb-6 px-2">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gray-700 rounded-full border-2 border-gray-600 flex items-center justify-center">
                H
              </div>
              <span className="text-xs font-bold text-gray-300">
                {liveMatch?.homeTeam?.shortName ||
                  liveMatch?.homeTeam?.name ||
                  "Home"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white tracking-widest">
                {scoreText}
              </span>
              <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest animate-pulse">
                ● {statusLabel}
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gray-700 rounded-full border-2 border-gray-600 flex items-center justify-center">
                A
              </div>
              <span className="text-xs font-bold text-gray-300">
                {liveMatch?.awayTeam?.shortName ||
                  liveMatch?.awayTeam?.name ||
                  "Away"}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl text-sm transition shadow-lg shadow-purple-900/50"
          >
            Match Detail
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div
          className={`${headingClass} mb-4 text-sm font-semibold tracking-wide`}
        >
          LATEST NEWS
        </div>
        <div className="space-y-4 overflow-y-auto pr-2">
          {(loading || loadingNews) && (
            <p className="text-xs text-gray-400">
              Mengambil informasi pertandingan dari API...
            </p>
          )}
          {!loadingNews && news && news.length > 0 ? (
            news.map((item) => (
              <NewsItem
                key={item.id}
                title={item.title}
                date={item.published}
                image={item.image}
              />
            ))
          ) : !loadingNews ? (
            <p className="text-xs text-gray-400">
              Tidak dapat memuat berita terkini.
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}

function NewsItem({ title, date, image }) {
  const dateLabel = date
    ? new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className="flex gap-4 group cursor-pointer">
      {image ? (
        <img
          src={image}
          alt={title}
          className="w-20 h-16 rounded-lg flex-shrink-0 object-cover opacity-90 group-hover:opacity-100 transition"
        />
      ) : (
        <div className="w-20 h-16 bg-gray-700 rounded-lg flex-shrink-0 bg-cover bg-center opacity-80 group-hover:opacity-100 transition" />
      )}
      <div className="flex flex-col justify-center">
        <h4 className="text-sm text-gray-200 group-hover:text-purple-300 font-medium leading-snug mb-1 transition">
          {title}
        </h4>
        <span className="text-[10px] text-gray-500">
          Premier League • {dateLabel || "Berita terkini"}
        </span>
      </div>
    </div>
  );
}
