import { useEffect, useState } from 'react'

import { ref, onValue } from 'firebase/database'

import { db } from '@/lib/firebaseDb'

export function useWorldCupMatches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const matchesRef = ref(db, 'ucl_data/wc_matches/data/matches')

    const unsubscribe = onValue(
      matchesRef,
      snapshot => {
        const data = snapshot.val()

        setMatches(Array.isArray(data) ? data : [])
        setLoading(false)
      },
      error => {
        console.error('Error reading World Cup matches:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const reloadWcMatches = async () => {
    try {
      const token = await import('@/lib/firebaseAuth').then(m => m.auth.currentUser?.getIdToken())

      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const response = await fetch('/api/world-cup/matches', { headers })

      if (!response.ok) {
        let errorMsg = response.statusText

        try {
          const errorBody = await response.json()

          if (errorBody.error) errorMsg = errorBody.error
        } catch {}

        throw new Error(`World Cup matches API returned ${response.status}: ${errorMsg}`)
      } else {
        const data = await response.json()

        if (data && Array.isArray(data.matches)) {
          setMatches(data.matches)
        } else if (Array.isArray(data)) {
          setMatches(data)
        }

        console.log('✅ World Cup matches refreshed successfully')
      }
    } catch (e) {
      console.error('❌ Failed to reload World Cup matches:', e.message)
      throw e
    }
  }

  return {
    wcMatches: matches,
    loadingWcMatches: loading,
    reloadWcMatches
  }
}

export function useWorldCupStandings() {
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const standingsRef = ref(db, 'ucl_data/wc_standings/data/standings')

    const unsubscribe = onValue(
      standingsRef,
      snapshot => {
        const data = snapshot.val()

        setStandings(Array.isArray(data) ? data : [])
        setLoading(false)
      },
      error => {
        console.error('Error reading World Cup standings:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const reloadWcStandings = async () => {
    try {
      const token = await import('@/lib/firebaseAuth').then(m => m.auth.currentUser?.getIdToken())

      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const response = await fetch('/api/world-cup/standings', { headers })

      if (!response.ok) {
        let errorMsg = response.statusText

        try {
          const errorBody = await response.json()

          if (errorBody.error) errorMsg = errorBody.error
        } catch {}

        throw new Error(`World Cup standings API returned ${response.status}: ${errorMsg}`)
      } else {
        console.log('✅ World Cup standings refreshed successfully')
      }
    } catch (e) {
      console.error('❌ Failed to reload World Cup standings:', e.message)
      throw e
    }
  }

  return {
    wcStandings: standings,
    loadingWcStandings: loading,
    reloadWcStandings
  }
}
