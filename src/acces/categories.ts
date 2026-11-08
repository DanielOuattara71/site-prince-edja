/**
 * Couche d'accès — catégories des trois familles (PLAN-DE-LANCEMENT S1, S2 ; règle du client du
 * 06/11/2026 : les filtres publics sont les catégories de l'admin).
 *
 * Mode API : `GET /public/api/v1/categories?famille=article|projet|produit`, qui ne renvoie que
 * les catégories visibles et non vides ; sinon `src/data/categories.ts` (catégories de départ).
 * Le tri et le filtrage sont dans `@/lib/categories`.
 */
import { CATEGORIES as CATEGORIES_DEPART, type CategorieSite } from '@/data/categories'
import { versCategories, type CategoriePublique } from './adaptateurs'
import { lireGenere, SOURCE_API } from './source'

export type { FamilleCategorie, CategorieSite } from '@/data/categories'

export const CATEGORIES: CategorieSite[] = SOURCE_API
  ? (['article', 'produit', 'projet'] as const).flatMap((famille) =>
      versCategories(famille, lireGenere<CategoriePublique[]>(`categories-${famille}`)),
    )
  : CATEGORIES_DEPART
