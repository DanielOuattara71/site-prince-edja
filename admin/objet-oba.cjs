const { chromium } = require('playwright')
const exe = process.env.HOME + '/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome'
;(async () => {
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await ctx.newPage()
  page.on('response', (r) => { if (r.status() >= 400) console.log('RES', r.status(), r.url().slice(0, 90)) })
  await page.goto('http://127.0.0.1:4173/site-prince-edja/boutique/oba', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  await page.screenshot({ path: '/tmp/objet-oba.png', fullPage: true })
  await browser.close()
})().catch((e) => { console.error('ECHEC', e); process.exit(1) })
