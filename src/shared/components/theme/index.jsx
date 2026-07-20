'use client'

import { AuthProvider } from '@/shared/components/providers/AuthContext'

const ThemeProvider = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>
}

export default ThemeProvider
