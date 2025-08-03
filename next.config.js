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
  },
  // Fix serverActions configuration
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "localhost:3001"]
    }
  }
}

module.exports = nextConfig