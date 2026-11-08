/**
 * Couche d'accès — Edja Shop (PLAN-DE-LANCEMENT S1, S2).
 *
 * Mode API : `GET /public/api/v1/boutique/produits` puis la fiche de chaque produit, chargés à la
 * construction — les bijoux deviennent `BIJOUX`/`PIECES`, les livres `LIVRES`. Sinon :
 * `src/data/shop.ts`, `content.ts` (bijoux) et `livres.ts` (quatre livres de maquette, « (maquette) »
 * dans leur nom). La galerie éditoriale et les filtres restent ceux du site. La pagination et les
 * filtres du catalogue sont dans `@/lib/catalogue`, qui lit ce module.
 */
import { BIJOUX as BIJOUX_DEPART } from '@/data/content'
import { LIVRES_MOCK } from '@/data/livres'
import { PIECES as PIECES_DEPART } from '@/data/shop'
import type { Bijou } from '@/types'
import { versProduit, type ProduitPublic } from './adaptateurs'
import { lireGenere, SOURCE_API } from './source'

export { FILTRES_SHOP, GALERIE_SHOP } from '@/data/shop'

const PRODUITS = SOURCE_API ? lireGenere<ProduitPublic[]>('produits') : []
const BIJOUX_API = PRODUITS.filter((p) => p.type === 'bijou').map(versProduit)

/** Les bijoux. En mode API, ils portent déjà leurs données commerciales. */
export const BIJOUX: Bijou[] = SOURCE_API ? BIJOUX_API : BIJOUX_DEPART
/** Les bijoux enrichis de leurs données commerciales. */
export const PIECES: Bijou[] = SOURCE_API ? BIJOUX_API : PIECES_DEPART
/** Pièces disponibles à la demande. */
export const piecesDisponibles = PIECES.filter((piece) => piece.commerce?.disponible)
export const LIVRES: Bijou[] = SOURCE_API
  ? PRODUITS.filter((p) => p.type === 'livre').map(versProduit)
  : LIVRES_MOCK
