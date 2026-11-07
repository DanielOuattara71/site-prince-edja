import { LIVRES_MOCK } from '@/data/livres'
import { PIECES } from '@/data/shop'
import { categoriesAffichees, slugCategorie } from '@/lib/categories'
import type { Bijou } from '@/types'

/**
 * Accès unique aux produits de la boutique (SCHEMAS § 12.2, mission 2).
 *
 * Aujourd'hui : filtre, trie et découpe les données locales (bijoux de `PIECES`, livres de
 * `LIVRES_MOCK`). Demain (mission 3, LIAISON partie C) : seul le corps de `obtenirProduits`
 * changera pour appeler `GET /public/api/v1/boutique/produits` ; la forme de la réponse est déjà
 * celle de l'API : `{ items, page, pageSize, total, totalPages, categories }`.
 *
 * Règles : 12 par page par défaut, jamais plus de 48 ; page hors limite → dernière page ; tri
 * stable (départage par identifiant) ; produits « sur demande » toujours en dernier dans les tris
 * par prix ; effectifs par catégorie calculés sur le catalogue complet, catégories vides absentes.
 */

export type TypeProduit = 'bijou' | 'livre'
export const TRIS = ['nouveautes', 'nom', 'prix-croissant', 'prix-decroissant'] as const
export type Tri = (typeof TRIS)[number]

export const TAILLE_PAGE = 12
export const TAILLE_PAGE_LARGE = 24
export const TAILLE_PAGE_MAX = 48

export interface ProduitCatalogue {
  type: TypeProduit
  /** Identifiant stable : le slug. Sert au départage des tris. */
  id: string
  produit: Bijou
  /** Rang dans les données : l'ordre « nouveautés » tant qu'aucune date de publication n'existe. */
  rang: number
}

export interface CategorieCompte {
  slug: string
  nom: string
  compte: number
}

export interface DemandeProduits {
  type?: TypeProduit | null
  categorie?: string | null
  disponible?: boolean
  createur?: string | null
  q?: string | null
  tri?: Tri
  page?: number
  pageSize?: number
}

export interface PageProduits {
  items: ProduitCatalogue[]
  page: number
  pageSize: number
  total: number
  totalPages: number
  categories: CategorieCompte[]
  createurs: { slug: string; nom: string }[]
}

/** Adresse d'un libellé : minuscules, sans accents ni ponctuation (« Bijoux & accessoires » → « bijoux-accessoires »). */
export function slugifier(texte: string): string {
  return slugCategorie(texte)
}

/** Le catalogue complet, bijoux puis livres, dans l'ordre des données. */
export const CATALOGUE: ProduitCatalogue[] = [
  ...PIECES.map((produit) => ({ type: 'bijou' as const, produit })),
  ...LIVRES_MOCK.map((produit) => ({ type: 'livre' as const, produit })),
].map((p, rang) => ({ ...p, id: p.produit.slug, rang }))

/** Prix affiché, ou `null` = « sur demande » (prix non confirmé ou absent). */
export function prixAffiche(p: ProduitCatalogue): number | null {
  const commerce = p.produit.commerce
  return commerce?.prixConfirme && commerce.prix != null ? commerce.prix : null
}

const categorieDe = (p: ProduitCatalogue) => p.produit.commerce?.categorie ?? ''
const createurDe = (p: ProduitCatalogue) => p.produit.commerce?.createur?.nom ?? null
const parId = (a: ProduitCatalogue, b: ProduitCatalogue) => a.id.localeCompare(b.id)

function comparer(tri: Tri): (a: ProduitCatalogue, b: ProduitCatalogue) => number {
  switch (tri) {
    case 'nom':
      return (a, b) => a.produit.nom.localeCompare(b.produit.nom, 'fr') || parId(a, b)
    case 'prix-croissant':
    case 'prix-decroissant': {
      const sens = tri === 'prix-croissant' ? 1 : -1
      return (a, b) => {
        const pa = prixAffiche(a)
        const pb = prixAffiche(b)
        // « Sur demande » toujours en dernier, quel que soit le sens.
        if (pa === null && pb === null) return parId(a, b)
        if (pa === null) return 1
        if (pb === null) return -1
        return (pa - pb) * sens || parId(a, b)
      }
    }
    case 'nouveautes':
    default:
      // Sans date de publication dans les données locales, l'ordre des données fait foi.
      return (a, b) => a.rang - b.rang || parId(a, b)
  }
}

/** Taille de page bornée : 1 à 48, 12 par défaut. */
export function bornerTaille(taille: number | undefined): number {
  if (!taille || !Number.isInteger(taille) || taille < 1) return TAILLE_PAGE
  return Math.min(taille, TAILLE_PAGE_MAX)
}

export function obtenirProduits(
  demande: DemandeProduits = {},
  catalogue: readonly ProduitCatalogue[] = CATALOGUE,
): PageProduits {
  const pageSize = bornerTaille(demande.pageSize)
  const q = demande.q?.trim().toLowerCase() ?? ''
  const filtres = catalogue.filter((p) => {
    if (demande.type && p.type !== demande.type) return false
    if (demande.categorie && slugifier(categorieDe(p)) !== demande.categorie) return false
    if (demande.disponible && !p.produit.commerce?.disponible) return false
    if (demande.createur && slugifier(createurDe(p) ?? '') !== demande.createur) return false
    if (q) {
      const cible = `${p.produit.nom} ${p.produit.culture} ${p.produit.histoire}`.toLowerCase()
      if (!cible.includes(q)) return false
    }
    return true
  })
  const tries = [...filtres].sort(comparer(demande.tri ?? 'nouveautes'))
  const total = tries.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const demandee = demande.page && Number.isInteger(demande.page) && demande.page >= 1 ? demande.page : 1
  const page = Math.min(demandee, totalPages)

  // Effectifs sur le catalogue complet (même filtré).
  // Catégories de produits de l'admin (règle du client) : visibles, non vides, dans son ordre.
  const categories = categoriesAffichees('produit', catalogue.map(categorieDe))
  const createurs = [
    ...new Set(catalogue.map(createurDe).filter((nom): nom is string => Boolean(nom))),
  ].map((nom) => ({ slug: slugifier(nom), nom }))

  return {
    items: tries.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageSize,
    total,
    totalPages,
    categories,
    createurs,
  }
}

/** Numéro de page lu dans l'adresse : entier ≥ 1 ; absent ou invalide → 1. */
export function lirePage(valeur: string | null | undefined): number {
  if (valeur === null || valeur === undefined || !/^\d+$/.test(valeur)) return 1
  const n = Number(valeur)
  return n >= 1 ? n : 1
}

/**
 * Pages à afficher dans la pagination : la première, la dernière, la courante et deux de chaque
 * côté, des points de suspension entre. `1 … 4 5 [6] 7 8 … 20`.
 */
export function fenetrePages(page: number, totalPages: number): (number | 'ellipse')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const debut = Math.max(2, page - 2)
  const fin = Math.min(totalPages - 1, page + 2)
  return [
    1,
    ...(debut > 2 ? ['ellipse' as const] : []),
    ...Array.from({ length: fin - debut + 1 }, (_, i) => debut + i),
    ...(fin < totalPages - 1 ? ['ellipse' as const] : []),
    totalPages,
  ]
}
