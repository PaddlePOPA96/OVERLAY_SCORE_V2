'use client'

import { useEffect, useState } from 'react'

import { signOut, onAuthStateChanged } from 'firebase/auth'
import { ref, set, get, onValue } from 'firebase/database'

import { useScoreboard } from '@/shared/hooks/useScoreboard'
import { auth } from '@/services/firebase/auth'
import { useAuth } from '@/shared/components/providers/AuthContext'
import { db } from '@/services/firebase/db'
import OperatorA from './OperatorA'
import OperatorB from './OperatorB'
import OperatorC from './OperatorC'
import OperatorD from './OperatorD'
import OperatorE from './OperatorE'
import OperatorPildun from './OperatorPildun'
import OperatorPildun2 from './OperatorPildun2'

import LayoutA from './LayoutA'
import LayoutB from './LayoutB'
import LayoutC from './LayoutC'
import LayoutD from './LayoutD'
import LayoutE from './LayoutE'
import LayoutPildun from './LayoutPildun'
import LayoutPildun2 from './LayoutPildun2'

// --- Scoreboard Slot Card Component ---
function ScoreboardSlotCard({ slotRoomId, slotNum, onSelect, onDelete, theme }) {
  const { data, updateMatch } = useScoreboard(slotRoomId)
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const isLight = theme === 'light'

  useEffect(() => {
    if (data?.scoreboardName) {
      setNameInput(data.scoreboardName)
    } else {
      setNameInput(`Scoreboard Slot ${slotNum}`)
    }
  }, [data?.scoreboardName, slotNum])

  const handleSaveName = e => {
    e.stopPropagation()
    const trimmed = nameInput.trim()

    if (trimmed) {
      updateMatch({ scoreboardName: trimmed })
    }

    setIsEditingName(false)
  }

  const handleEditClick = e => {
    e.stopPropagation()
    setIsEditingName(true)
  }

  const handleDeleteClick = e => {
    e.stopPropagation()

    if (typeof window !== 'undefined') {
      const confirmDelete = window.confirm(
        `Apakah Anda yakin ingin menghapus "${displayName}"? Seluruh data di slot ini akan dihapus permanen.`
      )

      if (confirmDelete) {
        onDelete(slotRoomId, `slot${slotNum}`)
      }
    }
  }

  const renderPreview = () => {
    if (!data) return null

    // Build static version of the layout
    const previewData = {
      ...data,
      showOverlay: true,
      isPreview: true,
      goalTrigger: 0,
      introId: 0,
      timer: {
        isRunning: false,
        baseTime: data.timer?.baseTime || 0,
        startTime: null
      }
    }

    const staticTime = data.timer?.baseTime || 0

    const staticFormatTime = seconds => {
      const m = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0')

      const s = (seconds % 60).toString().padStart(2, '0')

      return `${m}:${s}`
    }

    if (data.layout === 'A') {
      return <LayoutA data={previewData} displayTime={staticTime} formatTime={staticFormatTime} />
    }

    if (data.layout === 'C') {
      return <LayoutC data={previewData} displayTime={staticTime} formatTime={staticFormatTime} />
    }

    if (data.layout === 'D') {
      return <LayoutD data={previewData} displayTime={staticTime} formatTime={staticFormatTime} />
    }

    if (data.layout === 'E') {
      return <LayoutE data={previewData} displayTime={staticTime} formatTime={staticFormatTime} />
    }

    if (data.layout === 'Pildun') {
      return <LayoutPildun data={previewData} displayTime={staticTime} formatTime={staticFormatTime} />
    }

    if (data.layout === 'Pildun2') {
      return <LayoutPildun2 data={previewData} displayTime={staticTime} formatTime={staticFormatTime} />
    }

    return <LayoutB data={previewData} displayTime={staticTime} formatTime={staticFormatTime} />
  }

  const displayName = data?.scoreboardName || `Scoreboard Slot ${slotNum}`

  return (
    <div
      onClick={() => onSelect(slotRoomId)}
      className={`relative h-60 w-full rounded-2xl border overflow-hidden flex flex-col justify-between group cursor-pointer hover:border-violet-500 hover:-translate-y-1.5 transition-all duration-300 shadow-xl ${
        isLight ? 'border-slate-200 bg-white/60 backdrop-blur-md' : 'border-slate-800 bg-slate-900/40 backdrop-blur-md'
      }`}
    >
      {/* Background Live Preview */}
      <div className='absolute inset-0 pointer-events-none opacity-30 group-hover:opacity-45 transition-all duration-300 select-none overflow-hidden flex items-center justify-center bg-slate-950'>
        {data ? (
          <div className='transform scale-[0.2] origin-center flex items-center justify-center w-[500%] h-[500%] shrink-0'>
            {renderPreview()}
          </div>
        ) : (
          <div className='text-slate-700 text-xs animate-pulse uppercase tracking-wider font-semibold'>
            Loading preview...
          </div>
        )}
      </div>

      {/* Dark Overlay gradient to ensure text readability */}
      <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20 z-10 pointer-events-none' />

      {/* Card Top: Slot Number and Rename controls */}
      <div className='relative z-20 p-4 flex items-center justify-between w-full'>
        <span className='px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-violet-500/15 border border-violet-500/30 text-violet-400'>
          Slot {slotNum}
        </span>

        {/* Rename & Delete buttons */}
        <div className='flex items-center gap-1'>
          <button
            onClick={handleEditClick}
            className='p-1.5 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-white hover:bg-slate-800/80'
            title='Rename Scoreboard'
          >
            <i className='ri-edit-2-line text-sm' />
          </button>
          <button
            onClick={handleDeleteClick}
            className='p-1.5 rounded-lg transition-colors cursor-pointer text-red-400 hover:text-red-650 hover:bg-red-500/10'
            title='Hapus Scoreboard'
          >
            <i className='ri-delete-bin-line text-sm' />
          </button>
        </div>
      </div>

      {/* Card Bottom: Scoreboard Info and Action */}
      <div className='relative z-20 p-4 w-full mt-auto flex flex-col gap-2'>
        {isEditingName ? (
          <div className='flex items-center gap-2 w-full' onClick={e => e.stopPropagation()}>
            <input
              type='text'
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              className='bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-violet-500 w-full'
              placeholder='Enter scoreboard name'
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleSaveName(e)
                if (e.key === 'Escape') setIsEditingName(false)
              }}
            />
            <button
              onClick={handleSaveName}
              className='p-1 px-2 bg-violet-600 hover:bg-violet-700 text-white rounded text-[10px] font-bold cursor-pointer'
            >
              Save
            </button>
          </div>
        ) : (
          <p
            className={`text-base font-bold line-clamp-1 transition-colors ${
              isLight ? 'text-slate-100 group-hover:text-violet-300' : 'text-white group-hover:text-violet-300'
            }`}
          >
            {displayName}
          </p>
        )}

        <div className='flex items-center justify-between text-[11px] text-slate-400 mt-1'>
          <span>Layout: {data?.layout || 'B'}</span>
          <span className='text-violet-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold'>
            Buka Operator <i className='ri-arrow-right-line' />
          </span>
        </div>
      </div>
    </div>
  )
}

// --- Scoreboard Slot Selector Component ---
function ScoreboardSlotSelector({ userId, onSelect, theme }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const isLight = theme === 'light'

  useEffect(() => {
    if (!userId) return

    const slotsRef = ref(db, `users/${userId}/slots`)

    const unsubscribe = onValue(slotsRef, snapshot => {
      if (snapshot.exists()) {
        const val = snapshot.val()
        const list = Object.keys(val).map(key => val[key])

        list.sort((a, b) => a.num - b.num)
        setSlots(list)
      } else {
        const defaultSlots = [{ id: 'slot1', num: 1 }]

        set(ref(db, `users/${userId}/slots/slot1`), { id: 'slot1', num: 1 })
        setSlots(defaultSlots)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  const handleSelectSlot = async slotRoomId => {
    try {
      const slotRef = ref(db, `match_live/${slotRoomId}`)
      const mainRef = ref(db, `match_live/${userId}`)
      const snap = await get(slotRef)

      if (snap.exists()) {
        await set(mainRef, snap.val())
      } else {
        const defaultData = {
          layout: 'B',
          showOverlay: true,
          homeName: 'MAN',
          awayName: 'WHU',
          homeScore: 0,
          awayScore: 0,
          homeLogo: '/logo/England%20-%20Premier%20League/Liverpool%20FC.png',
          awayLogo: '/logo/England%20-%20Premier%20League/Manchester%20City.png',
          homeColor: '#a40606',
          awayColor: '#a40606',
          homeBg: '#111111',
          awayBg: '#111111',
          period: 1,
          timer: { isRunning: false, baseTime: 0, startTime: null },
          goalTrigger: 0,
          seriesType: 'none',
          homeSeriesScore: 0,
          awaySeriesScore: 0,
          scoreboardName: `Scoreboard Slot ${slotRoomId.split('slot')[1] || ''}`
        }

        await set(mainRef, defaultData)
        await set(slotRef, defaultData)
      }

      onSelect(slotRoomId)
    } catch (err) {
      console.error('Failed to activate slot:', err)
      onSelect(slotRoomId)
    }
  }

  const handleDeleteSlot = async (slotRoomId, slotId) => {
    try {
      await set(ref(db, `match_live/${slotRoomId}`), null)
      await set(ref(db, `users/${userId}/slots/${slotId}`), null)
    } catch (e) {
      console.error('Failed to delete slot:', e)
    }
  }

  const handleAddSlot = () => {
    if (slots.length >= 3) return

    // Find the lowest available number between 1 and 3
    const existingNums = slots.map(s => s.num)
    let nextNum = 1

    for (let i = 1; i <= 3; i++) {
      if (!existingNums.includes(i)) {
        nextNum = i
        break
      }
    }

    const nextSlotId = `slot${nextNum}`

    set(ref(db, `users/${userId}/slots/${nextSlotId}`), {
      id: nextSlotId,
      num: nextNum
    })
  }

  if (loading) {
    return <div className='text-slate-400 text-sm p-6'>Memuat slot...</div>
  }

  return (
    <div className='w-full flex flex-col gap-6 py-6 max-w-6xl mx-auto'>
      <div className='flex flex-col gap-1 text-left'>
        <h2 className={`text-2xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <i className='ri-gamepad-line text-violet-500' />
          Pilih Scoreboard Operator
        </h2>
        <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Silakan pilih salah satu slot untuk mulai mengoperasikan live scoreboard, atau tambahkan slot baru (maksimal
          3).
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-2'>
        {slots.map(slot => {
          const slotRoomId = `${userId}_${slot.id}`

          return (
            <ScoreboardSlotCard
              key={slot.id}
              slotRoomId={slotRoomId}
              slotNum={slot.num}
              onSelect={handleSelectSlot}
              onDelete={handleDeleteSlot}
              theme={theme}
            />
          )
        })}

        {slots.length < 3 && (
          <div
            onClick={handleAddSlot}
            className={`h-60 w-full rounded-2xl border border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 ${
              isLight
                ? 'border-slate-300 hover:border-violet-500 hover:bg-slate-50 text-slate-600'
                : 'border-slate-800 hover:border-violet-500/50 hover:bg-slate-900/10 text-slate-400'
            }`}
          >
            <div className='h-12 w-12 rounded-full border border-current flex items-center justify-center text-xl font-bold'>
              +
            </div>
            <span className='text-xs font-semibold tracking-wider uppercase'>Tambah Scoreboard Baru</span>
          </div>
        )}
      </div>
    </div>
  )
}

// --- Active Operator Panel Wrapper ---
function ActiveOperatorPanel({ roomId, theme, toggleTheme, onLogout, onBackToSlots }) {
  const {
    data,
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
  } = useScoreboard(roomId || 'default')

  const actions = {
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

  if (!data) {
    return <div className='text-white p-10'>Loading Scoreboard System...</div>
  }

  const renderOperator = () => {
    const commonProps = {
      data,
      actions,
      displayTime,
      formatTime,
      roomId,
      onLogout,
      theme,
      toggleTheme
    }

    if (data.layout === 'A') {
      return <OperatorA {...commonProps} />
    }

    if (data.layout === 'C') {
      return <OperatorC {...commonProps} />
    }

    if (data.layout === 'D') {
      return <OperatorD {...commonProps} />
    }

    if (data.layout === 'E') {
      return <OperatorE {...commonProps} />
    }

    if (data.layout === 'Pildun') {
      return <OperatorPildun {...commonProps} />
    }

    if (data.layout === 'Pildun2') {
      return <OperatorPildun2 {...commonProps} />
    }

    return <OperatorB {...commonProps} />
  }

  const slotName = data.scoreboardName || `Slot ${roomId.split('_slot')[1] || 'Active'}`

  return (
    <div className='w-full flex flex-col gap-4'>
      {onBackToSlots && (
        <div className='flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg'>
          <div className='flex items-center gap-3'>
            <span className='flex h-3 w-3 relative'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-3 w-3 bg-emerald-500'></span>
            </span>
            <div>
              <p className='text-[10px] text-slate-400 font-bold uppercase tracking-wider'>Active Scoreboard</p>
              <h3 className='text-sm font-bold text-white leading-tight'>{slotName}</h3>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onBackToSlots}
              className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-850 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-all shadow-sm cursor-pointer'
            >
              <i className='ri-arrow-left-line text-sm' />
              Ganti
            </button>
          </div>
        </div>
      )}

      {renderOperator()}
    </div>
  )
}

// --- Main Operator Root Component ---
export default function OperatorRoot({ initialRoomId, requireAuth = true, theme: parentTheme }) {
  const { user } = useAuth()
  const [isAuthReady, setIsAuthReady] = useState(!requireAuth)
  const [theme, setTheme] = useState(parentTheme || 'dark')
  const [activeRoomId, setActiveRoomId] = useState(null)

  useEffect(() => {
    if (!requireAuth) return undefined

    const unsub = onAuthStateChanged(auth, u => {
      if (!u) {
        if (typeof window !== 'undefined') {
          window.location.replace('/login')
        }
      } else {
        setIsAuthReady(true)
      }
    })

    return () => unsub()
  }, [requireAuth])

  // Synchronize state when parent theme prop changes
  useEffect(() => {
    if (parentTheme) {
      setTheme(parentTheme)
    }
  }, [parentTheme])

  // Load theme from local storage only if no parent theme prop is provided
  useEffect(() => {
    if (!parentTheme && typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('scoreboard-theme')

      if (stored) {
        setTheme(stored)
      }
    }
  }, [parentTheme])

  // Initialize activeRoomId based on whether it is a custom query room or user's default room
  useEffect(() => {
    if (isAuthReady && user?.uid) {
      const isCustomRoom = initialRoomId && initialRoomId !== user.uid

      if (isCustomRoom) {
        setActiveRoomId(initialRoomId)
      } else {
        // Only reset to null if we haven't selected a slot yet
        setActiveRoomId(prev => {
          if (prev && prev.startsWith(`${user.uid}_slot`)) {
            return prev
          }

          return null
        })
      }
    }
  }, [initialRoomId, isAuthReady, user?.uid])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'

    setTheme(nextTheme)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('scoreboard-theme', nextTheme)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } finally {
      if (typeof window !== 'undefined') {
        window.location.replace('/login')
      }
    }
  }

  if (!isAuthReady) {
    return <div className='text-white p-10'>Memeriksa sesi login...</div>
  }

  const currentUserId = user?.uid || auth.currentUser?.uid

  if (!activeRoomId) {
    if (!currentUserId) {
      return <div className='text-white p-10'>Memuat sesi user...</div>
    }

    return <ScoreboardSlotSelector userId={currentUserId} onSelect={setActiveRoomId} theme={theme} />
  }

  const isCustomRoom = activeRoomId !== currentUserId && !activeRoomId.startsWith(`${currentUserId}_slot`)

  return (
    <ActiveOperatorPanel
      roomId={activeRoomId}
      theme={theme}
      toggleTheme={toggleTheme}
      onLogout={handleLogout}
      onBackToSlots={isCustomRoom ? null : () => setActiveRoomId(null)}
    />
  )
}
