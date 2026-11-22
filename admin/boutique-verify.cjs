const { chromium } = require('playwright')
const exe = process.env.HOME + '/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome'
;(async () => {
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
  const page = await ctx.newPage()
  await page.goto('http://127.0.0.1:4173/site-prince-edja/boutique', { waitUntil: 'networkidle' }).catch(() => null)
  await page.waitForTimeout(1200)
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight
    for (let y = 0; y <= h; y += 500) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 300))
    }
  })
  await page.waitForTimeout(800)
  await page.screenshot({ path: '/tmp/boutique-verify.png', fullPage: true })
  await browser.close()
})().catch((e) => { console.error('ECHEC', e); process.exit(1) })
