import Providers from '@components/Providers'
import { DashboardProvider } from '@/components/providers/DashboardContext'
import SimpleDashboardLayout from '@/components/layout/SimpleDashboardLayout'

const Layout = async ({ children }) => {
  const direction = 'ltr'

  return (
    <Providers direction={direction}>
      <DashboardProvider>
        <SimpleDashboardLayout>{children}</SimpleDashboardLayout>
      </DashboardProvider>
    </Providers>
  )
}

export default Layout
