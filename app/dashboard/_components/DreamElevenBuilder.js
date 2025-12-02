"use client";

import { useState, useEffect, useRef } from "react";
import * as htmlToImage from "html-to-image";
import {
  INITIAL_PLAYERS,
  SPECIAL_PLAYERS,
  FORMATIONS,
} from "./_comp_builderplayer/builderConstants";
import { BenchPanel } from "./_comp_builderplayer/BenchPanel";
import { CandidateModal } from "./_comp_builderplayer/CandidateModal";
import { BuilderHeader } from "./_comp_builderplayer/BuilderHeader";
import { BuilderField } from "./_comp_builderplayer/BuilderField";
import { SearchPlayerForm } from "./_comp_builderplayer/SearchPlayerForm";

export default function DreamElevenBuilder() {
  const fieldRef = useRef(null);

  const [lineup, setLineup] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem("football_lineup_v2");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bench, setBench] = useState(() => {
    if (typeof window === "undefined") return INITIAL_PLAYERS;
    try {
      const saved = window.localStorage.getItem("football_bench_v2");
      return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
    } catch {
      return INITIAL_PLAYERS;
    }
  });

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

  // Auto save ke localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    setSaveStatus("Saving...");
    try {
      window.localStorage.setItem("football_lineup_v2", JSON.stringify(lineup));
      window.localStorage.setItem("football_bench_v2", JSON.stringify(bench));
    } catch {
      // ignore
    }
    const timeout = setTimeout(() => {
      setSaveStatus("Saved");
    }, 500);
    return () => clearTimeout(timeout);
  }, [lineup, bench]);

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
      const { x, y, ...cleanPlayer } = draggedItem;
      setLineup((prev) => prev.filter((p) => p.id !== draggedItem.id));
      setBench((prev) => [...prev, cleanPlayer]);
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

      // Urutkan kandidat berdasar skor (paling relevan dulu)
      scored.sort((a, b) => b.score - a.score);

      // Kalau semua skor 0 (nama beda banget), tetap balikin semua sebagai fallback
      const hasPositiveScore = scored.some((item) => item.score > 0);
      const effective = hasPositiveScore ? scored : scored;

      return effective.map((item) => item.candidate);
    } catch (error) {
      console.error("Error fetching image:", error);
      return [];
    }
  };

  const addNewPlayer = async (event) => {
    event.preventDefault();
    if (!newPlayerName.trim()) return;

    setIsSearching(true);
    const candidates = await fetchPlayerData(newPlayerName);
    setIsSearching(false);

    if (!candidates || !candidates.length) {
      // fallback: tidak ada hasil, pakai nama manual
      const newPlayer = {
        id: Date.now().toString(),
        name: newPlayerName,
        position: newPlayerPos,
        rating: Math.floor(Math.random() * (95 - 80 + 1) + 80),
        imgUrl: null,
      };
      setBench((prev) => [...prev, newPlayer]);
      setNewPlayerName("");
      return;
    }

    if (candidates.length === 1) {
      const chosen = candidates[0];
      const finalPosition = chosen.mappedPos || newPlayerPos;
      const newPlayer = {
        id: Date.now().toString(),
        name: chosen.displayName || chosen.name || newPlayerName,
        position: finalPosition,
        rating: Math.floor(Math.random() * (95 - 80 + 1) + 80),
        imgUrl: chosen.imgUrl || null,
      };
      setBench((prev) => [...prev, newPlayer]);
      setNewPlayerName("");
      if (chosen.mappedPos) {
        setNewPlayerPos(chosen.mappedPos);
      }
      return;
    }

    // Lebih dari satu kandidat -> buka modal pemilihan
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

  const handleChooseCandidate = (candidate) => {
    const basePos = candidateBase?.basePos || "ST";
    const finalPosition = candidate.mappedPos || basePos;

    const newPlayer = {
      id: Date.now().toString(),
      name: candidate.displayName || candidate.name || candidateBase?.nameInput,
      position: finalPosition,
      rating: Math.floor(Math.random() * (95 - 80 + 1) + 80),
      imgUrl: candidate.imgUrl || null,
    };

    setBench((prev) => [...prev, newPlayer]);
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
      <div className="bg-slate-950/90 text-slate-100 font-sans p-3 md:p-5 rounded-2xl border border-slate-800 shadow-2xl select-none">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col">
            <BuilderHeader
              currentFormation={currentFormation}
              onChangeFormation={applyFormationTemplate}
              onScreenshot={handleScreenshot}
              onResetField={resetBoard}
              onFactoryReset={factoryReset}
              saveStatus={saveStatus}
              isCapturing={isCapturing}
            />

            <BuilderField
              fieldRef={fieldRef}
              lineup={lineup}
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
              bench={bench}
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
