'use client'

import { useState, useEffect } from 'react'

const ModeDropdown = () => {
  const [mounted, setMounted] = useState(false)
  const [mode, setMode] = useState('light')

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    // Optional: read from localStorage if you want to persist theme
    const savedMode = localStorage.getItem('theme-mode') || 'light'
    setMode(savedMode)
    if (savedMode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  if (!mounted) return <div className="w-10 h-10" />

  const handleToggle = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark'
    setMode(newMode)
    localStorage.setItem('theme-mode', newMode)
    if (newMode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const getModeIcon = () => {
    return mode === 'dark' ? 'ri-moon-clear-line' : 'ri-sun-line'
  }

  return (
    <button
      title={mode + ' Mode'}
      onClick={handleToggle}
      className='w-10 h-10 flex items-center justify-center bg-white border-2 border-black hover:-translate-y-[2px] transition-transform hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]'
    >
      <i className={`${getModeIcon()} text-xl font-bold`} />
    </button>
  )
}

export default ModeDropdown
