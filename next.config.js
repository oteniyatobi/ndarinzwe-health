/** @type {import('next').NextConfig} */

const SUPABASE_HOSTNAME = 'wtvssandwzcosutffizd.supabase.co'
const isProd = process.env.NODE_ENV === 'production'

// Security headers only applied in production.
// In development, Next.js requires 'unsafe-eval' for source maps (webpack devtool).
// Applying a strict CSP in dev blocks that, which prevents React from hydrating
// and causes forms to fall back to native GET submissions.
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=(), usb=(), geolocation=(self)' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      `connect-src 'self' https://${SUPABASE_HOSTNAME} wss://${SUPABASE_HOSTNAME}`,
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pexels.com' },
    ],
  },

  async headers() {
    if (!isProd) return []   // no headers in development
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
