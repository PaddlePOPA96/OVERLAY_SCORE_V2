// Third-party Imports
import { Inter } from 'next/font/google'
import 'react-perfect-scrollbar/dist/css/styles.css'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

// Component Imports
import SecurityGuard from '@/shared/components/SecurityGuard'

export const metadata = {
  title: 'SCOREBOS - Scoreboard Dashboard & Overlay',
  description: 'Live sports scoreboard control and OBS broadcast overlay system.',
  icons: {
    icon: '/icon-512x512.png',
    apple: '/icon-512x512.png'
  }
}

export const dynamic = 'force-dynamic';

export const viewport = {
  width: 'device-width',
  initialScale: 1
}

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap'
})

const RootLayout = ({ children }) => {
  // Vars
  const direction = 'ltr'

  return (
    <html id='__next' lang='en' dir={direction}>
      <head>
        {/* Preconnect to Firebase origins – saves ~560ms on first auth request (LCP) */}
        <link rel='preconnect' href='https://identitytoolkit.googleapis.com' />
        <link rel='preconnect' href='https://firestore.googleapis.com' />
        <link rel='preconnect' href='https://securetoken.googleapis.com' />
      </head>
      <body className={`${inter.className} flex is-full min-bs-full flex-auto flex-col`}>
        <SecurityGuard />
        {children}
      </body>
    </html>
  )
}

export default RootLayout
