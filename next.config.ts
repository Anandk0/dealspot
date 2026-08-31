import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://dealspot-backend.onrender.com";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "riley-arturo-unjudicable.ngrok-free.dev",
    "*.ngrok-free.dev",
    "*.ngrok-free.app",
    "*.ngrok.io",
    "*.devtunnels.ms",
    "10.182.211.233",
    "192.168.31.186",
    "localhost",
    "127.0.0.1",
  ],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
