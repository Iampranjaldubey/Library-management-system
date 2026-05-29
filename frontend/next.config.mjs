/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // React
  reactStrictMode: true,

  // Compression & security
  compress: true,
  poweredByHeader: false,

  // Images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'Library Management System',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },

  // Turbopack config
  turbopack: {},
}

export default nextConfig