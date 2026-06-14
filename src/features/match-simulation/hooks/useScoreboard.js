'use client'
import { useEffect, useState } from 'react'

import { ref, onValue, update } from 'firebase/database'

import { db } from '@/lib/firebase/db'
import { defaultMatchData, formatTime } from '@/utils/scoreboardLogic'

// roomId / sessionId dipakai supaya beberapa pertandingan bisa jalan paralel
export function useScoreboard(roomId = 'default') {
  // defaultMatchData diimpor dari shared/scoreboardLogic supaya tidak duplikat
  const [data, setData] = useState(defaultMatchData)

  const [displayTime, setDisplayTime] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  // Sync Firebase untuk room tertentu
  useEffect(() => {
    if (!roomId) return

    // Reset state when roomId changes to prevent data carry-over
    setIsLoaded(false)

    const matchRef = ref(db, `match_live/${roomId}`)

    const unsubscribe = onValue(matchRef, snapshot => {
      if (snapshot.exists()) {
        const val = snapshot.val()

        setData(prev => ({ ...prev, ...val }))
        setIsLoaded(true)
        calculateTime(val)
      } else {
        // If room doesn't exist, we still mark it as loaded so UI can render
        setIsLoaded(true)
      }
    })

    return () => unsubscribe()
  }, [roomId])

  // Interval Lokal
  useEffect(() => {
    let interval

    if (data.timer?.isRunning) {
      interval = setInterval(() => {
        calculateTime(data)
      }, 500)
    }

    return () => clearInterval(interval)
  }, [data])

  const calculateTime = currentData => {
    if (!currentData?.timer) return

    if (currentData.timer.isRunning) {
      const now = Date.now()
      const elapsed = Math.floor((now - currentData.timer.startTime) / 1000)

      setDisplayTime(currentData.timer.baseTime + elapsed)
    } else {
      setDisplayTime(currentData.timer.baseTime)
    }
  }

  const updateMatch = updates => {
    if (!roomId) return
    update(ref(db, `match_live/${roomId}`), updates)

    // If it's a slot-specific room, mirror updates to the main user room for the overlay
    if (roomId.includes('_slot')) {
      const mainRoomId = roomId.split('_slot')[0]

      update(ref(db, `match_live/${mainRoomId}`), updates)
    }
  }

  const triggerGoal = team => {
    const current = team === 'home' ? data.homeScore || 0 : data.awayScore || 0

    const newScore = Math.min(20, current + 1)

    updateMatch({
      [team === 'home' ? 'homeScore' : 'awayScore']: newScore,
      goalTrigger: Date.now(),
      goalTeam: team === 'home' ? data.homeName : data.awayName
    })
  }

  const stopGoalAudio = () => {
    updateMatch({ goalAudioStop: Date.now() })
  }

  const previewGoalAudio = source => {
    updateMatch({
      previewAudioTrigger: Date.now(),
      previewAudioSource: source
    })
  }

  const toggleTimer = () => {
    const now = Date.now()
    let updates = {}

    if (data.timer.isRunning) {
      const elapsed = Math.floor((now - data.timer.startTime) / 1000)

      updates = { 'timer/isRunning': false, 'timer/baseTime': data.timer.baseTime + elapsed, 'timer/startTime': null }
    } else {
      updates = { 'timer/isRunning': true, 'timer/baseTime': data.timer.baseTime, 'timer/startTime': now }
    }

    updateMatch(updates)
  }

  const resetTimer = () => {
    updateMatch({ 'timer/isRunning': false, 'timer/baseTime': 0, 'timer/startTime': null })
  }

  const toggleOverlay = () => {
    const newState = !data.showOverlay

    updateMatch({
      showOverlay: newState,
      introId: newState ? Date.now() : data.introId // Trigger animasi saat unhide
    })
  }

  const triggerThirdTitle = (eventType, playerName, playerImg) => {
    updateMatch({
      'thirdTitle/isShowing': true,
      'thirdTitle/eventType': eventType,
      'thirdTitle/playerName': playerName,
      'thirdTitle/playerImg': playerImg,
      'thirdTitle/triggerId': Date.now()
    })
  }

  const hideThirdTitle = () => {
    updateMatch({
      'thirdTitle/isShowing': false
    })
  }

  // formatTime diimpor dari shared/scoreboardLogic — tidak perlu didefinisikan ulang di sini

  return {
    data,
    isLoaded,
    displayTime,
    formatTime,
    updateMatch,
    toggleTimer,
    resetTimer,
    triggerGoal,
    toggleOverlay,
    stopGoalAudio,
    previewGoalAudio,
    triggerThirdTitle,
    hideThirdTitle
  }
}
