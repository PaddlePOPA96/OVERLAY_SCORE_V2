"use client";

import { useEffect } from "react";

export function CandidateModal({ open, options, base, onCancel, onChoose }) {
  const show = open && Array.isArray(options) && options.length > 0;

  useEffect(() => {
    if (!show) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show, onCancel]);

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-slate-950 border border-slate-700 rounded-2xl p-4 w-full max-w-lg max-h-[80vh] flex flex-col gap-3 shadow-2xl">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Pilih pemain
            </h3>
            <p className="text-[11px] text-slate-400">
              Untuk kata kunci:{" "}
              <span className="font-mono text-slate-200">
                {base?.nameInput}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="mt-2 space-y-2 overflow-y-auto pr-1">
          {options.map((candidate) => (
            <button
              type="button"
              key={candidate.id}
              onClick={() => onChoose(candidate)}
              className="w-full flex items-center gap-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-left text-xs transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 overflow-hidden flex items-center justify-center flex-shrink-0">
                {candidate.imgUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={candidate.imgUrl}
                    alt={candidate.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] text-slate-400">NO PHOTO</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-100">
                    {candidate.name}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    {candidate.mappedPos || candidate.rawPosition || "?"}
                  </span>
                </div>
                <div className="mt-0.5 text-[10px] text-slate-400 flex flex-wrap gap-2">
                  {candidate.team && (
                    <span className="truncate max-w-[120px]">
                      {candidate.team}
                    </span>
                  )}
                  {candidate.nationality && (
                    <span className="px-2 py-[1px] rounded-full border border-slate-600 text-[9px]">
                      {candidate.nationality}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

