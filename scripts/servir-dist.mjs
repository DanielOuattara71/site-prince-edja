/**
 * Serveur statique de vérification pour `dist/` — jamais un serveur de production.
 *
 * Reproduit le comportement de GitHub Pages (hébergement actuel) : l'URL sans extension
 * résout `<dossier>/index.html` ; les chemins sans fichier renvoient `404.html` avec le statut
 * 404. Sert aussi à la recette locale du prérendu (B1/F4) : hydratation réelle, URL propre.
 *
 *   node scripts/servir-dist.mjs [port]   →   http://127.0.0.1:4173/site-prince-edja/
 */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'

const dist = resolve('dist')
const port = Number(process.argv[2] ?? 4173)
// Base du site (comme sur GitHub Pages) : les requêtes sans ce préfixe sont redirigées.
const BASE = '/site-prince-edja'

const TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.avif', 'image/avif'],
  ['.ico', 'image/x-icon'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.webmanifest', 'application/manifest+json'],
])

function securiser(chemin) {
  const arrivee = normalize(join(dist, chemin))
  if (!arrivee.startsWith(dist)) return null // pas de sortie du dossier
  return arrivee
}

const serveur = createServer(async (requete, reponse) => {
  try {
    const url = new URL(requete.url ?? '/', 'http://x')
    const cheminUrl = decodeURIComponent(url.pathname)
    // Comme GitHub Pages : le dossier nu redirige vers le slash final.
    if (cheminUrl === BASE) {
      reponse.writeHead(301, { Location: `${BASE}/` })
      return reponse.end()
    }
    if (!cheminUrl.startsWith(BASE)) {
      reponse.writeHead(302, { Location: `${BASE}${cheminUrl === '/' ? '' : cheminUrl}` })
      return reponse.end()
    }
    let cheminLocal = cheminUrl.slice(BASE.length) || '/'
    if (!cheminLocal.startsWith('/')) cheminLocal = `/${cheminLocal}`
    let fichier = securiser(cheminLocal)
    if (fichier === null) return reponse.writeHead(403).end()

    let infos = await stat(fichier).catch(() => null)
    if (infos?.isDirectory()) {
      fichier = join(fichier, 'index.html')
      infos = await stat(fichier).catch(() => null)
    } else if (infos === null) {
      // Pas de fichier direct : essayer `<chemin>/index.html` (URL propres de GitHub Pages)
      const avecIndex = join(fichier, 'index.html')
      const infosIndex = await stat(avecIndex).catch(() => null)
      if (infosIndex?.isFile()) {
        fichier = avecIndex
        infos = infosIndex
      }
    }

    if (!infos?.isFile()) {
      const coquille404 = await readFile(join(dist, '404.html')).catch(() => null)
      reponse.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
      return reponse.end(coquille404 ?? '404')
    }
    reponse.writeHead(200, {
      'Content-Type': TYPES.get(extname(fichier).toLowerCase()) ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    })
    reponse.end(await readFile(fichier))
  } catch {
    reponse.writeHead(500).end('500')
  }
})

serveur.listen(port, '127.0.0.1', () => {
  console.log(`[dist] http://127.0.0.1:${port}/site-prince-edja/`)
})
