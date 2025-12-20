// next.config.js or next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/npm/:path*",
        destination: "https://img.clerk.com/npm/:path*",
      },
      {
        source: "/_clerk/ip",
        destination: "https://headers.clerk.com",
      },
      {
        source: "/clerk/:path*",
        destination: "https://api.clerk.com/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
