/**
 * SEO — génère `public/sitemap.xml` et `public/robots.txt` depuis les données réelles.
 *
 * Pourquoi un script et pas un plugin Vite : importer les données de l'application
 * dans `vite.config.ts` les fait entrer dans le projet TypeScript *node*, qui n'a ni
 * les alias `@/` ni les types `import.meta.env`. Le script lit les fichiers comme du
 * texte, n'ajoute aucune dépendance, et fonctionne quel que soit l'hébergeur.
 *
 *   node scripts/seo.mjs          → écrit les fichiers
 *   node scripts/seo.mjs --check  → signale les routes manquantes, sans écrire
 *
 * Le mode `--check` est celui à lancer en CI : c'est lui qui empêche le sitemap de
 * mentir quand un produit est ajouté.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')

/** ⚠️ À changer quand le domaine bouge : une seule occurrence dans tout le projet. */
const SITE_URL = 'https://danielouattara71.github.io'
const BASE = '/site-prince-edja/'

const PAGES = [
  '',
  'a-propos',
  'xplore',
  'taste-and-travel',
  'boutique',
  'journal',
  'presse',
  'contact',
]

const lire = (chemin) => readFileSync(join(racine, chemin), 'utf8')

/** Slugs d'un tableau nommé dans un fichier de données. */
function slugsDe(fichier, nomExport) {
  const source = lire(fichier)
  const debut = source.indexOf(`export const ${nomExport}`)
  if (debut < 0) return []
  const fin = source.indexOf('export const', debut + 1)
  const bloc = source.slice(debut, fin < 0 ? undefined : fin)
  return [...bloc.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1])
}

const comptoirs = slugsDe('src/data/comptoirs.ts', 'COMPTOIRS')
const episodes = slugsDe('src/data/content.ts', 'EPISODES')
const bijoux = slugsDe('src/data/content.ts', 'BIJOUX')

// Les fiches n'existent que là où le comptoir a des pièces réelles : aujourd'hui
// « À porter » seulement. Le reste est en « en ouverture », pas indexable comme produit.
const routes = [
  ...PAGES,
  ...episodes.map((s) => `xplore/${s}`),
  ...comptoirs.map((s) => `boutique/${s}`),
  ...bijoux.map((s) => `boutique/a-porter/${s}`),
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((r) => `  <url><loc>${SITE_URL}${BASE}${r}</loc></url>`).join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}${BASE}sitemap.xml
`

const verifier = process.argv.includes('--check')
const cheminSitemap = join(racine, 'public', 'sitemap.xml')

if (verifier) {
  let existant = ''
  try {
    existant = readFileSync(cheminSitemap, 'utf8')
  } catch {
    console.error('✗ public/sitemap.xml est absent. Lance : npm run seo')
    process.exit(1)
  }
  const manquantes = routes.filter((r) => !existant.includes(`${BASE}${r}</loc>`))
  if (manquantes.length > 0) {
    console.error(`✗ ${manquantes.length} route(s) absente(s) du sitemap :`)
    for (const r of manquantes) console.error(`   ${BASE}${r}`)
    console.error('  → lance : npm run seo')
    process.exit(1)
  }
  console.log(`✓ sitemap à jour — ${routes.length} routes.`)
} else {
  writeFileSync(cheminSitemap, sitemap)
  writeFileSync(join(racine, 'public', 'robots.txt'), robots)
  console.log(`✓ sitemap écrit — ${routes.length} routes.`)
  console.log(`✓ robots.txt écrit.`)
}
