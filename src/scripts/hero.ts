export {};

function mount() {
  const stageEl = document.getElementById('stage');
  const field = document.getElementById('field');
  if (!(stageEl instanceof HTMLElement) || !(field instanceof HTMLCanvasElement)) {
    throw new Error('hero stage missing');
  }
  const pen = field.getContext('2d');
  if (!pen) throw new Error('hero canvas missing');
  return { stageEl, field, pen };
}

const { stageEl, field, pen } = mount();

const root = document.documentElement;
const params = new URLSearchParams(location.search);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || params.get('still') === '1';
const freeze = params.has('t') ? Number(params.get('t')) : null;
const still = reduced || freeze !== null;
const settled = 99;
const resolveIn = 1.3;
const period = 7;
const ramp = ' .:-=+*#%@';
const cellW = 6;
const cellH = 10;
const fontSize = 10;

const bayer = (() => {
  let m = [[0]];
  for (let s = 1; s < 8; s *= 2) {
    const n: number[][] = [];
    for (let y = 0; y < 2 * s; y++) {
      n.push([]);
      for (let x = 0; x < 2 * s; x++) {
        const v = m[y % s][x % s] * 4;
        n[y][x] = v + [[0, 2], [3, 1]][Math.floor(y / s)][Math.floor(x / s)];
      }
    }
    m = n;
  }
  return m.map((row) => row.map((v) => (v + 0.5) / 64));
})();

function hash(n: number) {
  n |= 0;
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
function smooth(a: number, b: number, x: number) {
  x = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return x * x * (3 - 2 * x);
}
function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function channels(name: string) {
  return getComputedStyle(root).getPropertyValue(name).split(',').map(Number);
}

let light = false;
let accent = [0, 0, 0];
let accent2 = [0, 0, 0];
let hot = [255, 255, 255];
let ink = [237, 237, 237];
let palette: string[][] = [];
let width = 0;
let height = 0;
let count = 0;
let px: Float32Array;
let py: Float32Array;
let tone: Float32Array;
let bay: Float32Array;
let hh: Float32Array;
let heat: Uint8Array;
let haze = [0, 0, 0];

function readTheme() {
  light = root.dataset.theme === 'light';
  accent = channels('--acc-rgb');
  accent2 = channels('--acc2-rgb');
  ink = channels('--ink-rgb');
  hot = channels('--hot-rgb');
  palette = [];
  for (let level = 0; level < 10; level++) {
    palette.push([]);
    for (let bucket = 0; bucket < 3; bucket++) {
      const t = level / 9;
      const base = [0, 1, 2].map((k) => mix(accent[k], accent2[k], bucket / 2));
      const color = light
        ? base.map((v, k) => mix(v, ink[k], 0.15 + t * 0.55))
        : base.map((v, k) => mix(v, hot[k], t ** 3 * 0.75));
      const alpha = light ? 0.34 + 0.66 * t ** 0.6 : 0.22 + 0.78 * t ** 0.6;
      palette[level].push(`rgba(${color[0] | 0},${color[1] | 0},${color[2] | 0},${alpha.toFixed(2)})`);
    }
  }
}

function draw(time: number) {
  pen.clearRect(0, 0, width, height);
  const eased = smooth(0, 1, Math.min(1, time / resolveIn));
  const bucket = time / period;
  const groups: number[][] = [];
  for (let i = 0; i < count; i++) {
    let value = tone[i];
    if (time < settled) {
      const reveal = Math.max(0, Math.min(1, eased * 1.5 - (1 - px[i] / width) * 0.5 - (py[i] / height) * 0.15));
      value *= reveal;
    }
    let level = Math.floor(value + bay[i]);
    if (level > 9) level = 9;
    if (level < 1) continue;
    if (time < settled) {
      const j = hash((i * 31 + Math.floor(bucket + hh[i])) * 977);
      if (j < 0.06) level = Math.max(1, level - 1);
      else if (j > 0.95) level = Math.min(9, level + 1);
    }
    const key = level * 3 + heat[i];
    (groups[key] || (groups[key] = [])).push(i, level);
  }
  for (let key = 0; key < groups.length; key++) {
    const group = groups[key];
    if (!group) continue;
    pen.fillStyle = palette[(key / 3) | 0][key % 3];
    for (let n = 0; n < group.length; n += 2) pen.fillText(ramp[group[n + 1]], px[group[n]], py[group[n]]);
  }
  const hazeAlpha = light ? 0.09 : 0.08;
  const glow = pen.createRadialGradient(haze[0], haze[1], 0, haze[0], haze[1], haze[2] * 0.7);
  glow.addColorStop(0, `rgba(${accent.join(',')},${hazeAlpha})`);
  glow.addColorStop(1, `rgba(${accent.join(',')},0)`);
  pen.globalCompositeOperation = 'destination-over';
  pen.fillStyle = glow;
  pen.fillRect(0, 0, width, height);
  pen.globalCompositeOperation = 'source-over';
}

function sparkles() {
  const one = document.getElementById('sp1');
  const two = document.getElementById('sp2');
  if (one) {
    one.style.left = width * 0.46 + 'px';
    one.style.top = height * 0.2 + 'px';
  }
  if (two) {
    two.style.left = width * 0.49 + 'px';
    two.style.top = height * 0.8 + 'px';
  }
}

function layout() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = stageEl.clientWidth;
  height = stageEl.clientHeight;
  field.width = Math.round(width * dpr);
  field.height = Math.round(height * dpr);
  pen.setTransform(dpr, 0, 0, dpr, 0, 0);
  const narrow = width < 860;
  const radius = narrow ? width * 0.36 : Math.min(height * 0.4, width * 0.25);
  const cx = narrow ? width * 0.6 : width * 0.72;
  const cy = narrow ? height * 0.7 : height * 0.5;
  const lx = -0.65;
  const ly = -0.76;
  haze = [cx + lx * radius * 0.9, cy + ly * radius * 0.9, radius];
  const cols = Math.ceil(width / cellW);
  const rows = Math.ceil(height / cellH);
  const cap = cols * rows;
  px = new Float32Array(cap);
  py = new Float32Array(cap);
  tone = new Float32Array(cap);
  bay = new Float32Array(cap);
  hh = new Float32Array(cap);
  heat = new Uint8Array(cap);
  count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c + 0.5) * cellW;
      const y = (r + 0.5) * cellH;
      const dx = (x - cx) / radius;
      const dy = (y - cy) / radius;
      const rr = Math.sqrt(dx * dx + dy * dy) || 1e-6;
      const ld = (dx * lx + dy * ly) / rr;
      const lit = smooth(-0.45, 0.95, ld);
      let t: number;
      if (rr < 1) {
        const edge = 1 - rr;
        const widthTone = 0.02 + 0.15 * lit;
        t =
          Math.exp(-edge / widthTone) * lit ** 0.9 +
          0.11 * smooth(-0.3, 1, ld) * (1 - rr * 0.55) ** 2 +
          0.24 * Math.exp(-edge / 0.025) * (1 - lit) +
          0.17 * Math.exp(-edge / 0.02);
      } else {
        const outside = rr - 1;
        t = (Math.exp(-outside / 0.025) * 0.6 + Math.exp(-outside / 0.22) * 0.07) * lit;
      }
      if (light) t = Math.min(1, t * 1.15);
      if (t < 0.012) continue;
      px[count] = x;
      py[count] = y;
      tone[count] = t * 9;
      bay[count] = bayer[r & 7][c & 7];
      hh[count] = hash(r * 977 + c * 131 + 7);
      heat[count] = Math.min(2, Math.floor(lit * Math.min(1, t * 2.4) * 3));
      count++;
    }
  }
  pen.font = `${light ? 600 : 400} ${fontSize}px "Geist Mono Variable", "Geist Mono", ui-monospace, Menlo, Consolas, monospace`;
  pen.textAlign = 'center';
  pen.textBaseline = 'middle';
  sparkles();
  draw(still ? (freeze ?? settled) : clock());
}

let started = performance.now();
let paused = 0;
let hiddenAt = 0;
let last = 0;
let frame = 0;

function clock() {
  return (performance.now() - started - paused) / 1000;
}

function loop(ts: number) {
  if (document.hidden) return;
  if (ts - last > 60) {
    draw(clock());
    last = ts;
  }
  frame = requestAnimationFrame(loop);
}

document.addEventListener('visibilitychange', () => {
  if (still) return;
  if (document.hidden) {
    hiddenAt = performance.now();
    cancelAnimationFrame(frame);
    return;
  }
  paused += performance.now() - hiddenAt;
  frame = requestAnimationFrame(loop);
});

new MutationObserver(() => {
  readTheme();
  layout();
}).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

addEventListener('resize', () => layout());

readTheme();
// Live: draw now on the fallback font and start the clock. The redraw when the
// real font lands keeps the clock running, so the reveal does not restart.
// Still: draw once, on the real font, as before.
if (!still) {
  layout();
  if (!document.hidden) {
    started = performance.now();
    frame = requestAnimationFrame(loop);
  }
}
(document.fonts?.ready ?? Promise.resolve()).then(() => layout());
