import { describe, expect, it } from 'vitest'
import { EPISODES } from '@/data/content'
import { PIECES } from '@/data/shop'
import { DESTINATIONS } from '@/data/destinations'
import { descriptionDestination, descriptionEpisode, descriptionObjet } from '@/lib/descriptions'

/** Audit V2-10 : des descriptions utiles dans les résultats de recherche (≈ 110 à 200 caractères). */
const utile = (texte: string) => texte.length >= 100 && texte.length <= 220

describe('descriptions de référencement', () => {
  it('épisodes', () => {
    for (const episode of EPISODES) expect(utile(descriptionEpisode(episode)), episode.slug).toBe(true)
  })

  it('pièces de la boutique', () => {
    for (const piece of PIECES) expect(utile(descriptionObjet(piece)), piece.slug).toBe(true)
  })

  it('destinations, avec ou sans épisode — jamais de guide promis', () => {
    for (const destination of DESTINATIONS) {
      const episode = EPISODES.find((e) => e.slug === destination.episodeSlug)
      const texte = descriptionDestination(destination.nom, episode)
      expect(texte.length, destination.slug).toBeGreaterThanOrEqual(90)
      expect(texte).not.toMatch(/guide|carnet/i)
    }
  })
})
