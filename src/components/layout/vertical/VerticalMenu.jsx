'use client'

// React & Firebase Imports
import { useEffect, useState } from 'react'

import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot, collection } from 'firebase/firestore'
import { ref as dbRef, onValue as onDbValue } from 'firebase/database'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

import { db } from '@/lib/firebaseDb'

import { auth } from '@/lib/firebaseAuth'
import { dbFirestore } from '@/lib/firebaseFirestore'

// Component Imports
import { Menu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }) => {
  const theme = useTheme()
  const { isBreakpointReached, transitionDuration } = useVerticalNav()
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [usersCount, setUsersCount] = useState(null)

  const [activeLeagues, setActiveLeagues] = useState({
    premier_league: true,
    ucl: true,
    world_cup: true
  })

  useEffect(() => {
    let roleUnsub = () => {}
    let usersUnsub = () => {}

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

          usersUnsub = onSnapshot(
            usersRef,
            usersSnap => {
              setUsersCount(usersSnap.size)
            },
            err => {
              console.error('Error fetching users count:', err)
            }
          )
        } else {
          setUsersCount(null)
          usersUnsub()
        }
      })
    })

    // Listen to leagues visibility settings in Realtime Database under client-allowed ucl_data node
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
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        menuItemStyles={menuItemStyles(theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(theme)}
      >
        <MenuSection label='Scoreboard Control'>
          <MenuItem href='/?s=operator' icon={<i className='ri-gamepad-line' />}>
            Scoreboard Operator
          </MenuItem>
          <MenuItem href='/?s=countdown-timer' icon={<i className='ri-time-line' />}>
            Countdown Timer
          </MenuItem>
          <MenuItem href='/?s=running-text' icon={<i className='ri-file-text-line' />}>
            Running Text (OBS)
          </MenuItem>
          <MenuItem href='/?s=tiktok-overlay' icon={<i className='ri-tiktok-line' />}>
            TikTok Video Overlay
          </MenuItem>
        </MenuSection>

        <MenuSection label='Sports Data'>
          {activeLeagues.premier_league && (
            <MenuItem href='/?s=premier-league' icon={<i className='ri-football-line' />}>
              Premier League
            </MenuItem>
          )}
          {activeLeagues.ucl && (
            <MenuItem href='/?s=ucl-table' icon={<i className='ri-trophy-line' />}>
              UCL Standings
            </MenuItem>
          )}
          {activeLeagues.world_cup && (
            <MenuItem href='/?s=world-cup' icon={<i className='ri-global-line' />}>
              World Cup 2026
            </MenuItem>
          )}
        </MenuSection>

        {isSuperAdmin && (
          <MenuSection label='Admin'>
            <MenuItem href='/?s=create-user' icon={<i className='ri-user-add-line' />}>
              Create New Account
            </MenuItem>
            <MenuItem href='/?s=active-leagues' icon={<i className='ri-settings-4-line' />}>
              Active Leagues Visibility
            </MenuItem>
            <MenuItem href='/?s=manage-users' icon={<i className='ri-shield-user-line' />}>
              {`Registered Accounts${usersCount !== null ? ` (${usersCount})` : ''}`}
            </MenuItem>
          </MenuSection>
        )}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
