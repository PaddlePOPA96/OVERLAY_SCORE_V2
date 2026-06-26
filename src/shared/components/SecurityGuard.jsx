'use client'

import { useEffect } from 'react'

export default function SecurityGuard() {
  useEffect(() => {
    // Hanya aktifkan proteksi di environment produksi
    if (process.env.NODE_ENV !== 'production') return

    // 1. Blokir Menu Klik Kanan (Context Menu)
    const handleContextMenu = (e) => {
      e.preventDefault()
      
return false
    }

    document.addEventListener('contextmenu', handleContextMenu)

    // 2. Blokir Tombol Shortcut Keyboard
    const handleKeyDown = (e) => {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault()
        
return false
      }

      // Check key character / code
      const key = e.key ? e.key.toLowerCase() : ''
      const code = e.keyCode

      // Cmd+Opt+I (macOS) / Ctrl+Shift+I (Windows)
      // Cmd+Opt+J (macOS) / Ctrl+Shift+J (Windows)
      // Cmd+Opt+C (macOS) / Ctrl+Shift+C (Windows)
      const isInspect = (e.ctrlKey || e.metaKey) && (
        (e.shiftKey && (key === 'i' || key === 'j' || key === 'c' || code === 73 || code === 74 || code === 67)) ||
        (e.altKey && (key === 'i' || key === 'j' || key === 'c' || code === 73 || code === 74 || code === 67))
      )

      // Ctrl+U (Windows) / Cmd+Opt+U (macOS) - View Source
      const isViewSource = (e.ctrlKey && (key === 'u' || code === 85)) || 
                           (e.metaKey && e.altKey && (key === 'u' || code === 85))

      // Ctrl+S (Save page)
      const isSavePage = (e.ctrlKey || e.metaKey) && (key === 's' || code === 83)

      if (isInspect || isViewSource || isSavePage) {
        e.preventDefault()
        
return false
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // 3. Deteksi DevTools dan Debugger Loop (Dihapus)

    // 4. Overwrite Console Logs (Fallback tambahan)
    const noop = () => {}
    
    // Simpan reference console original jika sewaktu-waktu dibutuhkan
    const originalConsole = {
      log: console.log,
      info: console.info,
      debug: console.debug,
      warn: console.warn
    }

    console.log = noop
    console.info = noop
    console.debug = noop
    console.warn = noop

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      
      // Kembalikan console ke semula saat unmount
      console.log = originalConsole.log
      console.info = originalConsole.info
      console.debug = originalConsole.debug
      console.warn = originalConsole.warn
    }
  }, [])

  return null
}
