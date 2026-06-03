# OVERLAY_SCORE_V2 – Live Football Scoreboard & Dashboard

A **Next.js 14** application for live football scoreboard control and multi-league dashboard, built for streaming workflows (OBS / Browser Source) and operator control.

---

## ✨ Features Overview

| Feature | Description |
|---|---|
| 🎮 Scoreboard Operator | Real-time scoreboard control with two overlay layouts |
| 📺 OBS Browser Source Overlays | Live score overlay + running text ticker |
| 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League Dashboard | Fixtures, results, standings & news |
| 🏆 Champions League Dashboard | UCL fixtures, results & group standings |
| 🌍 World Cup Dashboard | FIFA World Cup 2026 schedules, results & group standings |
| 📜 Running Text Ticker | Scrolling live match ticker for OBS |
| 👥 User & Role Management | Superadmin / admin / user roles via Firestore |
| 🌓 Dark / Light Mode | Per-user theme, persisted in localStorage |

---

## 🗂 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: Material UI v6 + Tailwind CSS
- **Auth**: Firebase Authentication (email/password + Google)
- **Database**: Firebase Realtime Database + Firestore
- **External API**: [football-data.org](https://www.football-data.org/) (PL, UCL, WC)
- **Deployment**: Vercel (recommended)

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- Firebase project with **Realtime Database** + **Firestore** enabled
- A [football-data.org](https://www.football-data.org/) API key

---

### 2. Environment Variables

Create a `.env.local` file in the project root:

```bash
# Firebase Client SDK (public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-db-id.firebaseio.com

# Firebase Admin SDK (server-side, keep private)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Football Data API
FOOTBALL_DATA_API_KEY=your_football_data_api_key
```

> ⚠️ **Never commit these values to git.** Use `.env.local` locally and set them as Vercel Environment Variables for production.

---

### 🔑 Cara Mendapatkan `FOOTBALL_DATA_API_KEY`

1. Kunjungi **[football-data.org](https://www.football-data.org/)**
2. Klik **"Get your API key"** atau **"Register"**
3. Pilih plan **Free** (gratis, sudah cukup untuk PL, UCL, dan WC)
4. Daftar dengan nama & email, pilih tipe penggunaan (Personal / Non-commercial)
5. Cek inbox email — cari email dari `football-data.org` berisi **API Token**
6. Salin token → tempel ke `.env.local` sebagai `FOOTBALL_DATA_API_KEY`

---

### 🔑 Cara Mendapatkan Firebase Admin SDK Key

1. Buka [Firebase Console](https://console.firebase.google.com/) → pilih project Anda
2. Masuk ke **Project Settings** (ikon ⚙️ di sidebar) → tab **Service accounts**
3. Klik **"Generate new private key"** → konfirmasi → file JSON akan diunduh
4. Dari file JSON tersebut, salin nilai berikut ke `.env.local`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (pastikan dibungkus tanda kutip dan `\n` tetap ada)

---

### 3. Install Dependencies

```bash
pnpm install
# atau
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Buka `http://localhost:3000`.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── page.jsx                    # Main dashboard (query ?s= routing)
│   │   ├── dashboard/
│   │   │   ├── running-text/page.js    # OBS Running Text overlay page
│   │   │   └── operator/               # Scoreboard operator UI
│   │   ├── premier-league/page.jsx     # EPL fixtures & standings
│   │   ├── ucl-table/page.jsx          # UCL fixtures & standings
│   │   ├── world-cup/page.jsx          # World Cup fixtures & standings
│   │   ├── running-text-setup/page.jsx # Running Text OBS setup
│   │   ├── countdown-timer/page.jsx    # Countdown Timer overlay
│   │   └── admin/create-user/page.jsx  # Admin user management
│   ├── [room]/                         # Public overlay page (OBS source)
│   └── api/
│       ├── premier-league/             # PL matches, standings, news
│       ├── champions-league/           # UCL matches, standings
│       └── world-cup/                  # WC matches, standings
├── features/
│   ├── premier-league/                 # PL hooks & components
│   ├── champions-league/               # UCL hooks & components
│   ├── world-cup/                      # WC hooks & components
│   ├── countdown/                      # Countdown timer feature
│   └── iam/                            # User role hooks
├── hooks/
│   └── useLayoutSettings.js            # Shared overlay settings (RTDB)
└── lib/
    ├── firebase.js                     # Firebase Auth + RTDB client
    ├── firebaseDb.js                   # Realtime Database instance
    ├── firebaseFirestore.js            # Firestore instance
    ├── firebaseAdmin.js                # Admin SDK (server-side)
    └── logoData.js                     # Club/national team logo resolver
```

---

## 🔥 Firebase Realtime Database Structure

```
match_live/{roomId}
  ├── layout              # "A" | "B"
  ├── showOverlay         # boolean
  ├── homeName / awayName
  ├── homeScore / awayScore
  ├── homeLogo / awayLogo
  ├── homeColor / awayColor
  ├── period              # "1st" | "2nd" | "Extra"
  ├── timer               # { isRunning, baseTime, startTime }
  └── goalTrigger / goalTeam

pl_data/
  ├── matches/            # Premier League matches snapshot
  ├── standings/          # PL standings snapshot
  └── news/               # PL news articles

ucl_data/
  ├── matches/            # UCL matches snapshot
  ├── standings/          # UCL standings snapshot
  ├── wc_matches/         # World Cup matches snapshot
  └── wc_standings/       # World Cup standings snapshot

settings/{uid}/
  └── runningText/
      ├── source          # "premier-league" | "champions-league" | "world-cup"
      ├── y               # Vertical offset (px)
      └── scale           # Scale factor
```

---

## 👥 User Roles

Roles disimpan di **Firestore** pada koleksi `users/{uid}`:

| Role | Akses |
|---|---|
| `superadmin` | Full access + bisa refresh data dari API |
| `admin` | Akses dashboard, tidak bisa refresh API |
| `user` | Akses terbatas |

> Tombol **"Refresh Source Data"** di halaman Running Text Setup hanya muncul untuk `superadmin`.

---

## 📺 OBS Setup – Running Text Ticker

1. Buka **Running Text Setup** di sidebar (`?s=running-text`)
2. Pilih sumber data: Premier League / Champions League / World Cup
3. Klik **🔄 Refresh Source Data** (Superadmin only) untuk memuat data terbaru dari API ke Firebase
4. Salin URL Overlay yang muncul, contoh: `https://your-app.vercel.app/dashboard/running-text`
5. Di OBS → tambah **Browser Source** → tempel URL → set Width: `1920`, Height: `80`

---

## 📺 OBS Setup – Scoreboard Overlay

1. Login sebagai operator → buka **Scoreboard Operator** di sidebar
2. Catat URL overlay yang sesuai dengan Room ID Anda
3. Di OBS → tambah **Browser Source** → tempel URL overlay (`/[roomId]`)
4. Set resolusi sesuai canvas OBS (misal 1920×1080)

---

## 🚢 Deployment (Vercel)

1. Push kode ke GitHub
2. Import repo di [vercel.com](https://vercel.com)
3. Set semua **Environment Variables** di Vercel dashboard (sama seperti `.env.local`)
4. Deploy → selesai

> Variabel `FIREBASE_PRIVATE_KEY` di Vercel: paste nilainya **tanpa** tanda kutip luar, tapi pastikan `\n` tetap ada di dalam string.

---

## 📝 Notes

- Data dari football-data.org di-cache di Firebase RTDB. Client membaca dari Firebase (realtime), bukan langsung dari API.
- API routes yang menulis ke Firebase hanya bisa dipanggil oleh user dengan role `superadmin` (diverifikasi via Firebase Admin SDK + Firestore).
- API keys (`FOOTBALL_DATA_API_KEY`, Firebase Admin credentials) **tidak boleh di-commit** ke repository.
