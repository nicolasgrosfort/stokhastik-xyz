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
      {
        source: "/api/status",
        destination: "http://localhost:8080/status.php",
      },
    ];
  },
};

export default nextConfig;
