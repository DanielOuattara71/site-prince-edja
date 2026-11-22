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
import type { CorpsPublie } from '@/lib/corpsRiche'

/** Pages légales : le squelette parcours/résumé (`sections`) reste la référence hors mode API ;
 *  en mode API, une page publiée porte son corps riche en plus (CorpsRiche). */
export interface PageLegaleAvecCorps extends PageLegale {
  corps: CorpsPublie | null
}

import { SITE as SITE_DEPART, isDarkTop } from '@/data/site'
import type { SiteInfo } from '@/types'
import { photoFixe, srcsetFixe } from './photos'

/** CorpsPublié = tableau de nœuds OU { type:'doc', content:[...] }
    (l'API renvoie l'un ou l'autre, historiquement). */
function corpsVide(corps: CorpsPublie | null): boolean {
  if (Array.isArray(corps)) return corps.length === 0
  if (corps && typeof corps === 'object') {
    const c = corps as { type?: string; content?: unknown[] }
    if (c.type === 'doc' && Array.isArray(c.content)) return c.content.length === 0
  }
  return true
}

function construirePagesLegales(): PageLegaleAvecCorps[] {
  if (!SOURCE_API) return PAGES_LEGALES_DEPART.map((p) => ({ ...p, corps: null }))
  const api = lireGenere<PageLegalePublique[]>('pages-legales')
  const parCle = new Map(api.map((p) => [p.cle, p]))
  return PAGES_LEGALES_DEPART.map((p) => {
    const trouvee = parCle.get(p.chemin.slice(1))
    if (!trouvee) return { ...p, corps: null }
    const fusion = versPageLegale(trouvee)
    const corps = (trouvee.traduction?.corps ?? null) as CorpsPublie | null
    return {
      ...p,
      titre: fusion.titre,
      resume: fusion.resume,
      sections: corpsVide(corps) ? p.sections : [],
      corps,
    }
  })
}

export const PAGES_LEGALES: PageLegaleAvecCorps[] = construirePagesLegales()

/** Langues actives : le réglage admin pilote le sélecteur ; le français reste toujours offert. */
interface ReglagesPublics {
  boutiqueEnLigne: boolean
  multiVendeurs: boolean
  languesActives: string[]
}
export const LANGUES_ACTIVES: typeof LANGUES = (() => {
  if (!SOURCE_API) return LANGUES
  const actives = lireGenere<ReglagesPublics>('reglages').languesActives
  const visibles = LANGUES.filter((l) => actives.includes(l.code))
  return visibles.length ? visibles : LANGUES.filter((l) => l.code === 'fr')
})()

export { NAV_PRINCIPALE, CTA_PRINCIPAL, FOOTER_NAV, filDariane, ENTREES_404, LANGUES }
export type { Libelle, LienNav, EntreeNav, BlocFooter, FragmentFil } from '@/data/navigation'
export { PROMESSE_NEWSLETTER, SEGMENTS_NEWSLETTER } from '@/data/newsletter'
export type { SegmentNewsletter } from '@/data/newsletter'

/** Identité publique (contrat 1.20.0 § 37.2). */
interface IdentitePublique {
  nom: string
  email: string
  linkedin: string | null
  linkedinLabel: string | null
  localisation: string | null
  role: string | null
  signature: string | null
  manifeste: string | null
  devise: string | null
  mission: string | null
  tagline: string[]
  bio: string[]
  stats: {
    cle: string
    libelle: string
    valeur: number | null
    suffixe: string | null
    dateValidation: string | null
    source: string | null
    ordre: number
  }[]
  heroImage: {
    url: string
    alt: string
    declinaisons: { largeur: number; url: string }[]
  } | null
}

/** La maison remplit l'identité depuis l'admin. Un champ vide laisse l'actif du dépôt en place :
 *  aucun texte n'est inventé pour combler ce que l'API ne fournit pas. */
function construireSite(): SiteInfo {
  const heros = photoFixe('accueil.heros')
  const identite = SOURCE_API ? lireGenere<IdentitePublique>('site') : null
  const deLIdentite = identite?.heroImage
  const imageHero = heros
    ? { url: heros.url, srcSet: srcsetFixe(heros) }
    : deLIdentite
      ? {
          url: deLIdentite.url,
          srcSet:
            deLIdentite.declinaisons.map((d) => `${d.url} ${d.largeur}w`).join(', ') || undefined,
        }
      : null
  const base: SiteInfo = {
    ...SITE_DEPART,
    heroImage: imageHero?.url ?? SITE_DEPART.heroImage,
    heroSrcSet: imageHero ? imageHero.srcSet : SITE_DEPART.heroSrcSet,
  }
  if (!identite) return base
  return {
    ...base,
    name: identite.nom || base.name,
    role: identite.role || base.role,
    signature: identite.signature || base.signature,
    manifeste: identite.manifeste || base.manifeste,
    tagline: identite.tagline.length ? identite.tagline : base.tagline,
    devise: identite.devise || base.devise,
    mission: identite.mission || base.mission,
    bio: identite.bio.length ? identite.bio : base.bio,
    email: identite.email || base.email,
    linkedin: identite.linkedin || base.linkedin,
    linkedinLabel: identite.linkedinLabel || base.linkedinLabel,
    localisation: identite.localisation || base.localisation,
    stats: identite.stats.length
      ? base.stats.map((s, index) => {
          const d = identite.stats.find((x) => x.ordre === index + 1) ?? identite.stats[index]
          return {
            ...s,
            value: d?.valeur ?? s.value,
            suffix: d?.suffixe ?? s.suffix,
            label: d?.libelle || s.label,
            date: d?.dateValidation ?? s.date,
          }
        })
      : base.stats,
  }
}

export const SITE: SiteInfo = construireSite()
export { isDarkTop }
