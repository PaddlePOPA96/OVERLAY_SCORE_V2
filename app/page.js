// app/page.js
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
