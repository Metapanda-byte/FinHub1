/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['financialmodelingprep.com', 'api.dicebear.com', 'images.unsplash.com', 'upload.wikimedia.org'],
  },
  experimental: {
    serverActions: true
  },
}

module.exports = nextConfig