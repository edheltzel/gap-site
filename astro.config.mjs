import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/** Public origin. Override with SITE_URL. The subdomain serves the site at /, so there is no `base`. */
const site = process.env.SITE_URL || 'https://gap.edheltzel.codes';

export default defineConfig({
  site,
  output: 'static',
  integrations: [
    sitemap(),
  ],
});
