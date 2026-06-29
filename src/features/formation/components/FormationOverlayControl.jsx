'use client'

import { useState, useEffect } from 'react'
import { ref, onValue, update, get } from 'firebase/database'
import { db } from '@/services/firebase/index'

import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
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
  ]
};

const availableFormations = Object.keys(formationPositions);

// Helper to remove any undefined properties from object payloads before sending to Firebase
const cleanPayload = (obj) => JSON.parse(JSON.stringify(obj));

export default function FormationOverlayControl({ theme = 'dark', roomId = 'default' }) {
  const isDark = theme === 'dark';
  const overlayPath = `match_live/${roomId}/formation_overlay`;

  const [activeTab, setActiveTab] = useState('home'); // 'home' or 'away'

  // Home Team State
  const [homeTeam, setHomeTeam] = useState('Belanda');
  const [homeFormation, setHomeFormation] = useState('3-4-1-2');
  const [homePlayers, setHomePlayers] = useState([]);
  const [homeSubstitutes, setHomeSubstitutes] = useState([]);
  const [homeTeamInfo, setHomeTeamInfo] = useState({});

  // Away Team State
  const [awayTeam, setAwayTeam] = useState('Argentina');
  const [awayFormation, setAwayFormation] = useState('4-3-3');
  const [awayPlayers, setAwayPlayers] = useState([]);
  const [awaySubstitutes, setAwaySubstitutes] = useState([]);
  const [awayTeamInfo, setAwayTeamInfo] = useState({});

  const [isVisible, setIsVisible] = useState(false);
  const [remoteState, setRemoteState] = useState(null);
  const [hostUrl, setHostUrl] = useState('');

  // Helper function to load data for a specific team
  const loadTeamData = async (teamName) => {
    let team = playerData.find(t => t.negara === teamName);
    if (!team) team = playerData[0];

    try {
      const snapshot = await get(ref(db, `match_live/global_formation_presets/${teamName}`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Update photo from local json just in case it has changed
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

    // Fallback to default presets
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

  // On mount, load initial states for both home and away
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

  // Fetch Firebase state to show visibility status
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

  // Aliases for currently active tab elements
  const selectedTeam = activeTab === 'home' ? homeTeam : awayTeam;
  const selectedFormation = activeTab === 'home' ? homeFormation : awayFormation;
  const players = activeTab === 'home' ? homePlayers : awayPlayers;
  const substitutes = activeTab === 'home' ? homeSubstitutes : awaySubstitutes;
  const teamInfo = activeTab === 'home' ? homeTeamInfo : awayTeamInfo;

  const setPlayers = activeTab === 'home' ? setHomePlayers : setAwayPlayers;
  const setSubstitutes = activeTab === 'home' ? setHomeSubstitutes : setAwaySubstitutes;
  const setTeamInfo = activeTab === 'home' ? setHomeTeamInfo : setAwayTeamInfo;

  // Handlers for active tab edits
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

  // Firebase update controls
  const handleShowHome = () => {
    update(ref(db, overlayPath), cleanPayload({
      isVisible: true,
      mode: 'home',
      home: { teamInfo: homeTeamInfo, players: homePlayers, substitutes: homeSubstitutes },
      away: { teamInfo: awayTeamInfo, players: awayPlayers, substitutes: awaySubstitutes },
      // Keep root data for backward compatibility
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
      // Keep root data for backward compatibility
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

  // Drag and drop mechanics (works transparently based on aliased players/substitutes)
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
    <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'} shadow-lg border border-gray-700`}>
      <style dangerouslySetInnerHTML={{
        __html: `
          .op-pitch-container {
            background-color: transparent;
            position: relative;
            overflow: hidden;
            border: 3px solid ${isDark ? '#4a4a4a' : '#1a1a1a'};
            border-radius: 4px;
            width: 100%;
            height: 600px;
          }
          .op-pitch-center-circle {
            position: absolute;
            top: 0;
            left: 50%;
            width: 150px;
            height: 150px;
            border: 3px solid ${isDark ? '#4a4a4a' : '#1a1a1a'};
            border-radius: 50%;
            transform: translate(-50%, -50%);
          }
          .op-penalty-area-bottom {
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 50%;
            height: 18%;
            border: 3px solid ${isDark ? '#4a4a4a' : '#1a1a1a'};
            border-bottom: none;
            transform: translateX(-50%);
          }
          .op-goal-area-bottom {
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 20%;
            height: 6%;
            border: 3px solid ${isDark ? '#4a4a4a' : '#1a1a1a'};
            border-bottom: none;
            transform: translateX(-50%);
          }
          .op-penalty-arc-bottom {
            position: absolute;
            bottom: 18%;
            left: 50%;
            width: 100px;
            height: 50px;
            border: 3px solid ${isDark ? '#4a4a4a' : '#1a1a1a'};
            border-bottom: none;
            border-radius: 100px 100px 0 0;
            transform: translateX(-50%);
          }
          .op-corner-bl { position: absolute; bottom: 0; left: 0; width: 30px; height: 30px; border-right: 3px solid ${isDark ? '#4a4a4a' : '#1a1a1a'}; border-top: 3px solid ${isDark ? '#4a4a4a' : '#1a1a1a'}; border-radius: 0 100% 0 0; }
          .op-corner-br { position: absolute; bottom: 0; right: 0; width: 30px; height: 30px; border-left: 3px solid ${isDark ? '#4a4a4a' : '#1a1a1a'}; border-top: 3px solid ${isDark ? '#4a4a4a' : '#1a1a1a'}; border-radius: 100% 0 0 0; }
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
            width: 90px;
            height: 100px;
            overflow: hidden;
            background-color: transparent;
            position: relative;
            pointer-events: none;
          }
          .op-player-image {
            width: 175%;
            height: 175%;
            object-fit: cover;
            object-position: top center;
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
          }
          .op-player-name-tag {
            background-color: #1a1a1a;
            color: white;
            font-size: 0.7rem;
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
            margin-top: -5px;
            pointer-events: none;
          }
        `
      }} />

      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-700 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex-1 py-3 font-bold text-sm tracking-wider uppercase border-b-2 transition-all duration-200 rounded-t ${
            activeTab === 'home'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          🏠 Home Team Setup ({homeTeam})
        </button>
        <button
          onClick={() => setActiveTab('away')}
          className={`flex-1 py-3 font-bold text-sm tracking-wider uppercase border-b-2 transition-all duration-200 rounded-t ${
            activeTab === 'away'
              ? 'border-red-500 text-red-400 bg-red-500/10'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          ✈️ Away Team Setup ({awayTeam})
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>{activeTab === 'home' ? '🏠 Home' : '✈️ Away'} Formation Control</span>
        </h2>

        <div className="flex items-center gap-4">
          <FormControl size="small" className="min-w-[150px]">
            <InputLabel id="team-select-label" className={isDark ? "text-gray-300" : ""}>Team</InputLabel>
            <Select
              labelId="team-select-label"
              value={selectedTeam}
              label="Team"
              onChange={(e) => handleTeamChange(e.target.value)}
              className={isDark ? "text-white bg-gray-700" : ""}
            >
              {playerData.map(t => (
                <MenuItem key={t.negara} value={t.negara}>{t.negara}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" className="min-w-[120px]">
            <InputLabel id="formation-select-label" className={isDark ? "text-gray-300" : ""}>Formation</InputLabel>
            <Select
              labelId="formation-select-label"
              value={selectedFormation}
              label="Formation"
              onChange={(e) => handleFormationChange(e.target.value)}
              className={isDark ? "text-white bg-gray-700" : ""}
            >
              {availableFormations.map(f => (
                <MenuItem key={f} value={f}>{f}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSavePreset}
            className="font-bold bg-blue-600 h-[40px] px-6"
            startIcon={<span className="ri-save-line text-lg"></span>}
          >
            Save Preset
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="lg:w-2/3">
          <div className="mb-2 text-sm text-gray-400">Drag to swap players, or drop on empty space to move freely ({selectedTeam})</div>
          <div 
            className="op-pitch-container"
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
                  <div className="w-[60px] h-[60px] rounded-full border-[3px] border-dashed border-gray-400 bg-black/20 flex items-center justify-center pointer-events-none mt-4 shadow-lg backdrop-blur-sm">
                    <span className="ri-add-line text-2xl text-gray-400"></span>
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
          className="lg:w-1/3 flex flex-col h-[600px]"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'unassign', 'unassign')}
        >
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <span className="ri-group-line"></span> Squad / Substitutes
          </h3>
          <div className={`flex-1 overflow-y-auto p-4 rounded border ${isDark ? 'border-gray-600 bg-gray-900' : 'border-gray-300 bg-gray-100'} custom-scrollbar`}>
            {Object.entries({
              'Penjaga Gawang': substitutes.filter(s => s.posisi === 'Penjaga Gawang'),
              'Pemain Bertahan': substitutes.filter(s => s.posisi === 'Pemain Bertahan'),
              'Gelandang': substitutes.filter(s => s.posisi === 'Gelandang'),
              'Pemain Depan': substitutes.filter(s => s.posisi === 'Pemain Depan')
            }).map(([role, subs]) => (
              <div key={role} className="mb-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-600 pb-1">{role}</h4>
                {subs.map((sub) => (
                  <div
                    key={sub.id}
                    className={`flex items-center gap-3 p-2 mb-2 rounded cursor-grab ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} border border-gray-600 shadow-sm`}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, sub.id, 'sub')}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, sub.id, 'sub')}
                  >
                    <img src={sub.link_foto} alt={sub.nama_pemain} className="w-10 h-10 rounded-full object-cover border border-gray-500 pointer-events-none" loading="lazy" decoding="async" onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/40' }} />
                    <div className="flex-1 pointer-events-none">
                      <div className="font-bold text-sm truncate">{sub.nama_pemain}</div>
                      <div className="text-xs text-gray-400">{sub.posisi}</div>
                    </div>
                  </div>
                ))}
                {subs.length === 0 && <div className="text-xs text-gray-500 italic mb-2">Tidak ada pemain</div>}
              </div>
            ))}
            <div className="mt-8 p-4 border-2 border-dashed border-red-500/50 rounded text-center text-red-500/70 opacity-70 hover:opacity-100 transition-opacity flex flex-col items-center gap-2 pointer-events-none">
              <span className="ri-delete-bin-line text-2xl"></span>
              <span className="text-sm font-semibold">Tarik pemain ke sini untuk menghapusnya dari lapangan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6 pt-4 border-t border-gray-700">
        <div>
          {isVisible ? (
            <span className="text-green-500 font-bold flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              ON AIR: {remoteState?.mode === 'vs' ? 'VS MODE' : remoteState?.mode === 'away' ? 'AWAY TEAM' : 'HOME TEAM'}
            </span>
          ) : (
            <span className="text-gray-500 font-bold">OFF AIR</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {isVisible && (
            <Button variant="contained" color="warning" onClick={handleUpdateOverlay} className="font-bold normal-case h-[40px]">
              Update Live
            </Button>
          )}
          <Button variant="contained" color="primary" onClick={handleShowHome} className="font-bold normal-case h-[40px]">
            Show Home
          </Button>
          <Button variant="contained" color="secondary" onClick={handleShowAway} className="font-bold normal-case h-[40px] bg-purple-600 hover:bg-purple-700">
            Show Away
          </Button>
          <Button variant="contained" color="success" onClick={handleShowVS} className="font-bold bg-[#D9FF00] text-black hover:bg-[#b8d900] normal-case h-[40px]">
            Show VS Mode
          </Button>
          {isVisible && (
            <Button variant="contained" color="error" onClick={handleHideOverlay} className="font-bold normal-case h-[40px]">
              Hide Overlay
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700">
        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          OBS Overlay URL (Single & VS)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="text"
            readOnly
            value={`${hostUrl}/${roomId}/formation`}
            className={`flex-1 p-3 rounded-lg border text-sm outline-none transition-all ${isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'}`}
          />
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              navigator.clipboard.writeText(`${hostUrl}/${roomId}/formation`)
              alert('URL Copied!')
            }}
            className={`normal-case font-bold h-[46px] px-6 ${isDark ? 'border-gray-600' : 'border-gray-400'}`}
          >
            Copy
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Gunakan URL ini di OBS Browser Source. Set ukuran yang direkomendasikan: 1920x1080.
        </p>
      </div>
    </div>
  );
}