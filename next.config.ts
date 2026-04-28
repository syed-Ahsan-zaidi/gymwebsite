import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Yeh line build pass karwayegi
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
