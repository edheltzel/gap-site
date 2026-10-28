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

// Favicon on real tab backgrounds at the sizes browsers use. The mark has to
// read as a round shape on a dark tab (#202124) and a white tab (#ffffff).
{
  const lin = (v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const ratio = (a, b) => {
    const x = lum(a);
    const y = lum(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };
  const tabs = { dark: [0x20, 0x21, 0x24], white: [255, 255, 255] };
  const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  const render = async (size, bg) => {
    const context = await browser.newContext({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.setContent(
      `<style>html,body{margin:0;background:${bg || 'transparent'}}img{display:block;width:${size}px;height:${size}px}</style><img id="f" src="${base}/favicon.svg">`,
    );
    await page.waitForFunction(() => {
      const img = document.getElementById('f');
      return img.complete && img.naturalWidth > 0;
    });
    const png = PNG.sync.read(await page.screenshot({ omitBackground: !bg, clip: { x: 0, y: 0, width: size, height: size } }));
    await context.close();
    return png;
  };
  const px = (png, x, y) => {
    const i = (y * png.width + x) * 4;
    return [png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3]];
  };

  for (const size of [16, 32, 64]) {
    const mid = Math.floor(size / 2);
    const last = size - 1;

    // Corners stay transparent at every size.
    const clear = await render(size, '');
    const cornerAlpha = [px(clear, 0, 0), px(clear, last, 0), px(clear, 0, last), px(clear, last, last)].map((p) => p[3]);
    report(cornerAlpha.every((a) => a === 0), `favicon ${size}px corners alpha=${cornerAlpha.join(',')} (need 0)`);

    // Dark tab: the part of the mark that clears 3:1 against the tab fills the tile.
    const dark = await render(size, hex(tabs.dark));
    const r = size / 2;
    let inside = 0;
    let visible = 0;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (Math.hypot(x + 0.5 - r, y + 0.5 - r) > r) continue;
        inside++;
        const p = px(dark, x, y);
        if (ratio(p, tabs.dark) >= 3) visible++;
      }
    }
    const cover = visible / inside;
    report(cover >= 0.5, `favicon ${size}px on dark tab covers ${(cover * 100).toFixed(0)}% of the inscribed disc (need >= 50%)`);
    // A point inside the outer shape but outside the centre dot, on each side.
    const off = Math.round(size * 0.375);
    const samples = [px(dark, mid - off, mid), px(dark, mid + off - 1, mid), px(dark, mid, mid - off), px(dark, mid, mid + off - 1)];
    const low = Math.min(...samples.map((p) => ratio(p, tabs.dark)));
    report(low >= 3, `favicon ${size}px on dark tab shape vs #202124 contrast ${low.toFixed(2)} (need >= 3)`);

    // White tab: the outermost edge of the mark stands out from white.
    const white = await render(size, hex(tabs.white));
    // Outermost mark pixel (alpha >= 128) met walking in from each side.
    const clearPx = (x, y) => px(clear, x, y)[3] < 128;
    const walk = (x, y, dx, dy) => {
      while (clearPx(x, y)) {
        x += dx;
        y += dy;
      }
      return px(white, x, y);
    };
    const edges = [walk(0, mid, 1, 0), walk(last, mid, -1, 0), walk(mid, 0, 0, 1), walk(mid, last, 0, -1)];
    const lowEdge = Math.min(...edges.map((p) => ratio(p, tabs.white)));
    report(lowEdge >= 3, `favicon ${size}px on white tab outer edge vs #ffffff contrast ${lowEdge.toFixed(2)} (need >= 3)`);
  }
}

await browser.close();
server.close();
console.log(lines.join('\n'));
console.log(failed ? 'FAIL' : 'PASS');
if (failed) process.exit(1);
