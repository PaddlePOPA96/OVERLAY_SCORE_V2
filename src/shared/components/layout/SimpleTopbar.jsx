'use client'

import ModeDropdown from './ModeDropdown'
import UserDropdown from './UserDropdown'

export default function SimpleTopbar({ isOpen, setIsOpen }) {
  return (
    <header className="h-16 border-b-4 border-black flex items-center justify-between px-6 bg-[#1D34F0] flex-shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:text-black transition-all duration-100 flex items-center justify-center p-1 border-2 border-transparent hover:border-black hover:bg-[#D9FF00] hover:shadow-[3px_3px_0px_#000] hover:-translate-y-[1px]"
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
