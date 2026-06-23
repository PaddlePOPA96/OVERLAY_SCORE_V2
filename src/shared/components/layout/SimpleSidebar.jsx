'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'

import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot, collection } from 'firebase/firestore'
import { ref as dbRef, onValue as onDbValue } from 'firebase/database'

import { auth } from '@/services/firebase/auth'
import { dbFirestore } from '@/services/firebase/firestore'
import { db } from '@/services/firebase/db'
import Logo from './Logo'

const NavItem = ({ href, icon, children, currentParam, isDirectPath }) => {
  const pathname = usePathname()

  let isActive = false
  if (isDirectPath) {
    isActive = pathname === href
  } else {
    // Extract the 's' parameter from the href
    const targetParam = href.split('s=')[1]
    isActive = pathname === '/' && (currentParam === targetParam || (!currentParam && targetParam === 'operator'))
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${isActive
        ? 'bg-violet-600 text-white font-semibold shadow-md'
        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
        }`}
    >
      <i className={`${icon} text-lg`} />
      <span>{children}</span>
    </Link>
  )
}

const NavSection = ({ title, children }) => (
  <div className="mb-6">
    <h4 className="px-3 mb-2 text-xs font-semibold tracking-wider text-zinc-500 uppercase">{title}</h4>
    <div className="flex flex-col space-y-1">
      {children}
    </div>
  </div>
)

export default function SimpleSidebar({ isOpen, setIsOpen }) {
  const searchParams = useSearchParams()
  const activeSection = searchParams.get('s')

  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [usersCount, setUsersCount] = useState(null)

  const [activeLeagues, setActiveLeagues] = useState({
    premier_league: true,
    ucl: true,
    world_cup: true
  })

  useEffect(() => {
    let roleUnsub = () => { }
    let usersUnsub = () => { }

    const authUnsub = onAuthStateChanged(auth, currentUser => {
      roleUnsub()
      usersUnsub()

      if (!currentUser) {
        setIsSuperAdmin(false)
        setUsersCount(null)

        return
      }

      const userRef = doc(dbFirestore, 'users', currentUser.uid)

      roleUnsub = onSnapshot(userRef, snap => {
        const role = snap.exists() ? snap.data().role : 'user'
        const superAdmin = role === 'superadmin'

        setIsSuperAdmin(superAdmin)

        if (superAdmin) {
          const usersRef = collection(dbFirestore, 'users')

          usersUnsub = onSnapshot(usersRef, usersSnap => {
            setUsersCount(usersSnap.size)
          })
        } else {
          setUsersCount(null)
          usersUnsub()
        }
      })
    })

    const leaguesRef = dbRef(db, 'ucl_data/settings/leagues')

    const leaguesUnsub = onDbValue(leaguesRef, snapshot => {
      const val = snapshot.val()

      if (val) {
        setActiveLeagues({
          premier_league: val.premier_league !== false,
          ucl: val.ucl !== false,
          world_cup: val.world_cup !== false
        })
      }
    })

    return () => {
      authUnsub()
      roleUnsub()
      usersUnsub()
      leaguesUnsub()
    }
  }, [])

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 h-[100dvh] flex flex-col border-r border-white/10 bg-zinc-950 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-8 h-8 text-white" />
            {/* <span className="font-bold text-lg text-white tracking-tight">SCOREBOS</span> */}
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-zinc-400 hover:text-white"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <NavSection title="Scoreboard Control">
            <NavItem currentParam={activeSection} href="/?s=operator" icon="ri-gamepad-line">Scoreboard Operator</NavItem>
            <NavItem currentParam={activeSection} href="/?s=countdown-timer" icon="ri-time-line">Countdown Timer</NavItem>
            <NavItem currentParam={activeSection} href="/?s=running-text" icon="ri-file-text-line">Running Text (OBS)</NavItem>
            <NavItem currentParam={activeSection} href="/?s=tiktok-overlay" icon="ri-video-line">Tiktok & IG Overlay</NavItem>
          </NavSection>

          <NavSection title="Sports Data">
            {activeLeagues.premier_league && (
              <NavItem currentParam={activeSection} href="/?s=premier-league" icon="ri-football-line">Premier League</NavItem>
            )}
            {activeLeagues.ucl && (
              <NavItem currentParam={activeSection} href="/?s=ucl-table" icon="ri-trophy-line">UCL Standings</NavItem>
            )}
            {activeLeagues.world_cup && (
              <NavItem currentParam={activeSection} href="/?s=world-cup" icon="ri-global-line">World Cup 2026</NavItem>
            )}
            <NavItem currentParam={activeSection} href="/?s=streams-operator" icon="ri-tv-line">Live Streams Config</NavItem>

            <NavItem currentParam={activeSection} href="/?s=streams" icon="ri-tv-line">Live Streams</NavItem>

          </NavSection>

          {isSuperAdmin && (
            <NavSection title="Admin">
              <NavItem currentParam={activeSection} href="/?s=create-user" icon="ri-user-add-line">Create New Account</NavItem>
              <NavItem currentParam={activeSection} href="/?s=active-leagues" icon="ri-settings-4-line">Active Leagues Visibility</NavItem>
              <NavItem currentParam={activeSection} href="/?s=manage-users" icon="ri-shield-user-line">
                {`Registered Accounts${usersCount !== null ? ` (${usersCount})` : ''}`}
              </NavItem>
            </NavSection>
          )}
        </div>
      </aside>
    </>
  )
}
