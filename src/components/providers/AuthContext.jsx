'use client'

import { createContext, useContext, useState, useEffect } from 'react'

import { onAuthStateChanged } from 'firebase/auth'

import { auth } from '@/lib/firebase/auth'

const AuthContext = createContext({ user: null, loading: true, roomId: 'default' })

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser)
      setLoading(false)
      
      if (currentUser) {
        import('@/lib/firebase/auth-service/service').then(({ syncUserToFirestore }) => {
          syncUserToFirestore(currentUser).catch(console.error)
        })
      }
    })

    return () => unsub()
  }, [])

  const roomId = user?.uid || 'default'

  return <AuthContext.Provider value={{ user, loading, roomId }}>{children}</AuthContext.Provider>
}
