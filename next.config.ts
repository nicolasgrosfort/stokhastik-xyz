import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  devIndicators: false,
  trailingSlash: true,
  reactStrictMode: false,

  async rewrites() {
    return [
      {
        source: "/api/buy",
        destination: "http://localhost:8080/buy.php",
      },
    ];
  },
};

export default nextConfig;
