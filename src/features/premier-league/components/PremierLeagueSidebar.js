"use client";

import { useEffect, useState } from "react";

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

  const [selectedNews, setSelectedNews] = useState(null);
  const [showNewsModal, setShowNewsModal] = useState(false);

  useEffect(() => {
    if (!showNewsModal) return;
    const handler = (event) => {
      if (event.key === "Escape") {
        setShowNewsModal(false);
        setSelectedNews(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showNewsModal]);

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
                onClick={() => {
                  setSelectedNews(item);
                  setShowNewsModal(true);
                }}
              />
            ))
          ) : !loadingNews ? (
            <p className="text-xs text-gray-400">
              Tidak dapat memuat berita terkini.
            </p>
          ) : null}
        </div>
      </div>
      {showNewsModal && selectedNews && (
        <NewsModal
          item={selectedNews}
          onClose={() => {
            setShowNewsModal(false);
            setSelectedNews(null);
          }}
          dark={isDark}
        />
      )}
    </>
  );
}

function NewsItem({ title, date, image, onClick }) {
  const dateLabel = date
    ? new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex gap-4 group cursor-pointer text-left w-full"
    >
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
          Sepak bola • {dateLabel || "Berita terkini"}
        </span>
      </div>
    </button>
  );
}

function NewsModal({ item, onClose, dark }) {
  const dateLabel = item.published
    ? new Date(item.published).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const containerClass = dark
    ? "bg-slate-950 border border-slate-700 text-slate-100"
    : "bg-white border border-slate-300 text-slate-900";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className={`${containerClass} rounded-2xl p-4 w-full max-w-lg shadow-2xl`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-semibold leading-snug">
              {item.title}
            </h3>
            {dateLabel && (
              <p className="text-[11px] text-slate-400 mt-1">
                Sepak bola • {dateLabel}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs flex items-center justify-center"
            aria-label="Tutup berita"
          >
            ×
          </button>
        </div>
        {item.image && (
          <div className="mb-3">
            <img
              src={item.image}
              alt={item.title}
              className="w-full max-h-60 object-cover rounded-xl"
            />
          </div>
        )}
        {item.description && (
          <p className="text-xs leading-relaxed text-slate-200 mb-3">
            {item.description}
          </p>
        )}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
          >
            Baca selengkapnya
            <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </div>
  );
}
