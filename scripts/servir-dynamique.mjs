/**
 * Serveur de rendu à la demande (contrat 1.13.0 § 30) — SANS reconstruction du frontend.
 *
 *   PUBLIC_API_URL=http://… node scripts/servir-dynamique.mjs
 *
 * Le site est construit une fois (`npm run build`), puis ce serveur :
 *   - interroge l'API publique à intervalles réguliers (TTL, 60 s par défaut) ;
 *   - injecte les données validées dans `globalThis.__PRINCE_DONNEES__` AVANT de charger le
 *     paquet SSR (les modules d'accès lisent les données à l'import) ;
 *   - rend chaque route à la requête avec le même `rendreRoute` que le prérendu ;
 *   - sert les fichiers statiques de `dist/` (bundles, polices, images).
 *
 * Une URL jamais vue au build (nouvel article publié) est donc servie immédiatement : la liste
 * des routes est recalculée à chaque rafraîchissement depuis les données de l'API.
 *
 * Aucune dépendance : node:http et les modules déjà construits dans `dist-ssr/`.
 * Ce serveur est indépendant de l'hébergeur final : il tourne partout où Node tourne.
 */
import { createServer } from 'node:http'
import { Worker } from 'node:worker_threads'
import { fileURLToPath } from 'node:url'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve, sep } from 'node:path'

const API = (process.env.PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '')
const PORT = Number(process.env.PORT ?? 4174)
const TTL_MS = Math.max(5, Number(process.env.DONNEES_TTL ?? 60)) * 1000
const ORIGINE = (process.env.PUBLIC_SITE_ORIGIN ?? 'https://prince-edja.vercel.app').replace(
  /\/+$/,
  '',
)
const BASE = '/site-prince-edja'
const DIST = resolve('dist')

if (!API) {
  console.error('PUBLIC_API_URL est requis (face publique du back end).')
  process.exit(1)
}

const FAMILLES = [
  'articles',
  'episodes',
  'projets',
  'destinations',
  'presse',
  'distinctions',
  'jalons',
  'partenaires',
  'offres',
  'villes',
  'archive',
  'univers',
  'galerie',
  'pages-legales',
]

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
}

/** Même国家安全 que le chargeur : une réponse hors contrat arrête le démarrage. */
async function lire(chemin) {
  const reponse = await fetch(`${API}/public/api/v1${chemin}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
  })
  if (!reponse.ok) throw new Error(`${chemin} → ${reponse.status}`)
  return reponse.json()
}

async function charger() {
  const donnees = {}
  for (const famille of FAMILLES) {
    const items = []
    for (let page = 1; ; page += 1) {
      const lot = await lire(`/contenus/${famille}?langue=fr&pageSize=100&page=${page}`)
      items.push(...lot.items)
      if (items.length >= lot.total || lot.items.length === 0) break
    }
    donnees[famille] = items
  }
  for (const famille of ['article', 'projet', 'produit']) {
    donnees[`categories-${famille}`] = await lire(`/categories?famille=${famille}&langue=fr&pageSize=100`)
  }
  // Même fusion que scripts/charger-donnees.core.ts : la liste porte `varianteIds`, la fiche
  // porte `variantes[].id`, `histoire`, `galerie`… (contrat 1.10.0 § 27).
  const fiches = new Map()
  const listes = new Map()
  for (let page = 1; ; page += 1) {
    const lot = await lire(`/boutique/produits?langue=fr&pageSize=48&page=${page}`)
    for (const produit of lot.items) {
      const cle = `${produit.type}:${produit.slug}`
      if (listes.has(cle)) continue
      listes.set(cle, produit)
      fiches.set(
        cle,
        await lire(
          `/boutique/produits/${encodeURIComponent(produit.slug)}?type=${produit.type}&langue=fr`,
        ),
      )
    }
    if (page >= lot.totalPages || lot.items.length === 0) break
  }
  donnees.produits = [...fiches.entries()].map(([cle, fiche]) => ({
    ...listes.get(cle),
    ...fiche,
  }))
  donnees['photos-fixes'] = (await lire('/photos-fixes')).items
  donnees.reglages = await lire('/reglages')
  return donnees
}

const echapperAttribut = (texte) =>
  String(texte).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const echapperTexte = (texte) =>
  String(texte).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Injecte titre, description, og:*, canonical et robots dans le gabarit (identique au prérendu). */
function rendreHead(head, page) {
  head = head.replace(/<title>[^<]*<\/title>/, `<title>${echapperTexte(page.titre)}</title>`)
  for (const motif of [
    /<meta name="description"[^>]*>\s*/g,
    /<meta property="og:title"[^>]*>\s*/g,
    /<meta property="og:description"[^>]*>\s*/g,
    /<meta property="og:image"[^>]*>\s*/g,
    /<meta property="og:url"[^>]*>\s*/g,
    /<meta name="robots"[^>]*>\s*/g,
    /<link rel="canonical"[^>]*>\s*/g,
  ])
    head = head.replace(motif, '')
  const ajouts = []
  if (page.description) {
    ajouts.push(`<meta name="description" content="${echapperAttribut(page.description)}" />`)
    ajouts.push(`<meta property="og:description" content="${echapperAttribut(page.description)}" />`)
  }
  ajouts.push(`<meta name="robots" content="${page.indexable ? 'index, follow' : 'noindex, follow'}" />`)
  ajouts.push(`<meta property="og:title" content="${echapperAttribut(page.titre)}" />`)
  if (page.indexable) {
    ajouts.push(`<meta property="og:url" content="${echapperAttribut(page.url)}" />`)
    ajouts.push(`<link rel="canonical" href="${echapperAttribut(page.url)}" />`)
  }
  ajouts.push(
    `<meta property="og:image" content="${echapperAttribut(`${ORIGINE}/images/og-prince-edja.jpg`)}" />`,
  )
  return head.replace('</head>', `  ${ajouts.join('\n    ')}\n  </head>`)
}

let modele = await readFile(join(DIST, 'index.html'), 'utf8')
let worker = null
let routes = new Set()
let rafraichiLe = 0
let sequence = 0
const attentes = new Map()

function lancerWorker(donnees) {
  const precedent = worker
  worker = new Worker(fileURLToPath(new URL('./worker-rendu.mjs', import.meta.url)), {
    workerData: {
      donnees,
      bundle: resolve('dist-ssr', 'entry-server.js'),
    },
  })
  worker.on('message', (message) => {
    if (message.type !== 'page') return
    const resolution = attentes.get(message.id)
    if (!resolution) return
    attentes.delete(message.id)
    if (message.erreur) resolution.rejeter(new Error(message.erreur))
    else resolution.resoudre(message.page)
  })
  worker.on('error', (erreur) => {
    for (const attente of attentes.values()) attente.rejeter(erreur)
    attentes.clear()
  })
  if (precedent) precedent.terminate()
}

function rendre(route, origine) {
  if (!worker) return Promise.reject(new Error('Aucun worker de rendu'))
  const id = ++sequence
  return new Promise((resoudre, rejeter) => {
    attentes.set(id, { resoudre, rejeter })
    worker.postMessage({ type: 'rendre', id, route, origine })
  })
}

async function rafraichir() {
  const donnees = await charger()
  lancerWorker(donnees)
  // Le worker expose les routes via son propre import : on les déduit des données ici,
  // sans attendre un message supplémentaire (la liste est identique à entry-server).
  routes = new Set([
    '/', '/a-propos', '/histoires', '/xplore', '/taste-and-travel', '/archive-afrique',
    '/boutique', '/journal', '/presse', '/contact',
    ...donnees['pages-legales'].map((p) => p.chemin),
    ...donnees.episodes.map((e) => '/xplore/' + e.slug),
    ...donnees.articles.map((a) => '/journal/' + a.slug),
    ...donnees.destinations.map((d) => '/destinations/' + d.slug),
    ...donnees.produits.map((p) => '/boutique/' + p.slug),
  ])
  rafraichiLe = Date.now()
  console.log(`[dynamique] données rechargées : ${routes.size} routes, prochain TTL dans ${TTL_MS / 1000} s`)
}

await rafraichir()
setInterval(() => {
  rafraichir().catch((erreur) => {
    console.error('[dynamique] échec du rechargement, conservation des données précédentes :', erreur.message)
  })
}, TTL_MS).unref()

async function servirFichier(chemin, reponse) {
  const relatif = normalize(chemin).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '')
  const cible = resolve(DIST, relatif)
  if (cible !== DIST && !cible.startsWith(DIST + sep)) {
    reponse.writeHead(403).end()
    return
  }
  try {
    const infos = await stat(cible)
    if (!infos.isFile()) throw new Error('pas un fichier')
    reponse.writeHead(200, {
      'Content-Type': TYPES[extname(cible)] ?? 'application/octet-stream',
      'Cache-Control': extname(cible) === '.html' ? 'no-cache' : 'public, max-age=3600',
    })
    reponse.end(await readFile(cible))
  } catch {
    reponse.writeHead(404).end('Introuvable')
  }
}

createServer(async (requete, reponse) => {
  try {
    const url = new URL(requete.url, `http://${requete.headers.host}`)
    let chemin = decodeURIComponent(url.pathname)
    if (chemin.startsWith(BASE + '/')) chemin = chemin.slice(BASE.length)
    else if (chemin !== BASE) {
      await servirFichier(chemin, reponse)
      return
    }
    const route = chemin === '' ? '/' : chemin
    if (Date.now() - rafraichiLe > TTL_MS * 2 && !routes.has(route)) await rafraichir()

    const page = await rendre(route, ORIGINE)
    if (!page) {
      reponse.writeHead(404, { 'Content-Type': TYPES['.html'] })
      reponse.end(await readFile(join(DIST, '404.html')))
      return
    }
    const html = page.html.replace(/<link rel="preload"[^>]*\/?>/g, '')
    let document = rendreHead(modele, page)
    document = document.replace('<div id="root"></div>', `<div id="root">${html}</div>`)
    reponse.writeHead(200, {
      'Content-Type': TYPES['.html'],
      'Cache-Control': 'public, max-age=0, s-maxage=' + Math.floor(TTL_MS / 1000),
      'X-Source': 'api',
    })
    reponse.end(document)
  } catch (erreur) {
    console.error('[dynamique] erreur de rendu :', erreur)
    reponse.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    reponse.end('Erreur de rendu')
  }
}).listen(PORT, () => {
  console.log(`[dynamique] http://127.0.0.1:${PORT}${BASE} — TTL ${TTL_MS / 1000} s`)
})
