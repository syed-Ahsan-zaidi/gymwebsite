import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, 
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Yeh line Next.js ko batayegi ke build ke waqt DB connection ki fikar na kare
  staticPageGenerationTimeout: 1000, 
};

export default nextConfig;
