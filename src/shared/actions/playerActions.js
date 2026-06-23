'use server'

import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { dbFirestore } from '@/services/firebase/firestore'
import { unstable_cache } from 'next/cache'

export async function getClubs() {
  const fetchClubs = unstable_cache(
    async () => {
      try {
        const clubsSnap = await getDocs(collection(dbFirestore, 'clubs'))
        const clubs = []
        
        clubsSnap.forEach(document => {
          const data = document.data()
          if (data.name) {
            clubs.push({ id: document.id, name: data.name })
          }
        })
        
        // Sort alphabetically
        clubs.sort((a, b) => a.name.localeCompare(b.name))
        return clubs
      } catch (error) {
        console.error("Failed to fetch clubs:", error)
        return []
      }
    },
    ['all-clubs-list'],
    { revalidate: 86400, tags: ['clubs'] } // Cache for 24 hours
  )

  return fetchClubs()
}

export async function getPlayersByClub(clubId) {
  if (!clubId) return []
  
  const fetchPlayers = unstable_cache(
    async (id) => {
      try {
        const clubDoc = await getDoc(doc(dbFirestore, 'clubs', id))
        if (!clubDoc.exists()) return []
        
        const players = clubDoc.data().players || []
        const clubName = clubDoc.data().name
        
        return players.map(p => ({
          ...p,
          club: clubName
        }))
      } catch (error) {
        console.error(`Failed to fetch players for club ${id}:`, error)
        return []
      }
    },
    [`players-by-club-${clubId}`],
    { revalidate: 86400, tags: [`club-${clubId}`] } // Cache for 24 hours
  )

  return fetchPlayers(clubId)
}

export async function searchAllPlayers(query) {
  if (!query || query.trim().length < 3) return []

  const fetchAllFlatPlayers = unstable_cache(
    async () => {
      try {
        console.time("Firestore-FetchAllPlayers")
        const clubsSnap = await getDocs(collection(dbFirestore, 'clubs'))
        const allPlayers = []
        clubsSnap.forEach(document => {
          const data = document.data()
          if (data.players && Array.isArray(data.players)) {
            data.players.forEach(p => {
              if (p.name) {
                allPlayers.push({ ...p, club: data.name })
              }
            })
          }
        })
        console.timeEnd("Firestore-FetchAllPlayers")
        console.log(`Cached ${allPlayers.length} players`)
        return allPlayers
      } catch (error) {
        console.error("Failed to fetch all flat players:", error)
        return []
      }
    },
    ['all-flat-players-v2'],
    { revalidate: 86400, tags: ['clubs', 'players'] }
  )

  console.time("GetFlatPlayersCache")
  const flatPlayers = await fetchAllFlatPlayers()
  console.timeEnd("GetFlatPlayersCache")

  const lowerQuery = query.toLowerCase().trim()
  
  const results = []
  for (const p of flatPlayers) {
    if (p.name.toLowerCase().includes(lowerQuery)) {
      results.push(p)
    }
    if (results.length >= 50) break
  }
  
  return results
}