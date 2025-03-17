/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Add image domains configuration here
  images: {
    domains: [
      'via.placeholder.com',  // Allow placeholder.com images
      'arweave.net',          // Allow arweave.net images (just in case some are still referenced)
      'www.gravatar.com',     // Common avatar provider (optional)
    ],
    // You can also add other domains as needed
  },
  
  // Existing webpack configurations (if any)
  webpack: (config: any) => {
    // Existing webpack configurations
    return config;
  },
}

module.exports = nextConfig