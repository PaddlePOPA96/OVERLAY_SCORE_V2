'use client'

import { createContext, useContext, useState } from 'react'

const DashboardContext = createContext({
  activeSection: 'operator',
  setActiveSection: () => {},
})

export function DashboardProvider({ children }) {
  const [activeSection, setActiveSection] = useState('operator')

  return (
    <DashboardContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  return useContext(DashboardContext)
}
