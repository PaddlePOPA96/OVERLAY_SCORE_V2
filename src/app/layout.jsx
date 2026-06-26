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
  title: {
    default: 'SCOREBOS - Scoreboard Dashboard & Overlay',
    template: '%s | SCOREBOS'
  },
  description: 'Sistem control live sports scoreboard dan broadcast overlay untuk OBS.',
  keywords: ['scoreboard', 'overlay', 'OBS', 'live sports', 'sports dashboard', 'broadcast', 'score control', 'scorebos'],
  authors: [{ name: 'SCOREBOS' }],
  creator: 'SCOREBOS',
  publisher: 'SCOREBOS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'SCOREBOS - Live Sports Scoreboard & OBS Overlay',
    description: 'Sistem control live sports scoreboard dan broadcast overlay untuk OBS.',
    url: 'https://scorebos.com', // Replace with your actual domain
    siteName: 'SCOREBOS',
    images: [
      {
        url: '/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'SCOREBOS Logo',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SCOREBOS - Live Sports Scoreboard & OBS Overlay',
    description: 'Sistem control live sports scoreboard dan broadcast overlay untuk OBS.',
    images: ['/icon-512x512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon-512x512.png',
    apple: '/icon-512x512.png'
  },
  manifest: '/manifest.json' // If you have a manifest file
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
