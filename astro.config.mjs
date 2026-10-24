// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://kidtivitylab.com',
  integrations: [
    sitemap({
      // /learn is the Next.js app in learn-app/, exported statically into dist/learn by the build
      customPages: [
        'https://kidtivitylab.com/learn/',
        'https://kidtivitylab.com/learn/how-it-works/',
      ],
      // Age × situation pages remain useful for navigation, but the current
      // library is too small to make each combination a distinct search page.
      filter: (page) => {
        const path = new URL(page).pathname;
        // Age × topic combinations: navigation-only until the library clears
        // the production gate (>=8 activities + unique intro + distinct set).
        if (/\/age\/[^/]+\/[^/]+\/$/.test(path)) return false;
        // Printables: noindex until the first real PDF pack exists.
        if (path === '/printables/') return false;
        return true;
      },
    }),
  ],
  trailingSlash: 'always',
  // The game (learn-app/) is not served by `astro dev`. Full local preview with the game:
  // `npm run build && npm run preview` (localhost:4321/learn/). Editing the game: `cd learn-app && npm run dev`.
  build: {
    format: 'directory',
  },
});
