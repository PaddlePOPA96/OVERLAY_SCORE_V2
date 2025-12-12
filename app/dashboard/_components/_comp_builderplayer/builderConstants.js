"use client";

// Data awal pemain untuk bench default
export const INITIAL_PLAYERS = [
  {
    id: "p1",
    name: "L. Messi",
    position: "RW",
    rating: 99,
    imgUrl: "https://media.api-sports.io/football/players/154.png",
  },
  {
    id: "p2",
    name: "C. Ronaldo",
    position: "ST",
    rating: 98,
    imgUrl: "https://media.api-sports.io/football/players/874.png",
  },
  {
    id: "p3",
    name: "P. Maldini",
    position: "CB",
    rating: 97,
    imgUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/PaoloMaldini.jpg/200px-PaoloMaldini.jpg",
  },
  {
    id: "p4",
    name: "Z. Zidane",
    position: "CAM",
    rating: 96,
    imgUrl:
      "https://upload.wikimedia.org/wikipedia/commons/f/f3/Zinedine_Zidane_by_Tasnim_03.jpg",
  },
  {
    id: "p5",
    name: "R. Nazario",
    position: "ST",
    rating: 98,
    imgUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/33/Ronaldo_Cannes_2018.jpg",
  },
  {
    id: "p6",
    name: "T. Henry",
    position: "ST",
    rating: 94,
    imgUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Thierry_Henry_2012.jpg/440px-Thierry_Henry_2012.jpg",
  },
  {
    id: "p7",
    name: "A. Iniesta",
    position: "CM",
    rating: 95,
    imgUrl: "https://media.api-sports.io/football/players/8.png",
  },
  {
    id: "p8",
    name: "R. Carlos",
    position: "LB",
    rating: 93,
    imgUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/66/Roberto_Carlos_2019.jpg",
  },
  {
    id: "p9",
    name: "V. Van Dijk",
    position: "CB",
    rating: 91,
    imgUrl: "https://media.api-sports.io/football/players/293.png",
  },
  {
    id: "p10",
    name: "K. De Bruyne",
    position: "CM",
    rating: 92,
    imgUrl: "https://media.api-sports.io/football/players/629.png",
  },
  {
    id: "p11",
    name: "E. Haaland",
    position: "ST",
    rating: 93,
    imgUrl: "https://media.api-sports.io/football/players/1100.png",
  },
];

// Override khusus untuk beberapa legenda yang susah dicari akurat via API
export const SPECIAL_PLAYERS = {
  // Ronaldo Luís Nazário de Lima
  "ronaldo nazario": {
    id: "special-ronaldo-nazario",
    name: "Ronaldo Nazário",
    imgUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/33/Ronaldo_Cannes_2018.jpg",
    mappedPos: "FWD",
  },
  "ronaldo luis nazario": {
    id: "special-ronaldo-nazario",
    name: "Ronaldo Nazário",
    imgUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/33/Ronaldo_Cannes_2018.jpg",
    mappedPos: "FWD",
  },
};

// Default slots berdasarkan posisi (seperti di mobile)
// Format: { x: percentage, y: percentage }
export const DEFAULT_SLOTS_BY_POSITION = {
  GK: [
    { x: 50, y: 88 }, // GK (Bottom center)
  ],
  DEF: [
    { x: 15, y: 68 }, // Left back
    { x: 38, y: 75 }, // Center back left
    { x: 62, y: 75 }, // Center back right
    { x: 85, y: 68 }, // Right back
  ],
  MID: [
    { x: 28, y: 45 }, // Left mid
    { x: 50, y: 55 }, // Center mid
    { x: 72, y: 45 }, // Right mid
  ],
  FWD: [
    { x: 18, y: 18 }, // Left forward
    { x: 50, y: 12 }, // Center forward
    { x: 82, y: 18 }, // Right forward
  ],
};

// Database formasi (koordinat persentase)
export const FORMATIONS = {
  "4-3-3": [
    { x: 50, y: 88 }, // GK
    { x: 15, y: 68 },
    { x: 38, y: 75 },
    { x: 62, y: 75 },
    { x: 85, y: 68 }, // DEF
    { x: 28, y: 45 },
    { x: 50, y: 55 },
    { x: 72, y: 45 }, // MID
    { x: 18, y: 18 },
    { x: 50, y: 12 },
    { x: 82, y: 18 }, // FWD
  ],
  "4-4-2": [
    { x: 50, y: 88 },
    { x: 15, y: 68 },
    { x: 38, y: 75 },
    { x: 62, y: 75 },
    { x: 85, y: 68 },
    { x: 15, y: 40 },
    { x: 38, y: 45 },
    { x: 62, y: 45 },
    { x: 85, y: 40 },
    { x: 35, y: 15 },
    { x: 65, y: 15 },
  ],
  "4-2-3-1": [
    { x: 50, y: 88 },
    { x: 15, y: 68 },
    { x: 38, y: 75 },
    { x: 62, y: 75 },
    { x: 85, y: 68 },
    { x: 35, y: 55 },
    { x: 65, y: 55 },
    { x: 20, y: 35 },
    { x: 50, y: 35 },
    { x: 80, y: 35 },
    { x: 50, y: 12 },
  ],
  "3-5-2": [
    { x: 50, y: 88 },
    { x: 30, y: 75 },
    { x: 50, y: 78 },
    { x: 70, y: 75 },
    { x: 10, y: 50 },
    { x: 35, y: 45 },
    { x: 50, y: 58 },
    { x: 65, y: 45 },
    { x: 90, y: 50 },
    { x: 35, y: 15 },
    { x: 65, y: 15 },
  ],
};

