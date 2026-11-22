/**
 * Couche d'accès — projets, épisodes, villes, destinations, archive (PLAN-DE-LANCEMENT S1, S2).
 *
 * Mode API : projets, épisodes, destinations, villes et archive viennent de
 * `GET /public/api/v1/contenus/<type>`, chargés à la construction. Le tracé de la Côte d'Ivoire
 * (`coteIvoire`) n'est pas un contenu administrable : c'est un fond de carte (Natural Earth).
 */
import { EPISODES as EPISODES_DEPART } from '@/data/content'
import { DESTINATIONS as DESTINATIONS_DEPART, type Destination } from '@/data/destinations'
import { PROJETS as PROJETS_DEPART, type Projet } from '@/data/projets'
import { TRAVEL_CITIES as TRAVEL_CITIES_DEPART } from '@/data/content'
import type { TravelCity } from '@/types'
import { ARCHIVE as ARCHIVE_DEPART, type EntreeArchive } from '@/data/archive'
import type { Episode } from '@/types'
import {
  versArchive,
  versDestinations,
  versEpisode,
  versPartenaire,
  versProjet,
  versVille,
  type ArchivePublique,
  type ArticlePublic,
  type CheminsContenus,
  type DestinationPublique,
  type EpisodePublic,
  type PartenairePublic,
  type ProjetPublic,
  type VillePublic,
} from './adaptateurs'
import type { Partenaire } from '@/data/collaborations'
import { lireGenere, SOURCE_API } from './source'

export { FILTRES_PROJETS } from '@/data/projets'
export type { Projet, StatutProjet } from '@/data/projets'
export { TRAVEL_PARTNERS, TRAVEL_PROGRAMME } from '@/data/content'
export { CADRE_CARTE } from '@/data/destinations'
export type { Destination } from '@/data/destinations'
export { NAVIGATION_ARCHIVE, publiable } from '@/data/archive'
export type { Fiabilite, EntreeArchive } from '@/data/archive'
export { default as coteIvoire } from '@/data/geo/cote-ivoire.json'

const EPISODES_API = SOURCE_API ? lireGenere<EpisodePublic[]>('episodes') : []
const SLUGS_EPISODES = new Map(EPISODES_API.map((e) => [e.id, versEpisode(e).slug]))

/**
 * Chemin du site de chaque contenu liable, pour les `CibleInterne` de type `contenu`. Les produits
 * publics n'ont pas d'identifiant (SCHEMAS § 12.2) : une cible vers un bijou ne se résout pas, et
 * le projet retombe sur la page de son template.
 */
function chemins(): CheminsContenus {
  const par = <T extends { id: string; slug?: string | null }>(liste: T[], prefixe: string) =>
    new Map(liste.flatMap((o) => (o.slug ? [[o.id, `${prefixe}${o.slug}`] as const] : [])))
  return {
    episodes: new Map([...SLUGS_EPISODES].map(([id, slug]) => [id, `/xplore/${slug}`])),
    articles: par(lireGenere<ArticlePublic[]>('articles'), '/journal/'),
    destinations: par(lireGenere<DestinationPublique[]>('destinations'), '/destinations/'),
  }
}

export const EPISODES: Episode[] = SOURCE_API ? EPISODES_API.map(versEpisode) : EPISODES_DEPART

/** Id du projet X'PLORE Côte d'Ivoire (chez le client) : /xplore n'indexe que ses épisodes. */
export const EPISODES_XPLORE: Episode[] = (() => {
  if (!SOURCE_API) return EPISODES
  const xplore = lireGenere<ProjetPublic[]>('projets').find((p) => p.slug === 'xplore-cote-divoire')
  return xplore ? EPISODES.filter((e) => e.projetId === xplore.id) : []
})()

/** Tous les épisodes d'un projet, dans l'ordre de la série. */
export function episodesDuProjet(projetId: string | null | undefined): Episode[] {
  if (!projetId) return []
  return EPISODES.filter((e) => e.projetId === projetId)
    .slice()
    .sort((a, b) => a.numero.localeCompare(b.numero, 'fr'))
}

export const PROJETS: Projet[] = SOURCE_API
  ? (() => {
      const liens = chemins()
      return lireGenere<ProjetPublic[]>('projets').map((p) =>
        versProjet(p, liens, { routeParDefaut: `/projets/${p.slug}` }),
      )
    })()
  : PROJETS_DEPART

export const DESTINATIONS: Destination[] = SOURCE_API
  ? versDestinations(lireGenere<DestinationPublique[]>('destinations'), SLUGS_EPISODES)
  : DESTINATIONS_DEPART

export const TRAVEL_CITIES: TravelCity[] = SOURCE_API
  ? lireGenere<VillePublic[]>('villes').map(versVille)
  : TRAVEL_CITIES_DEPART

export const ARCHIVE: EntreeArchive[] = SOURCE_API
  ? lireGenere<ArchivePublique[]>('archive').map(versArchive)
  : ARCHIVE_DEPART

/** Page publique d'un projet (contrat 1.15.0 § 32.4) : un appel, tous ses contenus déjà filtrés. */
export interface PageProjet {
  projet: Projet
  episodes: Episode[]
  destinations: Destination[]
  villes: TravelCity[]
  entrees: EntreeArchive[]
  partenaires: Partenaire[]
}

interface PageProjetPublique {
  projet: ProjetPublic
  episodes: EpisodePublic[]
  destinations: DestinationPublique[]
  villes: VillePublic[]
  entrees: ArchivePublique[]
  partenaires: PartenairePublic[]
}

/**
 * Une page de projet n'existe qu'en mode API : les données de départ n'ont pas de page assemblée.
 * Le JSON est celui qu'a écrit le chargeur depuis `GET /projets/{slug}/page`.
 */
export function pageProjet(slug: string): PageProjet | null {
  if (!SOURCE_API) return null
  try {
    const pages = lireGenere<Record<string, PageProjetPublique>>('pages-projets')
    const page = pages[slug]
    if (!page) return null
    const liens = chemins()
    return {
      projet: versProjet(page.projet, liens, { routeParDefaut: `/projets/${slug}` }),
      // L'API trie par modification ; l'album d'une série se lit par numéro (E01, E02…).
      episodes: page.episodes
        .map(versEpisode)
        .slice()
        .sort((a, b) => a.numero.localeCompare(b.numero, 'fr')),
      destinations: versDestinations(page.destinations, SLUGS_EPISODES),
      villes: page.villes.map(versVille),
      entrees: page.entrees.map(versArchive),
      partenaires: page.partenaires.map(versPartenaire),
    }
  } catch {
    // Un build de démonstration peut précéder le chargement des pages : la route répond 404.
    return null
  }
}
