'use client'

import { useRef, useState, useEffect } from 'react'

import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import { useColorScheme } from '@mui/material/styles'

const ModeDropdown = () => {
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const anchorRef = useRef(null)
  
  const { mode, setMode } = useColorScheme()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !mode) return <div className="w-10 h-10" />

  const handleToggle = () => {
    setMode(mode === 'dark' ? 'light' : 'dark')
  }

  const getModeIcon = () => {
    return mode === 'dark' ? 'ri-moon-clear-line' : 'ri-sun-line'
  }

  return (
    <Tooltip
      title={mode + ' Mode'}
      onOpen={() => setTooltipOpen(true)}
      onClose={() => setTooltipOpen(false)}
      open={tooltipOpen}
      PopperProps={{ className: 'capitalize' }}
    >
      <IconButton ref={anchorRef} onClick={handleToggle} className='text-zinc-400 hover:text-white'>
        <i className={getModeIcon()} />
      </IconButton>
    </Tooltip>
  )
}

export default ModeDropdown
