import React from 'react';
import { useScoreboard } from '@/shared/hooks/useScoreboard';

export default function StreamsPreviewDashboard({ roomId, theme }) {
    const { data, updateMatch } = useScoreboard(roomId);
    const isLight = theme === 'light';

    const handleScore = (team, increment) => {
        const currentScore = team === 'home' ? (data.homeScore || 0) : (data.awayScore || 0);
        const newScore = Math.max(0, currentScore + increment);
        updateMatch({
            [team === 'home' ? 'homeScore' : 'awayScore']: newScore
        });
    };

    return (
        <div className="flex flex-col gap-4 h-full w-full">
            <div className="flex justify-between items-center border-b-4 border-black pb-2">
                <h2 className="text-xl font-black uppercase tracking-wider text-black">Live Streams & Quick Score</h2>
                <a 
                    href="/streams" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white border-2 border-black font-bold text-xs uppercase hover:bg-slate-100 transition-colors"
                >
                    Buka di Tab Baru
                </a>
            </div>

            {/* Quick Score Controls */}
            <div className="p-4 bg-white border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <div className="flex flex-row items-center divide-x-4 divide-black">
                    {/* HOME */}
                    <div className="flex-1 flex flex-col items-center gap-2 px-4">
                        <span className="text-sm font-black uppercase tracking-wider text-black">
                            {data.homeName || 'HOME'}
                        </span>
                        <div className="flex items-center gap-4">
                            <button onClick={() => handleScore('home', -1)} className="w-8 h-8 flex items-center justify-center bg-white border-2 border-black hover:bg-slate-100 font-black text-xl">
                                -
                            </button>
                            <span className="text-3xl font-black min-w-[40px] text-center text-black">
                                {data.homeScore || 0}
                            </span>
                            <button onClick={() => handleScore('home', 1)} className="w-8 h-8 flex items-center justify-center bg-white border-2 border-black hover:bg-slate-100 font-black text-xl">
                                +
                            </button>
                        </div>
                    </div>

                    {/* AWAY */}
                    <div className="flex-1 flex flex-col items-center gap-2 px-4">
                        <span className="text-sm font-black uppercase tracking-wider text-black">
                            {data.awayName || 'AWAY'}
                        </span>
                        <div className="flex items-center gap-4">
                            <button onClick={() => handleScore('away', -1)} className="w-8 h-8 flex items-center justify-center bg-white border-2 border-black hover:bg-slate-100 font-black text-xl">
                                -
                            </button>
                            <span className="text-3xl font-black min-w-[40px] text-center text-black">
                                {data.awayScore || 0}
                            </span>
                            <button onClick={() => handleScore('away', 1)} className="w-8 h-8 flex items-center justify-center bg-white border-2 border-black hover:bg-slate-100 font-black text-xl">
                                +
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Iframe Preview */}
            <div className="flex-1 min-h-[680px] bg-black border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] overflow-hidden">
                <iframe
                    src="/streams?minimal=true"
                    width="100%"
                    height="100%"
                    style={{ border: 'none', display: 'block' }}
                    allowFullScreen
                    title="Live Streams Preview"
                ></iframe>
            </div>
        </div>
    );
}
