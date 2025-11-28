// app/page.js
import Link from "next/link";

export default function Home() {
  return (
    <div className="home-shell">
      <div className="home-card">
        <h1 className="home-title">
          <span className="home-icon">⚽</span>
          Scoreboard System
        </h1>
        <div className="home-buttons">
          <Link href="/login" className="home-btn home-btn-primary">
            Login Operator
          </Link>
          <Link href="/overlay" className="home-btn home-btn-secondary">
            Buka Overlay OBS
          </Link>
        </div>
      </div>
    </div>
  );
}
