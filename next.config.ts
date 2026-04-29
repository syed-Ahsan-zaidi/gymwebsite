import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // experimental ke bajaye direct bahar likhein
  serverExternalPackages: ["@prisma/client"],
  transpilePackages: ["@prisma/client"],
};

export default nextConfig;
