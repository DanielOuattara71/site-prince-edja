const { chromium } = require('playwright')
const exe = process.env.HOME + '/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome'
;(async () => {
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await ctx.newPage()
  page.on('request', (r) => { if (r.url().includes('medias-dev')) console.log('REQ', r.method(), r.url().slice(-40)) })
  page.on('response', (r) => { if (r.url().includes('medias-dev')) console.log('RES', r.status(), r.url().slice(-40)) })
  await page.goto('http://127.0.0.1:4173/site-prince-edja/boutique/oba', { waitUntil: 'networkidle' }).catch(() => null)
  await page.waitForTimeout(2500)
  const imgs = await page.locator('main img').evaluateAll((els) => els.map((el) => ({ src: el.getAttribute('src')?.slice(0, 80), complete: el.complete, w: el.naturalWidth, h: el.naturalHeight, alt: el.getAttribute('alt') })))
  console.log(JSON.stringify(imgs, null, 2))
  await browser.close()
})().catch((e) => { console.error('ECHEC', e); process.exit(1) })
