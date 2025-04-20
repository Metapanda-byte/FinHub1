/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  reactStrictMode: false,
  webpack: (config) => {
    // Disable webpack cache
    config.cache = false;
    return config;
  }
}

module.exports = nextConfig