import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow thumbnailUrl images from picsum.photos (studies.json dataset)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:  "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
