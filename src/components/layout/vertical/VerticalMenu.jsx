'use client'

// React & Firebase Imports
import { useEffect, useState } from 'react'

import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

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

  useEffect(() => {
    let roleUnsub = () => { }

    const authUnsub = onAuthStateChanged(auth, (currentUser) => {
      roleUnsub()

      if (!currentUser) {
        setIsSuperAdmin(false)

        return
      }

      const userRef = doc(dbFirestore, 'users', currentUser.uid)

      roleUnsub = onSnapshot(userRef, (snap) => {
        const role = snap.exists() ? snap.data().role : 'user'

        setIsSuperAdmin(role === 'superadmin')
      })
    })

    return () => {
      authUnsub()
      roleUnsub()
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
        </MenuSection>

        <MenuSection label='Sports Data'>
          <MenuItem href='/?s=premier-league' icon={<i className='ri-football-line' />}>
            Premier League
          </MenuItem>
          <MenuItem href='/?s=ucl-table' icon={<i className='ri-trophy-line' />}>
            UCL Standings
          </MenuItem>
        </MenuSection>

        {isSuperAdmin && (
          <MenuSection label='Admin'>
            <MenuItem href='/?s=manage-users' icon={<i className='ri-shield-user-line' />}>
              Manage Users
            </MenuItem>
          </MenuSection>
        )}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
