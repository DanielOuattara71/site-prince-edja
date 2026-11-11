/**
 * Prérendu (B1, axe de lancement) : rendu **au moment de la construction** de chaque route
 * publique, pour que le HTML porte son contenu et ses balises — jamais de dépendance au
 * JavaScript pour l'essentiel d'une page (LIAISON § C.2).
 *
 *   vite build --ssr src/entry-server.tsx --outDir dist-ssr
 *   node scripts/prerender.mjs
 *
 * Le `BrowserRouter` du client est remplacé par un routeur en mémoire (`<App routeurStatique>`) ;
 * les pages ne changent pas. La langue reste `fr` (la seule publiée à ce jour).
 */
import { prerender } from 'react-dom/static'
import { FournisseurLangue } from '@/i18n/FournisseurLangue'
import { ARTICLES } from '@/acces/journal'
import { BIJOUX, LIVRES } from '@/acces/boutique'
import { DESTINATIONS, EPISODES } from '@/acces/projets'
import { PAGES_LEGALES } from '@/acces/site'
import App from '@/App'
import { balisesPreRendues, preparerBalisesPreRendues } from '@/hooks/useSeo'

const ROUTES_STATIQUES = [
  '/',
  '/a-propos',
  '/histoires',
  '/xplore',
  '/taste-and-travel',
  '/archive-afrique',
  '/boutique',
  '/journal',
  '/presse',
  '/contact',
] as const

/** Les routes prérendues. `/a-propos/influence` et `/travailler-ensemble` (redirections)
 *  et les pages `/newsletter/*` (noindex, dynamiques) sont exclues volontairement. */
export function routesPubliques(): string[] {
  return [
    ...ROUTES_STATIQUES,
    ...PAGES_LEGALES.map((page) => page.chemin),
    ...EPISODES.map((episode) => `/xplore/${episode.slug}`),
    ...ARTICLES.map((article) => `/journal/${article.slug}`),
    ...DESTINATIONS.map((destination) => `/destinations/${destination.slug}`),
    ...BIJOUX.map((bijou) => `/boutique/${bijou.slug}`),
    ...LIVRES.map((livre) => `/boutique/${livre.slug}`),
  ]
}

export interface PagePreRendue {
  html: string
  titre: string
  description?: string
  indexable: boolean
  url: string
}

/** Rend une route et ramasse ses balises. `route` est **interne** (`/contact`) ; la location
 *  est construite avec la base, comme la fait le client (`/site-prince-edja/contact`), pour que
 *  le HTML prérendu soit identique au rendu navigateur (hydratation sans erreur). */
export async function rendreRoute(route: string, origine: string): Promise<PagePreRendue | null> {
  const base = import.meta.env.BASE_URL
  const location = `${base.replace(/\/+$/, '')}${route === '/' ? '/' : route}`
  preparerBalisesPreRendues(location, origine)
  const { prelude } = await prerender(
    <FournisseurLangue>
      <App routeurStatique={location} />
    </FournisseurLangue>,
  )
  const html = await new Response(prelude).text()
  const balises = balisesPreRendues()
  const balise = balises.at(-1)
  if (!balise) {
    // Une page sans useSeo : elle reste en SPA (jamais dans routesPubliques en principe).
    console.warn(`[prérendu] aucune balise SEO pour ${route}`)
    return null
  }
  return {
    html,
    titre: balise.titre,
    ...(balise.description !== undefined ? { description: balise.description } : {}),
    indexable: balise.indexable,
    url: balise.url,
  }
}
