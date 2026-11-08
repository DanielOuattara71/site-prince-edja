/**
 * Couche d'accès — identité, navigation, lettre d'information (PLAN-DE-LANCEMENT, S1).
 *
 * Seul point de lecture de `src/data/site.ts`, `navigation.ts` et `newsletter.ts` pour le reste
 * du site. Source aujourd'hui : les fichiers de `src/data/` ; au branchement (S2, LIAISON § C.2) :
 * `GET /public/api/v1/site` (identité, navigation, textes d'interface, pages légales, langues
 * actives). Seul ce module changera : les pages n'importent jamais `@/data/*` (règle de lint).
 */
export { SITE, isDarkTop } from '@/data/site'
export {
  NAV_PRINCIPALE,
  CTA_PRINCIPAL,
  FOOTER_NAV,
  filDariane,
  ENTREES_404,
  LANGUES,
  PAGES_LEGALES,
} from '@/data/navigation'
export type {
  Libelle,
  LienNav,
  EntreeNav,
  BlocFooter,
  FragmentFil,
  PageLegale,
} from '@/data/navigation'
export { PROMESSE_NEWSLETTER, SEGMENTS_NEWSLETTER } from '@/data/newsletter'
export type { SegmentNewsletter } from '@/data/newsletter'
