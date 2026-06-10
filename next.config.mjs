/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASEPATH,
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Remove console.* calls in production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Tree-shake heavy packages — only import what is actually used
  experimental: {
    // Inline critical CSS and defer the rest, eliminating render-blocking CSS penalty
    optimizeCss: process.env.NODE_ENV === 'production',
    // Tell Next.js to only bundle the MUI / Firebase submodules actually imported
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/lab',
      '@emotion/react',
      '@emotion/styled',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
    ],
  },

  // Allow Next.js <Image> to optimise images from these external origins
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
    // Serve modern formats (WebP / AVIF) automatically
    formats: ['image/avif', 'image/webp'],
  },

  // Long-lived cache for Next.js static chunks (fingerprinted filenames are cache-safe)
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/public/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ]
  },
}

export default nextConfig

