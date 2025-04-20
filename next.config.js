/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    domains: ['images.pexels.com'],
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig;