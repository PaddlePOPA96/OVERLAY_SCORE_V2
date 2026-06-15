'use server'

import data from '@/data/fix-player.json'

// Cache hasil flattening agar tidak diproses ulang
let cachedFlatPlayers = null

function getFlatPlayers() {
  if (cachedFlatPlayers) return cachedFlatPlayers

  const clubsArray = data.players || []

  // Menggunakan flatMap untuk performa dan keterbacaan yang lebih baik
  // Sekaligus validasi data di awal agar proses filter nanti lebih enteng
  cachedFlatPlayers = clubsArray.flatMap(c => {
    if (!c || !c.players) return []

    return c.players
      .filter(p => p && p.name) // Validasi objek player di sini
      .map(p => ({
        club: c.club,
        name: p.name,
        img_url: p.img_url
      }))
  })

  return cachedFlatPlayers
}

export async function searchPlayers(query) {
  // 1. Validasi awal (early return)
  if (!query || query.trim().length < 4) return []

  const flatPlayers = getFlatPlayers()
  const lowerQuery = query.toLowerCase().trim() // Tambahkan .trim() untuk membuang spasi tidak sengaja

  // 2. Proses filter sekarang lebih cepat karena data di flatPlayers dijamin valid
  const results = []

  for (const p of flatPlayers) {
    if (p.name.toLowerCase().includes(lowerQuery)) {
      results.push(p)
    }
    // 3. PENTING: Berhenti looping jika sudah mencapai 50 item (Bukan di-slice di akhir)
    if (results.length === 50) break
  }

  return results
}