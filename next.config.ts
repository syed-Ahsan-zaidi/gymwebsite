import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, 
  },
  eslint: {
    ignoreDuringBuilds: true, // Yeh asali tareeqa hai linting skip karne ka
  },
};

export default nextConfig;
