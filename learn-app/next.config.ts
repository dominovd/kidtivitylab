import path from "node:path";
import type { NextConfig } from "next";

const prod = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Static export: the root build copies `out/` into the Astro site's dist/learn,
  // so the game is served by the same Vercel project at kidtivitylab.com/learn/.
  output: prod ? "export" : undefined,
  basePath: "/learn",
  // Matches the main Astro site (trailingSlash: always) in production.
  // Off in dev: Next 16 dev serves an empty body for the basePath root when it is on.
  trailingSlash: prod,
  // Dev-only pages (app/debug/page.dev.tsx) are left out of the public build.
  pageExtensions: prod ? ["tsx", "ts"] : ["dev.tsx", "tsx", "ts"],
  images: { unoptimized: true },
  // learn-app sits inside the Astro repo, which has its own lockfile: pin the workspace root here
  turbopack: { root: path.join(__dirname) },
};

export default nextConfig;
