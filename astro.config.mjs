// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://kidtivitylab.com',
  integrations: [
    sitemap({
      // Age × situation pages remain useful for navigation, but the current
      // library is too small to make each combination a distinct search page.
      filter: (page) => !/\/age\/[^/]+\/[^/]+\/$/.test(new URL(page).pathname),
    }),
  ],
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
