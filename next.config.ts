import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverExternalPackages: ["@prisma/client"],
  },
};

export default nextConfig;
