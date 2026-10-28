import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import { siteDescription, siteName } from './src/site.js';

/** Public origin. Override with SITE_URL. The subdomain serves the site at /, so there is no `base`. */
const site = process.env.SITE_URL || 'https://gap.edheltzel.codes';

export default defineConfig({
  site,
  output: 'static',
  integrations: [
    starlight({
      title: siteName,
      description: siteDescription,
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/edheltzel/GAP' }],
      customCss: ['./src/styles/tokens.css', './src/styles/base.css'],
      components: {
        ThemeProvider: './src/components/ThemeProvider.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
      },
      routeMiddleware: './src/starlight-route.ts',
      sidebar: [{ label: 'Docs', items: [{ autogenerate: { directory: 'docs' } }] }],
    }),
    sitemap(),
  ],
});
