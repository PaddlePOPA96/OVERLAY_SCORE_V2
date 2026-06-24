// Third-party Imports
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
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
}

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
        {/* Preconnect to Google Fonts CDN used by Next.js font optimisation */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
        {/* Standard Font Fetching to bypass Next.js build timeouts */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="flex is-full min-bs-full flex-auto flex-col" style={{ fontFamily: '"Inter", sans-serif' }}>
        <SecurityGuard />
        {children}
      </body>
    </html>
  )
}

export default RootLayout
