'use client'

import { useRef, useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import { onAuthStateChanged, signOut } from 'firebase/auth'

import { auth } from '@/services/firebase/auth'
import MyProfileModal from './MyProfileModal'

const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const ADMIN_EMAIL = 'admin@admin.com'

const UserDropdown = () => {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const anchorRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const guide = localStorage.getItem('showNewUserGuide')
      if (guide === 'true') {
        setShowGuide(true)
      }
    }

    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [])

  const closeGuide = () => {
    setShowGuide(false)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('showNewUserGuide')
    }
  }

  const handleDropdownOpen = () => {
    setOpen(prev => !prev)
  }

  const handleDropdownClose = (event, url) => {
    if (url) {
      router.push(url)
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target)) {
      return
    }

    setOpen(false)
  }

  const handleLogout = async e => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dashboardPasscodeVerified')
      }
      await signOut(auth)
      handleDropdownClose(e, '/login')
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  const username = user?.email ? user.email.split('@')[0] : 'Operator'
  const userRole = user?.email === ADMIN_EMAIL ? 'Superuser' : 'Operator'

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        <Avatar
          ref={anchorRef}
          alt={username}
          onClick={handleDropdownOpen}
          className='cursor-pointer bs-[38px] is-[38px]'
        />
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-4 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className='shadow-lg'>
              <ClickAwayListener onClickAway={e => handleDropdownClose(e)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-4 gap-2' tabIndex={-1}>
                    <Avatar alt={username} />
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium text-capitalize' color='text.primary'>
                        {username}
                      </Typography>
                      <Typography variant='caption'>{userRole}</Typography>
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  <MenuItem className='gap-3' onClick={e => {
                    setProfileModalOpen(true)
                    setOpen(false)
                  }}>
                    <i className='ri-user-3-line' />
                    <Typography color='text.primary'>My Profile</Typography>
                  </MenuItem>
                  {user?.email === ADMIN_EMAIL && (
                    <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/admin/create-user')}>
                      <i className='ri-settings-4-line' />
                      <Typography color='text.primary'>Manage Users</Typography>
                    </MenuItem>
                  )}
                  <Divider className='mlb-1' />
                  <div className='flex items-center plb-2 pli-4'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='ri-logout-box-r-line' />}
                      onClick={handleLogout}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      Logout
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>

      <MyProfileModal 
        open={profileModalOpen} 
        onClose={() => setProfileModalOpen(false)} 
        user={user} 
        userRole={userRole}
      />

      {showGuide && (
        <div className="absolute top-[60px] right-[20px] z-[9999] w-[320px] bg-[#00ffff] border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] p-4 flex flex-col gap-3">
          {/* Arrow pointing UP */}
          <div className="absolute -top-[18px] right-[10px] w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[18px] border-b-black"></div>
          <div className="absolute -top-[12px] right-[10px] w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[18px] border-b-[#00ffff]"></div>
          
          <div className="flex justify-between items-start border-b-4 border-black pb-2">
            <h3 className="font-black uppercase tracking-wider text-black text-sm m-0 flex items-center gap-2">
              <i className="ri-error-warning-fill text-xl text-[#ff3366]"></i> Info Penting!
            </h3>
            <button onClick={closeGuide} className="bg-white border-2 border-black w-7 h-7 flex items-center justify-center hover:bg-[#ff3366] hover:text-white transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]">
              <i className="ri-close-line font-bold"></i>
            </button>
          </div>
          <p className="text-xs font-bold text-black leading-relaxed m-0 uppercase tracking-wide">
            PIN bawaan Anda adalah <span className="bg-[#ff3366] text-white px-2 py-1 mx-1 border-2 border-black text-sm">1234</span>
            <br/><br/>
            Klik ikon profil di atas, lalu pilih menu <span className="bg-[#ccff00] px-1 border-2 border-black underline decoration-2">My Profile</span> untuk menggantinya sekarang!
          </p>
        </div>
      )}
    </>
  )
}

export default UserDropdown
