/**
 * Parcours géographique des étapes, et son tracé.
 *
 * Deux choses sont séparées ici, et la seconde ne doit jamais se faire passer pour la
 * première :
 *
 * - le **parcours** : l'ordre des étapes, fourni par les données. Il est certain.
 * - le **tracé** : la ligne qui les relie. Sans traces GPS, personne ne sait par où le
 *   voyage est passé. OSRM calcule donc la route la plus courte entre deux étapes :
 *   c'est une reconstruction, pas une preuve. L'interface le dit explicitement.
 *
 * OSRM est un service public de démonstration : pas de SLA, pas d'usage commercial.
 * S'il est indisponible, chaque segment retombe sur la ligne droite — la carte montre
 * toujours le parcours, jamais un vide.
 */

export interface PointParcours {
  lat: number
  lng: number
}

/** Un segment entre deux étapes, dans l'ordre du parcours. */
export interface SegmentParcours {
  de: PointParcours
  vers: PointParcours
}

/** Tracé d'un segment : la géométrie renvoyée par OSRM, ou la ligne droite de repli. */
export interface TracerSegment {
  coordinates: [number, number][]
  /** true = OSRM a répondu ; false = ligne droite de repli. */
  calcule: boolean
}

/** Service de routage OSRM. Paramétrable pour les tests. */
export const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving'

/** Bornes géographiques réelles : une coordonnée hors bornes est une erreur de donnée. */
export function coordonneeValide(point: PointParcours): boolean {
  const { lat, lng } = point
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
}

/**
 * Segments du parcours, dans l'ordre.
 *
 * Deux garde-fous : les points invalides sont écartés (une coordonnée fausse ne doit
 * pas produire un marqueur planté au milieu de l'océan), et deux étapes consécutives
 * au même endroit ne forment pas de segment — une ligne de longueur nulle.
 */
export function segmentsDuParcours(points: PointParcours[]): SegmentParcours[] {
  const valides = points.filter(coordonneeValide)
  const segments: SegmentParcours[] = []

  for (let index = 1; index < valides.length; index += 1) {
    const de = valides[index - 1]
    const vers = valides[index]
    if (de.lat === vers.lat && de.lng === vers.lng) continue
    segments.push({ de, vers })
  }

  return segments
}

/** Clé de cache d'un segment. L'ordre des deux points compte : aller ≠ retour. */
function cleSegment({ de, vers }: SegmentParcours): string {
  return `${de.lng},${de.lat}>${vers.lng},${vers.lat}`
}

/**
 * Cache des tracés, en mémoire et pour la session.
 *
 * Les cinq segments d'une saison ne changent pas d'une visite à l'autre : les
 * redemander à chaque rendu serait interroger OSRM pour rien, ce que sa politique
 * d'utilisation déconseille.
 */
const cache = new Map<string, [number, number][]>()

/** Vide le cache. Exposé pour les tests, sans effet sur le rendu. */
export function viderCacheTracés(): void {
  cache.clear()
}

/** Nombre de tracés actuellement mémorisés. */
export function tailleCacheTracés(): number {
  return cache.size
}

/** Ligne droite entre deux points, au format des géométries OSRM. */
function ligneDroite({ de, vers }: SegmentParcours): [number, number][] {
  return [
    [de.lng, de.lat],
    [vers.lng, vers.lat],
  ]
}

/**
 * Tracé d'un segment : OSRM si possible, ligne droite sinon.
 *
 * @param fetchService Injection pour les tests ; `fetch` global par défaut.
 */
export async function tracerSegment(
  segment: SegmentParcours,
  fetchService: typeof fetch = fetch,
): Promise<TracerSegment> {
  const cle = cleSegment(segment)
  const enCache = cache.get(cle)
  if (enCache) return { coordinates: enCache, calcule: true }

  try {
    const reponse = await fetchService(
      `${OSRM_URL}/${segment.de.lng},${segment.de.lat};${segment.vers.lng},${segment.vers.lat}?overview=full&geometries=geojson`,
    )
    if (!reponse.ok) return { coordinates: ligneDroite(segment), calcule: false }

    const corps = (await reponse.json()) as {
      routes?: { geometry?: { coordinates?: [number, number][] } }[]
    }
    const coordinates = corps.routes?.[0]?.geometry?.coordinates

    // Une réponse vide ou mal formée vaut un échec : mieux vaut la ligne droite,
    // honnête, qu'un tracé fantôme.
    if (!coordinates || coordinates.length < 2) {
      return { coordinates: ligneDroite(segment), calcule: false }
    }

    cache.set(cle, coordinates)
    return { coordinates, calcule: true }
  } catch {
    // Réseau coupé, service en panne, JSON illisible : le parcours reste lisible.
    return { coordinates: ligneDroite(segment), calcule: false }
  }
}

/** Tracés de tous les segments, dans l'ordre du parcours. */
export async function tracerParcours(
  points: PointParcours[],
  fetchService: typeof fetch = fetch,
): Promise<TracerSegment[]> {
  const segments = segmentsDuParcours(points)
  return Promise.all(segments.map((segment) => tracerSegment(segment, fetchService)))
}

/**
 * Tous les points du parcours, pour cadrer la carte.
 *
 * Union des géométries : une route peut sortir du rectangle des étapes, et la carte
 * doit montrer tout ce qu'elle dessine.
 */
export function pointsDuTracé(tracés: TracerSegment[]): PointParcours[] {
  const points: PointParcours[] = []
  for (const tracé of tracés) {
    for (const [lng, lat] of tracé.coordinates) points.push({ lat, lng })
  }
  return points
}
