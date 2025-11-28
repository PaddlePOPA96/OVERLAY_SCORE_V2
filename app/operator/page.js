"use client";
import { useScoreboard } from "@/hooks/useScoreboard";
import LayoutA from "../overlay/LayoutA";
import LayoutB from "../overlay/LayoutB";
import { useState, useEffect } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";

// Data logo ter-generate otomatis dari struktur folder public/logo
const LOGO_DATA = {
  "Austria - Bundesliga": [
    "Austria Vienna",
    "FC Blau-Weiss Linz",
    "Grazer AK 1902",
    "LASK",
    "Rapid Vienna",
    "Red Bull Salzburg",
    "SCR Altach",
    "SK Sturm Graz",
    "SV Ried",
    "TSV Hartberg",
    "Wolfsberger AC",
    "WSG Tirol"
  ],
  "Belgium - Jupiler Pro League": [
    "Cercle Brugge",
    "Club Brugge KV",
    "FCV Dender EH",
    "KAA Gent",
    "KRC Genk",
    "KV Mechelen",
    "KVC Westerlo",
    "Oud-Heverlee Leuven",
    "RAAL La Louvière",
    "Royal Antwerp FC",
    "Royal Charleroi SC",
    "RSC Anderlecht",
    "Sint-Truidense VV",
    "Standard Liège",
    "Union Saint-Gilloise",
    "Zulte Waregem"
  ],
  "Bulgaria - efbet Liga": [
    "Arda Kardzhali",
    "Beroe Stara Zagora",
    "Botev Plovdiv",
    "Botev Vratsa",
    "Cherno More Varna",
    "CSKA 1948",
    "CSKA-Sofia",
    "Dobrudzha Dobrich",
    "Levski Sofia",
    "Lokomotiv Plovdiv",
    "Lokomotiv Sofia",
    "Ludogorets Razgrad",
    "Montana",
    "Septemvri Sofia",
    "Slavia Sofia",
    "Spartak Varna"
  ],
  "Croatia - SuperSport HNL": [
    "GNK Dinamo Zagreb",
    "HNK Gorica",
    "HNK Hajduk Split",
    "HNK Rijeka",
    "HNK Vukovar 1991",
    "NK Istra 1961",
    "NK Lokomotiva Zagreb",
    "NK Osijek",
    "NK Varazdin",
    "Slaven Belupo Koprivnica"
  ],
  "Czech Republic - Chance Liga": [
    "1.FC Slovacko",
    "AC Sparta Prague",
    "Bohemians Prague 1905",
    "FC Banik Ostrava",
    "FC Hradec Kralove",
    "FC Slovan Liberec",
    "FC Viktoria Plzen",
    "FC Zlin",
    "FK Dukla Prague",
    "FK Jablonec",
    "FK Mlada Boleslav",
    "FK Pardubice",
    "FK Teplice",
    "MFK Karvina",
    "SK Sigma Olomouc",
    "SK Slavia Prague"
  ],
  "Denmark - Superliga": [
    "Aarhus GF",
    "Bröndby IF",
    "FC Copenhagen",
    "FC Fredericia",
    "FC Midtjylland",
    "FC Nordsjaelland",
    "Odense Boldklub",
    "Randers FC",
    "Silkeborg IF",
    "Sönderjyske",
    "Vejle Boldklub",
    "Viborg FF"
  ],
  "England - Premier League": [
    "AFC Bournemouth",
    "Arsenal FC",
    "Aston Villa",
    "Brentford FC",
    "Brighton & Hove Albion",
    "Burnley FC",
    "Chelsea FC",
    "Crystal Palace",
    "Everton FC",
    "Fulham FC",
    "Leeds United",
    "Liverpool FC",
    "Manchester City",
    "Manchester United",
    "Newcastle United",
    "Nottingham Forest",
    "Sunderland",
    "Tottenham Hotspur",
    "West Ham United",
    "Wolverhampton Wanderers"
  ],
  "France - Ligue 1": [
    "AJ Auxerre",
    "Angers SCO",
    "AS Monaco",
    "FC Lorient",
    "FC Metz",
    "FC Nantes",
    "FC Toulouse",
    "Le Havre AC",
    "LOSC Lille",
    "OGC Nice",
    "Olympique Lyon",
    "Olympique Marseille",
    "Paris FC",
    "Paris Saint-Germain",
    "RC Lens",
    "RC Strasbourg Alsace",
    "Stade Brestois 29",
    "Stade Rennais FC"
  ],
  "Germany - Bundesliga": [
    "1.FC Heidenheim 1846",
    "1.FC Köln",
    "1.FC Union Berlin",
    "1.FSV Mainz 05",
    "Bayer 04 Leverkusen",
    "Bayern Munich",
    "Borussia Dortmund",
    "Borussia Mönchengladbach",
    "Eintracht Frankfurt",
    "FC Augsburg",
    "FC St. Pauli",
    "Hamburger SV",
    "RB Leipzig",
    "SC Freiburg",
    "SV Werder Bremen",
    "TSG 1899 Hoffenheim",
    "VfB Stuttgart",
    "VfL Wolfsburg"
  ],
  "Greece - Super League 1": [
    "AE Kifisias",
    "AE Larisa",
    "AEK Athens",
    "APO Levadiakos",
    "Aris Thessaloniki",
    "Asteras Aktor",
    "Atromitos Athens",
    "OFI Crete FC",
    "Olympiacos Piraeus",
    "Panathinaikos FC",
    "Panetolikos GFS",
    "Panserraikos",
    "PAOK Thessaloniki",
    "Volos NPS"
  ],
  "Israel - Ligat ha'Al": [
    "Beitar Jerusalem",
    "FC Ashdod",
    "Hapoel Beer Sheva",
    "Hapoel Haifa",
    "Hapoel Jerusalem",
    "Hapoel Petah Tikva",
    "Hapoel Tel Aviv",
    "Ihud Bnei Sakhnin",
    "Ironi Kiryat Shmona",
    "Ironi Tiberias",
    "Maccabi Bnei Reineh",
    "Maccabi Haifa",
    "Maccabi Netanya",
    "Maccabi Tel Aviv"
  ],
  "Italy - Serie A": [
    "AC Milan",
    "ACF Fiorentina",
    "AS Roma",
    "Atalanta BC",
    "Bologna FC 1909",
    "Cagliari Calcio",
    "Como 1907",
    "Genoa CFC",
    "Hellas Verona",
    "Inter Milan",
    "Juventus FC",
    "Parma Calcio 1913",
    "Pisa Sporting Club",
    "SS Lazio",
    "SSC Napoli",
    "Torino FC",
    "Udinese Calcio",
    "US Cremonese",
    "US Lecce",
    "US Sassuolo"
  ],
  "Netherlands - Eredivisie": [
    "Ajax Amsterdam",
    "AZ Alkmaar",
    "Excelsior Rotterdam",
    "FC Groningen",
    "FC Utrecht",
    "FC Volendam",
    "Feyenoord Rotterdam",
    "Fortuna Sittard",
    "Go Ahead Eagles",
    "Heracles Almelo",
    "NAC Breda",
    "NEC Nijmegen",
    "PEC Zwolle",
    "PSV Eindhoven",
    "SC Heerenveen",
    "SC Telstar",
    "Sparta Rotterdam",
    "Twente Enschede FC"
  ],
  "Norway - Eliteserien": [
    "Bryne FK",
    "FK BodøGlimt",
    "FK Haugesund",
    "Fredrikstad FK",
    "Hamarkameratene",
    "KFUM-Kameratene Oslo",
    "Kristiansund BK",
    "Molde FK",
    "Rosenborg BK",
    "Sandefjord Fotball",
    "Sarpsborg 08 FF",
    "SK Brann",
    "Strømsgodset IF",
    "Tromsø IL",
    "Vålerenga Fotball Elite",
    "Viking FK"
  ],
  "Poland - PKO BP Ekstraklasa": [
    "Arka Gdynia",
    "Bruk-Bet Termalica Nieciecza",
    "Cracovia",
    "GKS Katowice",
    "Górnik Zabrze",
    "Jagiellonia Bialystok",
    "Korona Kielce",
    "Lech Poznan",
    "Lechia Gdansk",
    "Legia Warszawa",
    "Motor Lublin",
    "Piast Gliwice",
    "Pogon Szczecin",
    "Radomiak Radom",
    "Raków Częstochowa",
    "Widzew Lodz",
    "Wisla Plock",
    "Zaglebie Lubin"
  ],
  "Portugal - Liga Portugal": [
    "Avs Futebol",
    "Casa Pia AC",
    "CD Nacional",
    "CD Santa Clara",
    "CD Tondela",
    "CF Estrela Amadora",
    "FC Alverca",
    "FC Arouca",
    "FC Famalicão",
    "FC Porto",
    "GD Estoril Praia",
    "Gil Vicente FC",
    "Moreirense FC",
    "Rio Ave FC",
    "SC Braga",
    "SL Benfica",
    "Sporting CP",
    "Vitória Guimarães SC"
  ],
  "Romania - SuperLiga": [
    "ACSC FC Arges",
    "AFC Unirea 04 Slobozia",
    "AFK Csikszereda Miercurea Ciuc",
    "CFR Cluj",
    "CS Universitatea Craiova",
    "FC Botosani",
    "FC Dinamo 1948",
    "FC Hermannstadt",
    "FC Metaloglobus Bucharest",
    "FC Rapid 1923",
    "FC Universitatea Cluj",
    "FCSB",
    "FCV Farul Constanta",
    "Petrolul Ploiesti",
    "SC Otelul Galati",
    "UTA Arad"
  ],
  "Russia - Premier Liga": [
    "Akhmat Grozny",
    "Akron Togliatti",
    "Baltika Kaliningrad",
    "CSKA Moscow",
    "Dinamo Makhachkala",
    "Dynamo Moscow",
    "FC Krasnodar",
    "FC Pari Nizhniy Novgorod",
    "FC Rostov",
    "FC Sochi",
    "Krylya Sovetov Samara",
    "Lokomotiv Moscow",
    "Rubin Kazan",
    "Spartak Moscow",
    "Torpedo Moscow",
    "Zenit St. Petersburg"
  ],
  "Scotland - Scottish Premiership": [
    "Aberdeen FC",
    "Celtic FC",
    "Dundee FC",
    "Dundee United FC",
    "Falkirk FC",
    "Heart of Midlothian FC",
    "Hibernian FC",
    "Kilmarnock FC",
    "Livingston FC",
    "Motherwell FC",
    "Rangers FC",
    "St. Mirren FC"
  ],
  "Serbia - Super liga Srbije": [
    "FK Cukaricki",
    "FK IMT Belgrad",
    "FK Javor-Matis Ivanjica",
    "FK Mladost Lucani",
    "FK Napredak Krusevac",
    "FK Novi Pazar",
    "FK Partizan Belgrade",
    "FK Radnicki 1923 Kragujevac",
    "FK Radnicki Nis",
    "FK Radnik Surdulica",
    "FK Spartak Subotica",
    "FK TSC Backa Topola",
    "FK Vojvodina Novi Sad",
    "OFK Beograd",
    "Red Star Belgrade",
    "Zeleznicar Pancevo"
  ],
  "Spain - LaLiga": [
    "Athletic Bilbao",
    "Atlético de Madrid",
    "CA Osasuna",
    "Celta de Vigo",
    "Deportivo Alavés",
    "Elche CF",
    "FC Barcelona",
    "Getafe CF",
    "Girona FC",
    "Levante UD",
    "Rayo Vallecano",
    "RCD Espanyol Barcelona",
    "RCD Mallorca",
    "Real Betis Balompié",
    "Real Madrid",
    "Real Oviedo",
    "Real Sociedad",
    "Sevilla FC",
    "Valencia CF",
    "Villarreal CF"
  ],
  "Sweden - Allsvenskan": [
    "AIK",
    "BK Häcken",
    "Degerfors IF",
    "Djurgårdens IF",
    "GAIS",
    "Halmstads BK",
    "Hammarby IF",
    "IF Brommapojkarna",
    "IF Elfsborg",
    "IFK Göteborg",
    "IFK Norrköping",
    "IFK Värnamo",
    "IK Sirius",
    "Malmö FF",
    "Mjällby AIF",
    "Östers IF"
  ],
  "Switzerland - Super League": [
    "BSC Young Boys",
    "FC Basel 1893",
    "FC Lausanne-Sport",
    "FC Lugano",
    "FC Luzern",
    "FC Sion",
    "FC St. Gallen 1879",
    "FC Thun",
    "FC Winterthur",
    "FC Zürich",
    "Grasshopper Club Zurich",
    "Servette FC"
  ],
  "Türkiye - Süper Lig": [
    "Alanyaspor",
    "Antalyaspor",
    "Basaksehir FK",
    "Besiktas JK",
    "Caykur Rizespor",
    "Eyüpspor",
    "Fatih Karagümrük",
    "Fenerbahce",
    "Galatasaray",
    "Gaziantep FK",
    "Genclerbirligi Ankara",
    "Göztepe",
    "Kasimpasa",
    "Kayserispor",
    "Kocaelispor",
    "Konyaspor",
    "Samsunspor",
    "Trabzonspor"
  ],
  "Ukraine - Premier Liga": [
    "Dynamo Kyiv",
    "Epicentr Kamyanets-Podilskyi",
    "FC Kudrivka",
    "FC Oleksandriya",
    "Karpaty Lviv",
    "Kolos Kovalivka",
    "Kryvbas Kryvyi Rig",
    "LNZ Cherkasy",
    "Metalist 1925 Kharkiv",
    "NK Veres Rivne",
    "Obolon Kyiv",
    "Polissya Zhytomyr",
    "Rukh Lviv",
    "SC Poltava",
    "Shakhtar Donetsk",
    "Zorya Lugansk"
  ]
};

function buildLogoSrc(league, club) {
  if (!league || !club) return "";
  const leagueSegment = encodeURIComponent(league);
  const clubSegment = encodeURIComponent(club);
  return `/logo/${leagueSegment}/${clubSegment}.png`;
}

function makeTeamAbbr(club) {
  if (!club) return "";
  const cleaned = club
    .replace(/[()]/g, " ")
    .replace(/[^A-Za-zÀ-ÿ\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "";

  const stopWords = new Set([
    "fc",
    "cf",
    "sc",
    "ac",
    "as",
    "bc",
    "ss",
    "afc",
    "nk",
    "fk",
    "sv",
    "if",
    "bk",
    "cd",
    "sd",
    "ud",
    "uc",
    "us",
  ]);

  const words = cleaned.split(" ");
  const mainWords =
    words.filter((w) => !stopWords.has(w.toLowerCase())) || words;

  const target = mainWords.length > 0 ? mainWords : words;

  let letters = "";
  if (target.length >= 3) {
    letters =
      (target[0][0] || "") + (target[1][0] || "") + (target[2][0] || "");
  } else if (target.length === 2) {
    letters =
      (target[0][0] || "") +
      (target[1][0] || "") +
      (target[1][1] || target[0][1] || "");
  } else {
    letters = (target[0] || "").slice(0, 3);
  }

  return letters.toUpperCase();
}

function LogoPickerModal({ isOpen, onClose, onSelect }) {
  const [league, setLeague] = useState(Object.keys(LOGO_DATA)[0] || "");

  if (!isOpen) return null;

  const clubs = LOGO_DATA[league] || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
    >
      <div
        style={{
          background: "#020617",
          color: "#e5e7eb",
          padding: "18px",
          borderRadius: "14px",
          width: "92%",
          maxWidth: "980px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          border: "1px solid #1f2937",
          boxShadow: "0 22px 55px rgba(0,0,0,0.7)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 14 }}>
            Pilih Logo Klub (Layout B)
          </span>
          <button className="op-btn" onClick={onClose}>
            Tutup
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, fontSize: 12 }}>
          <div
            style={{
              width: "32%",
              borderRight: "1px solid #1f2937",
              paddingRight: 10,
              overflowY: "auto",
              maxHeight: "60vh",
            }}
          >
            {Object.keys(LOGO_DATA).map((lg) => (
              <div
                key={lg}
                onClick={() => setLeague(lg)}
                style={{
                  padding: "7px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  marginBottom: 5,
                  background: lg === league ? "#1d4ed8" : "#020617",
                  border:
                    lg === league ? "1px solid #60a5fa" : "1px solid #1f2937",
                  color: lg === league ? "#f9fafb" : "#e5e7eb",
                }}
              >
                {lg}
              </div>
            ))}
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              maxHeight: "60vh",
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
              gap: 10,
              paddingLeft: 4,
            }}
          >
            {clubs.map((club) => {
              const src = buildLogoSrc(league, club);
              return (
                <button
                  key={club}
                  type="button"
                  onClick={() => onSelect({ src, club, league })}
                  style={{
                    background: "#020817",
                    borderRadius: 10,
                    border: "1px solid #1f2937",
                    padding: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                    minHeight: 150,
                    transition: "border-color 0.15s ease, background 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      background: "#020617",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      border: "1px solid #1f2937",
                    }}
                  >
                    <img
                      src={src}
                      alt={club}
                      style={{
                        maxWidth: "90%",
                        maxHeight: "90%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      textAlign: "center",
                      lineHeight: 1.3,
                      color: "#f9fafb",
                      textShadow: "0 1px 2px rgba(0,0,0,0.9)",
                      marginTop: 4,
                    }}
                  >
                    {club}
                  </span>
                </button>
              );
            })}
            {clubs.length === 0 && (
              <span style={{ fontSize: 12, opacity: 0.7 }}>
                Belum ada klub untuk liga ini.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponen kecil untuk kontrol Overlay + Copy URL (room berasal dari UID user)
function OverlayRoomControls({ showOverlay, toggleOverlay, roomId, compact }) {
  const [copied, setCopied] = useState(false);

  const overlayPath = `/overlay/${roomId || "default"}`;
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const overlayUrl = baseUrl ? `${baseUrl}${overlayPath}` : overlayPath;

  const handleToggleOverlay = () => {
    toggleOverlay();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(overlayUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  if (compact) {
    // Versi B: baris lebih ringkas di kanan atas
    return (
      <div className="op-room-compact">
        <button className="op-btn op-b-btn-main" onClick={handleToggleOverlay}>
          {showOverlay ? "Hide Overlay" : "Show Overlay"}
        </button>
        <span className="op-room-display op-room-url">
          {overlayPath}
        </span>
        <button className="op-btn" onClick={handleCopy}>
          {copied ? "Copied" : "Copy URL"}
        </button>
      </div>
    );
  }

  // Versi A: tampilan seperti kalkulator di blok kontrol
  return (
    <div className="op-room-row">
      <label className="op-label">Overlay</label>
      <button className="op-btn op-btn-main" onClick={handleToggleOverlay}>
        {showOverlay ? "HIDE" : "SHOW"}
      </button>

      <div className="op-room-box">
        <div className="op-room-display">
          <span className="op-room-display-label">ROOM</span>
          <span className="op-tiny">{roomId || "default"}</span>
        </div>
        <div className="op-room-display op-room-url">
          {overlayPath}
        </div>
        <button className="op-btn op-btn-main" onClick={handleCopy}>
          {copied ? "COPIED" : "COPY"}
        </button>
      </div>

      <span
        className={`op-tiny font-bold ${
          showOverlay ? "text-green-500" : "text-red-500"
        }`}
      >
        STATUS: {showOverlay ? "TAMPIL" : "SEMBUNYI"}
      </span>
    </div>
  );
}

// ==========================================
// KOMPONEN OPERATOR A (Mirip operator.html)
// ==========================================
function OperatorA({ data, actions, displayTime, formatTime, roomId, onLogout }) {
  // State lokal untuk input waktu manual (biar gak nge-lag saat ngetik)
  const [localTime, setLocalTime] = useState({ m: 0, s: 0 });

  useEffect(() => {
    // Sinkronkan input waktu dengan timer asli saat timer STOP
    if (!data.timer.isRunning) {
      setLocalTime({
        m: Math.floor(displayTime / 60),
        s: displayTime % 60
      });
    }
  }, [displayTime, data.timer.isRunning]);

  const handleManualTime = () => {
    // Hitung total detik dari input manual
    const totalSeconds = (parseInt(localTime.m) || 0) * 60 + (parseInt(localTime.s) || 0);
    // Kita harus 'mengakali' timer sistem dengan mereset baseTime
    // Logic ini ada di hook useScoreboard (nanti kita pastikan support)
    actions.updateMatch({
       "timer/baseTime": totalSeconds,
       "timer/startTime": null, // Reset start time
       "timer/isRunning": false // Pause dulu biar aman
    });
  };

  return (
    <div className="operator-a-container">
      <div className="w-full max-w-[900px] flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">⚽ Operator Panel – EPL Scoreboard</h2>
        <button className="op-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* PREVIEW AREA */}
      <div className="operator-a-preview-box">
        {/* Kita reuse komponen LayoutA sebagai preview! */}
        <LayoutA data={{ ...data, showOverlay: true }} displayTime={displayTime} formatTime={formatTime} />
      </div>

      <div className="operator-a-controls">
        
        {/* LAYOUT SWITCHER */}
        <div className="op-section" style={{borderBottom:'1px solid #444', paddingBottom:'10px', marginBottom:'5px'}}>
          <label className="op-label">Layout</label>
          <select 
            className="op-input" 
            value={data.layout}
            onChange={(e) => actions.updateMatch({ layout: e.target.value })}
          >
            <option value="A">Layout A</option>
            <option value="B">Layout B</option>
          </select>
          <span className="op-tiny">Pilih B untuk pindah ke operator-B UI</span>
        </div>

        {/* TEAM NAMES */}
        <div className="op-section">
          <label className="op-label">Team Left</label>
          <input className="op-input" value={data.homeName} onChange={e => actions.updateMatch({homeName: e.target.value})} placeholder="MAN" />
        </div>
        <div className="op-section">
          <label className="op-label">Team Right</label>
          <input className="op-input" value={data.awayName} onChange={e => actions.updateMatch({awayName: e.target.value})} placeholder="WHU" />
        </div>

        {/* SCORES & GOALS */}
        <div className="op-section">
          <label className="op-label">Score Left</label>
          <button className="op-btn" onClick={() => actions.updateMatch({homeScore: Math.max(0, data.homeScore-1)})}>-</button>
          <input className="op-input" type="number" value={data.homeScore} onChange={e => actions.updateMatch({homeScore: parseInt(e.target.value)||0})} style={{width:'50px'}}/>
          <button className="op-btn" onClick={() => actions.updateMatch({homeScore: data.homeScore+1})}>+</button>
          <button className="op-btn op-btn-main" onClick={() => actions.triggerGoal("home")}>GOAL L +1</button>
        </div>

        <div className="op-section">
          <label className="op-label">Score Right</label>
          <button className="op-btn" onClick={() => actions.updateMatch({awayScore: Math.max(0, data.awayScore-1)})}>-</button>
          <input className="op-input" type="number" value={data.awayScore} onChange={e => actions.updateMatch({awayScore: parseInt(e.target.value)||0})} style={{width:'50px'}}/>
          <button className="op-btn" onClick={() => actions.updateMatch({awayScore: data.awayScore+1})}>+</button>
          <button className="op-btn op-btn-main" onClick={() => actions.triggerGoal("away")}>GOAL R +1</button>
        </div>

        {/* COLORS */}
        <div className="op-section">
          <label className="op-label">Accent Gradient</label>
          <span className="op-tiny">Left:</span>
          <input type="color" className="op-input" value={data.homeColor} onChange={e => actions.updateMatch({homeColor: e.target.value})} />
          <span className="op-tiny">Right:</span>
          <input type="color" className="op-input" value={data.awayColor} onChange={e => actions.updateMatch({awayColor: e.target.value})} />
        </div>

        {/* TIMER */}
        <div className="op-section">
          <label className="op-label">Time</label>
          <input className="op-input" type="number" style={{width:'50px'}} value={localTime.m} onChange={e => setLocalTime({...localTime, m: e.target.value})} /> :
          <input className="op-input" type="number" style={{width:'50px'}} value={localTime.s} onChange={e => setLocalTime({...localTime, s: e.target.value})} />
          
          <button className="op-btn" onClick={handleManualTime}>Set Time</button>
          
          <div style={{display:'flex', gap:'5px', marginLeft:'10px'}}>
             <button className="op-btn op-btn-main" onClick={actions.toggleTimer}>
                {data.timer.isRunning ? "PAUSE" : "START"}
             </button>
             <button className="op-btn op-btn-danger" onClick={actions.resetTimer}>Reset</button>
          </div>
          <span className="op-tiny text-green-400 font-mono ml-2">
             LIVE: {formatTime(displayTime)}
          </span>
        </div>

        {/* OVERLAY TOGGLE + ROOM / LINK */}
        <OverlayRoomControls
          showOverlay={data.showOverlay}
          toggleOverlay={actions.toggleOverlay}
          roomId={roomId}
        />

      </div>
    </div>
  );
}

// ==========================================
// KOMPONEN OPERATOR B (Mirip operator-B.html)
// ==========================================
function OperatorB({ data, actions, displayTime, formatTime, roomId, onLogout }) {
  const [manualM, setManualM] = useState(0);
  const [manualS, setManualS] = useState(0);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [logoTarget, setLogoTarget] = useState("home");

  const handleSetTime = () => {
    const total = (parseInt(manualM) || 0) * 60 + (parseInt(manualS) || 0);
    actions.updateMatch({
        "timer/baseTime": total,
        "timer/startTime": null,
        "timer/isRunning": false
     });
  };

  return (
    <div className="operator-b-container">
      <div className="w-full max-w-[900px] flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">⚽ Operator Panel – EPL Scoreboard</h2>
        <button className="op-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* PREVIEW WRAPPER */}
      <div className="operator-b-preview-box">
          <LayoutB data={{...data, showOverlay: true}} displayTime={displayTime} formatTime={formatTime} />
      </div>

      <div className="top-controls w-full flex justify-end max-w-[860px] mt-4">
        <OverlayRoomControls
          compact
          showOverlay={data.showOverlay}
          toggleOverlay={actions.toggleOverlay}
          roomId={roomId}
        />
      </div>

      <div className="operator-b-controls">
         
         {/* Layout Switcher */}
         <div className="op-section">
            <label className="op-label">Layout</label>
            <select className="op-input" value={data.layout} onChange={(e) => actions.updateMatch({ layout: e.target.value })}>
               <option value="A">Layout A</option>
               <option value="B">Layout B</option>
            </select>
         </div>

         {/* Score Home */}
         <div className="op-section">
            <label className="op-label">Score Home</label>
            <button className="op-btn" onClick={() => actions.triggerGoal("home")}>+1 (GOAL)</button>
            <button className="op-btn" onClick={() => actions.updateMatch({homeScore: data.homeScore+1})}>+1 (No Anim)</button>
            <button className="op-btn" onClick={() => actions.updateMatch({homeScore: Math.max(0, data.homeScore-1)})}>-1</button>
            <input className="op-input" value={data.homeName} onChange={e => actions.updateMatch({homeName: e.target.value})} placeholder="Nama Tim Home" style={{width:'120px'}}/>
         </div>

         {/* Score Away */}
         <div className="op-section">
            <label className="op-label">Score Away</label>
            <button className="op-btn" onClick={() => actions.triggerGoal("away")}>+1 (GOAL)</button>
            <button className="op-btn" onClick={() => actions.updateMatch({awayScore: data.awayScore+1})}>+1 (No Anim)</button>
            <button className="op-btn" onClick={() => actions.updateMatch({awayScore: Math.max(0, data.awayScore-1)})}>-1</button>
            <input className="op-input" value={data.awayName} onChange={e => actions.updateMatch({awayName: e.target.value})} placeholder="Nama Tim Away" style={{width:'120px'}}/>
         </div>

         {/* Timer Controls */}
         <div className="op-section">
            <label className="op-label">Timer</label>
            <button className="op-btn op-b-btn-main" onClick={actions.toggleTimer}>{data.timer.isRunning ? "Pause" : "Start"}</button>
            <button className="op-btn" onClick={actions.resetTimer}>Reset</button>
            <span className="op-tiny font-mono text-lg ml-2">{formatTime(displayTime)}</span>
         </div>

         {/* Colors Home/Away (Border & Background) */}
         <div className="op-section">
            <label className="op-label">Colors</label>
            <span className="op-tiny">Home:</span>
            <input
              type="color"
              className="op-input"
              value={data.homeBg || "#ff4b4b"}
              onChange={(e) => actions.updateMatch({ homeBg: e.target.value })}
            />
            <span className="op-tiny" style={{ marginLeft: "10px" }}>Away:</span>
            <input
              type="color"
              className="op-input"
              value={data.awayBg || "#e5e5e5"}
              onChange={(e) => actions.updateMatch({ awayBg: e.target.value })}
            />
         </div>

         {/* Set Time */}
         <div className="op-section">
            <label className="op-label">Set Time</label>
            <input className="op-input" type="number" style={{width:'50px'}} value={manualM} onChange={e => setManualM(e.target.value)}/> : 
            <input className="op-input" type="number" style={{width:'50px'}} value={manualS} onChange={e => setManualS(e.target.value)}/>
            <button className="op-btn" onClick={handleSetTime}>Set</button>
         </div>

         {/* Babak */}
         <div className="op-section">
            <label className="op-label">Babak</label>
            <button className="op-btn" onClick={() => actions.updateMatch({period: 1})}>1st</button>
            <button className="op-btn" onClick={() => actions.updateMatch({period: 2})}>2nd</button>
            <button className="op-btn" onClick={() => actions.updateMatch({period: 3})}>Extra</button>
            <span className="op-tiny">Current: {data.period === 1 ? "1st" : data.period === 2 ? "2nd" : "Extra"}</span>
         </div>

         {/* Logo URL */}
         <div className="op-section">
            <label className="op-label">Logo Home</label>
            <input className="op-input" style={{width:'200px'}} value={data.homeLogo} onChange={e => actions.updateMatch({homeLogo: e.target.value})} />
            <button
              className="op-btn"
              onClick={() => {
                setLogoTarget("home");
                setLogoModalOpen(true);
              }}
            >
              Pilih
            </button>
         </div>
         <div className="op-section">
            <label className="op-label">Logo Away</label>
            <input className="op-input" style={{width:'200px'}} value={data.awayLogo} onChange={e => actions.updateMatch({awayLogo: e.target.value})} />
            <button
              className="op-btn"
              onClick={() => {
                setLogoTarget("away");
                setLogoModalOpen(true);
              }}
            >
              Pilih
            </button>
         </div>

         {/* Sync Button (Dummy untuk UI karena Firebase sudah auto-sync) */}
         <div className="op-section">
            <label className="op-label">Sync</label>
            <button className="op-btn" onClick={() => alert("Data tersinkronisasi otomatis!")}>Sync Semua Client</button>
         </div>

      </div>

      <LogoPickerModal
        isOpen={logoModalOpen}
        onClose={() => setLogoModalOpen(false)}
        onSelect={({ src, club }) => {
          if (!src || !club) return;
          const abbr = makeTeamAbbr(club);
          if (logoTarget === "home") {
            actions.updateMatch({ homeLogo: src, homeName: abbr });
          } else {
            actions.updateMatch({ awayLogo: src, awayName: abbr });
          }
          setLogoModalOpen(false);
        }}
      />
    </div>
  );
}


// ==========================================
// PAGE UTAMA (Layout Router)
// ==========================================
export default function OperatorPage() {
  let roomFromQuery = "";
  let roomFromHash = "";

  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    roomFromQuery = params.get("room") || "";
    roomFromHash = window.location.hash.replace("#", "") || "";
  }

  const roomId = roomFromQuery || roomFromHash || "default";

  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        if (typeof window !== "undefined") {
          window.location.replace("/login");
        }
      } else {
        setIsAuthReady(true);
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } finally {
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    }
  };

  const {
    data,
    displayTime,
    formatTime,
    updateMatch,
    toggleTimer,
    resetTimer,
    triggerGoal,
    toggleOverlay,
  } = useScoreboard(roomId);

  // Kelompokkan actions biar rapi saat dipassing ke props
  const actions = {
    updateMatch,
    toggleTimer,
    resetTimer,
    triggerGoal,
    toggleOverlay,
  };

  if (!isAuthReady) {
    return <div className="text-white p-10">Memeriksa sesi login...</div>;
  }

  if (!data)
    return <div className="text-white p-10">Loading Scoreboard System...</div>;

  // Render sesuai Layout yang dipilih di state
  if (data.layout === "A") {
    return (
      <OperatorA
        data={data}
        actions={actions}
        displayTime={displayTime}
        formatTime={formatTime}
        roomId={roomId}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <OperatorB
      data={data}
      actions={actions}
      displayTime={displayTime}
      formatTime={formatTime}
      roomId={roomId}
      onLogout={handleLogout}
    />
  );
}
