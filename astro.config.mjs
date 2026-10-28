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
      head: [
        { tag: 'link', attrs: { rel: 'icon', href: '/favicon.ico', sizes: '16x16 32x32 48x48' } },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' } },
      ],
      customCss: ['./src/styles/tokens.css', './src/styles/base.css', './src/styles/docs.css'],
      components: {
        ThemeProvider: './src/components/ThemeProvider.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
        SiteTitle: './src/components/SiteTitle.astro',
        SocialIcons: './src/components/SocialIcons.astro',
      },
      routeMiddleware: './src/starlight-route.ts',
      sidebar: [
        {
          label: 'Start here',
          items: [
            { label: 'What GAP does', slug: 'docs' },
            { label: 'Install gap', slug: 'docs/install' },
            { label: 'Your first sync', slug: 'docs/first-sync' },
          ],
        },
        {
          label: 'Everyday use',
          items: [
            { label: 'Sync your setup', slug: 'docs/sync' },
            { label: 'Check status', slug: 'docs/status' },
            { label: 'Pin a skill version', slug: 'docs/pin' },
            { label: 'Repair drifted skills', slug: 'docs/repair' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Agents and where GAP writes', slug: 'docs/agents' },
            { label: 'gap.toml and gap.lock', slug: 'docs/config' },
            { label: 'Commands', slug: 'docs/commands' },
          ],
        },
      ],
    }),
    sitemap(),
  ],
});
