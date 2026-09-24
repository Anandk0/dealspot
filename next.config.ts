import type { NextConfig } from "next";

// Backend URL used by the Next.js server to proxy /api/* requests.
// Server-side only — always reachable via localhost during local dev.
const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8081";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "riley-arturo-unjudicable.ngrok-free.dev",
    "*.ngrok-free.dev",
    "*.ngrok-free.app",
    "*.ngrok.io",
    "*.devtunnels.ms",
    "*.trycloudflare.com",
    "10.182.211.233",
    "10.90.218.233",
    "192.168.31.186",
    "192.168.1.159",
    "192.168.*",
    "localhost",
    "127.0.0.1",
  ],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
