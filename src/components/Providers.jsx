import ThemeProvider from '@components/theme'

const Providers = props => {
  const { children, direction } = props

  return (
    <ThemeProvider direction={direction}>
      {children}
    </ThemeProvider>
  )
}

export default Providers
