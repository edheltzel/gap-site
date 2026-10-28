# GAP: Global Agent Policies

Landing page and docs for [GAP](https://github.com/edheltzel/GAP). One rules file, copied into the file each coding agent already reads.

## Local development

Node 22.

```bash
npm ci
npm run dev
```

`npm run check` runs `astro check`. `npm run build` writes the static site to `dist/`. `npm run contrast` checks the colour tokens. `npm run flash` checks theme flash against the built site (needs Chrome).

## Hosting

Cloudflare Pages. Build command `npm run build`, output directory `dist`. In the Pages build settings set `NODE_VERSION=22` and `SITE_URL=https://gap.edheltzel.codes`. No Wrangler config, and CI has no deploy step.

## Fonts

Geist and Geist Mono are self-hosted with `@fontsource-variable/geist` and `@fontsource-variable/geist-mono`. Both faces are under the SIL Open Font License 1.1. Nothing is fetched from a font CDN at runtime.
