/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;