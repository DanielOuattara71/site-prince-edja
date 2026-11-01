import { z } from 'zod'
import type { Page, ParametresListe, DemandeTransition } from '@/api/schemas/communs'
import { LANGUES, type CibleInterne, type Langue, type StatutContenu } from '@/api/schemas/communs'
import type { RessourceVersionnee } from '@/api/schemas/versions'
import type { RessourceContenu } from '@/auth/permissions'

/**
 * Formulaires **déclaratifs** (D-62) : une ressource éditoriale décrit ses champs une fois ; les
 * valeurs du formulaire, la validation avant envoi, les conversions vers le contrat, la mise en
 * page et l'aperçu en découlent. Ajouter une famille ne recopie aucun code (section 9).
 *
 * Règles de conversion, communes à toutes les familles :
 * - un texte de crédibilité vide part à `null`, jamais en chaîne inventée ;
 * - un nombre vide part à `null`, jamais à `0` (§ 2) ;
 * - une traduction est présente dès que son titre est saisi ; écrite, elle remplace la traduction
 *   entière (§ 8) ; vidée alors qu'elle existait, elle est supprimée (`null`).
 */

interface Base {
  cle: string
  libelle: string
  aide?: string
}

export type ChampDeclaratif =
  | (Base & {
      type: 'texte'
      max?: number
      multiligne?: boolean
      /** Obligatoire pour enregistrer (le serveur le refuse sinon). */
      obligatoire?: boolean
    })
  | (Base & { type: 'nombre'; entier?: boolean; min?: number; max?: number })
  | (Base & {
      type: 'choix'
      options: readonly { valeur: string; libelle: string }[]
      obligatoire?: boolean
    })
  | (Base & { type: 'image' })
  | (Base & { type: 'pdf' })
  | (Base & { type: 'tags' })
  | (Base & { type: 'url' })
  | (Base & { type: 'datePartielle' })
  | (Base & { type: 'relation'; ressource: 'episodes' | 'destinations' })
  | (Base & { type: 'cible' })
  | (Base & { type: 'booleen' })
  /** Liste de sources (archive) : au moins une exigée à la publication. */
  | (Base & { type: 'sources' })
  /**
   * Textes d'une page fixe par clé de bloc (`traductions[l].blocs`, § 9.15). Les clés viennent du
   * serveur (données de départ) : l'écran n'en invente aucune.
   */
  | (Base & { type: 'blocs' })

export const TYPES_SOURCE = ['ecrite', 'orale', 'iconographique', 'autre'] as const
export interface SourceFormulaire {
  libelle: string
  url: string
  type: (typeof TYPES_SOURCE)[number]
}

export interface ChampTraduitDeclaratif {
  cle: string
  libelle: string
  aide?: string
  /** Marque **P** : obligatoire à la publication dans les langues actives. */
  requis?: boolean
  max?: number
  multiligne?: boolean
  /** Vide envoyé `null` (champ facultatif, **C** ou **O**) ou chaîne vide (champ **P**). */
  vide: 'null' | 'chaine'
}

export interface ContenuDeclaratif {
  id: string
  statut: StatutContenu
  version: number
  publieLe: string | null
  modifieLe: string
  champsAFournir: string[]
  languesPresentes: Langue[]
  dernierMotifRefus: string | null
  createurId?: string | null | undefined
  traductions: { [L in Langue]?: Record<string, unknown> | undefined }
  [champ: string]: unknown
}

export interface ResumeDeclaratif {
  id: string
  titre: string
  version: number
  statut: StatutContenu | null
  publieLe: string | null
  modifieLe: string
  champsAFournir: string[]
  languesPresentes: Langue[]
  numero?: string | undefined
  cle?: string | undefined
  periode?: string | undefined
  ordre?: number | undefined
}

/** Ce que les écrans attendent de la couche `api/` (gabarit § 8). */
export interface ApiDeclarative {
  lister: (
    parametres: ParametresListe,
    signal?: AbortSignal,
    filtres?: Record<string, string | undefined>,
  ) => Promise<Page<ResumeDeclaratif>>
  lire: (id: string) => Promise<ContenuDeclaratif>
  creer: (entree: never) => Promise<ContenuDeclaratif>
  modifier: (id: string, modification: never) => Promise<ContenuDeclaratif>
  supprimer: (id: string, version: number) => Promise<undefined>
  transition: (
    id: string,
    demande: DemandeTransition,
  ) => Promise<{ contenu: unknown; publicationId: string | null }>
  ordonner: (ids: string[]) => Promise<{ ids: string[] }>
}

export interface SpecRessource {
  ressource: RessourceContenu & RessourceVersionnee
  chemin: string
  titreListe: string
  nouveau: string
  /** Champ traduit qui sert de titre (`titre`, `nom`). */
  champTitre: string
  /** Un slug par langue, tiré du titre (RG-04) ; les villes n'en ont pas. */
  slug: boolean
  traduits: ChampTraduitDeclaratif[]
  principal: ChampDeclaratif[]
  lateral: ChampDeclaratif[]
  /** Identifiant affiché en première colonne de la liste (`numero`, `cle`, `periode`). */
  colonneIdentifiant?: { champ: 'numero' | 'cle' | 'periode'; libelle: string }
  ordonnable?: boolean
  /** Ensemble fermé (pages) : ni création ni suppression (§ 9.15). */
  fermee?: boolean
  libelles: Record<string, string>
  api: ApiDeclarative
}

export type Valeurs = Record<string, unknown> & {
  traductions: Record<Langue, Record<string, string>>
}

const tousLesChamps = (spec: SpecRessource) => [...spec.principal, ...spec.lateral]
/** Champs écrits hors des traductions (les blocs, eux, vivent dans chaque traduction). */
const champsDirects = (spec: SpecRessource) => tousLesChamps(spec).filter((c) => c.type !== 'blocs')
const champBlocs = (spec: SpecRessource) => tousLesChamps(spec).find((c) => c.type === 'blocs')
const clesTraduites = (spec: SpecRessource) => [
  ...(spec.slug ? ['slug'] : []),
  ...spec.traduits.map((c) => c.cle),
]

function valeurVide(champ: ChampDeclaratif): unknown {
  switch (champ.type) {
    case 'image':
    case 'pdf':
    case 'cible':
      return null
    case 'tags':
    case 'sources':
      return []
    case 'booleen':
      return false
    case 'blocs':
      return { fr: {}, en: {} }
    default:
      return ''
  }
}

function valeurLue(champ: ChampDeclaratif, brute: unknown): unknown {
  switch (champ.type) {
    case 'image':
    case 'pdf':
    case 'cible':
      return brute ?? null
    case 'tags':
      return Array.isArray(brute) ? brute : []
    case 'booleen':
      return brute === true
    case 'sources':
      return Array.isArray(brute)
        ? brute.map((s: { libelle?: unknown; url?: unknown; type?: unknown }) => ({
            libelle: typeof s.libelle === 'string' ? s.libelle : '',
            url: typeof s.url === 'string' ? s.url : '',
            type: typeof s.type === 'string' ? s.type : 'ecrite',
          }))
        : []
    case 'nombre':
      return typeof brute === 'number' ? String(brute) : ''
    default:
      return typeof brute === 'string' ? brute : ''
  }
}

const traductionVide = (spec: SpecRessource) =>
  Object.fromEntries(clesTraduites(spec).map((cle) => [cle, '']))

export function valeursVides(spec: SpecRessource): Valeurs {
  return {
    ...Object.fromEntries(tousLesChamps(spec).map((c) => [c.cle, valeurVide(c)])),
    traductions: { fr: traductionVide(spec), en: traductionVide(spec) },
  }
}

export function valeursDepuis(spec: SpecRessource, contenu: ContenuDeclaratif): Valeurs {
  const traduction = (langue: Langue) => {
    const lue = contenu.traductions[langue]
    return Object.fromEntries(
      clesTraduites(spec).map((cle) => {
        const valeur = lue?.[cle]
        return [cle, typeof valeur === 'string' ? valeur : '']
      }),
    )
  }
  const blocs = champBlocs(spec)
  const blocsDe = (langue: Langue) => {
    const lus = contenu.traductions[langue]?.['blocs']
    return lus && typeof lus === 'object' ? { ...(lus as Record<string, string>) } : {}
  }
  return {
    ...Object.fromEntries(champsDirects(spec).map((c) => [c.cle, valeurLue(c, contenu[c.cle])])),
    ...(blocs ? { [blocs.cle]: { fr: blocsDe('fr'), en: blocsDe('en') } } : {}),
    traductions: { fr: traduction('fr'), en: traduction('en') },
  }
}

const nombreLu = (s: string) => {
  const n = Number(s.trim().replace(',', '.'))
  return s.trim() && Number.isFinite(n) ? n : null
}

function versApi(champ: ChampDeclaratif, valeur: unknown): unknown {
  switch (champ.type) {
    case 'image':
    case 'pdf':
    case 'cible':
      return valeur ?? null
    case 'tags':
    case 'booleen':
      return valeur
    case 'sources':
      return (valeur as SourceFormulaire[]).map((s) => ({
        libelle: s.libelle.trim(),
        url: s.url.trim() || null,
        type: s.type,
      }))
    case 'nombre':
      return nombreLu(String(valeur))
    case 'choix':
      return String(valeur) || null
    default:
      return String(valeur).trim() || null
  }
}

const present = (spec: SpecRessource, t: Record<string, string>) =>
  Boolean(t[spec.champTitre]?.trim())
const entamee = (spec: SpecRessource, t: Record<string, string>) =>
  clesTraduites(spec).some((cle) => cle !== spec.champTitre && t[cle]?.trim())

function traductionsEcrites(spec: SpecRessource, valeurs: Valeurs, existantes: Langue[]) {
  const ecrites: Partial<Record<Langue, Record<string, unknown> | null>> = {}
  const blocs = champBlocs(spec)
  for (const langue of LANGUES) {
    const t = valeurs.traductions[langue]
    if (present(spec, t)) {
      ecrites[langue] = {
        ...(spec.slug && t['slug']?.trim() ? { slug: t['slug'].trim() } : {}),
        ...Object.fromEntries(
          spec.traduits.map((c) => {
            const valeur = t[c.cle] ?? ''
            return [
              c.cle,
              c.cle === spec.champTitre
                ? valeur.trim()
                : c.vide === 'null'
                  ? valeur.trim() || null
                  : valeur,
            ]
          }),
        ),
        ...(blocs
          ? {
              blocs: {
                ...((valeurs[blocs.cle] as Record<Langue, Record<string, string>>)[langue] ?? {}),
              },
            }
          : {}),
      }
    } else if (existantes.includes(langue)) ecrites[langue] = null
  }
  return ecrites
}

/** Corps de `POST` : tous les champs, convertis. */
export function versEntree(spec: SpecRessource, valeurs: Valeurs): Record<string, unknown> {
  return {
    ...Object.fromEntries(champsDirects(spec).map((c) => [c.cle, versApi(c, valeurs[c.cle])])),
    traductions: traductionsEcrites(spec, valeurs, []),
  }
}

/** Corps de `PATCH` : tous les champs (remplacement champ par champ, § 8) et la version lue. */
export function versModification(
  spec: SpecRessource,
  valeurs: Valeurs,
  contenu: ContenuDeclaratif,
): Record<string, unknown> {
  return {
    ...Object.fromEntries(champsDirects(spec).map((c) => [c.cle, versApi(c, valeurs[c.cle])])),
    traductions: traductionsEcrites(spec, valeurs, contenu.languesPresentes),
    version: contenu.version,
  }
}

const RE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const RE_DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/
const RE_HTTPS = /^https:\/\/\S+$/

/** Validation avant envoi, messages en français, chemins = ids des champs (D-44). */
export function schemaFormulaire(spec: SpecRessource) {
  return z.looseObject({}).superRefine((brut, ctx) => {
    const valeurs = brut as Valeurs
    const signaler = (chemin: (string | number)[], message: string) =>
      ctx.addIssue({ code: 'custom', path: chemin, message })
    for (const champ of tousLesChamps(spec)) {
      const valeur = valeurs[champ.cle]
      const texte = typeof valeur === 'string' ? valeur.trim() : ''
      if ((champ.type === 'texte' || champ.type === 'choix') && champ.obligatoire && !texte) {
        signaler([champ.cle], `${champ.libelle} : obligatoire.`)
      }
      if (champ.type === 'texte' && champ.max && texte.length > champ.max) {
        signaler([champ.cle], `Au plus ${champ.max} caractères.`)
      }
      if (champ.type === 'nombre' && texte) {
        const n = nombreLu(texte)
        if (n === null || (champ.entier && !Number.isInteger(n))) {
          signaler([champ.cle], champ.entier ? 'Un nombre entier.' : 'Un nombre.')
        } else if (
          (champ.min !== undefined && n < champ.min) ||
          (champ.max !== undefined && n > champ.max)
        ) {
          signaler([champ.cle], `Entre ${champ.min ?? '−∞'} et ${champ.max ?? '+∞'}.`)
        }
      }
      if (champ.type === 'url' && texte && !RE_HTTPS.test(texte)) {
        signaler([champ.cle], 'Une adresse qui commence par https://.')
      }
      if (champ.type === 'datePartielle' && texte && !RE_DATE.test(texte)) {
        signaler([champ.cle], 'AAAA, AAAA-MM ou AAAA-MM-JJ.')
      }
      if (champ.type === 'sources') {
        for (const [i, source] of (valeur as SourceFormulaire[]).entries()) {
          if (!source.libelle.trim())
            signaler([champ.cle, i, 'libelle'], 'Libellé de la source obligatoire.')
          if (source.url.trim() && !RE_HTTPS.test(source.url.trim())) {
            signaler([champ.cle, i, 'url'], 'Une adresse qui commence par https://.')
          }
        }
      }
    }
    const { fr, en } = valeurs.traductions
    if (!present(spec, fr) && !present(spec, en)) {
      signaler(['traductions', 'fr', spec.champTitre], 'Obligatoire dans au moins une langue.')
    }
    for (const langue of LANGUES) {
      const t = valeurs.traductions[langue]
      if (!present(spec, t) && entamee(spec, t)) {
        signaler(
          ['traductions', langue, spec.champTitre],
          'Saisissez ce champ dans cette langue, ou videz ses autres champs.',
        )
      }
      if (spec.slug && t['slug'] && !RE_SLUG.test(t['slug'])) {
        signaler(['traductions', langue, 'slug'], 'Minuscules, chiffres et tirets seulement.')
      }
      for (const champ of spec.traduits) {
        if (champ.max && (t[champ.cle] ?? '').length > champ.max) {
          signaler(['traductions', langue, champ.cle], `Au plus ${champ.max} caractères.`)
        }
      }
    }
  })
}

/** Chemins des champs, pour rattacher les `422` du serveur (D-44). */
export function champsConnus(spec: SpecRessource): string[] {
  return [
    ...tousLesChamps(spec).map((c) => c.cle),
    ...LANGUES.flatMap((l) => clesTraduites(spec).map((cle) => `traductions.${l}.${cle}`)),
  ]
}

/** Libellés lisibles des chemins de `champsAFournir` et des manques RG-03. */
export function libellesDe(spec: SpecRessource): Record<string, string> {
  return {
    ...Object.fromEntries(tousLesChamps(spec).map((c) => [c.cle, c.libelle])),
    ...Object.fromEntries(spec.traduits.map((c) => [c.cle, c.libelle])),
    ...spec.libelles,
  }
}

export type { CibleInterne }
