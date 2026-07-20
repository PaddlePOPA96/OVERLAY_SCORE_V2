'use client'

import { useState, useEffect } from 'react'
import { ref, onValue, update, get } from 'firebase/database'

import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { db } from '@/services/firebase/index'
import playerData from '@/data/fix-playerpildun32.json'

const formationMap = {
  "Meksiko": "4-3-3", "Afrika Selatan": "4-2-3-1", "Swiss": "4-2-3-1", "Kanada": "3-4-2-1",
  "Bosnia dan Herzegovina": "4-4-2", "Brasil": "4-3-3", "Maroko": "4-3-3", "AS": "4-2-3-1",
  "Amerika Serikat": "4-2-3-1", "Australia": "5-4-1", "Paraguay": "4-1-4-1", "Jerman": "4-2-3-1",
  "Pantai Gading": "4-3-3", "Ekuador": "3-4-3", "Belanda": "3-4-1-2", "Jepang": "3-4-2-1",
  "Swedia": "4-4-2", "Belgia": "4-3-3", "Mesir": "4-4-2", "Spanyol": "4-3-3",
  "Tanjung Verde": "5-4-1", "Prancis": "4-2-3-1", "Norwegia": "4-3-3", "Senegal": "4-4-2",
  "Argentina": "4-3-3", "Austria": "4-2-3-1", "Aljazair": "4-3-3", "Kolombia": "4-2-3-1",
  "Portugal": "4-3-3", "RD Kongo": "4-4-2", "Inggris": "4-2-3-1", "Kroasia": "4-3-3", "Ghana": "4-2-3-1"
};

const formationPositions = {
  "4-3-3": [
    { top: '80%', left: '43%' }, { top: '60%', left: '10%' }, { top: '60%', left: '32%' },
    { top: '60%', left: '54%' }, { top: '60%', left: '76%' }, { top: '40%', left: '25%' },
    { top: '40%', left: '43%' }, { top: '40%', left: '62%' }, { top: '17%', left: '15%' },
    { top: '10%', left: '43%' }, { top: '17%', left: '71%' }
  ],
  "4-1-2-3": [
    { top: '80%', left: '43%' },
    { top: '63%', left: '10%' }, { top: '63%', left: '32%' }, { top: '63%', left: '54%' }, { top: '63%', left: '76%' },
    { top: '48%', left: '43%' },
    { top: '33%', left: '26%' }, { top: '33%', left: '60%' },
    { top: '17%', left: '15%' }, { top: '10%', left: '43%' }, { top: '17%', left: '71%' }
  ],
  "4-2-3-1": [
    { top: '80%', left: '43%' }, { top: '63%', left: '10%' }, { top: '63%', left: '32%' },
    { top: '63%', left: '54%' }, { top: '63%', left: '76%' }, { top: '43%', left: '32%' },
    { top: '43%', left: '54%' }, { top: '25%', left: '15%' }, { top: '25%', left: '43%' },
    { top: '25%', left: '71%' }, { top: '7%', left: '43%' }
  ],
  "3-4-2-1": [
    { top: '80%', left: '43%' }, { top: '60%', left: '20%' }, { top: '60%', left: '43%' },
    { top: '60%', left: '66%' }, { top: '40%', left: '10%' }, { top: '40%', left: '32%' },
    { top: '40%', left: '54%' }, { top: '40%', left: '76%' }, { top: '23%', left: '32%' },
    { top: '23%', left: '54%' }, { top: '7%', left: '43%' }
  ],
  "4-4-2": [
    { top: '80%', left: '43%' }, { top: '60%', left: '10%' }, { top: '60%', left: '32%' },
    { top: '60%', left: '54%' }, { top: '60%', left: '76%' }, { top: '35%', left: '10%' },
    { top: '35%', left: '32%' }, { top: '35%', left: '54%' }, { top: '35%', left: '76%' },
    { top: '10%', left: '32%' }, { top: '10%', left: '54%' }
  ],
  "5-4-1": [
    { top: '80%', left: '43%' }, { top: '60%', left: '5%' }, { top: '60%', left: '24%' },
    { top: '60%', left: '43%' }, { top: '60%', left: '62%' }, { top: '60%', left: '81%' },
    { top: '35%', left: '15%' }, { top: '35%', left: '34%' }, { top: '35%', left: '52%' },
    { top: '35%', left: '71%' }, { top: '10%', left: '43%' }
  ],
  "4-1-4-1": [
    { top: '80%', left: '43%' }, { top: '63%', left: '10%' }, { top: '63%', left: '32%' },
    { top: '63%', left: '54%' }, { top: '63%', left: '76%' }, { top: '47%', left: '43%' },
    { top: '30%', left: '10%' }, { top: '30%', left: '32%' }, { top: '30%', left: '54%' },
    { top: '30%', left: '76%' }, { top: '10%', left: '43%' }
  ],
  "3-4-3": [
    { top: '80%', left: '43%' }, { top: '60%', left: '20%' }, { top: '60%', left: '43%' },
    { top: '60%', left: '66%' }, { top: '40%', left: '10%' }, { top: '40%', left: '32%' },
    { top: '40%', left: '54%' }, { top: '40%', left: '76%' }, { top: '20%', left: '20%' },
    { top: '10%', left: '43%' }, { top: '20%', left: '66%' }
  ],
  "3-4-1-2": [
    { top: '80%', left: '43%' }, { top: '60%', left: '20%' }, { top: '60%', left: '43%' },
    { top: '60%', left: '66%' }, { top: '40%', left: '10%' }, { top: '40%', left: '32%' },
    { top: '40%', left: '54%' }, { top: '40%', left: '76%' }, { top: '25%', left: '43%' },
    { top: '10%', left: '32%' }, { top: '10%', left: '54%' }
  ],
  "4-2-1-3": [
    { top: '80%', left: '43%' }, { top: '63%', left: '10%' }, { top: '63%', left: '32%' },
    { top: '63%', left: '54%' }, { top: '63%', left: '76%' }, { top: '47%', left: '32%' },
    { top: '47%', left: '54%' }, { top: '32%', left: '43%' }, { top: '17%', left: '15%' },
    { top: '10%', left: '43%' }, { top: '17%', left: '71%' }
  ]
};

const availableFormations = Object.keys(formationPositions);

const cleanPayload = (obj) => JSON.parse(JSON.stringify(obj));

export default function FormationOverlayControl({ theme = 'light', roomId = 'default' }) {
  const overlayPath = `match_live/${roomId}/formation_overlay`;

  const [activeTab, setActiveTab] = useState('home');

  const [homeTeam, setHomeTeam] = useState('Belanda');
  const [homeFormation, setHomeFormation] = useState('3-4-1-2');
  const [homePlayers, setHomePlayers] = useState([]);
  const [homeSubstitutes, setHomeSubstitutes] = useState([]);
  const [homeTeamInfo, setHomeTeamInfo] = useState({});

  const [awayTeam, setAwayTeam] = useState('Argentina');
  const [awayFormation, setAwayFormation] = useState('4-3-3');
  const [awayPlayers, setAwayPlayers] = useState([]);
  const [awaySubstitutes, setAwaySubstitutes] = useState([]);
  const [awayTeamInfo, setAwayTeamInfo] = useState({});

  const [isVisible, setIsVisible] = useState(false);
  const [remoteState, setRemoteState] = useState(null);
  const [hostUrl, setHostUrl] = useState('');

  const loadTeamData = async (teamName) => {
    let team = playerData.find(t => t.negara === teamName);
    if (!team) team = playerData[0];

    try {
      const snapshot = await get(ref(db, `match_live/global_formation_presets/${teamName}`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const localTeamData = playerData.find(t => t.negara === teamName);
        const updatePhoto = (player) => {
          if (!localTeamData || !player) return player;
          const freshPlayer = localTeamData.pemain.find(p => p.nama_pemain === player.nama_pemain);
          return freshPlayer ? { ...player, link_foto: freshPlayer.link_foto } : player;
        };

        const updatedPlayers = (data.players || []).map(updatePhoto);
        const updatedSubstitutes = (data.substitutes || []).map(updatePhoto);

        return {
          teamInfo: {
            negara: team.negara,
            formation: data.formation || '4-3-3',
            link_bendera: team.link_bendera || '',
            pelatih: team.pelatih || '',
            link_foto_pelatih: team.link_foto_pelatih || ''
          },
          players: updatedPlayers,
          substitutes: updatedSubstitutes,
          formation: data.formation || '4-3-3'
        };
      }
    } catch (error) {
      console.warn('Could not load preset from Firebase:', error);
    }

    const defaultForm = formationMap[team.negara] || '4-3-3';
    const initialPositions = formationPositions[defaultForm] || formationPositions["4-3-3"];
    const teamPlayers = team.pemain || [];

    const initialStartingXI = Array.from({ length: 11 }).map((_, index) => ({
      id: `slot-${index}`,
      isEmpty: true,
      styleTop: initialPositions[index]?.top || '50%',
      styleLeft: initialPositions[index]?.left || '50%',
      type: 'player'
    }));

    const initialSubstitutes = teamPlayers.map((p, index) => ({
      ...p,
      id: `sub-${index}`,
      type: 'sub'
    }));

    return {
      teamInfo: {
        negara: team.negara,
        formation: defaultForm,
        link_bendera: team.link_bendera || '',
        pelatih: team.pelatih || '',
        link_foto_pelatih: team.link_foto_pelatih || ''
      },
      players: initialStartingXI,
      substitutes: initialSubstitutes,
      formation: defaultForm
    };
  };

  useEffect(() => {
    const initData = async () => {
      const savedHomeTeam = localStorage.getItem('lastFormationTeam_home') || 'Belanda';
      const savedAwayTeam = localStorage.getItem('lastFormationTeam_away') || 'Argentina';
      
      setHomeTeam(savedHomeTeam);
      setAwayTeam(savedAwayTeam);

      const homeRes = await loadTeamData(savedHomeTeam);
      setHomeTeamInfo(homeRes.teamInfo);
      setHomePlayers(homeRes.players);
      setHomeSubstitutes(homeRes.substitutes);
      setHomeFormation(homeRes.formation);

      const awayRes = await loadTeamData(savedAwayTeam);
      setAwayTeamInfo(awayRes.teamInfo);
      setAwayPlayers(awayRes.players);
      setAwaySubstitutes(awayRes.substitutes);
      setAwayFormation(awayRes.formation);
    };

    initData();
  }, []);

  useEffect(() => {
    if (!roomId) return;
    const dbRef = ref(db, overlayPath);
    const unsubscribe = onValue(dbRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        setIsVisible(data.isVisible || false);
        setRemoteState(data);
      } else {
        setIsVisible(false);
        setRemoteState(null);
      }
    });

    if (typeof window !== 'undefined') {
      setHostUrl(window.location.origin);
    }
    return () => unsubscribe();
  }, [roomId, overlayPath]);

  const selectedTeam = activeTab === 'home' ? homeTeam : awayTeam;
  const selectedFormation = activeTab === 'home' ? homeFormation : awayFormation;
  const players = activeTab === 'home' ? homePlayers : awayPlayers;
  const substitutes = activeTab === 'home' ? homeSubstitutes : awaySubstitutes;
  const teamInfo = activeTab === 'home' ? homeTeamInfo : awayTeamInfo;

  const setPlayers = activeTab === 'home' ? setHomePlayers : setAwayPlayers;
  const setSubstitutes = activeTab === 'home' ? setHomeSubstitutes : setAwaySubstitutes;
  const setTeamInfo = activeTab === 'home' ? setHomeTeamInfo : setAwayTeamInfo;

  const handleTeamChange = async (newTeam) => {
    const res = await loadTeamData(newTeam);
    if (activeTab === 'home') {
      setHomeTeam(newTeam);
      setHomeFormation(res.formation);
      setHomePlayers(res.players);
      setHomeSubstitutes(res.substitutes);
      setHomeTeamInfo(res.teamInfo);
      localStorage.setItem('lastFormationTeam_home', newTeam);
    } else {
      setAwayTeam(newTeam);
      setAwayFormation(res.formation);
      setAwayPlayers(res.players);
      setAwaySubstitutes(res.substitutes);
      setAwayTeamInfo(res.teamInfo);
      localStorage.setItem('lastFormationTeam_away', newTeam);
    }
  };

  const handleFormationChange = (newFormation) => {
    const newPositions = formationPositions[newFormation];
    if (!newPositions) return;

    if (activeTab === 'home') {
      setHomeFormation(newFormation);
      setHomePlayers(prev => prev.map((p, i) => ({
        ...p,
        styleTop: newPositions[i]?.top || p.styleTop,
        styleLeft: newPositions[i]?.left || p.styleLeft
      })));
      setHomeTeamInfo(prev => ({ ...prev, formation: newFormation }));
    } else {
      setAwayFormation(newFormation);
      setAwayPlayers(prev => prev.map((p, i) => ({
        ...p,
        styleTop: newPositions[i]?.top || p.styleTop,
        styleLeft: newPositions[i]?.left || p.styleLeft
      })));
      setAwayTeamInfo(prev => ({ ...prev, formation: newFormation }));
    }
  };

  const handleShowHome = () => {
    update(ref(db, overlayPath), cleanPayload({
      isVisible: true,
      mode: 'home',
      home: { teamInfo: homeTeamInfo, players: homePlayers, substitutes: homeSubstitutes },
      away: { teamInfo: awayTeamInfo, players: awayPlayers, substitutes: awaySubstitutes },
      teamInfo: homeTeamInfo,
      players: homePlayers,
      substitutes: homeSubstitutes
    })).catch(console.error);
  };

  const handleShowAway = () => {
    update(ref(db, overlayPath), cleanPayload({
      isVisible: true,
      mode: 'away',
      home: { teamInfo: homeTeamInfo, players: homePlayers, substitutes: homeSubstitutes },
      away: { teamInfo: awayTeamInfo, players: awayPlayers, substitutes: awaySubstitutes },
      teamInfo: awayTeamInfo,
      players: awayPlayers,
      substitutes: awaySubstitutes
    })).catch(console.error);
  };

  const handleShowVS = () => {
    update(ref(db, overlayPath), cleanPayload({
      isVisible: true,
      mode: 'vs',
      home: { teamInfo: homeTeamInfo, players: homePlayers, substitutes: homeSubstitutes },
      away: { teamInfo: awayTeamInfo, players: awayPlayers, substitutes: awaySubstitutes }
    })).catch(console.error);
  };

  const handleUpdateOverlay = () => {
    const currentMode = remoteState?.mode || 'home';
    const payload = {
      isVisible: true,
      mode: currentMode,
      home: { teamInfo: homeTeamInfo, players: homePlayers, substitutes: homeSubstitutes },
      away: { teamInfo: awayTeamInfo, players: awayPlayers, substitutes: awaySubstitutes }
    };

    if (currentMode === 'home') {
      payload.teamInfo = homeTeamInfo;
      payload.players = homePlayers;
      payload.substitutes = homeSubstitutes;
    } else if (currentMode === 'away') {
      payload.teamInfo = awayTeamInfo;
      payload.players = awayPlayers;
      payload.substitutes = awaySubstitutes;
    }

    update(ref(db, overlayPath), cleanPayload(payload)).catch(console.error);
  };

  const handleHideOverlay = () => {
    update(ref(db, overlayPath), { isVisible: false }).catch(console.error);
  };

  const handleSavePreset = () => {
    update(ref(db, `match_live/global_formation_presets/${selectedTeam}`), cleanPayload({
      formation: selectedFormation,
      players,
      substitutes
    })).then(() => alert(`Formation for ${selectedTeam} Saved Globally!`))
      .catch(error => {
        console.error(error);
        alert('Gagal menyimpan: ' + error.message);
      });
  };

  const handleDragStart = (e, playerId, type) => {
    e.dataTransfer.setData('playerId', playerId);
    e.dataTransfer.setData('type', type);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const syncFirebase = (updatedPlayers, updatedSubstitutes) => {
    if (!isVisible) return;
    const currentMode = remoteState?.mode || 'home';
    const payload = {
      isVisible: true,
      mode: currentMode,
      home: {
        teamInfo: homeTeamInfo,
        players: activeTab === 'home' ? updatedPlayers : homePlayers,
        substitutes: activeTab === 'home' ? updatedSubstitutes : homeSubstitutes
      },
      away: {
        teamInfo: awayTeamInfo,
        players: activeTab === 'away' ? updatedPlayers : awayPlayers,
        substitutes: activeTab === 'away' ? updatedSubstitutes : awaySubstitutes
      }
    };
    
    if (currentMode === 'home') {
      payload.teamInfo = homeTeamInfo;
      payload.players = activeTab === 'home' ? updatedPlayers : homePlayers;
      payload.substitutes = activeTab === 'home' ? updatedSubstitutes : homeSubstitutes;
    } else if (currentMode === 'away') {
      payload.teamInfo = awayTeamInfo;
      payload.players = activeTab === 'away' ? updatedPlayers : awayPlayers;
      payload.substitutes = activeTab === 'away' ? updatedSubstitutes : awaySubstitutes;
    }

    update(ref(db, overlayPath), cleanPayload(payload)).catch(console.error);
  };

  const handleDrop = (e, targetPlayerId, targetType) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedPlayerId = e.dataTransfer.getData('playerId');
    const draggedType = e.dataTransfer.getData('type');

    if (!draggedPlayerId || draggedPlayerId === targetPlayerId) return;

    let newPlayers = [...players];
    let newSubstitutes = [...substitutes];
    const getPlayerIndex = (id, type) => type === 'player' ? newPlayers.findIndex(p => p.id === id) : newSubstitutes.findIndex(p => p.id === id);
    const draggedIndex = getPlayerIndex(draggedPlayerId, draggedType);

    if (draggedIndex === -1) return;

    if (targetType === 'unassign') {
      if (draggedType === 'player' && !newPlayers[draggedIndex].isEmpty) {
        const playerObj = newPlayers[draggedIndex];
        const newSub = { ...playerObj, styleTop: undefined, styleLeft: undefined, type: 'sub', id: `sub-${Date.now()}` };
        newSubstitutes.push(newSub);
        newPlayers[draggedIndex] = {
          id: `slot-${Date.now()}`,
          isEmpty: true,
          styleTop: playerObj.styleTop,
          styleLeft: playerObj.styleLeft,
          type: 'player'
        };
      }
      setPlayers(newPlayers);
      setSubstitutes(newSubstitutes);
      syncFirebase(newPlayers, newSubstitutes);
      return;
    }

    const targetIndex = getPlayerIndex(targetPlayerId, targetType);
    if (targetIndex === -1) return;

    if (draggedType === 'player' && targetType === 'player') {
      const p1 = newPlayers[draggedIndex];
      const p2 = newPlayers[targetIndex];
      const tempTop = p1.styleTop;
      const tempLeft = p1.styleLeft;
      p1.styleTop = p2.styleTop;
      p1.styleLeft = p2.styleLeft;
      p2.styleTop = tempTop;
      p2.styleLeft = tempLeft;
    } else if (draggedType === 'sub' && targetType === 'player') {
      const subObj = newSubstitutes[draggedIndex];
      const playerObj = newPlayers[targetIndex];
      const newPlayer = { ...subObj, styleTop: playerObj.styleTop, styleLeft: playerObj.styleLeft, type: 'player', id: `player-${Date.now()}` };
      if (playerObj.isEmpty) {
        newSubstitutes.splice(draggedIndex, 1);
      } else {
        const newSub = { ...playerObj, styleTop: undefined, styleLeft: undefined, type: 'sub', id: `sub-${Date.now()}` };
        newSubstitutes[draggedIndex] = newSub;
      }
      newPlayers[targetIndex] = newPlayer;
    } else if (draggedType === 'player' && targetType === 'sub') {
      const playerObj = newPlayers[draggedIndex];
      const subObj = newSubstitutes[targetIndex];
      if (playerObj.isEmpty) return;
      const newPlayer = { ...subObj, styleTop: playerObj.styleTop, styleLeft: playerObj.styleLeft, type: 'player', id: `player-${Date.now()}` };
      const newSub = { ...playerObj, styleTop: undefined, styleLeft: undefined, type: 'sub', id: `sub-${Date.now()}` };
      newPlayers[draggedIndex] = newPlayer;
      newSubstitutes[targetIndex] = newSub;
    } else if (draggedType === 'sub' && targetType === 'sub') {
      const temp = newSubstitutes[draggedIndex];
      newSubstitutes[draggedIndex] = newSubstitutes[targetIndex];
      newSubstitutes[targetIndex] = temp;
    }

    setPlayers(newPlayers);
    setSubstitutes(newSubstitutes);
    syncFirebase(newPlayers, newSubstitutes);
  };

  const handlePitchDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedPlayerId = e.dataTransfer.getData('playerId');
    const draggedType = e.dataTransfer.getData('type');
    
    if (draggedType !== 'player') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const styleLeft = `${Math.max(2, Math.min(98, (x / rect.width) * 100))}%`;
    const styleTop = `${Math.max(2, Math.min(98, (y / rect.height) * 100))}%`;

    const updatedPlayers = players.map(p => {
      if (p.id === draggedPlayerId) {
        return { ...p, styleTop, styleLeft };
      }
      return p;
    });

    setPlayers(updatedPlayers);
    syncFirebase(updatedPlayers, substitutes);
  };

  return (
    <div className="p-6 bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] w-full">
      <style dangerouslySetInnerHTML={{
        __html: `
          .op-pitch-container {
            background-color: #87e074;
            position: relative;
            overflow: hidden;
            border: 4px solid #000;
            width: 100%;
            height: 600px;
          }
          .op-pitch-center-circle {
            position: absolute;
            top: 0;
            left: 50%;
            width: 150px;
            height: 150px;
            border: 4px solid #000;
            border-radius: 50%;
            transform: translate(-50%, -50%);
          }
          .op-penalty-area-bottom {
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 50%;
            height: 18%;
            border: 4px solid #000;
            border-bottom: none;
            transform: translateX(-50%);
          }
          .op-goal-area-bottom {
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 20%;
            height: 6%;
            border: 4px solid #000;
            border-bottom: none;
            transform: translateX(-50%);
          }
          .op-penalty-arc-bottom {
            position: absolute;
            bottom: 18%;
            left: 50%;
            width: 100px;
            height: 50px;
            border: 4px solid #000;
            border-bottom: none;
            border-radius: 100px 100px 0 0;
            transform: translateX(-50%);
          }
          .op-corner-bl { position: absolute; bottom: 0; left: 0; width: 30px; height: 30px; border-right: 4px solid #000; border-top: 4px solid #000; border-radius: 0 100% 0 0; }
          .op-corner-br { position: absolute; bottom: 0; right: 0; width: 30px; height: 30px; border-left: 4px solid #000; border-top: 4px solid #000; border-radius: 100% 0 0 0; }
          .op-player-card {
            position: absolute;
            width: 100px;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: grab;
            transition: transform 0.1s;
            z-index: 20;
          }
          .op-player-card:active {
            cursor: grabbing;
            transform: scale(1.1) translate(-50%, -50%) !important;
            z-index: 50;
          }
          .op-player-image-container {
            width: 80px;
            height: 80px;
            overflow: hidden;
            background-color: transparent;
            position: relative;
            pointer-events: none;
            border: 3px solid #000;
            border-radius: 100%;
            background: white;
            box-shadow: 2px 2px 0px 0px #000;
          }
          .op-player-image {
            width: 140%;
            height: 140%;
            object-fit: cover;
            object-position: top center;
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
          }
          .op-player-name-tag {
            background-color: #fff;
            color: #000;
            font-size: 0.7rem;
            font-weight: 900;
            padding: 4px 6px;
            text-align: center;
            white-space: nowrap;
            width: 105%;
            overflow: hidden;
            text-overflow: ellipsis;
            border: 2px solid #000;
            box-shadow: 2px 2px 0px 0px #000;
            z-index: 10;
            margin-top: -5px;
            pointer-events: none;
            text-transform: uppercase;
          }
        `
      }} />

      {/* Tabs Switcher */}
      <div className="flex border-4 border-black mb-6 bg-slate-100 divide-x-4 divide-black">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex-1 py-3 font-black text-sm tracking-wider uppercase transition-colors ${
            activeTab === 'home'
              ? 'bg-[#00ffff] text-black'
              : 'text-black hover:bg-slate-200'
          }`}
        >
          🏠 Home Team Setup ({homeTeam})
        </button>
        <button
          onClick={() => setActiveTab('away')}
          className={`flex-1 py-3 font-black text-sm tracking-wider uppercase transition-colors ${
            activeTab === 'away'
              ? 'bg-[#ff3366] text-white'
              : 'text-black hover:bg-slate-200'
          }`}
        >
          ✈️ Away Team Setup ({awayTeam})
        </button>
      </div>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 pb-4 border-b-4 border-black">
        <h2 className="text-2xl font-black uppercase tracking-wider text-black">
          {activeTab === 'home' ? '🏠 Home' : '✈️ Away'} Formation Control
        </h2>

        <div className="flex flex-wrap items-center gap-4">
          <Select 
            label="Team"
            value={selectedTeam} 
            onChange={(e) => handleTeamChange(e.target.value)}
            className="min-w-[150px]"
            options={playerData.map(t => ({ value: t.negara, label: t.negara }))}
          />

          <Select 
            label="Formation"
            value={selectedFormation} 
            onChange={(e) => handleFormationChange(e.target.value)}
            className="min-w-[120px]"
            options={availableFormations.map(f => ({ value: f, label: f }))}
          />

          <Button variant="primary" onClick={handleSavePreset} className="mt-4 xl:mt-6">
            Save Preset
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="lg:w-2/3">
          <div className="mb-2 text-sm font-bold text-slate-700 bg-[#ccff00] p-2 border-2 border-black inline-block">
            Drag to swap players, or drop on empty space to move freely ({selectedTeam})
          </div>
          <div 
            className="op-pitch-container shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
            onDragOver={handleDragOver}
            onDrop={handlePitchDrop}
          >
            <div className="op-corner-bl"></div>
            <div className="op-corner-br"></div>
            <div className="op-pitch-center-circle"></div>
            <div className="op-penalty-area-bottom"></div>
            <div className="op-goal-area-bottom"></div>
            <div className="op-penalty-arc-bottom"></div>
            {players.map((player) => (
              <div
                key={player.id}
                className="op-player-card"
                style={{ top: player.styleTop, left: player.styleLeft, transform: 'translate(-50%, -50%)' }}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, player.id, 'player')}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, player.id, 'player')}
              >
                {player.isEmpty ? (
                  <div className="w-[60px] h-[60px] rounded-full border-4 border-black border-dashed bg-white/50 flex items-center justify-center pointer-events-none mt-4 backdrop-blur-sm">
                    <span className="ri-add-line text-2xl text-black font-black"></span>
                  </div>
                ) : (
                  <>
                    <div className="op-player-image-container">
                      <img src={player.link_foto} alt={player.nama_pemain} className="op-player-image" loading="lazy" decoding="async" onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/50' }} />
                    </div>
                    <div className="op-player-name-tag">
                      {player.nama_pemain}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          className="lg:w-1/3 flex flex-col h-[640px]"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'unassign', 'unassign')}
        >
          <h3 className="font-black mb-2 flex items-center gap-2 uppercase tracking-wider p-2 bg-[#ffcc00] border-2 border-black inline-block self-start">
            Squad / Substitutes
          </h3>
          <div className="flex-1 overflow-y-auto p-4 border-4 border-black bg-slate-100 shadow-[6px_6px_0_0_rgba(0,0,0,1)] custom-scrollbar">
            {Object.entries({
              'Penjaga Gawang': substitutes.filter(s => s.posisi === 'Penjaga Gawang'),
              'Pemain Bertahan': substitutes.filter(s => s.posisi === 'Pemain Bertahan'),
              'Gelandang': substitutes.filter(s => s.posisi === 'Gelandang'),
              'Pemain Depan': substitutes.filter(s => s.posisi === 'Pemain Depan')
            }).map(([role, subs]) => (
              <div key={role} className="mb-4">
                <h4 className="text-xs font-black text-black uppercase tracking-wider mb-2 border-b-2 border-black pb-1">{role}</h4>
                {subs.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-3 p-2 mb-2 bg-white border-2 border-black cursor-grab shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-all"
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, sub.id, 'sub')}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, sub.id, 'sub')}
                  >
                    <img src={sub.link_foto} alt={sub.nama_pemain} className="w-10 h-10 rounded-full object-cover border-2 border-black pointer-events-none bg-slate-200" loading="lazy" decoding="async" onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/40' }} />
                    <div className="flex-1 pointer-events-none">
                      <div className="font-black text-sm uppercase truncate text-black">{sub.nama_pemain}</div>
                      <div className="text-xs font-bold text-slate-500 uppercase">{sub.posisi}</div>
                    </div>
                  </div>
                ))}
                {subs.length === 0 && <div className="text-xs font-bold text-slate-500 uppercase italic mb-2">Tidak ada pemain</div>}
              </div>
            ))}
            <div className="mt-8 p-4 border-4 border-dashed border-[#ff3366] bg-[#ff3366]/10 text-center text-[#ff3366] hover:bg-[#ff3366]/20 transition-colors flex flex-col items-center gap-2 pointer-events-none">
              <i className="ri-delete-bin-line text-2xl font-black"></i>
              <span className="text-sm font-black uppercase tracking-wider">Tarik pemain ke sini untuk menghapusnya dari lapangan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-8 pt-6 border-t-4 border-black">
        <div className="p-2 border-2 border-black bg-white inline-block">
          {isVisible ? (
            <span className="text-[#ff3366] font-black uppercase tracking-wider flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff3366] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ff3366]"></span>
              </span>
              ON AIR: {remoteState?.mode === 'vs' ? 'VS MODE' : remoteState?.mode === 'away' ? 'AWAY TEAM' : 'HOME TEAM'}
            </span>
          ) : (
            <span className="text-slate-500 font-black uppercase tracking-wider">OFF AIR</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {isVisible && (
            <Button variant="outline" className="bg-[#ffcc00]" onClick={handleUpdateOverlay}>
              Update Live
            </Button>
          )}
          <Button variant="outline" className="bg-[#00ffff]" onClick={handleShowHome}>
            Show Home
          </Button>
          <Button variant="outline" className="bg-[#ff3366] text-white" onClick={handleShowAway}>
            Show Away
          </Button>
          <Button variant="outline" className="bg-[#ccff00]" onClick={handleShowVS}>
            Show VS Mode
          </Button>
          {isVisible && (
            <Button variant="outline" className="bg-black text-white" onClick={handleHideOverlay}>
              Hide Overlay
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t-4 border-black">
        <label className="block text-sm font-black uppercase tracking-wider mb-2 text-black">
          OBS Overlay URL (Single & VS)
        </label>
        <div className="flex items-center gap-0 border-4 border-black p-1 bg-white">
          <input
            type="text"
            readOnly
            value={`${hostUrl}/${roomId}/formation`}
            className="flex-1 p-2 font-bold text-sm outline-none bg-transparent"
          />
          <Button
            variant="primary"
            onClick={() => {
              navigator.clipboard.writeText(`${hostUrl}/${roomId}/formation`)
              alert('URL Copied!')
            }}
          >
            Copy
          </Button>
        </div>
        <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-wider">
          Gunakan URL ini di OBS Browser Source. Set ukuran yang direkomendasikan: 1920x1080.
        </p>
      </div>
    </div>
  );
}