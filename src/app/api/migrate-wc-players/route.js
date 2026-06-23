import { NextResponse } from 'next/server'
import { doc, setDoc } from 'firebase/firestore'
import { dbFirestore } from '@/services/firebase/firestore'

const API_KEY = process.env.FOOTBALL_DATA_API_KEY
const BASE_URL = 'https://api.football-data.org/v4'

export async function GET(request) {
  try {
    if (!API_KEY) {
      return NextResponse.json({ error: 'FOOTBALL_DATA_API_KEY not configured' }, { status: 500 })
    }

    // Ambil daftar tim yang bermain di World Cup (WC)
    const url = `${BASE_URL}/competitions/WC/teams`
    const res = await fetch(url, {
      headers: { 'X-Auth-Token': API_KEY }
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json({ error: 'Failed to fetch from API', details: err }, { status: res.status })
    }

    const data = await res.json()
    const teams = data.teams || []

    let successCount = 0
    let failCount = 0
    const migratedTeams = []

    for (const team of teams) {
      const countryName = team.name
      const squad = team.squad || []
      
      // Jika squad kosong, lewati (kadang API gratisan tidak menyediakan squad untuk semua tim)
      if (squad.length === 0) continue;

      const safeId = countryName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

      // Format pemain agar sesuai dengan struktur UI Anda
      const formattedPlayers = squad.map(p => ({
        name: p.name,
        club: countryName,
        img_url: "" // API football-data umumnya tidak kasih gambar wajah gratis
      }))

      try {
        const docRef = doc(dbFirestore, 'clubs', safeId)
        await setDoc(docRef, {
          name: countryName,
          players: formattedPlayers
        })
        successCount++
        migratedTeams.push(countryName)
      } catch (err) {
        console.error(`Failed to migrate ${countryName}:`, err)
        failCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil menambahkan ${successCount} Negara Piala Dunia beserta pemainnya!`,
      teams: migratedTeams
    })

  } catch (error) {
    console.error('WC Migration error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
