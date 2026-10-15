import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  coordonneeValide,
  segmentsDuParcours,
  tailleCacheTracés,
  tracerParcours,
  tracerSegment,
  pointsDuTracé,
  viderCacheTracés,
  type PointParcours,
} from './routage'

/** Les six étapes réelles, Côte d'Ivoire. */
const ETAPES: PointParcours[] = [
  { lat: 7.69, lng: -5.03 }, // Bouaké
  { lat: 4.95, lng: -6.09 }, // Sassandra
  { lat: 5.2, lng: -4.42 }, // Jacqueville
  { lat: 5.87, lng: -7.45 }, // Taï
  { lat: 5.9, lng: -4.8 }, // Tiassalé
  { lat: 5.29, lng: -3.3 }, // Adiaké — l'étape la plus orientale, encore à l'ouest
]

/** Réponse OSRM valide : une géométrie de deux points. */
function reponseOsm(coordinates: [number, number][]) {
  return {
    ok: true,
    json: async () => ({ routes: [{ geometry: { coordinates } }] }),
  } as unknown as Response
}

describe('coordonneeValide', () => {
  it('accepte une position réelle en Côte d’Ivoire', () => {
    expect(coordonneeValide({ lat: 7.69, lng: -5.03 })).toBe(true)
  })

  it('accepte une longitude ouest, négative', () => {
    // Toutes les étapes ivoiriennes sont à l'ouest : la frontière est du pays
    // s'arrête vers 2,5 °O. Une valeur positive placerait la ville au Ghana.
    expect(coordonneeValide({ lat: 5.29, lng: -3.3 })).toBe(true)
  })

  it('refuse une latitude hors bornes', () => {
    expect(coordonneeValide({ lat: 91, lng: -5 })).toBe(false)
    expect(coordonneeValide({ lat: -91, lng: -5 })).toBe(false)
  })

  it('refuse une longitude hors bornes', () => {
    expect(coordonneeValide({ lat: 7, lng: 181 })).toBe(false)
    expect(coordonneeValide({ lat: 7, lng: -181 })).toBe(false)
  })

  it('refuse une coordonnée non numérique', () => {
    expect(coordonneeValide({ lat: Number.NaN, lng: -5 })).toBe(false)
  })
})

describe('segmentsDuParcours', () => {
  it('relie les étapes dans l’ordre du parcours', () => {
    const segments = segmentsDuParcours(ETAPES)
    expect(segments).toHaveLength(5)
    expect(segments[0].de).toEqual(ETAPES[0])
    expect(segments[0].vers).toEqual(ETAPES[1])
    expect(segments[4].de).toEqual(ETAPES[4])
    expect(segments[4].vers).toEqual(ETAPES[5])
  })

  it('garde Adiaké en Côte d’Ivoire, à l’ouest du méridien', () => {
    // Régression : Adiaké avait été notée « 3.3 » dans une convention « positif =
    // ouest », ce qui la plaçait hors du pays. La frontière est s'arrête à -2,5°.
    const segments = segmentsDuParcours(ETAPES)
    expect(segments[4].vers.lng).toBe(-3.3)
    expect(segments[4].vers.lng).toBeLessThan(-2.506)
  })

  it('écarte un point invalide sans casser l’ordre des autres', () => {
    const avecErreur = [
      ETAPES[0],
      { lat: 999, lng: 0 },
      ETAPES[1],
      ETAPES[2],
    ]
    const segments = segmentsDuParcours(avecErreur)
    expect(segments).toHaveLength(2)
    expect(segments[0].vers).toEqual(ETAPES[1])
    expect(segments[1].vers).toEqual(ETAPES[2])
  })

  it('ne trace pas de ligne entre deux étapes au même endroit', () => {
    const double = [ETAPES[0], { ...ETAPES[0] }, ETAPES[1]]
    expect(segmentsDuParcours(double)).toHaveLength(1)
  })

  it('renvoie une liste vide avec une seule étape', () => {
    expect(segmentsDuParcours([ETAPES[0]])).toEqual([])
  })

  it('renvoie une liste vide sans aucune étape', () => {
    expect(segmentsDuParcours([])).toEqual([])
  })
})

describe('tracerSegment', () => {
  beforeEach(viderCacheTracés)

  it('utilise la géométrie renvoyée par OSRM', async () => {
    const fetchService = vi.fn().mockResolvedValue(
      reponseOsm([
        [-5.03, 7.69],
        [-5.5, 6.2],
        [-6.09, 4.95],
      ]),
    )

    const tracé = await tracerSegment({ de: ETAPES[0], vers: ETAPES[1] }, fetchService)

    expect(tracé.calcule).toBe(true)
    expect(tracé.coordinates).toHaveLength(3)
    expect(fetchService).toHaveBeenCalledOnce()
    expect(fetchService.mock.calls[0][0]).toContain('-5.03,7.69;-6.09,4.95')
  })

  it('retombe sur la ligne droite quand OSRM répond mal', async () => {
    const fetchService = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ routes: [] }),
    } as unknown as Response)

    const tracé = await tracerSegment({ de: ETAPES[0], vers: ETAPES[1] }, fetchService)

    expect(tracé.calcule).toBe(false)
    expect(tracé.coordinates).toEqual([
      [-5.03, 7.69],
      [-6.09, 4.95],
    ])
  })

  it('retombe sur la ligne droite quand le réseau tombe', async () => {
    const fetchService = vi.fn().mockRejectedValue(new Error('réseau'))

    const tracé = await tracerSegment({ de: ETAPES[0], vers: ETAPES[1] }, fetchService)

    expect(tracé.calcule).toBe(false)
    expect(tracé.coordinates).toEqual([
      [-5.03, 7.69],
      [-6.09, 4.95],
    ])
  })

  it('retombe sur la ligne droite si la réponse est vide', async () => {
    const fetchService = vi.fn().mockResolvedValue(
      reponseOsm([[-5.03, 7.69]]),
    )

    const tracé = await tracerSegment({ de: ETAPES[0], vers: ETAPES[1] }, fetchService)

    expect(tracé.calcule).toBe(false)
  })

  it('ne redemande pas un tracé déjà connu', async () => {
    const fetchService = vi.fn().mockResolvedValue(
      reponseOsm([
        [-5.03, 7.69],
        [-6.09, 4.95],
      ]),
    )
    const segment = { de: ETAPES[0], vers: ETAPES[1] }

    await tracerSegment(segment, fetchService)
    await tracerSegment(segment, fetchService)

    expect(fetchService).toHaveBeenCalledOnce()
    expect(tailleCacheTracés()).toBe(1)
  })
})

describe('tracerParcours', () => {
  beforeEach(viderCacheTracés)
  afterEach(() => vi.restoreAllMocks())

  it('produit un tracé par segment, dans l’ordre', async () => {
    const fetchService = vi.fn().mockResolvedValue(
      reponseOsm([
        [0, 0],
        [1, 1],
      ]),
    )

    const tracés = await tracerParcours(ETAPES, fetchService)

    expect(tracés).toHaveLength(5)
    expect(tracés.every((tracé) => tracé.calcule)).toBe(true)
    expect(fetchService).toHaveBeenCalledTimes(5)
  })

  it('mélange tracés calculés et lignes droites sans rien perdre', async () => {
    const fetchService = vi
      .fn()
      .mockResolvedValueOnce(reponseOsm([[0, 0], [1, 1]]))
      .mockRejectedValueOnce(new Error('panne'))

    const tracés = await tracerParcours(ETAPES.slice(0, 3), fetchService)

    expect(tracés).toHaveLength(2)
    expect(tracés[0].calcule).toBe(true)
    expect(tracés[1].calcule).toBe(false)
  })

  it('ne produit aucun tracé sans étape', async () => {
    expect(await tracerParcours([], vi.fn())).toEqual([])
  })
})

describe('pointsDuTracé', () => {
  it('réunit tous les points du parcours pour cadrer la carte', () => {
    const tracés = [
      { coordinates: [[0, 0], [1, 1]] as [number, number][], calcule: true },
      { coordinates: [[2, 2], [3, 3]] as [number, number][], calcule: false },
    ]
    expect(pointsDuTracé(tracés)).toHaveLength(4)
    expect(pointsDuTracé(tracés)[3]).toEqual({ lat: 3, lng: 3 })
  })
})
