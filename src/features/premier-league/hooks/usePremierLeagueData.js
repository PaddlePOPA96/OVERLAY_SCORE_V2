import { useEffect, useState } from 'react'

import { ref, onValue } from 'firebase/database'

import { db } from '@/lib/firebase/db'
import { auth } from '@/lib/firebase/auth'

export function usePremierLeagueMatches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const matchesRef = ref(db, 'pl_data/matches/data/matches')

    const unsubscribe = onValue(
      matchesRef,
      snapshot => {
        const data = snapshot.val()

        setMatches(Array.isArray(data) ? data : [])
        setLoading(false)
      },
      error => {
        console.error('Error reading matches from Firebase:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const reloadMatches = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error('User must be logged in to refresh data')
      }

      const token = await auth.currentUser.getIdToken()

      if (!token) {
        throw new Error('Failed to get authentication token')
      }

      const response = await fetch('/api/premier-league/matches', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        let errorMsg = response.statusText

        try {
          const errorBody = await response.json()

          if (errorBody.error) errorMsg = errorBody.error
        } catch {} // Ignore JSON parse error

        throw new Error(`API returned ${response.status}: ${errorMsg}`)
      }

      // Data disimpan ke Firebase RTDB oleh API route.
      // onValue listener di atas akan otomatis menerima update — tidak perlu setMatches() di sini.
      await response.json() // consume body
      console.log('✅ Premier League matches refreshed — Firebase listener will update state automatically')
    } catch (e) {
      console.error('❌ Failed to reload matches:', e.message)
      throw e
    }
  }

  return { matches, loadingMatches: loading, reloadMatches }
}

export function usePremierLeagueNews() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const newsRef = ref(db, 'pl_data/news/articles')

    const unsubscribe = onValue(
      newsRef,
      snapshot => {
        const data = snapshot.val()

        setNews(Array.isArray(data) ? data : [])
        setLoading(false)
      },
      error => {
        console.error('Error reading news from Firebase:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const reloadNews = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error('User must be logged in to refresh data')
      }

      const token = await auth.currentUser.getIdToken()

      if (!token) {
        throw new Error('Failed to get authentication token')
      }

      const response = await fetch('/api/premier-league/news', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        let errorMsg = response.statusText

        try {
          const errorBody = await response.json()

          if (errorBody.error) errorMsg = errorBody.error
        } catch {} // Ignore JSON parse error

        throw new Error(`API returned ${response.status}: ${errorMsg}`)
      }

      console.log('✅ Premier League news refreshed successfully')
    } catch (e) {
      console.error('❌ Failed to reload news:', e.message)
      throw e
    }
  }

  return { news, loadingNews: loading, reloadNews }
}

export function usePremierLeagueStandings() {
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const standingsRef = ref(db, 'pl_data/standings/data/standings')

    const unsubscribe = onValue(
      standingsRef,
      snapshot => {
        const data = snapshot.val()

        if (Array.isArray(data)) {
          const tableObj = data.find(s => s.type === 'TOTAL')

          setStandings(Array.isArray(tableObj?.table) ? tableObj.table : [])
        } else {
          setStandings([])
        }

        setLoading(false)
      },
      error => {
        console.error('Error reading standings:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const reloadStandings = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error('User must be logged in to refresh data')
      }

      const token = await auth.currentUser.getIdToken()

      if (!token) {
        throw new Error('Failed to get authentication token')
      }

      const response = await fetch('/api/premier-league/standings', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        let errorMsg = response.statusText

        try {
          const errorBody = await response.json()

          if (errorBody.error) errorMsg = errorBody.error
        } catch {}

        throw new Error(`API returned ${response.status}: ${errorMsg}`)
      }

      console.log('✅ Premier League standings refreshed successfully')
    } catch (e) {
      console.error('❌ Failed to reload standings:', e.message)
      throw e
    }
  }

  return { standings, loadingStandings: loading, reloadStandings }
}
