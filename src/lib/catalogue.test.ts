import { describe, expect, it } from 'vitest'
import type { Bijou } from '@/types'
import {
  CATALOGUE,
  fenetrePages,
  lirePage,
  obtenirProduits,
  type ProduitCatalogue,
  type TypeProduit,
} from '@/lib/catalogue'

/** Mission 2 : pagination et tri de la boutique (SCHEMAS § 12.2, RG-34). */

/** Un catalogue d'essai de `n` produits ; `prix` pour fixer un prix confirmé. */
function catalogue(
  n: number,
  options: { type?: TypeProduit; prix?: (i: number) => number | null } = {},
): ProduitCatalogue[] {
  return Array.from({ length: n }, (_, i) => {
    const prix = options.prix?.(i) ?? null
    const produit: Bijou = {
      slug: `essai-${String(i).padStart(2, '0')}`,
      numero: String(i),
      culture: '',
      nom: `Essai ${String.fromCharCode(90 - (i % 26))}`,
      histoire: '',
      image: '',
      tags: { format: 'objet', projet: 'TRIBE' },
      commerce: {
        reference: '',
        prix,
        prixConfirme: prix !== null,
        matieres: [],
        tailles: [],
        edition: null,
        atelier: null,
        village: null,
        poids: null,
        galerie: [],
        disponible: i % 2 === 0,
        createur: null,
        categorie: i % 3 === 0 ? 'Mode' : 'Bijoux & accessoires',
      },
    }
    return { type: options.type ?? 'bijou', id: produit.slug, produit, rang: i }
  })
}

describe('obtenirProduits : découpage', () => {
  it('liste vide : une page, aucun élément', () => {
    const r = obtenirProduits({}, [])
    expect(r).toMatchObject({ items: [], page: 1, total: 0, totalPages: 1, pageSize: 12 })
  })

  it('un seul produit : une page', () => {
    const r = obtenirProduits({}, catalogue(1))
    expect(r.items).toHaveLength(1)
    expect(r.totalPages).toBe(1)
  })

  it('exactement 12 produits : une page ; 13 produits : deux pages, 1 sur la seconde', () => {
    expect(obtenirProduits({}, catalogue(12)).totalPages).toBe(1)
    const treize = catalogue(13)
    expect(obtenirProduits({}, treize).totalPages).toBe(2)
    const seconde = obtenirProduits({ page: 2 }, treize)
    expect(seconde.items).toHaveLength(1)
    expect(seconde.items[0]?.id).toBe('essai-12')
  })

  it('page hors limite : la dernière page', () => {
    const r = obtenirProduits({ page: 99 }, catalogue(13))
    expect(r.page).toBe(2)
    expect(r.items).toHaveLength(1)
  })

  it('page invalide (0, négative, décimale) : la première', () => {
    for (const page of [0, -3, 1.5]) expect(obtenirProduits({ page }, catalogue(13)).page).toBe(1)
  })

  it('jamais plus de 48 par page', () => {
    const r = obtenirProduits({ pageSize: 500 }, catalogue(60))
    expect(r.pageSize).toBe(48)
    expect(r.items).toHaveLength(48)
  })
})

describe('obtenirProduits : tris et filtres', () => {
  it('prix croissant et décroissant : « sur demande » toujours en dernier', () => {
    // Prix confirmés pour les quatre premiers, « sur demande » pour les autres.
    const c = catalogue(6, { prix: (i) => (i < 4 ? [3000, 1000, 2000, 1000][i] ?? null : null) })
    const croissant = obtenirProduits({ tri: 'prix-croissant' }, c).items.map((p) => p.id)
    expect(croissant).toEqual(['essai-01', 'essai-03', 'essai-02', 'essai-00', 'essai-04', 'essai-05'])
    const decroissant = obtenirProduits({ tri: 'prix-decroissant' }, c).items.map((p) => p.id)
    expect(decroissant).toEqual(['essai-00', 'essai-02', 'essai-01', 'essai-03', 'essai-04', 'essai-05'])
  })

  it('tri stable : à égalité, l’identifiant départage, d’un appel à l’autre', () => {
    const c = [...catalogue(8)].reverse()
    const a = obtenirProduits({ tri: 'prix-croissant' }, c).items.map((p) => p.id)
    const b = obtenirProduits({ tri: 'prix-croissant' }, [...c].reverse()).items.map((p) => p.id)
    expect(a).toEqual(b)
    expect(a).toEqual([...a].sort())
  })

  it('filtres : type, catégorie (adresse), disponibilité', () => {
    const c = [...catalogue(6), ...catalogue(2, { type: 'livre' }).map((p) => ({ ...p, id: `l-${p.id}` }))]
    expect(obtenirProduits({ type: 'livre' }, c).total).toBe(2)
    expect(obtenirProduits({ categorie: 'mode' }, c).total).toBe(3)
    expect(obtenirProduits({ disponible: true }, c).total).toBe(4)
  })

  it('effectifs par catégorie calculés sur le catalogue complet, catégories vides absentes', () => {
    const r = obtenirProduits({ type: 'livre', page: 1 }, catalogue(6))
    expect(r.total).toBe(0)
    expect(r.categories).toEqual([
      { slug: 'bijoux-accessoires', nom: 'Bijoux & accessoires', compte: 4 },
      { slug: 'mode', nom: 'Mode', compte: 2 },
    ])
  })

  it('le catalogue réel réunit bijoux et livres', () => {
    expect(CATALOGUE.some((p) => p.type === 'bijou')).toBe(true)
    expect(CATALOGUE.some((p) => p.type === 'livre')).toBe(true)
    expect(obtenirProduits({ type: 'livre' }).categories.map((c) => c.slug)).toContain(
      'livres-photographie',
    )
  })
})

describe('adresse et fenêtre de pagination', () => {
  it('lirePage : absent ou invalide → 1', () => {
    expect(lirePage(null)).toBe(1)
    expect(lirePage('abc')).toBe(1)
    expect(lirePage('-2')).toBe(1)
    expect(lirePage('2.5')).toBe(1)
    expect(lirePage('0')).toBe(1)
    expect(lirePage('3')).toBe(3)
  })

  it('fenêtre : 1 … 4 5 [6] 7 8 … 20', () => {
    expect(fenetrePages(6, 20)).toEqual([1, 'ellipse', 4, 5, 6, 7, 8, 'ellipse', 20])
    expect(fenetrePages(1, 5)).toEqual([1, 2, 3, 4, 5])
    expect(fenetrePages(2, 20)).toEqual([1, 2, 3, 4, 'ellipse', 20])
  })
})
