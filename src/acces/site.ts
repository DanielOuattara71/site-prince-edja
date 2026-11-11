/**
 * Couche d'accès — identité, navigation, lettre d'information (PLAN-DE-LANCEMENT, S1).
 *
 * Seul point de lecture de `src/data/site.ts`, `navigation.ts` et `newsletter.ts` pour le reste
 * du site. Source aujourd'hui : les fichiers de `src/data/` ; au branchement (S2, LIAISON § C.2) :
 * `GET /public/api/v1/site` (identité, navigation, textes d'interface, langues actives).
 * Les pages légales restent servies par `src/data/navigation.ts` en données de départ ; en mode
 * API, la copie publiée sert de surcouche (titre, résumé, corps riche).
 */
import {
  NAV_PRINCIPALE,
  CTA_PRINCIPAL,
  FOOTER_NAV,
  filDariane,
  ENTREES_404,
  LANGUES,
  PAGES_LEGALES as PAGES_LEGALES_DEPART,
} from '@/data/navigation'
import type { PageLegale } from '@/data/navigation'
import { lireGenere, SOURCE_API } from './source'
import { versPageLegale, type PageLegalePublique } from './adaptateurs'
import type { CorpsDocument } from '@/lib/corpsRiche'

/** Pages légales : le squelette parcours/résumé (`sections`) reste la référence hors mode API ;
 *  en mode API, une page publiée porte son corps riche en plus (CorpsRiche). */
export interface PageLegaleAvecCorps extends PageLegale {
  corps: CorpsDocument | null
}

function construirePagesLegales(): PageLegaleAvecCorps[] {
  if (!SOURCE_API) return PAGES_LEGALES_DEPART.map((p) => ({ ...p, corps: null }))
  const api = lireGenere<PageLegalePublique[]>('pages-legales')
  const parCle = new Map(api.map((p) => [p.cle, p]))
  return PAGES_LEGALES_DEPART.map((p) => {
    const trouvee = parCle.get(p.chemin.slice(1))
    if (!trouvee) return { ...p, corps: null }
    const fusion = versPageLegale(trouvee)
    const corps = (trouvee.traduction?.corps ?? null) as CorpsDocument | null
    return {
      ...p,
      titre: fusion.titre,
      resume: fusion.resume,
      sections: corps?.content?.length ? [] : p.sections,
      corps,
    }
  })
}

export const PAGES_LEGALES: PageLegaleAvecCorps[] = construirePagesLegales()

export { SITE, isDarkTop } from '@/data/site'
export { NAV_PRINCIPALE, CTA_PRINCIPAL, FOOTER_NAV, filDariane, ENTREES_404, LANGUES }
export type { Libelle, LienNav, EntreeNav, BlocFooter, FragmentFil } from '@/data/navigation'
export { PROMESSE_NEWSLETTER, SEGMENTS_NEWSLETTER } from '@/data/newsletter'
export type { SegmentNewsletter } from '@/data/newsletter'
