"use client";

import { PlayerCard } from "./PlayerCard";

export function BenchPanel({
  bench,
  onClearBench,
  onDragOver,
  onDrop,
  onDragStart,
  onRemoveFromBench,
}) {
  const hasPlayers = Array.isArray(bench) && bench.length > 0;

  return (
    <div className="flex-1 bg-slate-900/90 p-4 rounded-xl border border-slate-700 flex flex-col shadow-xl">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-300 flex items-center gap-2">
          <div className="w-2 h-5 bg-yellow-500 rounded-sm" />
          Cadangan ({bench.length})
        </h2>
        {hasPlayers && (
          <button
            type="button"
            onClick={onClearBench}
            className="text-[10px] px-2 py-1 rounded-full border border-slate-600 text-slate-300 hover:bg-red-600/80 hover:text-white hover:border-red-500 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div
        className="flex-1 overflow-y-auto max-h-[500px] min-h-[200px] bg-black/30 p-2 rounded-lg grid grid-cols-3 gap-2 content-start custom-scrollbar"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {!hasPlayers && (
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
              onDragStart={(event) => onDragStart(event, item, "bench")}
              onRemove={() => onRemoveFromBench(item.id)}
            />
          </div>
        ))}
      </div>

      <p className="text-center text-[10px] text-slate-500 mt-2">
        Tip: Drag pemain di lapangan untuk menggeser posisi.
      </p>
    </div>
  );
}

