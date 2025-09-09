import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds (not recommended for production)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
