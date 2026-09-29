import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/lab", destination: "/neon", permanent: false },
      { source: "/about", destination: "/", permanent: false },
      { source: "/posts", destination: "https://benchanviolin.substack.com", permanent: false },
      { source: "/upwork", destination: "https://www.upwork.com/freelancers/~01a10f284f33009412", permanent: false },

      /* Retired Watch Your Step surfaces are permanently retired; source remains preserved on disk. */
      { source: "/watch-your-step", destination: "/", permanent: true },
      { source: "/watch-your-step/:path+", destination: "/", permanent: true },

      /* Retired Author Ship presentation surfaces are permanently retired; source remains preserved on disk. */
      { source: "/bridge", destination: "/", permanent: true },
      { source: "/standing-orders", destination: "/", permanent: true },
      { source: "/ships-log", destination: "/", permanent: true },
      { source: "/crew", destination: "/", permanent: true },
      { source: "/ben", destination: "/", permanent: true },
      { source: "/system", destination: "/", permanent: true },

      /*
       * `/df` remains a stable Benchantech-controlled shortcut, but the former
       * Studio offer is discontinued. Until a future Developer Forward course
       * has a canonical destination, the shortcut resolves to the public
       * Developer Forward evidence hub rather than to an external checkout.
       */
      { source: "/df", destination: "/developer-forward", permanent: false }
    ];
  }
};

export default nextConfig;
