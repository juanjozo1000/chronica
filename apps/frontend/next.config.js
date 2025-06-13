/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Enable if you want to use the app directory in the future
    // appDir: true,
  },
  // API routes configuration
  async rewrites() {
    return [
      // You can add API rewrites here if needed
    ]
  },
}

module.exports = nextConfig 