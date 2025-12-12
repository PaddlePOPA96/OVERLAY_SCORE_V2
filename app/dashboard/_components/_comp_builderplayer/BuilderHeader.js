"use client";

import { FORMATIONS } from "./builderConstants";
import { useRouter } from "next/navigation";

export function BuilderHeader({
  currentFormation,
  onChangeFormation,
  onScreenshot,
  onResetField,
  onFactoryReset,
  onSaveToFirebase,
  userId,
  saveStatus,
  isCapturing,
}) {
  const router = useRouter();
  return (
    <header className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 flex items-center gap-2">
          STARTING ELEVEN BUILDER
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
          Drag &amp; drop bebas tanpa batas slot! karna kita bukan arne slot
        </p>
      </div>

      <div className="flex gap-2 items-center">
        <div className="relative group">
          <div className="absolute -top-3 left-0 text-[9px] text-slate-400 bg-slate-950 px-1">
            Snap to:
          </div>
          <select
            value={currentFormation}
            onChange={onChangeFormation}
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
          onClick={onScreenshot}
          disabled={isCapturing}
          className="hidden sm:inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded border border-slate-700 text-xs font-bold transition-colors"
          title="Screenshot dan simpan sebagai gambar"
        >
          <span>📷</span>
          <span>Screenshot</span>
        </button>

        <button
          type="button"
          onClick={onSaveToFirebase}
          disabled={!userId}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 text-white px-3 py-2 rounded border border-slate-700 text-xs font-bold transition-colors"
          title={userId ? "Save to Firebase Cloud" : "Login to save to cloud"}
        >
          <span>☁️</span>
          <span>Save Cloud</span>
        </button>

        <button
          type="button"
          onClick={() => router.push('/dashboard/match')}
          disabled={!userId}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 text-white px-3 py-2 rounded border border-slate-700 text-xs font-bold transition-all"
          title={userId ? "Play against other users" : "Login to play matches"}
        >
          <span>⚔️</span>
          <span>Play VS</span>
        </button>

        <button
          type="button"
          onClick={onResetField}
          className="bg-slate-800 hover:bg-yellow-600/80 text-yellow-100 p-2.5 rounded border border-slate-700 transition-colors"
          title="Clear Field"
        >
          ⟳
        </button>

        <button
          type="button"
          onClick={onFactoryReset}
          className="bg-slate-800 hover:bg-red-600/80 text-red-100 p-2.5 rounded border border-slate-700 transition-colors"
          title="Hard Reset"
        >
          🗑
        </button>
      </div>
    </header>
  );
}

