// Layout Imports
import Providers from '@components/Providers'
import { DashboardProvider } from '@/components/providers/DashboardContext'
import DashboardLayoutContent from '@/components/DashboardLayoutContent'

const Layout = async ({ children }) => {
  // Vars
  const direction = 'ltr'

  return (
    <Providers direction={direction}>
      <DashboardProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </DashboardProvider>
    </Providers>
  )
}

export default Layout
