'use client'

import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/services/firebase/index';

export default function FormationOverlay({ params }) {
  const roomId = params.room || 'default';
  
  const [overlayData, setOverlayData] = useState(null);
  
  // Animation states
  const [showState, setShowState] = useState('hidden'); // hidden, entering, visible, exiting

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
        if (showState !== 'hidden') {
          setShowState('exiting');
          setTimeout(() => {
            setShowState('hidden');
            setOverlayData(null);
          }, 800); // Wait for exit animation to finish
        }
      }
    });

    return () => unsubscribe();
  }, [roomId, showState]);

  if (showState === 'hidden' || !overlayData) {
    return null; 
  }

  const { teamInfo, players, substitutes } = overlayData;

  const getShortName = (fullName) => {
    if (!fullName) return '';
    let names = fullName.split(' ');
    let shortName = names.length > 1 ? names[names.length - 1] : names[0];
    if (fullName.toLowerCase().includes('van dijk')) shortName = 'Van Dijk';
    if (fullName.toLowerCase().includes('de jong')) shortName = 'F. de Jong';
    return shortName;
  };

  return (
    <div className="bg-transparent min-h-screen p-4 flex justify-center items-center font-sans text-black overflow-hidden perspective-1000">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes boardEnter {
          0% { transform: translateY(120%) scale(0.9) rotateX(10deg); opacity: 0; }
          100% { transform: translateY(0) scale(1) rotateX(0deg); opacity: 1; }
        }
        @keyframes boardExit {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(120%) scale(0.9); opacity: 0; }
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
            opacity: 0; /* Starts hidden, triggered by animation */
            margin-top: -30px;
        }
        .player-image-container {
            width: 115px;
            height: 125px;
            overflow: hidden;
            background-color: transparent; 
            display: flex;
            justify-content: center;
            align-items: flex-end;
        }
        .player-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: top center;
            transform: scale(1.75); 
            transform-origin: top center; 
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
      `}} />

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
              className="pitch-container w-full h-[810px] shadow-inner"
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
                      className="player-image drop-shadow-lg" 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/90x100?text=Player' }} 
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
    </div>
  );
}
