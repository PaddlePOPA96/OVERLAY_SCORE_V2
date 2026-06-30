'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { motion, AnimatePresence } from 'framer-motion'

import { useAuth } from '@/shared/components/providers/AuthContext'


export default function DashboardAuthGuard({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  const isRedirecting = !loading && !user

  return (
    <>
      <AnimatePresence>
        {(loading || isRedirecting) && (
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
      {!loading && user ? children : null}
    </>
  )
}
