import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The app lives at kidtivitylab.com/learn (served via a rewrite from the main site).
  basePath: "/learn",
  // matches the main Astro site (trailingSlash: always)
  trailingSlash: true,
};

export default nextConfig;
