'use server'

import data from '@/data/fix-player.json'

// Cache the flattened list to avoid re-flattening on every request
let cachedFlatPlayers = null

function getFlatPlayers() {
  if (cachedFlatPlayers) return cachedFlatPlayers
  
  const clubsArray = data.players || []
  const flatPlayers = []
  clubsArray.forEach(c => {
    if (c && c.players) {
      c.players.forEach(p => {
        flatPlayers.push({ club: c.club, name: p.name, img_url: p.img_url })
      })
    }
  })
  
  cachedFlatPlayers = flatPlayers
  return cachedFlatPlayers
}

export async function searchPlayers(query) {
  if (!query || query.length < 4) return []
  
  const flatPlayers = getFlatPlayers()
  const lowerQuery = query.toLowerCase()
  
  return flatPlayers
    .filter(p => p && p.name && p.name.toLowerCase().includes(lowerQuery))
    .slice(0, 50)
}
