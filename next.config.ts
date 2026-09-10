import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/lab", destination: "/neon", permanent: false },
      { source: "/about", destination: "/", permanent: false },
      { source: "/posts", destination: "https://benchanviolin.substack.com", permanent: false },
      { source: "/upwork", destination: "https://www.upwork.com/freelancers/~01a10f284f33009412", permanent: false },

      /* Retired Watch Your Step surfaces remain reversible and preserved on disk. */
      { source: "/watch-your-step", destination: "/", permanent: false },
      { source: "/watch-your-step/:path+", destination: "/", permanent: false },

      /* Retired Author Ship presentation surfaces remain preserved on disk. */
      { source: "/bridge", destination: "/", permanent: false },
      { source: "/standing-orders", destination: "/", permanent: false },
      { source: "/ships-log", destination: "/", permanent: false },
      { source: "/crew", destination: "/", permanent: false },
      { source: "/ben", destination: "/", permanent: false },
      { source: "/system", destination: "/", permanent: false },

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
