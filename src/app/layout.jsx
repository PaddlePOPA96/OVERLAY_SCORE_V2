// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Font Imports
import { Inter } from 'next/font/google'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

// Component Imports
import SecurityGuard from '@/shared/components/SecurityGuard'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata = {
  title: 'SCOREBOS - Scoreboard Dashboard & Overlay',
  description: 'Live sports scoreboard control and OBS broadcast overlay system.'
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
}

const RootLayout = ({ children }) => {
  // Vars
  const direction = 'ltr'

  return (
    <html id='__next' lang='en' dir={direction} className={inter.variable}>
      <head>
        {/* Preconnect to Firebase origins – saves ~560ms on first auth request (LCP) */}
        <link rel='preconnect' href='https://identitytoolkit.googleapis.com' />
        <link rel='preconnect' href='https://firestore.googleapis.com' />
        <link rel='preconnect' href='https://securetoken.googleapis.com' />
        {/* Preconnect to Google Fonts CDN used by Next.js font optimisation */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
      </head>
      <body className={`${inter.className} flex is-full min-bs-full flex-auto flex-col`}>
        <SecurityGuard />
        {children}
      </body>
    </html>
  )
}

export default RootLayout
