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
  versProjet,
  versVille,
  type ArchivePublique,
  type ArticlePublic,
  type CheminsContenus,
  type DestinationPublique,
  type EpisodePublic,
  type ProjetPublic,
  type VillePublic,
} from './adaptateurs'
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

export const PROJETS: Projet[] = SOURCE_API
  ? (() => {
      const liens = chemins()
      return lireGenere<ProjetPublic[]>('projets').map((p) => versProjet(p, liens))
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
