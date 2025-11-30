## OVERLAY_SCORE_V2 – EPL Scoreboard Dashboard & Overlay

OVERLAY_SCORE_V2 is a Next.js 16 application for running a live football scoreboard and Premier League dashboard, built for streaming workflows (OBS / browser source) and operator control.

The app combines:

- A secure operator dashboard with authentication.
- Real‑time scoreboard control UI (layouts A & B).
- Browser‑source overlay pages for live broadcast.
- A Premier League section with fixtures, results, table and news.

---

## Features

### 1. Authentication & Dashboard

- Email/password + Google login (`/login`, `/register`).
- Protected dashboard at `/dashboard`:
  - Sidebar navigation:
    - **Scoreboard Operator**
    - **Premier League → Jadwal & Hasil**
    - **Premier League → Premier League Table**
  - Dark / light theme toggle (per user, persisted in `localStorage`).

### 2. Scoreboard Operator

**Routes**

- `/operator` – main operator (query `?room=` optional).
- `/operator/[room]` – operator bound to a specific room ID.

**Capabilities**

- Two operator layouts:
  - **Layout A** – horizontal bar overlay with gradient accents.
  - **Layout B** – box‑style scoreboard with club logos & colors.
- Full‑page operator experience inside `/dashboard` (no iframe).
- Real‑time controls:
  - Team names, scores, logos (with logo picker).
  - Timer (start/pause/reset, manual time set).
  - Period (1st, 2nd, Extra).
  - Color / accent controls (kept in sync across layouts A & B).
  - Overlay visibility toggle (`showOverlay`) with intro animation trigger.
- Sync button (“Sync Semua Client”) to make the operator UI explicit about data refresh.

### 3. Overlay Pages (for OBS / Browser Source)

**Routes**

- `/overlay/page.js` – base overlay entry.
- `/overlay/[room]` – overlay tied to a given `roomId`.

**Details**

- Renders Layout A or Layout B according to live data.
- Designed for 1920x1080 browser sources in OBS.
- Overlay shows whatever the Operator sends through Firebase for that room.

### 4. Premier League Dashboard

**Routes & Views**

- `/dashboard` → `Premier League → Jadwal & Hasil`:
  - Hero “Match of the Day” (live match only when available).
  - Sections:
    - **Today Match**
    - **Next Match**
    - **Last Match**
  - Match rows include:
    - Status badge (`LIVE`, `FT`, `UPCOMING`).
    - Club names, date, and logos.
- `/dashboard` → `Premier League → Premier League Table`:
  - Standings card with:
    - `#`, `Club` (with logo), `M`, `W`, `D`, `L`, `SG`, `Poin`.
  - Compact, EPL‑style layout, theme‑aware (dark/light).
  - “Refresh” button (visible only for admin user, e.g. `admin@admin.com`) to re‑fetch standings on demand.

**Data Sources**

- `app/api/klasemen/route.js`
  - `GET /api/klasemen` → Premier League standings from [football-data.org](https://www.football-data.org/).
  - Also writes a snapshot to Firebase at `pl_data/standings` (for optional usage).
- `app/api/pertandingan/route.js`
  - `GET /api/pertandingan` → PL fixtures and results (±7 day window).
  - Writes snapshot to `pl_data/matches`.
- `app/api/news/route.js`
  - `GET /api/news` → latest EPL news from ESPN (`eng.1`).
- `app/api/teams/[id]/route.js`
  - `GET /api/teams/:id` → team details (optional, for future enhancements).

### 5. Firebase Integration

- Realtime Database structure:

  ```text
  match_live/{roomId}
    layout
    showOverlay
    introId
    homeName / awayName
    homeScore / awayScore
    homeLogo / awayLogo
    homeColor / awayColor
    homeBg / awayBg
    period
    timer: { isRunning, baseTime, startTime }
    goalTrigger
    goalTeam

  pl_data/standings
    lastUpdated
    data: { ...raw response from football-data.org... }

  pl_data/matches
    lastUpdated
    data: { ...raw response from football-data.org... }

  pl_data/teams/{id}
    lastUpdated
    data: { ...raw response for that team... }
  ```

- `hooks/useScoreboard.js` encapsulates all realtime read/write logic for `match_live/{roomId}`.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, `app/` directory, client/server components).
- **UI**:
  - Tailwind CSS 4 (via `@tailwindcss/postcss`).
  - Lightweight UI primitives (`components/ui/button`, `components/ui/card`).
- **Auth**: Firebase Authentication (email/password + Google).
- **Data**: Firebase Realtime Database.
- **External APIs**:
  - [football-data.org](https://www.football-data.org/) – standings & fixtures.
  - ESPN Soccer API – latest Premier League news.

---

## Getting Started

### 1. Prerequisites

- Node.js 20+ (recommended to match Next.js 16 requirements).
- npm (or pnpm/yarn/bun, but README uses npm examples).
- A Firebase project with Realtime Database enabled.
- A football-data.org API key.

### 2. Environment Variables

Create a `.env.local` file in the project root with at least:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-db-id.firebaseio.com

FOOTBALL_DATA_API_KEY=your_football_data_api_key
```

The Firebase keys are read in `lib/firebase.js`, and the football API key is used in the API routes under `app/api/klasemen`, `app/api/pertandingan`, and `app/api/teams/[id]`.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

Default flow:

- Visit `/login` → authenticate.
- After login, you are redirected to `/dashboard`.
- From the sidebar:
  - Open **Scoreboard Operator** to control overlays.
  - Open **Premier League → Jadwal & Hasil** to see fixtures.
  - Open **Premier League → Premier League Table** to see the standings.

---

## Project Structure (High Level)

```text
app/
  api/
    klasemen/route.js        # PL standings API + Firebase snapshot
    pertandingan/route.js    # PL fixtures/results API + snapshot
    news/route.js            # EPL news feed
    teams/[id]/route.js      # Team details
  dashboard/
    page.js                  # Auth‑protected dashboard shell
    LeftSidebar.js
    MainColumn.js
    RightColumn.js
    PremierLeagueSection.js  # PL hero + matches + standings
    PremierLeagueSidebar.js  # Live matches + latest news panel
    pl-data.js               # Hooks for matches/news/standings
  operator/
    page.js                  # /operator
    [room]/page.js           # /operator/[room]
    OperatorRoot.js          # Shared operator controller
    OperatorA.js             # Layout A control UI
    OperatorB.js             # Layout B control UI
    OverlayRoomControls.js
    LogoPickerModal.js
    logoData.js              # Logo list + helper
  overlay/
    LayoutA.js
    LayoutB.js
    [room]/page.js           # /overlay/[room]
login/, register/            # Auth pages
lib/
  firebase.js                # Firebase app + RTDB
  firebaseAuth.js            # Firebase Auth singleton
hooks/
  useScoreboard.js           # Core scoreboard realtime hook
public/
  logo/England - Premier League/*.png  # Club logos used in UI
  table.html                 # Original EPL dashboard HTML reference
```

---

## Firebase Rules (Example)

```

Adjust according to your security requirements (for production, you may want more restrictive `pl_data` rules or server‑side write only).

---

## Deployment

You can deploy this project like any other Next.js 16 app:

- **Vercel** – easiest option, with automatic environment variable support.
- **Custom Node server** – build and start:

```bash
npm run build
npm start
```

Make sure the Firebase and API environment variables are configured in your hosting platform.

---

## Notes

- This README describes the current structure and flows of the project; if you add more overlays, leagues, or dashboards, update this document so future maintainers can quickly understand the system.
- API keys for football-data.org and Firebase should **never** be committed to the repository; always keep them in environment variables or secure secrets stores.
