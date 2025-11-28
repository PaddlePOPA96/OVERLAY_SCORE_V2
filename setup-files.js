const fs = require('fs');
const path = require('path');

// --- KONFIGURASI KONTEN FILE ---

const firebaseConfigContent = `// lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  // GANTI DENGAN CONFIG DARI FIREBASE CONSOLE KAMU
  apiKey: "API_KEY_KAMU",
  authDomain: "PROJECT_ID.firebaseapp.com",
  databaseURL: "https://PROJECT_ID-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "PROJECT_ID",
  storageBucket: "PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

export { db };
`;

const hookContent = `// hooks/useScoreboard.js
"use client";
import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";

export function useScoreboard() {
  const [data, setData] = useState({
    homeName: "HOME",
    awayName: "AWAY",
    homeScore: 0,
    awayScore: 0,
    timer: { isRunning: false, baseTime: 0, startTime: 0 },
  });
  const [displayTime, setDisplayTime] = useState(0);

  useEffect(() => {
    const matchRef = ref(db, "match_live");
    const unsubscribe = onValue(matchRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        setData(val);
        calculateTime(val); 
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let interval;
    if (data.timer?.isRunning) {
      interval = setInterval(() => { calculateTime(data); }, 500);
    }
    return () => clearInterval(interval);
  }, [data]);

  const calculateTime = (currentData) => {
    if (!currentData?.timer) return;
    if (currentData.timer.isRunning) {
      const now = Date.now();
      const elapsed = Math.floor((now - currentData.timer.startTime) / 1000);
      setDisplayTime(currentData.timer.baseTime + elapsed);
    } else {
      setDisplayTime(currentData.timer.baseTime);
    }
  };

  const updateMatch = (updates) => { update(ref(db, "match_live"), updates); };

  const toggleTimer = () => {
    const now = Date.now();
    let updates = {};
    if (data.timer.isRunning) {
      const elapsed = Math.floor((now - data.timer.startTime) / 1000);
      updates = { "timer/isRunning": false, "timer/baseTime": data.timer.baseTime + elapsed, "timer/startTime": null };
    } else {
      updates = { "timer/isRunning": true, "timer/baseTime": data.timer.baseTime, "timer/startTime": now };
    }
    updateMatch(updates);
  };

  const resetTimer = () => {
    updateMatch({ "timer/isRunning": false, "timer/baseTime": 0, "timer/startTime": null });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return \`\${m}:\${s}\`;
  };

  return { data, displayTime, formatTime, updateMatch, toggleTimer, resetTimer };
}
`;

const operatorPageContent = `// app/operator/page.js
"use client";
import { useScoreboard } from "@/hooks/useScoreboard";

export default function OperatorPage() {
  const { data, displayTime, formatTime, updateMatch, toggleTimer, resetTimer } = useScoreboard();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center gap-8">
      <h1 className="text-3xl font-bold text-yellow-500">🎮 Operator Panel</h1>
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-full max-w-lg text-center shadow-lg">
        <div className="text-6xl font-mono font-bold mb-6 tracking-widest bg-black p-4 rounded-lg text-green-400">
          {formatTime(displayTime)}
        </div>
        <div className="flex justify-center gap-4">
          <button onClick={toggleTimer} className={\`px-8 py-3 rounded-lg font-bold text-lg transition \${data.timer?.isRunning ? "bg-yellow-600" : "bg-green-600"}\`}>
            {data.timer?.isRunning ? "⏸ PAUSE" : "▶ START"}
          </button>
          <button onClick={resetTimer} className="px-8 py-3 bg-red-600 rounded-lg font-bold text-lg">⏹ RESET</button>
        </div>
      </div>
      <div className="flex gap-4 w-full max-w-2xl">
        <div className="flex-1 bg-gray-800 p-6 rounded-xl flex flex-col items-center">
          <input value={data.homeName || ""} onChange={(e) => updateMatch({ homeName: e.target.value })} className="bg-transparent text-center text-xl font-bold border-b border-gray-600 mb-4 w-full" placeholder="HOME" />
          <div className="text-7xl font-bold mb-4">{data.homeScore}</div>
          <div className="flex gap-2">
            <button onClick={() => updateMatch({ homeScore: Math.max(0, data.homeScore - 1) })} className="px-4 py-2 bg-gray-700 rounded">-</button>
            <button onClick={() => updateMatch({ homeScore: data.homeScore + 1 })} className="px-4 py-2 bg-blue-600 rounded font-bold">+</button>
          </div>
        </div>
        <div className="flex-1 bg-gray-800 p-6 rounded-xl flex flex-col items-center">
          <input value={data.awayName || ""} onChange={(e) => updateMatch({ awayName: e.target.value })} className="bg-transparent text-center text-xl font-bold border-b border-gray-600 mb-4 w-full" placeholder="AWAY" />
          <div className="text-7xl font-bold mb-4">{data.awayScore}</div>
          <div className="flex gap-2">
            <button onClick={() => updateMatch({ awayScore: Math.max(0, data.awayScore - 1) })} className="px-4 py-2 bg-gray-700 rounded">-</button>
            <button onClick={() => updateMatch({ awayScore: data.awayScore + 1 })} className="px-4 py-2 bg-blue-600 rounded font-bold">+</button>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

const overlayPageContent = `// app/overlay/page.js
"use client";
import { useScoreboard } from "@/hooks/useScoreboard";

export default function OverlayPage() {
  const { data, displayTime, formatTime } = useScoreboard();

  return (
    <div className="min-h-screen bg-transparent flex items-end justify-center pb-10">
      <div className="flex items-stretch bg-black/90 text-white rounded-lg overflow-hidden shadow-2xl border-b-4 border-blue-600 transform scale-125">
        <div className="bg-gray-100 text-gray-900 px-6 py-2 flex items-center justify-center font-bold text-2xl w-[100px] font-mono border-r-4 border-blue-900">
          {formatTime(displayTime)}
        </div>
        <div className="flex items-center px-6 py-2 gap-4 bg-gradient-to-r from-gray-900 to-gray-800">
          <span className="text-2xl font-bold uppercase tracking-wider w-[120px] text-right">{data.homeName || "HOME"}</span>
          <span className="bg-blue-700 px-4 py-1 text-3xl font-extrabold rounded">{data.homeScore}</span>
        </div>
        <div className="w-[2px] bg-gray-600"></div>
        <div className="flex items-center px-6 py-2 gap-4 bg-gradient-to-l from-gray-900 to-gray-800">
          <span className="bg-red-700 px-4 py-1 text-3xl font-extrabold rounded">{data.awayScore}</span>
          <span className="text-2xl font-bold uppercase tracking-wider w-[120px] text-left">{data.awayName || "AWAY"}</span>
        </div>
      </div>
    </div>
  );
}
`;

const homePageContent = `// app/page.js
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">⚽ Scoreboard System</h1>
      <div className="flex gap-4">
        <Link href="/operator" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-xl">
          Buka Operator Panel
        </Link>
        <Link href="/overlay" className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-xl">
          Buka Overlay OBS
        </Link>
      </div>
    </div>
  );
}
`;

// --- FUNGSI UTAMA GENERATOR ---

const filesToCreate = [
  { path: 'lib/firebase.js', content: firebaseConfigContent },
  { path: 'hooks/useScoreboard.js', content: hookContent },
  { path: 'app/operator/page.js', content: operatorPageContent },
  { path: 'app/overlay/page.js', content: overlayPageContent },
  { path: 'app/page.js', content: homePageContent }
];

function createFiles() {
  console.log("🚀 Memulai pembuatan file project...");

  // 1. Buat Folder yang dibutuhkan
  ['lib', 'hooks', 'app/operator', 'app/overlay'].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Folder dibuat: ${dir}`);
    }
  });

  // 2. Buat File
  filesToCreate.forEach(file => {
    fs.writeFileSync(file.path, file.content);
    console.log(`✅ File dibuat: ${file.path}`);
  });

  console.log("\n🎉 SELESAI! Struktur project berhasil dibuat.");
  console.log("👉 Langkah selanjutnya: Edit 'lib/firebase.js' dan masukkan config Firebase kamu.");
  console.log("👉 Jalankan: npm run dev");
}

createFiles();