import { describe, expect, it } from 'vitest'
import {
  articleSchema,
  entreeArticleSchema,
  modificationArticleSchema,
} from '@/api/schemas/articles'
import { compteSchema } from '@/api/schemas/communs'
import { corpsRicheSchema, mediasDuCorps } from '@/api/schemas/corps-riche'
import { mediaSchema } from '@/api/schemas/medias'
import { tagSchema } from '@/api/schemas/tags'
import {
  articlesInitiaux,
  comptesInitiaux,
  IDS_EXEMPLE,
  mediasInitiaux,
  tagsInitiaux,
} from '@/api/mocks/donnees'

describe('jeux d’exemple conformes au contrat (D-14)', () => {
  it('chaque fixture passe son schéma de lecture', () => {
    for (const { compte } of comptesInitiaux()) expect(compteSchema.parse(compte)).toBeTruthy()
    for (const article of articlesInitiaux()) expect(articleSchema.parse(article)).toBeTruthy()
    for (const media of mediasInitiaux()) expect(mediaSchema.parse(media)).toBeTruthy()
    for (const tag of tagsInitiaux()) expect(tagSchema.parse(tag)).toBeTruthy()
  })

  it('chaque titre d’exemple est marqué « Exemple »', () => {
    for (const article of articlesInitiaux()) {
      expect(article.traductions.fr?.titre).toMatch(/^Exemple/)
    }
  })
})

describe('schémas d’écriture stricts (D-22)', () => {
  it('refusent un champ inconnu ou en lecture seule', () => {
    const base = { categorie: 'Voyage', traductions: { fr: { titre: 'Exemple' } } }
    expect(entreeArticleSchema.safeParse(base).success).toBe(true)
    expect(entreeArticleSchema.safeParse({ ...base, inconnu: 1 }).success).toBe(false)
    expect(entreeArticleSchema.safeParse({ ...base, champsAFournir: [] }).success).toBe(false)
    expect(modificationArticleSchema.safeParse({ statut: 'publie', version: 1 }).success).toBe(
      false,
    )
  })

  it('exigent la version sur une modification', () => {
    expect(modificationArticleSchema.safeParse({ aLaUne: true }).success).toBe(false)
    expect(modificationArticleSchema.safeParse({ aLaUne: true, version: 2 }).success).toBe(true)
  })
})

describe('corps riche : liste blanche (§ 9.1)', () => {
  const doc = (content: unknown[]) => ({ type: 'doc', content })

  it('accepte titres 2 à 4, listes, citation, lien sûr et image par identifiant', () => {
    const corps = doc([
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Titre' }] },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Lien',
            marks: [{ type: 'link', attrs: { href: 'https://exemple.test' } }],
          },
        ],
      },
      { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph' }] }] },
      { type: 'blockquote', content: [{ type: 'paragraph' }] },
      { type: 'image', attrs: { mediaId: IDS_EXEMPLE.mediaComplet } },
    ])
    const lu = corpsRicheSchema.parse(corps)
    expect(mediasDuCorps(lu)).toEqual([IDS_EXEMPLE.mediaComplet])
  })

  it.each([
    ['un titre de niveau 1', { type: 'heading', attrs: { level: 1 } }],
    ['un bloc de code', { type: 'codeBlock' }],
    ['une image par adresse', { type: 'image', attrs: { src: 'https://exemple.test/a.jpg' } }],
    [
      'un lien javascript:',
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'x',
            marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
          },
        ],
      },
    ],
    [
      'une marque souligné',
      { type: 'paragraph', content: [{ type: 'text', text: 'x', marks: [{ type: 'underline' }] }] },
    ],
  ])('refuse %s', (_cas, noeud) => {
    expect(corpsRicheSchema.safeParse(doc([noeud])).success).toBe(false)
  })
})
