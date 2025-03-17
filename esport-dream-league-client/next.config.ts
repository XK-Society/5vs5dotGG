/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'arweave.net',
      },
    ],
  },
  // Disable image optimization if you're experiencing issues
  experimental: {
    optimizeImages: false,
  },
}

module.exports = nextConfig