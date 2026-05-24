// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Treat all API routes as dynamic — prevents Next.js from trying to call
  // them during build when MongoDB is not available.
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
