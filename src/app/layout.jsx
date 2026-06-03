// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Font Imports
import { Poppins } from 'next/font/google'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins'
})

export const metadata = {
  title: 'SCOREBOS - Scoreboard Dashboard & Overlay',
  description: 'Live sports scoreboard control and OBS broadcast overlay system.'
}

const RootLayout = ({ children }) => {
  // Vars
  const direction = 'ltr'

  return (
    <html id='__next' lang='en' dir={direction} className={poppins.variable}>
      <body className={`${poppins.className} flex is-full min-bs-full flex-auto flex-col`}>{children}</body>
    </html>
  )
}

export default RootLayout
