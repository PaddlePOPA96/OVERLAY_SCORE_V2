"use client";

import { PlayerCard } from "./PlayerCard";

export function BuilderField({
  fieldRef,
  lineup,
  onDragOver,
  onDrop,
  onDragStart,
}) {
  return (
    <div
      ref={fieldRef}
      onDragOver={onDragOver}
      onDrop={onDrop}
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
            onDragStart={(event) => onDragStart(event, player, "field")}
          />
        </div>
      ))}

      {lineup.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-white/30 font-bold text-xl pointer-events-none">
          Drop Players Anywhere
        </div>
      )}
    </div>
  );
}

