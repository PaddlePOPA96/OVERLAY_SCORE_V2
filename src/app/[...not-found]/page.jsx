// Component Imports
import Providers from '@/shared/components/Providers'
import NotFound from '@/shared/views/NotFound'

const NotFoundPage = () => {
  const direction = 'ltr'

  return (
    <Providers direction={direction}>
      <div className='flex flex-col min-h-[100dvh]'>
        <NotFound />
      </div>
    </Providers>
  )
}

export default NotFoundPage
