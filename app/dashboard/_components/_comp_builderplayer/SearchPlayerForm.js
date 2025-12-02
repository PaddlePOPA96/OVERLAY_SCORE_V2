"use client";

export function SearchPlayerForm({
  newPlayerName,
  setNewPlayerName,
  newPlayerPos,
  setNewPlayerPos,
  isSearching,
  onSubmit,
}) {
  return (
    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 shadow-xl">
      <h3 className="font-bold text-slate-300 mb-3 flex items-center gap-2 text-sm">
        <span className="text-cyan-400">🔍</span>
        Cari Pemain
      </h3>
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
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
  );
}

