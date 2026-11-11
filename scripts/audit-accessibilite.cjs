/**
 * Audit d'accessibilité WCAG AA des pages principales du site (F3 du PROMPT-SUITE).
 *
 * - aucune nouvelle dépendance (Playwright + axe-core viennent de l'admin) ;
 * - sert `dist/` avec la base `/site-prince-edja/` (GitHub Pages) ;
 * - retourne un code non nul si violation de niveau `serious` ou `critical`.
 *
 *   npm run build && node scripts/audit-accessibilite.cjs
 */
const { createServer } = require('node:http')
const { readFile, stat } = require('node:fs/promises')
const { readFileSync } = require('node:fs')
const { extname, join, normalize, resolve } = require('node:path')
const ADMIN_NM = join(__dirname, '..', 'admin', 'node_modules')
const { chromium } = require(join(ADMIN_NM, 'playwright'))

const dist = resolve(__dirname, '..', 'dist')
const BASE = '/site-prince-edja'
const PORT = 4190

const TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.avif', 'image/avif'],
  ['.ico', 'image/x-icon'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
])

function securiser(chemin) {
  const arrivee = normalize(join(dist, chemin))
  return arrivee.startsWith(dist) ? arrivee : null
}

const PAGES = [
  '/',
  '/a-propos',
  '/histoires',
  '/xplore',
  '/taste-and-travel',
  '/archive-afrique',
  '/boutique',
  '/journal',
  '/contact',
  '/mentions-legales',
]

async function demarrerServeur() {
  const serveur = createServer(async (requete, reponse) => {
    try {
      const url = new URL(requete.url ?? '/', 'http://x')
      if (url.pathname === BASE || url.pathname.startsWith(`${BASE}/`)) {
        url.pathname = url.pathname.slice(BASE.length) || '/'
      }
      let fichier = securiser(url.pathname)
      if (fichier === null) return reponse.writeHead(403).end()
      let infos = await stat(fichier).catch(() => null)
      if (infos?.isDirectory()) {
        fichier = join(fichier, 'index.html')
        infos = await stat(fichier).catch(() => null)
      }
      if (!infos?.isFile()) {
        const coquille = await readFile(join(dist, '404.html')).catch(() => '404')
        reponse.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
        return reponse.end(coquille)
      }
      reponse.writeHead(200, {
        'Content-Type': TYPES.get(extname(fichier).toLowerCase()) ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      })
      reponse.end(await readFile(fichier))
    } catch (erreur) {
      reponse.writeHead(500).end(String(erreur))
    }
  })
  return new Promise((resolve_) => serveur.listen(PORT, '127.0.0.1', () => resolve_(serveur)))
}

async function main() {
  const serveur = await demarrerServeur()
  const exe = `${process.env.HOME}/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome`
  const browser = await chromium.launch({
    executablePath: exe,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })

  // Charger axe-core depuis l'admin (pas de dépendance supplémentaire dans le site)
  const axeSource = readFileSync(join(ADMIN_NM, 'axe-core', 'axe.min.js'), 'utf8')

  let total = 0
  for (const page of PAGES) {
    const contexte = await browser.newContext()
    const pagePw = await contexte.newPage()
    const url = `http://127.0.0.1:${PORT}${BASE}${page}`
    await pagePw.goto(url, { waitUntil: 'networkidle' })
    await pagePw.waitForTimeout(800)

    await pagePw.addScriptTag({ content: axeSource })
    const resultat = await pagePw.evaluate(async () => {
      return window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] })
    })

    const serieux = resultat.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    )
    total += serieux.length

    if (serieux.length > 0) {
      console.log(`\n=== ${page} — ${serieux.length} violation(s) serious/critical`)
      for (const v of serieux) {
        console.log(`- [${v.id}] ${v.help} (impact: ${v.impact}) — ${v.nodes.length} noeud(s)`)
        for (const noeud of v.nodes.slice(0, 3)) {
          console.log(`   - ${noeud.target.join(' ')}`)
        }
      }
    } else {
      console.log(`OK ${page}`)
    }

    await contexte.close()
  }

  await browser.close()
  serveur.close()

  if (total > 0) {
    console.log(`\nTotal : ${total} violation(s) serious/critical`)
    process.exitCode = 1
  } else {
    console.log('\nAudit WCAG AA : OK sur les pages principales')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
