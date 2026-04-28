import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, 
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ye line Turbopack aur Prisma ke conflict ko kam karti hai
  output: 'standalone', 
};

export default nextConfig;
