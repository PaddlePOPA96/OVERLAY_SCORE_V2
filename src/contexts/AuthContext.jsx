'use client'

import { createContext, useContext, useState, useEffect } from 'react'

import { onAuthStateChanged } from 'firebase/auth'

import { auth } from '@/lib/firebaseAuth'

const AuthContext = createContext({ user: null, loading: true, roomId: 'default' })

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    
return () => unsub()
  }, [])

  const roomId = user?.uid || 'default'

  return (
    <AuthContext.Provider value={{ user, loading, roomId }}>
      {children}
    </AuthContext.Provider>
  )
}
