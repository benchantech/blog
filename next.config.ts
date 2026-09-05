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
      },
      {
        source: "/upwork",
        destination: "https://www.upwork.com/freelancers/~01a10f284f33009412",
        permanent: false
      },
      {
        source: "/watch-your-step/:path+",
        destination: "/watch-your-step",
        permanent: false
      }
    ];
  }
};

export default nextConfig;
