// Component Imports
import Providers from '@components/Providers'
import NotFound from '@views/NotFound'

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
