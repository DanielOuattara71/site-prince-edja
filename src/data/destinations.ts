import { EPISODES } from './content'

/**
 * Les étapes de la saison X'PLORE (CDC T-331).
 *
 * L'association avec les épisodes se fait par le nom du lieu, jamais à la main : une
 * étape sans épisode du même nom reste sans lien plutôt que rattachée de force.
 *
 * Coordonnées en degrés décimaux **signés**, la convention d'OpenStreetMap, de Leaflet
 * et du GeoJSON : positif vers l'est, négatif vers l'ouest. Le fichier déclarait
 * auparavant « positif = ouest », ce qui plaçait Adiaké — la seule étape à l'est du
 * méridien — dans l'océan. Les valeurs ci-dessous sont les positions réelles des
 * villes, à deux décimales près.
 */

export interface Destination {
  slug: string
  nom: string
  /** Latitude nord, en degrés décimaux. */
  lat: number
  /** Longitude est, en degrés décimaux (négative à l'ouest). */
  lng: number
  /** Épisode de la saison portant le même lieu, s'il existe. */
  episodeSlug?: string
  /** Carnet téléchargeable de l'épisode, s'il existe. */
  guide?: string
}

/**
 * Positions des étapes, en degrés décimaux **signés** (positif = est, négatif =
 * ouest), la convention d'OpenStreetMap, de Leaflet et du GeoJSON.
 *
 * Toutes les étapes sont à l'ouest du méridien — la frontière orientale du pays
 * s'arrête vers 2,5 °O. Adiaké est la plus orientale (3,3 °O) : notée « 3.3 » dans
 * une ancienne convention « positif = ouest », elle avait été placée de l'autre côté
 * du méridien, donc hors du pays. Deux décimales suffisent au placement d'une ville
 * sur une carte nationale (≈ 1 km) ; elles ne prétendent pas localiser un point
 * précis dans la ville.
 */
const COORDONNEES: Record<string, { lat: number; lng: number }> = {
  'Bouaké': { lat: 7.69, lng: -5.03 },
  'Sassandra': { lat: 4.95, lng: -6.09 },
  'Jacqueville': { lat: 5.2, lng: -4.42 },
  'Taï': { lat: 5.87, lng: -7.45 },
  'Tiassalé': { lat: 5.9, lng: -4.8 },
  'Adiaké': { lat: 5.29, lng: -3.3 },
}

/** « N'Zi/Bouaké » du CDC se lit comme l'étape de Bouaké. */
const ALIAS: Record<string, string> = {
  "N'Zi/Bouaké": 'Bouaké',
}

/**
 * Les étapes, dans l'ordre de la saison — celui du `numero` des épisodes. C'est cet
 * ordre que la carte relie : il décrit la progression de la saison, pas une date de
 * visite, qu'aucune donnée ne fournit.
 */
export const DESTINATIONS: Destination[] = [
  "N'Zi/Bouaké",
  'Sassandra',
  'Jacqueville',
  'Taï',
  'Tiassalé',
  'Adiaké',
].map((nom) => {
  const lieu = ALIAS[nom] ?? nom
  const episode = EPISODES.find((item) => item.lieu === lieu)
  const coordonnees = COORDONNEES[lieu]
  return {
    slug: episode?.slug ?? `destination-${lieu.toLowerCase()}`,
    nom,
    lat: coordonnees?.lat ?? 0,
    lng: coordonnees?.lng ?? 0,
    episodeSlug: episode?.slug,
    guide: episode?.guide,
  }
})

/** Zone couverte par les étapes, en degrés signés, pour cadrer la carte. */
export const CADRE_CARTE = { nord: 10.6, sud: 4.3, ouest: -8.6, est: 2.4 }
