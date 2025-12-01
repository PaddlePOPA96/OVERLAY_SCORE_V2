"use client";

import { useState, useEffect, useRef } from "react";
import * as htmlToImage from "html-to-image";



// Database formasi (koordinat persentase)
const FORMATIONS = {
  "4-3-3": [
    { x: 50, y: 88 }, // GK
    { x: 15, y: 68 },
    { x: 38, y: 75 },
    { x: 62, y: 75 },
    { x: 85, y: 68 }, // DEF
    { x: 28, y: 45 },
    { x: 50, y: 55 },
    { x: 72, y: 45 }, // MID
    { x: 18, y: 18 },
    { x: 50, y: 12 },
    { x: 82, y: 18 }, // FWD
  ],
  "4-4-2": [
    { x: 50, y: 88 },
    { x: 15, y: 68 },
    { x: 38, y: 75 },
    { x: 62, y: 75 },
    { x: 85, y: 68 },
    { x: 15, y: 40 },
    { x: 38, y: 45 },
    { x: 62, y: 45 },
    { x: 85, y: 40 },
    { x: 35, y: 15 },
    { x: 65, y: 15 },
  ],
  "4-2-3-1": [
    { x: 50, y: 88 },
    { x: 15, y: 68 },
    { x: 38, y: 75 },
    { x: 62, y: 75 },
    { x: 85, y: 68 },
    { x: 35, y: 55 },
    { x: 65, y: 55 },
    { x: 20, y: 35 },
    { x: 50, y: 35 },
    { x: 80, y: 35 },
    { x: 50, y: 12 },
  ],
  "3-5-2": [
    { x: 50, y: 88 },
    { x: 30, y: 75 },
    { x: 50, y: 78 },
    { x: 70, y: 75 },
    { x: 10, y: 50 },
    { x: 35, y: 45 },
    { x: 50, y: 58 },
    { x: 65, y: 45 },
    { x: 90, y: 50 },
    { x: 35, y: 15 },
    { x: 65, y: 15 },
  ],
};

function PlayerCard({ player, onDragStart, small = false }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      draggable
      onDragStart={(event) => onDragStart(event, player)}
      className={`relative group cursor-grab active:cursor-grabbing bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md flex flex-col items-center shadow-lg transition-transform hover:scale-110 select-none overflow-hidden z-20 ${
        small ? "p-1 w-20" : "p-2 w-24"
      }`}
    >
      <div
        className={`${
          small ? "w-12 h-12" : "w-16 h-16"
        } rounded-full bg-slate-700 mb-1 border-2 border-slate-500 overflow-hidden relative shadow-inner flex items-center justify-center`}
      >
        {!imgError && player.imgUrl ? (
          <img
            src={player.imgUrl}
            alt={player.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-slate-600 flex flex-col items-center justify-center text-slate-400 text-xs">
            <span>NO</span>
            <span>PHOTO</span>
          </div>
        )}
      </div>

      <div className="text-center w-full relative z-10 bg-slate-900/80 rounded px-1">
        <div
          className={`font-bold text-white truncate w-full ${
            small ? "text-[10px]" : "text-xs"
          }`}
        >
          {player.name}
        </div>
        <div className="flex justify-center gap-1 mt-0.5">
          <span className="text-[9px] text-yellow-400 font-mono">
            {player.rating}
          </span>
          <span className="text-[9px] text-blue-300">
            {player.position}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function DreamElevenBuilder() {
  const fieldRef = useRef(null);

  const [lineup, setLineup] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem("football_lineup_v2");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bench, setBench] = useState(() => {
    if (typeof window === "undefined") return INITIAL_PLAYERS;
    try {
      const saved = window.localStorage.getItem("football_bench_v2");
      return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
    } catch {
      return INITIAL_PLAYERS;
    }
  });

  const [currentFormation, setCurrentFormation] = useState("4-3-3");
  const [draggedItem, setDraggedItem] = useState(null);
  const [sourceType, setSourceType] = useState(null);

  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerPos, setNewPlayerPos] = useState("ST");
  const [isSearching, setIsSearching] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [isCapturing, setIsCapturing] = useState(false);

  // Auto save ke localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    setSaveStatus("Saving...");
    try {
      window.localStorage.setItem("football_lineup_v2", JSON.stringify(lineup));
      window.localStorage.setItem("football_bench_v2", JSON.stringify(bench));
    } catch {
      // ignore
    }
    const timeout = setTimeout(() => {
      setSaveStatus("Saved");
    }, 500);
    return () => clearTimeout(timeout);
  }, [lineup, bench]);

  const applyFormationTemplate = (event) => {
    const formationName = event.target.value;
    setCurrentFormation(formationName);
    const coords = FORMATIONS[formationName];
    const newLineup = lineup.map((player, index) => {
      if (index < coords.length) {
        return { ...player, x: coords[index].x, y: coords[index].y };
      }
      return player;
    });
    setLineup(newLineup);
  };

  const handleDragStart = (event, item, source) => {
    setDraggedItem(item);
    setSourceType(source);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDropOnField = (event) => {
    event.preventDefault();
    if (!draggedItem || !fieldRef.current) return;

    const rect = fieldRef.current.getBoundingClientRect();
    let x = ((event.clientX - rect.left) / rect.width) * 100;
    let y = ((event.clientY - rect.top) / rect.height) * 100;

    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    if (sourceType === "bench") {
      const newPlayer = { ...draggedItem, x, y };
      setLineup((prev) => [...prev, newPlayer]);
      setBench((prev) => prev.filter((p) => p.id !== draggedItem.id));
    } else {
      setLineup((prev) =>
        prev.map((p) => (p.id === draggedItem.id ? { ...p, x, y } : p))
      );
    }

    setDraggedItem(null);
    setSourceType(null);
  };

  const handleDropOnBench = (event) => {
    event.preventDefault();
    if (!draggedItem) return;

    if (sourceType === "field") {
      const { x, y, ...cleanPlayer } = draggedItem;
      setLineup((prev) => prev.filter((p) => p.id !== draggedItem.id));
      setBench((prev) => [...prev, cleanPlayer]);
    }
    setDraggedItem(null);
    setSourceType(null);
  };

  const fetchPlayerData = async (name) => {
    try {
      const response = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(
          name
        )}`
      );
      const data = await response.json();
      if (data.player && data.player.length > 0) {
        const playerData = data.player[0];
        const imgUrl =
          playerData.strCutout || playerData.strThumb || null;

        const rawPosition = (playerData.strPosition || "").toUpperCase();
        let mappedPos = null;

        if (
          rawPosition.includes("KEEPER") ||
          rawPosition.includes("GOALKEEPER")
        ) {
          mappedPos = "GK";
        } else if (
          rawPosition.includes("BACK") ||
          rawPosition.includes("DEF")
        ) {
          mappedPos = "DEF";
        } else if (rawPosition.includes("MID")) {
          mappedPos = "MID";
        } else if (
          rawPosition.includes("FORWARD") ||
          rawPosition.includes("WINGER") ||
          rawPosition.includes("STRIKER") ||
          rawPosition.includes("ATTACK")
        ) {
          mappedPos = "FWD";
        }

        return { imgUrl, mappedPos };
      }
      return { imgUrl: null, mappedPos: null };
    } catch (error) {
      console.error("Error fetching image:", error);
      return { imgUrl: null, mappedPos: null };
    }
  };

  const addNewPlayer = async (event) => {
    event.preventDefault();
    if (!newPlayerName.trim()) return;

    setIsSearching(true);
    const { imgUrl, mappedPos } = await fetchPlayerData(newPlayerName);
    const finalPosition = mappedPos || newPlayerPos;

    const newPlayer = {
      id: Date.now().toString(),
      name: newPlayerName,
      position: finalPosition,
      rating: Math.floor(Math.random() * (95 - 80 + 1) + 80),
      imgUrl,
    };

    setBench((prev) => [...prev, newPlayer]);
    setNewPlayerName("");
    if (mappedPos) {
      setNewPlayerPos(mappedPos);
    }
    setIsSearching(false);
  };

  const resetBoard = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Reset posisi pemain? Pemain akan kembali ke cadangan.")) {
      const allPlayers = [
        ...bench,
        ...lineup.map(({ x, y, ...p }) => p),
      ];
      setLineup([]);
      setBench(allPlayers);
    }
  };

  const factoryReset = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Hapus SEMUA data dan kembali ke awal?")) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("football_lineup_v2");
        window.localStorage.removeItem("football_bench_v2");
        window.location.reload();
      }
    }
  };

  const handleScreenshot = async () => {
    if (!fieldRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      const dataUrl = await htmlToImage.toPng(fieldRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#065f46",
      });

      const link = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      link.download = `lineup-${date}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Gagal membuat screenshot:", error);
      // eslint-disable-next-line no-alert
      alert("Gagal membuat gambar. Coba lagi.");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="bg-slate-950/90 text-slate-100 font-sans p-3 md:p-5 rounded-2xl border border-slate-800 shadow-2xl select-none">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 flex flex-col">
          <header className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 flex items-center gap-2">
                FREE-FORM BUILDER
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 font-normal normal-case flex items-center gap-1">
                  <span
                    className={
                      saveStatus === "Saving."
                        ? "animate-pulse text-yellow-400"
                        : "text-emerald-400"
                    }
                  >
                    ●
                  </span>
                  {saveStatus}
                </span>
              </h2>
              <p className="text-slate-400 text-sm">
                Drag &amp; drop bebas tanpa batas slot!
              </p>
            </div>

            <div className="flex gap-2 items-center">
              <div className="relative group">
                <div className="absolute -top-3 left-0 text-[9px] text-slate-400 bg-slate-950 px-1">
                  Snap to:
                </div>
                <select
                  value={currentFormation}
                  onChange={applyFormationTemplate}
                  className="appearance-none bg-slate-800 border border-slate-600 text-white py-2 pl-4 pr-10 rounded font-bold cursor-pointer hover:bg-slate-700 focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  {Object.keys(FORMATIONS).map((fmt) => (
                    <option key={fmt} value={fmt}>
                      {fmt}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">
                  ▼
                </span>
              </div>

              <button
                type="button"
                onClick={handleScreenshot}
                disabled={isCapturing}
                className="hidden sm:inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded border border-slate-700 text-xs font-bold transition-colors"
                title="Screenshot dan simpan sebagai gambar"
              >
                <span>📷</span>
                <span>Screenshot</span>
              </button>

              <button
                type="button"
                onClick={resetBoard}
                className="bg-slate-800 hover:bg-yellow-600/80 text-yellow-100 p-2.5 rounded border border-slate-700 transition-colors"
                title="Clear Field"
              >
                ⟳
              </button>

              <button
                type="button"
                onClick={factoryReset}
                className="bg-slate-800 hover:bg-red-600/80 text-red-100 p-2.5 rounded border border-slate-700 transition-colors"
                title="Hard Reset"
              >
                🗑
              </button>
            </div>
          </header>

          <div
            ref={fieldRef}
            onDragOver={handleDragOver}
            onDrop={handleDropOnField}
            className="relative w-full max-w-3xl aspect-[90/68] bg-emerald-700 rounded-xl border-[6px] border-emerald-900 shadow-2xl overflow-hidden ring-1 ring-white/10 cursor-crosshair mx-auto"
          >
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.5) 50%)",
                backgroundSize: "100% 10%",
              }}
            />
            <div className="absolute inset-5 border-[3px] border-white/60 pointer-events-none rounded-sm" />
            {/* garis tengah vertikal */}
            <div className="absolute top-5 bottom-5 left-1/2 w-[3px] bg-white/60 -translate-x-1/2 pointer-events-none" />
            {/* lingkaran tengah */}
            <div className="absolute top-1/2 left-1/2 w-32 h-32 border-[3px] border-white/60 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none flex items-center justify-center">
              <div className="w-2 h-2 bg-white/60 rounded-full" />
            </div>
            {/* kotak penalti kiri */}
            <div className="absolute left-5 top-1/2 -translate-y-1/2 w-[15%] h-[40%] border-[3px] border-l-0 border-white/60 pointer-events-none bg-white/5" />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 w-[5%] h-[18%] border-[3px] border-l-0 border-white/60 pointer-events-none" />
            {/* kotak penalti kanan */}
            <div className="absolute right-5 top-1/2 -translate-y-1/2 w-[15%] h-[40%] border-[3px] border-r-0 border-white/60 pointer-events-none bg-white/5" />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 w-[5%] h-[18%] border-[3px] border-r-0 border-white/60 pointer-events-none" />

            {lineup.map((player) => (
              <div
                key={player.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-300 ease-out"
                style={{ top: `${player.y}%`, left: `${player.x}%` }}
              >
                <PlayerCard
                  player={player}
                  small
                  onDragStart={(event) =>
                    handleDragStart(event, player, "field")
                  }
                />
              </div>
            ))}

            {lineup.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-white/30 font-bold text-xl pointer-events-none">
                Drop Players Anywhere
              </div>
            )}
          </div>
        </div>

        <div className="md:w-80 flex flex-col gap-4">
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 shadow-xl">
            <h3 className="font-bold text-slate-300 mb-3 flex items-center gap-2 text-sm">
              <span className="text-cyan-400">🔍</span>
              Cari Pemain
            </h3>
            <form onSubmit={addNewPlayer} className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Nama (cth: Neymar)"
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                value={newPlayerName}
                onChange={(event) => setNewPlayerName(event.target.value)}
                disabled={isSearching}
              />
              <div className="flex gap-2">
                <select
                  value={newPlayerPos}
                  onChange={(event) => setNewPlayerPos(event.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white text-sm flex-1 cursor-pointer"
                  disabled={isSearching}
                >
                  <option value="GK">GK</option>
                  <option value="DEF">DEF</option>
                  <option value="MID">MID</option>
                  <option value="FWD">FWD</option>
                </select>
                <button
                  type="submit"
                  disabled={isSearching || !newPlayerName.trim()}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className={isSearching ? "animate-spin" : ""}>
                    {isSearching ? "⟳" : "+"}
                  </span>
                </button>
              </div>
            </form>
          </div>

          <div className="flex-1 bg-slate-900/90 p-4 rounded-xl border border-slate-700 flex flex-col shadow-xl">
            <h2 className="text-lg font-bold mb-3 text-slate-300 flex items-center gap-2">
              <div className="w-2 h-5 bg-yellow-500 rounded-sm" />
              Cadangan ({bench.length})
            </h2>
            <div
              className="flex-1 overflow-y-auto max-h-[500px] min-h-[200px] bg-black/30 p-2 rounded-lg grid grid-cols-3 gap-2 content-start custom-scrollbar"
              onDragOver={handleDragOver}
              onDrop={handleDropOnBench}
            >
              {bench.length === 0 && (
                <div className="col-span-3 text-center text-slate-500 py-10 text-xs italic">
                  Cadangan kosong.
                  <br />
                  Tarik pemain dari lapangan ke sini.
                </div>
              )}
              {bench.map((item) => (
                <div key={item.id} className="flex justify-center">
                  <PlayerCard
                    player={item}
                    small
                    onDragStart={(event) =>
                      handleDragStart(event, item, "bench")
                    }
                  />
                </div>
              ))}
            </div>
            <p className="text-center text-[10px] text-slate-500 mt-2">
              Tip: Drag pemain di lapangan untuk menggeser posisi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
