'use server'

import { unstable_cache } from 'next/cache'
import playerData from '@/data/fix-player.json'

export async function getClubs() {
  try {
    const clubs = []
    if (playerData && Array.isArray(playerData.players)) {
      playerData.players.forEach(clubData => {
        if (clubData.club) {
          clubs.push({ id: clubData.club, name: clubData.club })
        }
      })
    }
    // Sort alphabetically
    clubs.sort((a, b) => a.name.localeCompare(b.name))
    return clubs
  } catch (error) {
    console.error("Failed to fetch clubs from local JSON:", error)
    return []
  }
}

export async function getPlayersByClub(clubId) {
  if (!clubId) return []
  
  try {
    if (!playerData || !Array.isArray(playerData.players)) return []
    
    const clubData = playerData.players.find(c => c.club === clubId)
    if (!clubData || !clubData.players) return []
    
    return clubData.players.map(p => ({
      ...p,
      club: clubData.club
    }))
  } catch (error) {
    console.error(`Failed to fetch players for club ${clubId} from JSON:`, error)
    return []
  }
}

export async function searchAllPlayers(query) {
  if (!query || query.trim().length < 3) return []

  try {
    const allPlayers = []
    if (playerData && Array.isArray(playerData.players)) {
      playerData.players.forEach(clubData => {
        if (clubData.players && Array.isArray(clubData.players)) {
          clubData.players.forEach(p => {
            if (p.name) {
              allPlayers.push({ ...p, club: clubData.club })
            }
          })
        }
      })
    }
    
    const lowerQuery = query.toLowerCase().trim()
    const results = []
    for (const p of allPlayers) {
      if (p.name.toLowerCase().includes(lowerQuery)) {
        results.push(p)
      }
      if (results.length >= 50) break
    }
    return results
  } catch (error) {
    console.error("Failed to fetch flat players from local json:", error)
    return []
  }
}