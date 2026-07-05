'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ref, get } from 'firebase/database'

import { useAuth } from '@/shared/components/providers/AuthContext'
import PasscodeModal from '@/shared/components/PasscodeModal'
import { db } from '@/services/firebase/db'

export default function DashboardAuthGuard({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isPasscodeVerified, setIsPasscodeVerified] = useState(false)
  const [expectedPasscode, setExpectedPasscode] = useState(null)

  const [isCheckingPasscode, setIsCheckingPasscode] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  // Check localStorage on mount so we don't prompt within 24 hours
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dashboardPasscodeVerified')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (parsed.verified && parsed.expiry > new Date().getTime()) {
            setIsPasscodeVerified(true)
            setIsCheckingPasscode(false)
          } else {
            localStorage.removeItem('dashboardPasscodeVerified')
          }
        } catch (e) {
          localStorage.removeItem('dashboardPasscodeVerified')
        }
      }
    }
  }, [])

  // Fetch passcode from database when user is loaded
  useEffect(() => {
    if (user && !isPasscodeVerified) {
      get(ref(db, `users/${user.uid}/passcode`))
        .then((snap) => {
          if (snap.exists()) {
            const val = snap.val()
            if (val.length === 4) {
              import('@/shared/utils/hash').then(({ hashPasscode }) => {
                hashPasscode(val).then((hashed) => {
                  setExpectedPasscode(hashed)
                  setIsCheckingPasscode(false)
                })
              })
            } else {
              setExpectedPasscode(val)
              setIsCheckingPasscode(false)
            }
          } else {
            // Jika tidak ada di DB, kita set null agar tidak memunculkan modal (atau set ke nilai string kosong jika ingin di-lock)
            setExpectedPasscode(null)
            setIsCheckingPasscode(false)
          }
        })
        .catch((err) => {
          console.error('Failed to fetch user passcode', err)
          setExpectedPasscode(null)
          setIsCheckingPasscode(false)
        })
    } else if (user && isPasscodeVerified) {
      setIsCheckingPasscode(false)
    }
  }, [user, isPasscodeVerified])

  const isRedirecting = !loading && !user
  const isLoadingOrChecking = loading || isRedirecting || (user && isCheckingPasscode)

  const handlePasscodeSuccess = () => {
    const expiry = new Date().getTime() + 24 * 60 * 60 * 1000 // 24 hours
    localStorage.setItem('dashboardPasscodeVerified', JSON.stringify({ verified: true, expiry }))
    setIsPasscodeVerified(true)
  }

  const showPasscodeModal = !isLoadingOrChecking && user && !isPasscodeVerified && expectedPasscode !== null

  return (
    <>
      <AnimatePresence>
        {isLoadingOrChecking && (
          <motion.div
            key="dashboard-preloader"
            initial={{ opacity: 1 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed top-0 left-0 w-full h-screen bg-black z-[9999] overflow-hidden pointer-events-auto"
          >
            <div
              className="absolute left-[5%] text-[#D9FF00] font-black text-[clamp(4rem,12vw,12rem)] leading-none uppercase tracking-tighter animate-pulse"
              style={{ top: '4vh' }}
            >
              SCOREBOS
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!isLoadingOrChecking && user ? children : null}
      
      {showPasscodeModal && (
        <PasscodeModal
          isOpen={showPasscodeModal}
          onSuccess={handlePasscodeSuccess}
          expectedPasscode={expectedPasscode}
        />
      )}
    </>
  )
}
