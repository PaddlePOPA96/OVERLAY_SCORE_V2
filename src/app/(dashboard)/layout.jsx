import Providers from '@/shared/components/Providers'
import { DashboardProvider } from '@/shared/components/providers/DashboardContext'
import SimpleDashboardLayout from '@/shared/components/layout/SimpleDashboardLayout'

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
