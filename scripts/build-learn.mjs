// Builds the Kidtivity Learn app (learn-app/, Next.js static export) and copies it
// into the Astro output, so one Vercel project serves the game at /learn/.
// Runs after `astro build` (see "build" in package.json).
import { execSync } from "node:child_process";
import { cpSync, existsSync, rmSync } from "node:fs";

const run = (cmd) => execSync(cmd, { cwd: "learn-app", stdio: "inherit", env: { ...process.env, NODE_ENV: "production" } });

if (!existsSync("dist")) throw new Error("dist/ not found: run astro build first");
run("npm ci --no-audit --no-fund --include=dev");
run("npm run build");
rmSync("dist/learn", { recursive: true, force: true });
cpSync("learn-app/out", "dist/learn", { recursive: true });
console.log("Kidtivity Learn copied to dist/learn");
