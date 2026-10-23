import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The app lives at kidtivitylab.com/learn (served via a rewrite from the main site).
  basePath: "/learn",
  // Matches the main Astro site (trailingSlash: always) in production.
  // Off in dev: Next 16 dev serves an empty body for the basePath root when it is on.
  trailingSlash: process.env.NODE_ENV === "production",
  // learn-app sits inside the Astro repo, which has its own lockfile: pin the workspace root here
  turbopack: { root: path.join(__dirname) },
};

export default nextConfig;
