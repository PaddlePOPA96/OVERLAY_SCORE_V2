'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'

import { motion, AnimatePresence } from 'framer-motion'

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

    isActive = pathname === '/dashboard' && (currentParam === targetParam || (!currentParam && targetParam === 'operator'))
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 text-sm transition-all duration-100 ${isActive
        ? 'bg-[#D9FF00] text-black font-black border-2 border-black shadow-[3px_3px_0px_#000] -translate-y-[1px]'
        : 'text-white hover:bg-[#D9FF00] hover:text-black font-bold border-2 border-transparent hover:border-black hover:shadow-[3px_3px_0px_#000] hover:-translate-y-[1px]'
        }`}
    >
      <i className={`${icon} text-lg`} />
      <span>{children}</span>
    </Link>
  )
}

const NavSection = ({ title, children }) => (
  <div className="mb-6">
    <h4 className="px-3 mb-2 text-xs font-black tracking-widest text-[#D9FF00] uppercase drop-shadow-[1px_1px_0px_#000]">{title}</h4>
    <div className="flex flex-col space-y-2">
      {children}
    </div>
  </div>
)

export default function SimpleSidebar({ isOpen, setIsOpen }) {
  const searchParams = useSearchParams()
  const activeSection = searchParams.get('s')

  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [userRole, setUserRole] = useState('user')
  const [rolePermissions, setRolePermissions] = useState({})
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
        setUserRole('user')
        setUsersCount(null)

        return
      }

      const userRef = doc(dbFirestore, 'users', currentUser.uid)

      roleUnsub = onSnapshot(userRef, snap => {
        const data = snap.exists() ? snap.data() : {}
        const role = data.role || 'user'
        const superAdmin = role === 'superadmin'

        setIsSuperAdmin(superAdmin)
        setUserRole(role)

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

    const permsRef = dbRef(db, 'ucl_data/settings/roles_permissions')

    const permsUnsub = onDbValue(permsRef, snapshot => {
      const val = snapshot.val()

      if (val) {
        setRolePermissions(val)
      }
    })

    return () => {
      authUnsub()
      roleUnsub()
      usersUnsub()
      leaguesUnsub()
      permsUnsub()
    }
  }, [])

  const hasPermission = (permissionKey) => {
    if (userRole === 'superadmin') return true
    if (!rolePermissions || Object.keys(rolePermissions).length === 0) return true
    const roleConfig = rolePermissions[userRole]

    if (!roleConfig) return true
    
return !!roleConfig[permissionKey]
  }

  const router = useRouter()
  const [isPreloading, setIsPreloading] = useState(false)

  const handleHomeClick = (e) => {
    e.preventDefault()
    setIsPreloading(true)
    setTimeout(() => {
      router.push('/')
    }, 1200)
  }

  return (
    <>
      {/* HOME PRELOADER TRANSITION */}
      <AnimatePresence>
        {isPreloading && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "100vh" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="fixed top-0 left-0 w-full bg-black z-[9999] overflow-hidden pointer-events-auto"
          >
            <motion.div
              initial={{ y: "80vh" }}
              animate={{ y: "4vh" }}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              className="absolute left-[5%] text-[#D9FF00] font-black text-[clamp(4rem,12vw,12rem)] leading-none uppercase tracking-tighter"
            >
              SCOREBOS
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 h-[100dvh] flex flex-col border-r-4 border-black bg-[#1D34F0] flex-shrink-0 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}>
        <div className="h-16 flex items-center justify-between px-6 border-b-4 border-black bg-[#D9FF00]">
          <a href="/" onClick={handleHomeClick} className="flex items-center gap-2 cursor-pointer">
            <Logo className="w-8 h-8 text-black" />
          </a>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-black hover:text-gray-800"
            aria-label="Close sidebar"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <NavSection title="Scoreboard Control">
            {hasPermission('operator') && (
              <NavItem currentParam={activeSection} href="/dashboard?s=operator" icon="ri-gamepad-line">Scoreboard Operator</NavItem>
            )}
            {hasPermission('countdown_timer') && (
              <NavItem currentParam={activeSection} href="/dashboard?s=countdown-timer" icon="ri-time-line">Countdown Timer</NavItem>
            )}
            {hasPermission('running_text') && (
              <NavItem currentParam={activeSection} href="/dashboard?s=running-text" icon="ri-file-text-line">Running Text (OBS)</NavItem>
            )}
            {hasPermission('tiktok_overlay') && (
              <NavItem currentParam={activeSection} href="/dashboard?s=tiktok-overlay" icon="ri-video-line">Tiktok & IG Overlay</NavItem>
            )}
            <NavItem currentParam={activeSection} href="/dashboard?s=formation" icon="ri-group-line">Team Formation</NavItem>
          </NavSection>

          <NavSection title="Sports Data">
            {activeLeagues.premier_league && hasPermission('premier_league') && (
              <NavItem currentParam={activeSection} href="/dashboard?s=premier-league" icon="ri-football-line">Premier League</NavItem>
            )}
            {activeLeagues.ucl && hasPermission('ucl') && (
              <NavItem currentParam={activeSection} href="/dashboard?s=ucl-table" icon="ri-trophy-line">UCL Standings</NavItem>
            )}
            {activeLeagues.world_cup && hasPermission('world_cup') && (
              <NavItem currentParam={activeSection} href="/dashboard?s=world-cup" icon="ri-global-line">World Cup 2026</NavItem>
            )}
            {hasPermission('streams_operator') && (
              <NavItem currentParam={activeSection} href="/dashboard?s=streams-operator" icon="ri-tv-line">Live Streams Config</NavItem>
            )}
            {hasPermission('streams') && (
              <NavItem currentParam={activeSection} href="/dashboard?s=streams" icon="ri-tv-line">Live Streams</NavItem>
            )}
          </NavSection>

          {isSuperAdmin && (
            <NavSection title="Admin">
              <NavItem currentParam={activeSection} href="/dashboard?s=create-user" icon="ri-user-add-line">Create New Account</NavItem>
              <NavItem currentParam={activeSection} href="/dashboard?s=role-permissions" icon="ri-key-2-line">Role Permissions</NavItem>
              <NavItem currentParam={activeSection} href="/dashboard?s=active-leagues" icon="ri-settings-4-line">Active Leagues Visibility</NavItem>
              <NavItem currentParam={activeSection} href="/dashboard?s=manage-users" icon="ri-shield-user-line">
                {`Registered Accounts${usersCount !== null ? ` (${usersCount})` : ''}`}
              </NavItem>
            </NavSection>
          )}
        </div>
      </aside>
    </>
  )
}
