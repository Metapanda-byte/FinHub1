/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  reactStrictMode: false, // Disabled for debugging - can enable later
  webpack: (config) => {
    // Re-enable webpack cache for better performance
    config.cache = {
      type: 'filesystem',
    };
    return config;
  }
}

module.exports = nextConfig