'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut } from 'firebase/auth'

import { auth } from '@/services/firebase/auth'
import MyProfileModal from './MyProfileModal'
import { Dropdown, DropdownItem, DropdownDivider } from '@/components/ui/Dropdown'
import Button from '@/components/ui/Button'

const ADMIN_EMAIL = 'admin@admin.com'

const UserDropdown = () => {
  const [user, setUser] = useState(null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
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

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dashboardPasscodeVerified')
      }
      await signOut(auth)
      router.push('/login')
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  const username = user?.email ? user.email.split('@')[0] : 'Operator'
  const userRole = user?.email === ADMIN_EMAIL ? 'Superuser' : 'Operator'
  const initial = username.charAt(0).toUpperCase()

  const UserAvatar = (
    <div className="relative cursor-pointer hover:-translate-y-[2px] transition-transform">
      <div className="w-10 h-10 bg-[#ccff00] border-2 border-black flex items-center justify-center font-black text-lg">
        {initial}
      </div>
      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
    </div>
  )

  return (
    <>
      <Dropdown trigger={UserAvatar} align="right" className="w-56 mt-2">
        <div className="p-4 border-b-2 border-black bg-slate-50 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#ccff00] border-2 border-black flex items-center justify-center font-black text-lg shrink-0">
            {initial}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-sm truncate">{username}</span>
            <span className="text-xs font-bold text-slate-500">{userRole}</span>
          </div>
        </div>
        
        <DropdownItem onClick={() => setProfileModalOpen(true)}>
          <i className="ri-user-3-line text-lg w-5 text-center" />
          <span>My Profile</span>
        </DropdownItem>

        {user?.email === ADMIN_EMAIL && (
          <DropdownItem onClick={() => router.push('/admin/create-user')}>
            <i className="ri-settings-4-line text-lg w-5 text-center" />
            <span>Manage Users</span>
          </DropdownItem>
        )}

        <DropdownDivider />
        
        <div className="p-3">
          <Button fullWidth variant="danger" onClick={handleLogout} startIcon={<i className="ri-logout-box-r-line" />}>
            Logout
          </Button>
        </div>
      </Dropdown>

      {/* Note: If MyProfileModal still uses MUI, we will need to refactor it next. Assuming it's standard for now or will be refactored soon */}
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
