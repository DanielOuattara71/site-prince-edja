import { CATEGORIES_JOURNAL } from './content'
import { CATEGORIES_SHOP } from './shop'

/**
 * Catégories du site, **telles que l'admin les définit** (Boutique › Catégories, trois familles).
 *
 * Règle du client (06/11/2026) : les catégories affichées sur le site public, et donc ses filtres
 * (Histoires, Journal, EDJA Shop), sont celles que l'admin crée. Aucune page n'en écrit en dur.
 *
 * Aujourd'hui, ce fichier reprend les données de départ de l'admin (mêmes noms, même ordre). Au
 * branchement sur l'API (mission 3, `GET /public/api/v1/categories?famille=`), seul ce fichier
 * change : les pages lisent `categoriesAffichees` (`src/lib/categories.ts`).
 */
export type FamilleCategorie = 'article' | 'projet' | 'produit'

export interface CategorieSite {
  famille: FamilleCategorie
  nom: string
  /** Masquée dans l'admin : absente du site, même si des contenus la portent. */
  visible: boolean
}

const depuis = (famille: FamilleCategorie, noms: readonly string[]): CategorieSite[] =>
  noms.map((nom) => ({ famille, nom, visible: true }))

export const CATEGORIES: CategorieSite[] = [
  ...depuis('article', CATEGORIES_JOURNAL),
  ...depuis('produit', CATEGORIES_SHOP),
  // Décision du client : X'PLORE et les documentaires → Film, Taste & Travel → Tourisme,
  // Archive d'Afrique → Patrimoine.
  ...depuis('projet', ['Film', 'Tourisme', 'Patrimoine']),
]
