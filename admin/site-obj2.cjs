const { chromium } = require('playwright')
const exe = process.env.HOME + '/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome'
const URL_SITE = 'http://127.0.0.1:4173/site-prince-edja/boutique'
;(async () => {
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await ctx.newPage()
  page.on('console', (m) => { if (m.type() === 'error') console.log('[console]', m.text()) })
  page.on('response', (r) => { if (r.status() >= 400) console.log('RES', r.status(), r.url().slice(0, 90)) })
  await page.goto(URL_SITE, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  await page.screenshot({ path: '/tmp/objet-pendentif.png', fullPage: true })
  const counts = await page.locator('main img').evaluate_all((els) => els.map((el) => el.complete && el.naturalWidth > 0))
  console.log('images chargées:', counts.filter(Boolean).length, '/', counts.length)
  await page.screenshot({ path: '/tmp/catalogue-strip.png', clip: { x: 0, y: 0, width: 1440, height: 1100 } })
  await browser.close()
})().catch((e) => { console.error('ECHEC', e); process.exit(1) })
