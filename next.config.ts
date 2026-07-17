import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  devIndicators: false,
  trailingSlash: true,
  reactStrictMode: false,
  images: { unoptimized: true },

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
      {
        source: "/api/embedding",
        destination: "http://localhost:8080/embedding.php",
      },
    ];
  },
};

export default nextConfig;
