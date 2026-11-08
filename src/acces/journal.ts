/**
 * Couche d'accès — Journal (PLAN-DE-LANCEMENT S1, S2).
 *
 * Mode API (`PUBLIC_DATA_SOURCE=api`) : `GET /public/api/v1/contenus/articles`, chargé à la
 * construction ; sinon `ARTICLES` de `src/data/content.ts`. Les catégories du Journal passent par
 * `@/acces/categories`.
 */
import { ARTICLES as ARTICLES_DEPART } from '@/data/content'
import type { Article } from '@/types'
import { versArticle, type ArticlePublic } from './adaptateurs'
import { lireGenere, SOURCE_API } from './source'

export const ARTICLES: Article[] = SOURCE_API
  ? lireGenere<ArticlePublic[]>('articles').map(versArticle)
  : ARTICLES_DEPART
