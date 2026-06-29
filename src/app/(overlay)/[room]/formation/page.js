'use client'

import React, { useState, useEffect, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/services/firebase/index';

export default function FormationOverlay({ params }) {
  const roomId = params.room || 'default';

  const [overlayData, setOverlayData] = useState(null);

  // Animation states
  const [showState, setShowState] = useState('hidden'); // hidden, entering, visible, exiting

  // Keep track of the latest showState in a ref to avoid resubscribing to Firebase on every animation state change
  const showStateRef = useRef(showState);
  useEffect(() => {
    showStateRef.current = showState;
  }, [showState]);

  useEffect(() => {
    if (!roomId) return;
    const dbRef = ref(db, `match_live/${roomId}/formation_overlay`);

    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val();

      if (data && data.isVisible) {
        setOverlayData(data);
        setShowState('entering');
      } else {
        // If data is hidden but we are currently showing, trigger exit
        if (showStateRef.current !== 'hidden') {
          setShowState('exiting');
          setTimeout(() => {
            setShowState('hidden');
            setOverlayData(null);
          }, 800); // Wait for exit animation to finish
        }
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  if (showState === 'hidden' || !overlayData) {
    return null;
  }

  // Parse mode and data safely (for backward compatibility)
  const mode = overlayData.mode || 'home';

  const homeData = overlayData.home || (overlayData.teamInfo ? {
    teamInfo: overlayData.teamInfo,
    players: overlayData.players,
    substitutes: overlayData.substitutes
  } : null);

  const awayData = overlayData.away || null;

  // Active single data (if mode is home or away)
  const activeSingleData = mode === 'away' ? awayData : homeData;

  const getShortName = (fullName) => {
    if (!fullName) return '';
    let names = fullName.split(' ');
    let shortName = names.length > 1 ? names[names.length - 1] : names[0];
    if (fullName.toLowerCase().includes('van dijk')) shortName = 'Van Dijk';
    if (fullName.toLowerCase().includes('de jong')) shortName = 'F. de Jong';
    return shortName;
  };

  const parsePct = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    return parseFloat(val.replace('%', ''));
  };

  // Maps vertical position (top, left) to landscape position for left half (Home) or right half (Away)
  const getLandscapePosition = (player, isHome) => {
    const topVal = parsePct(player.styleTop);
    const leftVal = parsePct(player.styleLeft);

    const landscapeTop = 36 + (leftVal - 43) * 0.85;
    const clampedTop = Math.max(5, Math.min(88, landscapeTop));

    if (isHome) {
      // Home sudah aman, tidak diubah
      const landscapeLeft = 40 - ((topVal - 7) / 73) * 38;
      return { top: `${clampedTop}%`, left: `${landscapeLeft}%` };
    } else {
      // Away: kurangi anchor dan range supaya GK tidak keluar
      // GK (topVal=80): 58 + (73/73)*32 = 58+32 = 90% ✅
      // ST (topVal=7):  58 + (0/73)*32  = 58% ✅
      const landscapeLeft = 57 + ((topVal - 7) / 73) * 32;
      return { top: `${clampedTop}%`, left: `${landscapeLeft}%` };
    }
  };

  // Render Single layout (Vertical Pitch)
  const renderSingleLayout = (data) => {
    if (!data) return null;
    const { teamInfo, players, substitutes } = data;

    return (
      <main
        style={{ width: '1440px' }}
        className={`bg-[#f5f4ef] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-600 ${showState === 'exiting' ? 'board-exit' : 'board-enter'}`}
      >
        <header className="bg-[#1c1a1a] text-white p-6 px-10 flex items-center justify-between shadow-md relative z-20">
          <div className="flex items-center">
            {teamInfo?.link_bendera && (
              <div className="h-12 w-20 mr-6 overflow-hidden relative rounded-sm bg-gray-500 shadow-inner">
                <img
                  id="header-flag"
                  src={teamInfo.link_bendera}
                  alt={`Bendera ${teamInfo.negara}`}
                  className="w-full h-full object-cover absolute top-0 left-0 z-10"
                />
              </div>
            )}
            <h1 id="country-name" className="text-4xl md:text-5xl font-black uppercase tracking-tight drop-shadow-md">
              {teamInfo?.negara}
            </h1>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row p-6 md:p-10 gap-8 relative z-10">
          <div className="lg:w-3/4 flex flex-col">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-xl font-black uppercase text-gray-900 tracking-wide">FORMATION</h2>
                <p className="text-gray-700 text-lg font-bold tracking-widest">{teamInfo?.formation}</p>
              </div>
              {teamInfo?.pelatih && (
                <div className="flex items-center justify-end gap-4 text-right">
                  <div>
                    <h2 className="text-sm font-bold uppercase text-gray-500 tracking-wide">HEAD COACH</h2>
                    <p className="text-gray-900 text-lg font-black tracking-widest uppercase">{teamInfo.pelatih}</p>
                  </div>
                  {teamInfo?.link_foto_pelatih && (
                    <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-gray-800 shadow-md">
                      <img
                        src={teamInfo.link_foto_pelatih}
                        alt={teamInfo.pelatih}
                        className="w-full h-full object-cover object-top scale-[1.2] origin-top"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              id="pitch"
              className="pitch-container w-full h-[680px] shadow-inner"
            >
              <div className="corner-bl"></div>
              <div className="corner-br"></div>
              <div className="pitch-center-circle"></div>
              <div className="penalty-area-bottom"></div>
              <div className="goal-area-bottom"></div>
              <div className="penalty-arc-bottom"></div>

              {players?.filter(p => !p.isEmpty).map((player, index) => (
                <div
                  key={player.id}
                  id={player.id}
                  className="player-card"
                  style={{
                    top: player.styleTop,
                    left: player.styleLeft,
                    animation: showState === 'exiting' ? 'none' : `playerPopIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`,
                    animationDelay: `${0.8 + (index * 0.1)}s`
                  }}
                >
                  <div className="player-image-container">
                    <img
                      src={player.link_foto}
                      alt={player.nama_pemain}
                      className="player-image"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/90x100?text=Player' }}
                    />
                  </div>
                  <div className="player-name-tag">
                    {getShortName(player.nama_pemain)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/4 flex flex-col justify-between pt-16 border-l-2 border-gray-300 pl-8">
            <div>
              <h2 className="text-xl font-black uppercase text-gray-900 mb-6">Substitution</h2>
              <ul className="space-y-3 text-gray-800 font-semibold text-sm">
                {substitutes?.map((sub, index) => (
                  <li
                    key={sub.id}
                    className="flex items-center sub-item"
                    style={{
                      animation: showState === 'exiting' ? 'none' : `fadeSlideRight 0.4s ease forwards`,
                      animationDelay: `${1.2 + (index * 0.05)}s`
                    }}
                  >
                    <span>{sub.nama_pemain}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 mb-4">
              <h2 className="text-xl font-black uppercase text-gray-900 mb-3">Head Coach</h2>
              <p className="text-base font-semibold text-gray-700">Coach {teamInfo?.negara}</p>
            </div>
          </div>
        </div>
      </main>
    );
  };

  // Render VS layout (Landscape Pitch showing both teams)
  const renderVSLayout = () => {
    if (!homeData || !awayData) return <div className="text-white">Awaiting complete VS lineup data...</div>;

    const { teamInfo: homeTeamInfo, players: homePlayers, substitutes: homeSubstitutes } = homeData;
    const { teamInfo: awayTeamInfo, players: awayPlayers, substitutes: awaySubstitutes } = awayData;

    return (
      <main
        style={{ width: '1840px' }}
        className={`bg-[#f5f4ef] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-600 ${showState === 'exiting' ? 'board-exit' : 'board-enter'}`}
      >
        {/* Unified VS Header */}
        <header className="bg-[#1c1a1a] text-white p-6 px-12 flex items-center justify-between shadow-md relative z-20 border-b border-gray-800">
          {/* Home Team Header */}
          <div className="flex items-center w-5/12">
            {homeTeamInfo?.link_bendera && (
              <div className="h-12 w-20 mr-6 overflow-hidden relative rounded-sm bg-gray-500 shadow-inner">
                <img
                  src={homeTeamInfo.link_bendera}
                  alt={`Bendera ${homeTeamInfo.negara}`}
                  className="w-full h-full object-cover absolute top-0 left-0 z-10"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight drop-shadow-md">
                {homeTeamInfo?.negara}
              </h1>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                {homeTeamInfo?.formation} • Coach: {homeTeamInfo?.pelatih || 'N/A'}
              </p>
            </div>
          </div>

          {/* VS Center Indicator */}
          <div className="flex justify-center items-center w-2/12">
            <div className="bg-[#D9FF00] text-black font-black text-2xl px-6 py-2 rounded-full uppercase tracking-widest shadow-md">
              VS
            </div>
          </div>

          {/* Away Team Header */}
          <div className="flex items-center justify-end text-right w-5/12">
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight drop-shadow-md">
                {awayTeamInfo?.negara}
              </h1>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                Coach: {awayTeamInfo?.pelatih || 'N/A'} • {awayTeamInfo?.formation}
              </p>
            </div>
            {awayTeamInfo?.link_bendera && (
              <div className="h-12 w-20 ml-6 overflow-hidden relative rounded-sm bg-gray-500 shadow-inner">
                <img
                  src={awayTeamInfo.link_bendera}
                  alt={`Bendera ${awayTeamInfo.negara}`}
                  className="w-full h-full object-cover absolute top-0 left-0 z-10"
                />
              </div>
            )}
          </div>
        </header>

        {/* Symmetrical Split Layout: Left Subs | Landscape Pitch | Right Subs */}
        <div className="flex p-6 md:p-8 gap-6 relative z-10 items-stretch">
          {/* Left Panel: Home Substitutes */}
          <div className="w-1/6 flex flex-col justify-between border-r border-gray-300 pr-6">
            <div>
              <h2 className="text-md font-black uppercase text-blue-800 mb-4 border-b pb-1">Substitutes</h2>
              <ul className="space-y-2 text-gray-800 font-semibold text-xs">
                {homeSubstitutes?.slice(0, 10).map((sub, index) => (
                  <li
                    key={sub.id}
                    className="flex items-center sub-item"
                    style={{
                      animation: showState === 'exiting' ? 'none' : `fadeSlideRight 0.4s ease forwards`,
                      animationDelay: `${1.2 + (index * 0.05)}s`
                    }}
                  >
                    <span>{sub.nama_pemain}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Center Panel: Landscape Pitch */}
          <div className="w-4/6 flex flex-col justify-center">
            <div
              id="pitch-landscape"
              className="pitch-landscape w-full h-[650px] shadow-inner"
            >
              <div className="corner-tl"></div>
              <div className="corner-tr"></div>
              <div className="corner-bl-l"></div>
              <div className="corner-br-l"></div>
              <div className="pitch-landscape-center-line"></div>
              <div className="pitch-landscape-center-circle"></div>

              <div className="penalty-area-left"></div>
              <div className="penalty-arc-left"></div>
              <div className="goal-area-left"></div>

              <div className="penalty-area-right"></div>
              <div className="penalty-arc-right"></div>
              <div className="goal-area-right"></div>

              {/* Render Home Players (Left Side) */}
              {homePlayers?.filter(p => !p.isEmpty).map((player, index) => {
                const pos = getLandscapePosition(player, true);
                return (
                  <div
                    key={`home-${player.id}`}
                    style={{
                      top: pos.top,
                      left: pos.left,
                      position: 'absolute',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 20
                    }}
                  >
                    <div
                      className="player-card-landscape"
                      style={{
                        animation: showState === 'exiting' ? 'none' : `playerPopIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`,
                        animationDelay: `${0.8 + (index * 0.06)}s`
                      }}
                    >
                      <div className="player-image-container-landscape">
                        <img
                          src={player.link_foto}
                          alt={player.nama_pemain}
                          className="player-image-landscape"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/90x100?text=Player' }}
                        />
                      </div>
                      <div className="player-name-tag-landscape bg-blue-900 border border-blue-500/50">
                        {getShortName(player.nama_pemain)}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Render Away Players (Right Side) */}
              {awayPlayers?.filter(p => !p.isEmpty).map((player, index) => {
                const pos = getLandscapePosition(player, false);
                return (
                  <div
                    key={`away-${player.id}`}
                    style={{
                      top: pos.top,
                      left: pos.left,
                      position: 'absolute',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 20
                    }}
                  >
                    <div
                      className="player-card-landscape"
                      style={{
                        animation: showState === 'exiting' ? 'none' : `playerPopIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`,
                        animationDelay: `${0.8 + (index * 0.06)}s`
                      }}
                    >
                      <div className="player-image-container-landscape">
                        <img
                          src={player.link_foto}
                          alt={player.nama_pemain}
                          className="player-image-landscape"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/90x100?text=Player' }}
                        />
                      </div>
                      <div className="player-name-tag-landscape bg-red-900 border border-red-500/50">
                        {getShortName(player.nama_pemain)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Away Substitutes */}
          <div className="w-1/6 flex flex-col justify-between border-l border-gray-300 pl-6">
            <div>
              <h2 className="text-md font-black uppercase text-red-800 mb-4 border-b pb-1 text-right">Substitutes</h2>
              <ul className="space-y-2 text-gray-800 font-semibold text-xs text-right">
                {awaySubstitutes?.slice(0, 10).map((sub, index) => (
                  <li
                    key={sub.id}
                    className="flex items-center justify-end sub-item"
                    style={{
                      animation: showState === 'exiting' ? 'none' : `fadeSlideRight 0.4s ease forwards`,
                      animationDelay: `${1.2 + (index * 0.05)}s`
                    }}
                  >
                    <span>{sub.nama_pemain}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    );
  };

  return (
    <div className={`bg-transparent min-h-screen p-4 flex justify-center ${mode === 'vs' ? 'items-start pt-12' : 'items-center'} font-sans text-black overflow-hidden`}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes boardEnter {
          0% { transform: translateY(100px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes boardExit {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(100px); opacity: 0; }
        }
        @keyframes playerPopIn {
          0% { transform: scale(0) translateY(20px); opacity: 0; }
          60% { transform: scale(1.1) translateY(-5px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes fadeSlideRight {
          0% { transform: translateX(-20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        .board-enter {
          animation: boardEnter 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .board-exit {
          animation: boardExit 0.6s cubic-bezier(0.5, 0, 0.1, 1) forwards;
        }
        
        .pitch-container {
            background-color: transparent; 
            position: relative;
            overflow: hidden;
            border: 3px solid #1a1a1a;
            border-radius: 4px;
        }
        .pitch-center-circle {
            position: absolute;
            top: 0;
            left: 50%;
            width: 150px;
            height: 150px;
            border: 3px solid #1a1a1a;
            border-radius: 50%;
            transform: translate(-50%, -50%);
        }
        .penalty-area-bottom {
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 50%;
            height: 18%;
            border: 3px solid #1a1a1a;
            border-bottom: none;
            transform: translateX(-50%);
        }
        .goal-area-bottom {
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 20%;
            height: 6%;
            border: 3px solid #1a1a1a;
            border-bottom: none;
            transform: translateX(-50%);
        }
        .penalty-arc-bottom {
            position: absolute;
            bottom: 18%;
            left: 50%;
            width: 100px;
            height: 50px;
            border: 3px solid #1a1a1a;
            border-bottom: none;
            border-radius: 100px 100px 0 0;
            transform: translateX(-50%);
        }
        .corner-bl { position: absolute; bottom: 0; left: 0; width: 30px; height: 30px; border-right: 3px solid #1a1a1a; border-top: 3px solid #1a1a1a; border-radius: 0 100% 0 0; }
        .corner-br { position: absolute; bottom: 0; right: 0; width: 30px; height: 30px; border-left: 3px solid #1a1a1a; border-top: 3px solid #1a1a1a; border-radius: 100% 0 0 0; }

        .player-card {
            position: absolute;
            width: 120px;
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 20;
            opacity: 0;
            margin-top: -30px;
        }
        .player-image-container {
            width: 115px;
            height: 125px;
            overflow: hidden;
            background-color: transparent; 
            position: relative;
        }
        .player-image {
            width: 175%;
            height: 175%;
            object-fit: cover;
            object-position: top center;
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
        }
        .player-name-tag {
            background-color: #1a1a1a;
            color: white;
            font-size: 0.8rem;
            font-weight: 700;
            padding: 5px 8px;
            border-radius: 4px;
            text-align: center;
            white-space: nowrap;
            width: 105%;
            overflow: hidden;
            text-overflow: ellipsis;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            z-index: 10;
            margin-top: -5px;
        }
        
        .sub-item {
          opacity: 0;
        }

        /* Landscape Pitch styles (for VS Mode) */
        .pitch-landscape {
            background-color: transparent; 
            position: relative;
            overflow: hidden;
            border: 3px solid #1a1a1a;
            border-radius: 8px;
        }
        .pitch-landscape-center-line {
            position: absolute;
            top: 0;
            left: 50%;
            width: 3px;
            height: 100%;
            background-color: #1a1a1a;
            transform: translateX(-50%);
        }
        .pitch-landscape-center-circle {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 150px;
            height: 150px;
            border: 3px solid #1a1a1a;
            border-radius: 50%;
            transform: translate(-50%, -50%);
        }
        .penalty-area-left {
            position: absolute;
            left: 0;
            top: 50%;
            width: 16%;
            height: 48%;
            border: 3px solid #1a1a1a;
            border-left: none;
            transform: translateY(-50%);
        }
        .penalty-area-right {
            position: absolute;
            right: 0;
            top: 50%;
            width: 16%;
            height: 48%;
            border: 3px solid #1a1a1a;
            border-right: none;
            transform: translateY(-50%);
        }
        .goal-area-left {
            position: absolute;
            left: 0;
            top: 50%;
            width: 6%;
            height: 20%;
            border: 3px solid #1a1a1a;
            border-left: none;
            transform: translateY(-50%);
        }
        .goal-area-right {
            position: absolute;
            right: 0;
            top: 50%;
            width: 6%;
            height: 20%;
            border: 3px solid #1a1a1a;
            border-right: none;
            transform: translateY(-50%);
        }
        .penalty-arc-left {
            position: absolute;
            left: 16%;
            top: 50%;
            width: 40px;
            height: 80px;
            border: 3px solid #1a1a1a;
            border-left: none;
            border-radius: 0 80px 80px 0;
            transform: translate(-50%, -50%);
        }
        .penalty-arc-right {
            position: absolute;
            right: 16%;
            top: 50%;
            width: 40px;
            height: 80px;
            border: 3px solid #1a1a1a;
            border-right: none;
            border-radius: 80px 0 0 80px;
            transform: translate(50%, -50%);
        }
        .corner-tl { position: absolute; top: 0; left: 0; width: 20px; height: 20px; border-right: 3px solid #1a1a1a; border-bottom: 3px solid #1a1a1a; border-radius: 0 0 100% 0; }
        .corner-tr { position: absolute; top: 0; right: 0; width: 20px; height: 20px; border-left: 3px solid #1a1a1a; border-bottom: 3px solid #1a1a1a; border-radius: 0 0 0 100%; }
        .corner-bl-l { position: absolute; bottom: 0; left: 0; width: 20px; height: 20px; border-right: 3px solid #1a1a1a; border-top: 3px solid #1a1a1a; border-radius: 0 100% 0 0; }
        .corner-br-l { position: absolute; bottom: 0; right: 0; width: 20px; height: 20px; border-left: 3px solid #1a1a1a; border-top: 3px solid #1a1a1a; border-radius: 100% 0 0 0; }

        .player-card-landscape {
            position: absolute;
            width: 85px;
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 20;
            opacity: 0;
            transform: translate(-50%, -50%);
        }
        .player-image-container-landscape {
            width: 80px;
            height: 90px;
            overflow: hidden;
            background-color: transparent; 
            position: relative;
        }
        .player-image-landscape {
            width: 165%;
            height: 165%;
            object-fit: cover;
            object-position: top center;
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
        }
        .player-name-tag-landscape {
            color: white;
            font-size: 0.65rem;
            font-weight: 700;
            padding: 4px 6px;
            border-radius: 4px;
            text-align: center;
            white-space: nowrap;
            width: 105%;
            overflow: hidden;
            text-overflow: ellipsis;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            z-index: 10;
            margin-top: -3px;
        }
      `}} />

      {mode === 'vs' ? renderVSLayout() : renderSingleLayout(activeSingleData)}
    </div>
  );
}
