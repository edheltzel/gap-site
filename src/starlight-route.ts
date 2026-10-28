import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { siteName } from './site.js';

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  const entry = route.entry as { data?: { title?: string } };
  const page = entry.data?.title;
  const ogTitle = page ? `${page} | ${siteName}` : siteName;
  for (const tag of route.head) {
    if (tag.tag !== 'meta' || !tag.attrs) continue;
    if (tag.attrs.property === 'og:title' || tag.attrs.property === 'og:site_name') {
      tag.attrs.content = tag.attrs.property === 'og:site_name' ? siteName : ogTitle;
    }
  }
});
