# ⚽ OVERLAY_SCORE_V2

Aplikasi **Next.js 14** (App Router) untuk dashboard & kontrol live scoreboard sepak bola secara realtime. Didesain khusus untuk kebutuhan siaran/streaming dan integrasi langsung ke OBS (Browser Source).

---

## ✨ Fitur Utama

* 🎮 **Scoreboard Operator:** Kontrol skor, logo, timer, dan nama tim secara realtime.
* 📺 **OBS Browser Source Overlays:** Papan skor live & running text ticker siap pakai di OBS.
* 🏆 **Multi-League Dashboard:** Integrasi jadwal, hasil, dan klasemen Premier League, Champions League, & World Cup 2026.
* 👥 **Manajemen Akses & Role:** Mendukung role `superadmin`, `admin`, dan `user` via Firestore.
* 🌓 **Mode Gelap / Terang:** UI modern dengan Material UI v6 + Tailwind CSS.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js 14 (App Router), Tailwind CSS, MUI v6
* **Database & Auth:** Firebase Authentication, Realtime Database (realtime scoreboard), & Firestore (data user/role)
* **Data API:** [football-data.org](https://www.football-data.org/)

---

## 🚀 Memulai (Getting Started)

### 1. Konfigurasi Environment (`.env.local`)
Salin file `.env.example` menjadi `.env.local` di root project dan lengkapi nilainya:

```env
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-db.firebaseio.com

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Football Data API
FOOTBALL_DATA_API_KEY=your_football_data_api_key
```

### 2. Cara Mendapatkan Football Data API Key
1. Kunjungi dan daftar di **[football-data.org](https://www.football-data.org/)** dengan memilih **Free Plan** (gratis).
2. Isi formulir pendaftaran (Nama, Email, dan Tipe Penggunaan: Personal / Non-commercial).
3. Periksa kotak masuk/inbox email Anda untuk menemukan email berisi **API Token**.
4. Salin token tersebut dan masukkan ke dalam `.env.local` sebagai `FOOTBALL_DATA_API_KEY`.

#### Alur Mendapatkan API Key:
```mermaid
flowchart TD
    Start([Kunjungi football-data.org]) --> Reg[Klik 'Get your API key' / 'Register']
    Reg --> Free[Pilih Plan: Free]
    Free --> Form[Isi Nama, Email & Tipe Penggunaan]
    Form --> Email[Cek Inbox Email Anda]
    Email --> Token[Salin API Token dari Email]
    Token --> Env([Masukkan ke .env.local as FOOTBALL_DATA_API_KEY])

    classDef step fill:#2C3E50,stroke:#34495E,stroke-width:1px,color:#fff;
    classDef startEnd fill:#16A085,stroke:#1ABC9C,stroke-width:2px,color:#fff;
    class Start,Env startEnd;
    class Reg,Free,Form,Email,Token step;
```

<details>
<summary>🔑 Cara Mendapatkan Firebase Admin SDK Key</summary>

1. Buka [Firebase Console](https://console.firebase.google.com/) -> Project Settings -> **Service accounts**.
2. Klik **Generate new private key** untuk mengunduh JSON.
3. Salin nilainya ke variabel `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, dan `FIREBASE_PRIVATE_KEY`.
</details>

### 3. Instalasi & Menjalankan Aplikasi
```bash
# Install dependensi
pnpm install  # atau npm install

# Jalankan lokal dev server
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 📺 Panduan Setup OBS

### Running Text Ticker
1. Buka halaman **Running Text Setup** (`?s=running-text`).
2. Klik **🔄 Refresh Source Data** (Superadmin only) untuk sync data terbaru dari API.
3. Tambahkan **Browser Source** baru di OBS dengan detail:
   * **URL:** `http://localhost:3000/dashboard/running-text`
   * **Width & Height:** `1920` x `80`

### Scoreboard Overlay
1. Masuk ke halaman **Scoreboard Operator** untuk menyalin link overlay Room Anda.
2. Tambahkan **Browser Source** baru di OBS dengan detail:
   * **URL:** `http://localhost:3000/[roomId]`
   * **Width & Height:** Sesuaikan dengan kanvas (misal `1920` x `1080`).

---

## 👥 Manajemen User & Role

Hak akses diatur via Firestore di koleksi `users/{uid}`:
* **`superadmin`:** Akses penuh + kontrol penuh refresh data dari external API.
* **`admin`:** Akses dashboard dan operator scoreboard (tidak bisa refresh API).
* **`user`:** Akses terbatas (hanya baca/view).

---

<details>
<summary>📁 Struktur Project & Database Schema</summary>

### Struktur Direktori Utama
```
src/
├── app/
│   ├── (dashboard)/       # Dashboard & operator panel
│   ├── [room]/           # Live scoreboard overlay (OBS source)
│   └── api/              # API proxy endpoint (PL, UCL, WC)
├── features/             # Modul logika per-liga/fitur
├── hooks/                # Custom React hooks (realtime state)
└── lib/                  # Inisialisasi Firebase & utils
```

### Realtime Database Schema
```
match_live/{roomId}       # Realtime scoreboard state
pl_data/                  # Cached Premier League data
ucl_data/                 # Cached UCL & World Cup data
settings/{uid}/           # User preferences / OBS configs
```
</details>

---

## 🚢 Deployment (Vercel)

1. Hubungkan repository ke [Vercel](https://vercel.com).
2. Tambahkan semua Environment Variables yang sama dengan `.env.local`.
3. Deploy!
   * *Catatan:* Untuk `FIREBASE_PRIVATE_KEY` di Vercel, masukkan nilainya tanpa tanda kutip di awal/akhir, namun pastikan karakter newline (`\n`) tetap ada.
