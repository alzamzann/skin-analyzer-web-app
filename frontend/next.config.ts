import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiBaseUrl =
      process.env.DERMALYZER_API_BASE_URL ?? "http://127.0.0.1:8000";

    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "s3-ap-southeast-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "images.soco.id",
      },
      {
        protocol: "https",
        hostname: "incidecoder-content.storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "www.sociolla.com",
      },
    ],
  },
};

export default nextConfig;
