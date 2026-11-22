const { chromium } = require('playwright')
const exe = process.env.HOME + '/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome'
;(async () => {
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await ctx.newPage()
  await page.goto('http://127.0.0.1:4173/site-prince-edja/boutique/oba', { waitUntil: 'networkidle' }).catch(() => null)
  await page.waitForTimeout(2000)
  const info = await page.locator('main img').evaluateAll((els) => els.map((el) => ({
    src: el.getAttribute('src')?.slice(-50),
    rect: JSON.stringify(el.getBoundingClientRect()),
    offsetParent: el.offsetParent?.tagName,
    display: getComputedStyle(el).display,
    visibility: getComputedStyle(el).visibility,
    opacity: getComputedStyle(el).opacity,
    objectFit: getComputedStyle(el).objectFit,
    filter: getComputedStyle(el).filter,
    parent: getComputedStyle(el.parentElement).height,
    parentdisplay: getComputedStyle(el.parentElement).display,
    class: el.className,
  })))
  console.log(JSON.stringify(info, null, 2))
  await browser.close()
})().catch((e) => { console.error('ECHEC', e); process.exit(1) })
