'use client'

import ModeDropdown from './ModeDropdown'
import UserDropdown from './UserDropdown'

export default function SimpleTopbar({ isOpen, setIsOpen }) {
  return (
    <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-zinc-950 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-zinc-400 hover:text-white transition-colors flex items-center justify-center p-1 rounded-md hover:bg-white/5"
          aria-label="Toggle sidebar"
        >
          <i className="ri-menu-line text-2xl"></i>
        </button>
      </div>
      <div className="flex items-center gap-2">
        <ModeDropdown />
        <UserDropdown />
      </div>
    </header>
  )
}
