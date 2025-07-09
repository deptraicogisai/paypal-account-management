import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // 👈 Bỏ qua lỗi TypeScript khi build
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/account',
        permanent: true, // or false if it's a temporary redirect
      },
    ];
  },
};

export default nextConfig;
