import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@prisma/client"],
  // transpilePackages wali line ko bilkul hata dein
};

export default nextConfig;
