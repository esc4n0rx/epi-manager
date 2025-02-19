/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Comente ou remova esta linha
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;

