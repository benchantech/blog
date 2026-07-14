import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/lab",
        destination: "/neon",
        permanent: false
      },
      {
        source: "/about",
        destination: "/system",
        permanent: false
      },
      {
        source: "/posts",
        destination: "https://benchanviolin.substack.com",
        permanent: false
      }
    ];
  }
};

export default nextConfig;
