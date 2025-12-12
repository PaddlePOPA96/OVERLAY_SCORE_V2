"use client";

import { useState, useEffect, useRef } from "react";
import * as htmlToImage from "html-to-image";
import {
  INITIAL_PLAYERS,
  SPECIAL_PLAYERS,
  FORMATIONS,
  DEFAULT_SLOTS_BY_POSITION,
} from "./_comp_builderplayer/builderConstants";
import { BenchPanel } from "./_comp_builderplayer/BenchPanel";
import { CandidateModal } from "./_comp_builderplayer/CandidateModal";
import { BuilderHeader } from "./_comp_builderplayer/BuilderHeader";
import { BuilderField } from "./_comp_builderplayer/BuilderField";
import { SearchPlayerForm } from "./_comp_builderplayer/SearchPlayerForm";
import { searchPlayerByName } from "../../../lib/dreamTeamApi";
import { db } from "../../../lib/firebase";
import { ref, set, onValue } from "firebase/database";
import { auth } from "../../../lib/firebaseAuth";
import { onAuthStateChanged } from "firebase/auth";

export default function DreamElevenBuilder() {
  const fieldRef = useRef(null);

  const [lineup, setLineup] = useState([]);
  const [bench, setBench] = useState(INITIAL_PLAYERS);

  const [currentFormation, setCurrentFormation] = useState("4-3-3");
  const [draggedItem, setDraggedItem] = useState(null);
  const [sourceType, setSourceType] = useState(null);

  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerPos, setNewPlayerPos] = useState("ST");
  const [isSearching, setIsSearching] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [isCapturing, setIsCapturing] = useState(false);
  const [candidateOptions, setCandidateOptions] = useState([]);
  const [candidateBase, setCandidateBase] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [userId, setUserId] = useState(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  // Sync with Firebase
  useEffect(() => {
    if (!userId) return undefined;

    const dreamRef = ref(db, `dream_team/${userId}`);
    const unsubscribe = onValue(dreamRef, (snapshot) => {
      if (!snapshot.exists()) {
        setSaveStatus("Belum pernah disimpan");
        return;
      }

      const val = snapshot.val() || {};
      const savedLineup = Array.isArray(val.lineup) ? val.lineup : [];
      const savedPlayers = Array.isArray(val.players) ? val.players : [];

      if (savedLineup.length) {
        // Convert coordinates from mobile format (0-1) to web format (0-100)
        const convertedLineup = savedLineup.map((slot) => ({
          ...slot,
          x: slot.x < 2 ? slot.x * 100 : slot.x, // If x < 2, it's in 0-1 format, convert to 0-100
          y: slot.y < 2 ? slot.y * 100 : slot.y, // If y < 2, it's in 0-1 format, convert to 0-100
        }));
        setLineup(convertedLineup);
      }
      if (savedPlayers.length) {
        setBench((prev) => {
          const map = new Map(prev.map((p) => [p.id, p]));
          savedPlayers.forEach((p) => {
            if (p && p.id) {
              map.set(p.id, p);
            }
          });
          return Array.from(map.values());
        });
      }
      setSaveStatus("Loaded from Firebase");
    });

    return () => unsubscribe();
  }, [userId]);

  // Helper function to get next available slot for a position
  const getNextSlotForPosition = (position) => {
    const positionSlots = DEFAULT_SLOTS_BY_POSITION[position] || DEFAULT_SLOTS_BY_POSITION.MID;

    // Count how many players of this position are already on field
    // We check lineup to see which slots are taken
    const usedSlots = new Set(lineup.map(slot => `${slot.x},${slot.y}`));

    // Find first available slot for this position
    for (let i = 0; i < positionSlots.length; i++) {
      const slot = positionSlots[i];
      const slotKey = `${slot.x},${slot.y}`;
      if (!usedSlots.has(slotKey)) {
        return slot;
      }
    }

    // If all slots for this position are taken, return center position
    return { x: 50, y: 50 };
  };

  const applyFormationTemplate = (event) => {
    const formationName = event.target.value;
    setCurrentFormation(formationName);
    const coords = FORMATIONS[formationName];
    const newLineup = lineup.map((player, index) => {
      if (index < coords.length) {
        return { ...player, x: coords[index].x, y: coords[index].y };
      }
      return player;
    });
    setLineup(newLineup);
  };

  const handleDragStart = (event, item, source) => {
    setDraggedItem(item);
    setSourceType(source);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDropOnField = (event) => {
    event.preventDefault();
    if (!draggedItem || !fieldRef.current) return;

    const rect = fieldRef.current.getBoundingClientRect();
    let x = ((event.clientX - rect.left) / rect.width) * 100;
    let y = ((event.clientY - rect.top) / rect.height) * 100;

    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    if (sourceType === "bench") {
      const newPlayer = { ...draggedItem, x, y };
      setLineup((prev) => [...prev, newPlayer]);
      setBench((prev) => prev.filter((p) => p.id !== draggedItem.id));
    } else {
      setLineup((prev) =>
        prev.map((p) => (p.id === draggedItem.id ? { ...p, x, y } : p))
      );
    }

    setDraggedItem(null);
    setSourceType(null);
  };

  const handleDropOnBench = (event) => {
    event.preventDefault();
    if (!draggedItem) return;

    if (sourceType === "field") {
      // Just remove from lineup - player already exists in bench
      setLineup((prev) => prev.filter((p) => p.id !== draggedItem.id));
    }
    setDraggedItem(null);
    setSourceType(null);
  };

  const handleRemoveFromBench = (id) => {
    setBench((prev) => prev.filter((player) => player.id !== id));
  };

  const fetchPlayerData = async (name) => {
    const normalize = (value) =>
      (value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const queryNorm = normalize(name);

    // Cek dulu override legenda
    if (SPECIAL_PLAYERS[queryNorm]) {
      return [SPECIAL_PLAYERS[queryNorm]];
    }

    try {
      // Use RapidAPI service
      const players = await searchPlayerByName(name);

      if (!players || !players.length) {
        return [];
      }

      // Score and rank the results based on name matching
      const tokens = queryNorm.split(" ").filter(Boolean);
      const firstToken = tokens[0] || "";
      const extraTokens = tokens.slice(1);

      const scored = players.map((player) => {
        const nameNorm = normalize(player.name);
        let score = 0;

        if (firstToken && nameNorm.includes(firstToken)) {
          score += 2;
        }
        extraTokens.forEach((token) => {
          if (nameNorm.includes(token)) {
            score += 1;
          }
        });

        return {
          score,
          candidate: {
            id: player.id,
            name: player.name,
            imgUrl: player.imgUrl,
            mappedPos: player.position,
            rawPosition: player.rawPosition || player.position,
            team: player.team || "",
            nationality: player.nationality || "",
            displayName: player.name,
            rating: player.rating || 75, // Include rating from API
          },
        };
      });

      // Sort by score (most relevant first)
      scored.sort((a, b) => b.score - a.score);

      // Return all candidates, even with score 0 as fallback
      return scored.map((item) => item.candidate);
    } catch (error) {
      console.error("Error fetching player data from RapidAPI:", error);

      // Fallback to TheSportsDB if RapidAPI fails
      try {
        const response = await fetch(
          `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(
            name
          )}`
        );
        const data = await response.json();
        const players = Array.isArray(data.player) ? data.player : [];

        if (!players.length) {
          return [];
        }

        const tokens = queryNorm.split(" ").filter(Boolean);
        const firstToken = tokens[0] || "";
        const extraTokens = tokens.slice(1);

        const scored = players.map((player) => {
          const nameNorm = normalize(player.strPlayer);
          let score = 0;

          if (firstToken && nameNorm.includes(firstToken)) {
            score += 2;
          }
          extraTokens.forEach((token) => {
            if (nameNorm.includes(token)) {
              score += 1;
            }
          });

          const rawPosition = (player.strPosition || "").toUpperCase();
          let mappedPos = null;

          if (
            rawPosition.includes("KEEPER") ||
            rawPosition.includes("GOALKEEPER")
          ) {
            mappedPos = "GK";
          } else if (
            rawPosition.includes("BACK") ||
            rawPosition.includes("DEF")
          ) {
            mappedPos = "DEF";
          } else if (rawPosition.includes("MID")) {
            mappedPos = "MID";
          } else if (
            rawPosition.includes("FORWARD") ||
            rawPosition.includes("WINGER") ||
            rawPosition.includes("STRIKER") ||
            rawPosition.includes("ATTACK")
          ) {
            mappedPos = "FWD";
          }

          return {
            score,
            candidate: {
              id: player.idPlayer,
              name: player.strPlayer,
              imgUrl: player.strCutout || player.strThumb || null,
              mappedPos,
              rawPosition: player.strPosition || "",
              team: player.strTeam || "",
              nationality: player.strNationality || "",
            },
          };
        });

        // Sort by score
        scored.sort((a, b) => b.score - a.score);
        return scored.map((item) => item.candidate);
      } catch (fallbackError) {
        console.error("Error fetching from fallback API:", fallbackError);
        return [];
      }
    }
  };

  const addNewPlayer = async (event) => {
    event.preventDefault();
    if (!newPlayerName.trim()) return;

    setIsSearching(true);
    const candidates = await fetchPlayerData(newPlayerName);
    setIsSearching(false);

    console.log('[DreamElevenBuilder] Search results:', candidates);

    if (!candidates || !candidates.length) {
      console.log('[DreamElevenBuilder] No candidates found, adding manual player');
      // fallback: tidak ada hasil, pakai nama manual
      const newPlayer = {
        id: Date.now().toString(),
        name: newPlayerName,
        position: newPlayerPos,
        rating: 75, // Default rating for manual entry
        imgUrl: null,
      };

      // Add to bench and field together
      const slot = getNextSlotForPosition(newPlayerPos);
      setBench((prev) => [...prev, newPlayer]);
      setLineup((prev) => [...prev, { id: newPlayer.id, x: slot.x, y: slot.y }]);

      setNewPlayerName("");
      return;
    }

    // Ada kandidat dari API -> tampilkan modal untuk memilih
    console.log('[DreamElevenBuilder] Showing modal with', candidates.length, 'candidates');
    setCandidateOptions(candidates);
    setCandidateBase({
      nameInput: newPlayerName,
      basePos: newPlayerPos,
    });
    setShowCandidateModal(true);
  };

  const resetBoard = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Reset posisi pemain? Pemain akan kembali ke cadangan.")) {
      const allPlayers = [
        ...bench,
        ...lineup.map(({ x, y, ...p }) => p),
      ];
      setLineup([]);
      setBench(allPlayers);
    }
  };

  const factoryReset = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Hapus SEMUA data dan kembali ke awal?")) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("football_lineup_v2");
        window.localStorage.removeItem("football_bench_v2");
        window.location.reload();
      }
    }
  };

  const clearBench = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Hapus semua pemain di cadangan?")) {
      setBench([]);
    }
  };

  const handleSaveToFirebase = async () => {
    if (!userId) {
      // eslint-disable-next-line no-alert
      alert("Silakan login terlebih dahulu untuk menyimpan ke cloud");
      return;
    }

    try {
      setSaveStatus("Saving to Firebase...");

      const selectedPlayers = lineup
        .map((slot) => {
          const meta = bench.find((p) => p.id === slot.id);
          if (!meta) return null;
          return { ...meta, x: slot.x, y: slot.y };
        })
        .filter(Boolean);

      const payload = {
        lineup,
        players: selectedPlayers,
        updatedAt: Date.now(),
      };

      await set(ref(db, `dream_team/${userId}`), payload);
      setSaveStatus("Saved to Firebase ✓");

      setTimeout(() => setSaveStatus("Saved"), 2000);
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      setSaveStatus("Failed to save");
    }
  };


  const handleChooseCandidate = (candidate) => {
    const basePos = candidateBase?.basePos || "ST";
    const finalPosition = candidate.mappedPos || basePos;

    const newPlayer = {
      id: Date.now().toString(),
      name: candidate.displayName || candidate.name || candidateBase?.nameInput,
      position: finalPosition,
      rating: candidate.rating || 75, // Use API rating or default
      imgUrl: candidate.imgUrl || null,
    };

    // Check if player already exists in bench (by name to avoid duplicates)
    const exists = bench.find(p => p.name === newPlayer.name);
    if (exists) {
      console.log('[DreamElevenBuilder] Player already exists, skipping duplicate');
      setShowCandidateModal(false);
      setCandidateOptions([]);
      setCandidateBase(null);
      setNewPlayerName("");
      return;
    }

    // Add to bench first
    setBench((prev) => [...prev, newPlayer]);

    // Auto-place on field
    const slot = getNextSlotForPosition(finalPosition);
    setLineup((prev) => [...prev, { id: newPlayer.id, x: slot.x, y: slot.y }]);

    setNewPlayerName("");
    if (candidate.mappedPos) {
      setNewPlayerPos(candidate.mappedPos);
    }
    setCandidateOptions([]);
    setCandidateBase(null);
    setShowCandidateModal(false);
  };

  const handleCancelCandidate = () => {
    setCandidateOptions([]);
    setCandidateBase(null);
    setShowCandidateModal(false);
  };

  const handleScreenshot = async () => {
    if (!fieldRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      const rect = fieldRef.current.getBoundingClientRect();
      const dataUrl = await htmlToImage.toPng(fieldRef.current, {
        cacheBust: true,
        pixelRatio: 1,
        width: rect.width,
        height: rect.height,
        backgroundColor: "#065f46",
      });

      const link = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      link.download = `lineup-${date}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Gagal membuat screenshot:", error);
      // eslint-disable-next-line no-alert
      alert("Gagal membuat gambar. Coba lagi.");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <>
      <div className="bg-slate-950/90 text-slate-100 font-sans p-3 md:p-5 rounded-2xl border border-slate-800 shadow-2xl select-none max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col">
            <BuilderHeader
              currentFormation={currentFormation}
              onChangeFormation={applyFormationTemplate}
              onScreenshot={handleScreenshot}
              onResetField={resetBoard}
              onFactoryReset={factoryReset}
              onSaveToFirebase={handleSaveToFirebase}
              userId={userId}
              saveStatus={saveStatus}
              isCapturing={isCapturing}
            />


            <BuilderField
              fieldRef={fieldRef}
              lineup={lineup.map((slot) => {
                const player = bench.find((p) => p.id === slot.id);
                return player ? { ...player, x: slot.x, y: slot.y } : slot;
              })}
              onDragOver={handleDragOver}
              onDrop={handleDropOnField}
              onDragStart={handleDragStart}
            />
          </div>

          <div className="md:w-80 flex flex-col gap-4">
            <SearchPlayerForm
              newPlayerName={newPlayerName}
              setNewPlayerName={setNewPlayerName}
              newPlayerPos={newPlayerPos}
              setNewPlayerPos={setNewPlayerPos}
              isSearching={isSearching}
              onSubmit={addNewPlayer}
            />

            <BenchPanel
              bench={bench.filter(p => !lineup.find(slot => slot.id === p.id))}
              onClearBench={clearBench}
              onDragOver={handleDragOver}
              onDrop={handleDropOnBench}
              onDragStart={handleDragStart}
              onRemoveFromBench={handleRemoveFromBench}
            />
          </div>
        </div>
      </div>
      <CandidateModal
        open={showCandidateModal}
        options={candidateOptions}
        base={candidateBase}
        onCancel={handleCancelCandidate}
        onChoose={handleChooseCandidate}
      />
    </>
  );
}
