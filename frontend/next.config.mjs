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

  // Same-origin API proxy (BFF pattern).
  // The browser only ever talks to this Next.js origin at /api/*, and Next
  // forwards those calls to the Spring backend server-side. This is what lets
  // the refresh token live in a first-party HttpOnly cookie (SameSite=Lax works
  // because it's no longer a cross-site request). Set the upstream via
  // BACKEND_API_URL (preferred) or NEXT_PUBLIC_API_URL; defaults to local dev.
  async rewrites() {
    const backend =
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:8080'
    return [
      { source: '/api/:path*', destination: `${backend}/api/:path*` },
    ]
  },

  // Turbopack config
  turbopack: {},
}

export default nextConfig