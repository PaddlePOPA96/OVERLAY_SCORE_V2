// Component Imports
import Providers from '@/shared/components/Providers'

const Layout = ({ children }) => {
  const direction = 'ltr'

  return (
    <Providers direction={direction}>
      <div className='flex flex-col min-h-[100dvh]'>
        {children}
      </div>
    </Providers>
  )
}

export default Layout
