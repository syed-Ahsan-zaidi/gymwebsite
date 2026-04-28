/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TypeScript errors ko ignore karega
    ignoreBuildErrors: true,
  },
  eslint: {
    // Linting errors (jaise unused variables) ko ignore karega
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
