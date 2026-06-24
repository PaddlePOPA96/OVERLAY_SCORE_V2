'use client'

import { useState } from 'react'

import { usePathname } from 'next/navigation'

import DashboardAuthGuard from '@/shared/components/DashboardAuthGuard'

import SimpleSidebar from './SimpleSidebar'
import SimpleTopbar from './SimpleTopbar'

export default function SimpleDashboardLayout({ children }) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Public OBS graphic overlays shouldn't have layout templates or login guards
  const isOverlay = pathname.includes('/dashboard/operator/overlay') || pathname.includes('/dashboard/running-text')

  if (isOverlay) {
    return (
      <>
        {children}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            html, body, #__next, [data-mui-color-scheme], [data-mui-color-scheme="dark"], [data-mui-color-scheme="light"] {
              background: transparent !important;
              background-color: transparent !important;
            }
          `
          }}
        />
      </>
    )
  }

  return (
    <DashboardAuthGuard>
      <div className="flex h-[100dvh] w-full overflow-hidden bg-[#F5F4F0]">
        <SimpleSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="flex flex-col flex-1 min-w-0">
          <SimpleTopbar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar text-black font-medium">
            {children}
          </main>
        </div>
      </div>
    </DashboardAuthGuard>
  )
}
