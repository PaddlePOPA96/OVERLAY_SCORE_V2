import { useEffect, useState } from 'react'

import { doc, onSnapshot } from 'firebase/firestore'

import { dbFirestore } from '@/lib/firebaseFirestore'

export function useUserRole(user) {
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setRole(null)
      setLoading(false)

      return
    }

    // Cek Firestore users/{uid} untuk mengambil role secara dinamis dari database
    const userRef = doc(dbFirestore, 'users', user.uid)

    const unsub = onSnapshot(
      userRef,
      docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data()

          setRole(data.role || 'user')
        } else {
          setRole('user') // Default jika doc belum ada
        }

        setLoading(false)
      },
      error => {
        console.error('Error reading user role from Firestore:', error)
        setRole('user')
        setLoading(false)
      }
    )

    return () => unsub()
  }, [user])

  const isAdmin = role === 'admin' || role === 'superadmin'
  const isSuperAdmin = role === 'superadmin'

  return { role, isAdmin, isSuperAdmin, loading }
}
