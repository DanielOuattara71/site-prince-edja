const { chromium } = require('playwright')
const exe = process.env.HOME + '/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome'
;(async () => {
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  for (const [nom, url] of [
    ['outfit', 'https://outfit.hellohello.is/'],
    ['slight-twist', 'https://www.slight-twist.co.nz/'],
  ]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
    const page = await ctx.newPage()
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(3000)
    await page.screenshot({ path: `/tmp/refs/${nom}.png`, fullPage: true })
    console.log('saved', nom, page.url())
    await ctx.close()
  }
  await browser.close()
})().catch((e) => { console.error('ECHEC', e); process.exit(1) })
