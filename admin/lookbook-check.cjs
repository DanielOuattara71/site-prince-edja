const { chromium } = require('playwright')
const exe = process.env.HOME + '/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome'
;(async () => {
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1200 } })
  const page = await ctx.newPage()
  await page.goto('http://127.0.0.1:4173/site-prince-edja/boutique#galerie', { waitUntil: 'networkidle' }).catch(() => null)
  await page.waitForTimeout(1500)
  await page.evaluate(() => {
    const el = document.getElementById('galerie')
    if (el) window.scrollTo(0, el.offsetTop - 50)
  })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: '/tmp/lookbook-section.png', fullPage: false })
  const counts = await page.locator('#galerie img').evaluateAll((els) => els.map((el) => ({ src: el.src.split('/').pop(), complete: el.complete, w: el.naturalWidth })))
  console.log('images:', JSON.stringify(counts))
  await browser.close()
})().catch((e) => { console.error('ECHEC', e); process.exit(1) })
