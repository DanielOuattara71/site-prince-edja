import { chromium } from 'playwright-core';
import fs from 'node:fs';

const url = process.argv[2];
const out = process.argv[3];
const w = parseInt(process.argv[4] || '1440');
const h = parseInt(process.argv[5] || '900');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: w, height: h } });
await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(5000);

const data = await page.evaluate(() => {
  const res = { bg: null, color: null, els: [] };
  const cs = getComputedStyle(document.body);
  res.bg = cs.backgroundColor;
  res.color = cs.color;
  const root = document.querySelector('main') || document.body;
  const walk = (el, depth) => {
    for (const child of el.children) {
      const r = child.getBoundingClientRect();
      const c = getComputedStyle(child);
      const range = document.createRange();
      range.selectNodeContents(child);
      const text = (range.cloneContents().textContent || '').trim().replace(/\s+/g, ' ').slice(0, 140);
      const visible = r.width > 1 || r.height > 1;
      if (visible) {
        res.els.push({
          depth,
          tag: child.tagName.toLowerCase(),
          cls: (child.getAttribute('class') || '').replace(/\s+/g, ' ').slice(0, 220),
          text: text.slice(0, 70),
          rect: { x: Math.round(r.x), y: Math.round(r.top + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) },
          color: c.color, bg: c.backgroundColor, fs: c.fontSize, fw: c.fontWeight, style: c.fontStyle, lh: c.lineHeight, ls: c.letterSpacing, ta: c.textAlign, tc: c.textTransform, d: c.display, br: c.borderRadius, pad: c.padding, m: c.margin, ov: c.overflow, pos: c.position, z: c.zIndex, op: c.opacity, align: c.alignItems, justify: c.justifyContent, gap: c.gap, fd: c.flexDirection,
        });
      }
      if (depth < 7) walk(child, depth + 1);
    }
  };
  walk(root, 0);
  return res;
});
fs.writeFileSync(out, JSON.stringify(data, null, 1));
console.log('ok');
await browser.close();
