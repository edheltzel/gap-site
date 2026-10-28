// Logo shape check. The GAP mark is a circle, like the hero globe.
// In dark and light themes, on the landing page and a docs page, the header
// mark (.word i / .site-word i) must have equal width and height and a border
// radius of at least half its size. public/favicon.svg must contain no <rect>
// and at least one <circle>, and rendered in Chrome with no page background
// its four corners must be transparent while the centre and the middle of each
// edge are painted, so the outer shape is a circle.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';

const root = path.resolve('dist');
const chrome = process.env.CHROME_PATH || '/usr/bin/google-chrome';

function serve(dir) {
  return http.createServer((req, res) => {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    let file = path.join(dir, url);
    if (url.endsWith('/')) file = path.join(file, 'index.html');
    else if (!path.extname(file)) {
      if (fs.existsSync(file + '.html')) file += '.html';
      else if (fs.existsSync(path.join(file, 'index.html'))) file = path.join(file, 'index.html');
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end('not found');
        return;
      }
      const types = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.svg': 'image/svg+xml',
        '.woff2': 'font/woff2',
        '.xml': 'application/xml',
      };
      res.setHeader('content-type', types[path.extname(file)] || 'application/octet-stream');
      res.end(data);
    });
  });
}

const pages = [
  { path: '/', selector: '.word i' },
  { path: '/docs/', selector: '.site-word i' },
];

const server = serve(root);
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  executablePath: chrome,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

let failed = false;
const lines = [];
const report = (ok, text) => {
  if (!ok) failed = true;
  lines.push(`${ok ? 'ok  ' : 'FAIL'} ${text}`);
};

// Header mark, both themes, both page types.
for (const theme of ['dark', 'light']) {
  for (const item of pages) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
      colorScheme: theme,
    });
    const page = await context.newPage();
    await page.addInitScript((value) => localStorage.setItem('gap-theme', value), theme);
    await page.goto(base + item.path, { waitUntil: 'load' });
    const mark = page.locator(item.selector).first();
    const label = `${item.path} ${theme} ${item.selector}`;
    if ((await mark.count()) === 0) {
      report(false, `${label} not found`);
      await context.close();
      continue;
    }
    const got = await mark.evaluate((el) => {
      const cs = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      return {
        theme: document.documentElement.dataset.theme || '',
        radius: cs.borderTopLeftRadius,
        radii: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius],
        w: box.width,
        h: box.height,
      };
    });
    const half = Math.min(got.w, got.h) / 2;
    const toPx = (value) => (value.endsWith('%') ? (parseFloat(value) / 100) * Math.min(got.w, got.h) : parseFloat(value));
    const round = got.radii.every((value) => toPx(value) >= half - 0.01);
    const square = got.w > 0 && Math.abs(got.w - got.h) < 0.01;
    report(
      round && square && got.theme === theme,
      `${label} theme=${got.theme} size=${got.w}x${got.h} radius=${got.radius} (need >= ${half}px)`,
    );
    await context.close();
  }
}

// Favicon source.
const svg = fs.readFileSync('public/favicon.svg', 'utf8');
const rects = (svg.match(/<rect\b/g) || []).length;
const circles = (svg.match(/<circle\b/g) || []).length;
report(rects === 0, `favicon.svg has ${rects} <rect>`);
report(circles >= 1, `favicon.svg has ${circles} <circle>`);

// Favicon rendered with no page background.
{
  const size = 64;
  const context = await browser.newContext({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}img{display:block;width:${size}px;height:${size}px}</style><img id="f" src="${base}/favicon.svg">`,
  );
  await page.waitForFunction(() => {
    const img = document.getElementById('f');
    return img.complete && img.naturalWidth > 0;
  });
  const png = PNG.sync.read(await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } }));
  const alpha = (x, y) => png.data[(y * png.width + x) * 4 + 3];
  const last = size - 1;
  const corners = [
    ['top-left', 0, 0],
    ['top-right', last, 0],
    ['bottom-left', 0, last],
    ['bottom-right', last, last],
  ];
  for (const [name, x, y] of corners) {
    report(alpha(x, y) === 0, `favicon corner ${name} alpha=${alpha(x, y)} (need 0)`);
  }
  const solid = [
    ['centre', size / 2, size / 2],
    ['top edge', size / 2, 1],
    ['bottom edge', size / 2, last - 1],
    ['left edge', 1, size / 2],
    ['right edge', last - 1, size / 2],
  ];
  for (const [name, x, y] of solid) {
    report(alpha(x, y) === 255, `favicon ${name} alpha=${alpha(x, y)} (need 255)`);
  }
  await context.close();
}

await browser.close();
server.close();
console.log(lines.join('\n'));
console.log(failed ? 'FAIL' : 'PASS');
if (failed) process.exit(1);
