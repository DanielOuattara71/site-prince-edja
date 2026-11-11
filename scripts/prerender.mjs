/**
 * Prérendu par route (B1) : injecte dans `dist/` un HTML complet par page publique —
 * `<title>`, balises `og:*`, canonical, robots et **contenu** — à partir du rendu SSR
 * (`vite build --ssr src/entry-server.tsx --outDir dist-ssr`).
 *
 * Origine absolue (og:url, canonical) : `PUBLIC_SITE_ORIGIN` (variable publique de build), sinon
 * l'adresse canonique actuelle du dépôt (`https://prince-edja.vercel.app`). Quand le domaine
 * sera tranché (question 21), poser la variable et tout est cohérent d'un coup.
 *
 * Aucune dépendance : node uniquement. Il écrit aussi `dist/404.html` (coquille vide) pour
 * qu'une route inconnue rende le 404 stylé du site au lieu de la page 404 de l'hébergeur.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const dist = resolve('dist')
const distSsr = resolve('dist-ssr', 'entry-server.js')

const origine = (process.env.PUBLIC_SITE_ORIGIN ?? 'https://prince-edja.vercel.app').replace(
  /\/+$/,
  '',
)

const { routesPubliques, rendreRoute } = await import(new URL(`file://${distSsr}`))

const template = await readFile(resolve(dist, 'index.html'), 'utf8')

const echapperAttribut = (texte) =>
  texte.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const echapperTexte = (texte) =>
  texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Remplace les balises `<title>` et les metas de l'en-tête ; en supprime si absentes côté page. */
function rendreHead(head, balise) {
  // `<title>`
  if (!/<title>[^<]*<\/title>/.test(head)) {
    throw new Error('gabarit : <title> introuvable')
  }
  head = head.replace(/<title>[^<]*<\/title>/, `<title>${echapperTexte(balise.titre)}</title>`)

  const nettoyer = (regex) => {
    head = head.replace(regex, '')
  }
  // metas de base au gabarit que l'on remplace toujours : description, og:title, og:description,
  // og:image (relativisée/absolue) ; la page peut ne pas en porter.
  nettoyer(/<meta name="description"[^>]*>\s*/g)
  nettoyer(/<meta property="og:title"[^>]*>\s*/g)
  nettoyer(/<meta property="og:description"[^>]*>\s*/g)
  nettoyer(/<meta property="og:image"[^>]*>\s*/g)
  nettoyer(/<meta property="og:url"[^>]*>\s*/g)
  nettoyer(/<meta name="robots"[^>]*>\s*/g)
  nettoyer(/<link rel="canonical"[^>]*>\s*/g)

  const ajouts = []
  if (balise.description) {
    ajouts.push(`<meta name="description" content="${echapperAttribut(balise.description)}" />`)
    ajouts.push(
      `<meta property="og:description" content="${echapperAttribut(balise.description)}" />`,
    )
  }
  ajouts.push(
    `<meta name="robots" content="${balise.indexable ? 'index, follow' : 'noindex, follow'}" />`,
  )
  ajouts.push(`<meta property="og:title" content="${echapperAttribut(balise.titre)}" />`)
  if (balise.indexable) {
    ajouts.push(`<meta property="og:url" content="${echapperAttribut(balise.url)}" />`)
    ajouts.push(`<link rel="canonical" href="${echapperAttribut(balise.url)}" />`)
  }
  ajouts.push(
    `<meta property="og:image" content="${echapperAttribut(`${origine}/images/og-prince-edja.jpg`)}" />`,
  )
  return head.replace('</head>', `  ${ajouts.join('\n    ')}\n  </head>`)
}

const routes = routesPubliques()
let ecrites = 0
const manquants = []

for (const route of routes) {
  const page = await rendreRoute(route, origine)
  if (!page) {
    manquants.push(route)
    continue
  }
  // React Float (`react-dom` `preload()`) laisse ses `<link>` dans le conteneur au SSR, puis
  // les hisse dans `<head>` côté client — la différence vaudrait un #418 à chaque chargement.
  // On les retire ici ; le client les ré-émet lui-même.
  const html = page.html.replace(/<link rel="preload"[^>]*\/?>/g, '')
  let head = rendreHead(template, page)
  head = head.replace('<div id="root"></div>', `<div id="root">${html}</div>`)
  if (route === '/') {
    await writeFile(resolve(dist, 'index.html'), head)
  } else {
    const cible = resolve(dist, route.replace(/^\/+/, ''), 'index.html')
    await mkdir(dirname(cible), { recursive: true })
    await writeFile(cible, head)
  }
  ecrites += 1
}

// 404 : coquille vide (le routeur affiche le 404 stylé, sans mismatch d'hydratation).
await writeFile(resolve(dist, '404.html'), template)

console.log(`[prérendu] origine ${origine}`)
console.log(`[prérendu] ${ecrites} page(s) sur ${routes.length}, ${manquants.length} ignorée(s)`)
if (manquants.length > 0) {
  console.log('[prérendu] sans balises :', manquants.join(', '))
}
