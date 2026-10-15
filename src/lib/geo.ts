import coteIvoire from '@/data/geo/cote-ivoire.json'

/**
 * Frontières de la Côte d'Ivoire, en vecteur.
 *
 * La géométrie vient de Natural Earth 10m (domaine public), arrondie à trois
 * décimales — environ 100 m, très au-delà de ce qu'un écran montre à l'échelle du
 * pays. Tracée par Leaflet, elle reste **nette à tous les niveaux de zoom** : une
 * image de tuile, elle, pique du net au flou dès que l'écran est haute densité. C'est
 * tout l'enjeu d'un fond vectoriel.
 *
 * Une frontière réelle plutôt qu'une silhouette approximative : une forme inventée
 * serait une faute, pas un raccourci.
 */

export interface GeometriePays {
  type: 'Feature'
  properties: { nom: string; iso: string; source: string }
  geometry: {
    type: 'MultiPolygon'
    coordinates: number[][][][]
  }
}

export const COTE_DIVOIRE = coteIvoire as unknown as GeometriePays

/** Bornes du pays, en degrés. */
function bornesDuPays(): { nord: number; sud: number; est: number; ouest: number } {
  let nord = -90
  let sud = 90
  let est = -180
  let ouest = 180

  for (const polygone of COTE_DIVOIRE.geometry.coordinates) {
    for (const anneau of polygone) {
      for (const [lng, lat] of anneau) {
        if (lat > nord) nord = lat
        if (lat < sud) sud = lat
        if (lng > est) est = lng
        if (lng < ouest) ouest = lng
      }
    }
  }

  return { nord, sud, est, ouest }
}

export const BORNES_PAYS = bornesDuPays()

/**
 * Cadre que la carte autorise : le pays plus une marge.
 *
 * Sans cette limite, un visiteur curieux dérive sur l'Atlantique ou sur le Burkina et
 * ne retrouve plus les étapes.
 */
export const CADRE_CARTE = {
  nord: BORNES_PAYS.nord + 2.2,
  sud: BORNES_PAYS.sud - 2.2,
  est: BORNES_PAYS.est + 2.2,
  ouest: BORNES_PAYS.ouest - 2.2,
}
