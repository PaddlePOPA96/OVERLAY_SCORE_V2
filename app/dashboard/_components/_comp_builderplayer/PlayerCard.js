"use client";

import { useState } from "react";
import Image from "next/image";

export function PlayerCard({ player, onDragStart, small = false, onRemove }) {
  const [imgError, setImgError] = useState(false);
  const size = small ? 48 : 64;

  return (
    <div
      draggable
      onDragStart={(event) => onDragStart(event, player)}
      className={`relative group cursor-grab active:cursor-grabbing bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md flex flex-col items-center shadow-lg transition-transform hover:scale-110 select-none overflow-hidden z-20 ${small ? "p-1 w-20" : "p-2 w-24"
        }`}
    >
      <div
        className={`${small ? "w-12 h-12" : "w-16 h-16"
          } rounded-full bg-slate-700 mb-1 border-2 border-slate-500 overflow-hidden relative shadow-inner flex items-center justify-center`}
      >
        {!imgError && player.imgUrl ? (
          <Image
            src={player.imgUrl}
            alt={player.name}
            width={size}
            height={size}
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
          className={`font-bold text-white truncate w-full ${small ? "text-[10px]" : "text-xs"
            }`}
        >
          {player.name}
        </div>
        <div className="flex justify-center gap-1 mt-0.5">
          <span className="text-[9px] text-yellow-400 font-mono">
            {typeof player.rating === 'number' && player.rating > 0 && player.rating <= 100
              ? Math.round(player.rating)
              : '75'}
          </span>
          <span className="text-[9px] text-blue-300">
            {player.position}
          </span>
        </div>
      </div>

      {onRemove && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            onRemove();
          }}
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-[10px] text-white flex items-center justify-center shadow hover:bg-red-500"
          title="Hapus dari cadangan"
        >
          ×
        </button>
      )}
    </div>
  );
}
