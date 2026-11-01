import { z } from 'zod'

/**
 * Types communs du contrat (`docs/CONTRAT-API.md` § 2, 4 et 6).
 *
 * Deux familles de schémas, volontairement distinctes (D-22) :
 * - **lecture** (`z.object`) : tolère un champ ajouté par une version mineure du contrat ;
 * - **écriture** (`z.strictObject`) : refuse tout champ inconnu, comme le serveur.
 */

export const LANGUES = ['fr', 'en'] as const
export const langueSchema = z.enum(LANGUES)
export type Langue = z.infer<typeof langueSchema>

export const ROLES = ['editeur', 'admin', 'super_admin', 'vendeur'] as const
export const roleSchema = z.enum(ROLES)
export type Role = z.infer<typeof roleSchema>

export const STATUTS_CONTENU = ['brouillon', 'en_relecture', 'publie', 'archive'] as const
export const statutContenuSchema = z.enum(STATUTS_CONTENU)
export type StatutContenu = z.infer<typeof statutContenuSchema>

export const idSchema = z.uuid()
export const horodatageSchema = z.iso.datetime({ offset: true })
export const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Minuscules, chiffres et tirets seulement.')
/** `AAAA`, `AAAA-MM` ou `AAAA-MM-JJ`. */
export const datePartielleSchema = z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/)
export const versionSchema = z.number().int().positive()

/** Traductions en lecture : une langue peut manquer. */
export function traductionsLecture<T extends z.ZodType>(schema: T) {
  return z.object({ fr: schema.optional(), en: schema.optional() })
}

/** Traductions en écriture : `null` supprime la langue (§ 8). */
export function traductionsEcriture<T extends z.ZodType>(schema: T) {
  return z.strictObject({ fr: schema.nullable().optional(), en: schema.nullable().optional() })
}

export const compteResumeSchema = z.object({ id: idSchema, nom: z.string() })
export type CompteResume = z.infer<typeof compteResumeSchema>

export const compteSchema = z.object({
  id: idSchema,
  email: z.email(),
  nom: z.string(),
  role: roleSchema,
  actif: z.boolean(),
  derniereConnexion: horodatageSchema.nullable(),
  doitChangerMotDePasse: z.boolean(),
  createurId: idSchema.nullable(),
})
export type Compte = z.infer<typeof compteSchema>

/** Champs communs à toute ressource soumise au cycle de vie (§ 6, § 7). */
export const contenuBaseShape = {
  id: idSchema,
  statut: statutContenuSchema,
  publieLe: horodatageSchema.nullable(),
  creeLe: horodatageSchema,
  modifieLe: horodatageSchema,
  auteurId: idSchema,
  version: versionSchema,
  champsAFournir: z.array(z.string()),
  languesPresentes: z.array(langueSchema),
  dernierMotifRefus: z.string().nullable(),
}

export const resumeContenuSchema = z.object({
  id: idSchema,
  statut: statutContenuSchema.nullable(),
  titre: z.string(),
  slug: z.string().nullable(),
  publieLe: horodatageSchema.nullable(),
  modifieLe: horodatageSchema,
  auteur: compteResumeSchema.nullable(),
  version: versionSchema,
  champsAFournir: z.array(z.string()),
  languesPresentes: z.array(langueSchema),
  imageId: idSchema.nullable(),
  createurId: idSchema.optional(),
})
export type ResumeContenu = z.infer<typeof resumeContenuSchema>

export function pageSchema<T extends z.ZodType>(item: T) {
  return z.object({
    items: z.array(item),
    page: z.number().int().positive(),
    pageSize: z.number().int().min(1).max(100),
    total: z.number().int().min(0),
  })
}
export interface Page<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

/** Paramètres de liste communs (§ 2). `pageSize` plafonné à 100 (D-22). */
export const parametresListeSchema = z.strictObject({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  tri: z.string().optional(),
  q: z.string().optional(),
  statut: statutContenuSchema.optional(),
  langue: langueSchema.optional(),
  sansLangue: langueSchema.optional(),
  tag: z.array(idSchema).optional(),
  aFournir: z.boolean().optional(),
})
export type ParametresListe = z.infer<typeof parametresListeSchema>

export const demandeTransitionSchema = z.strictObject({
  vers: statutContenuSchema,
  version: versionSchema,
  programmeLe: horodatageSchema.optional(),
  motif: z.string().min(3).max(1000).optional(),
})
export type DemandeTransition = z.infer<typeof demandeTransitionSchema>

export function reponseTransitionSchema<T extends z.ZodType>(contenu: T) {
  return z.object({ contenu, publicationId: idSchema.nullable() })
}

export const usageSchema = z.object({
  ressource: z.string(),
  id: idSchema,
  titre: z.string(),
  champ: z.string(),
  statut: statutContenuSchema.nullable(),
})
export type Usage = z.infer<typeof usageSchema>

/** Corps d'erreur (§ 4.1). */
export const erreurApiSchema = z.object({
  status: z.number().int(),
  code: z.string(),
  message: z.string(),
  champ: z.string().optional(),
  details: z.unknown().optional(),
  requeteId: z.string(),
})
export type CorpsErreurApi = z.infer<typeof erreurApiSchema>

/** `details` d'un `422 RG-03` : la liste cliquable des manques (RG-03, PA:429). */
export const manquantsSchema = z.object({
  manquants: z.array(
    z.object({ champ: z.string(), langue: langueSchema.optional(), message: z.string() }),
  ),
})

/** Pages fixes (§ 9.15) et pages légales (§ 9.16) : ensembles fermés. */
export const CLES_PAGE = [
  'accueil',
  'a-propos',
  'histoires',
  'xplore',
  'taste-and-travel',
  'boutique',
  'journal',
  'presse',
  'contact',
  'archive-afrique',
  'newsletter',
] as const
export type ClePage = (typeof CLES_PAGE)[number]
export const CLES_PAGE_LEGALE = [
  'mentions-legales',
  'confidentialite',
  'cookies',
  'cgv',
  'retours',
] as const
export const RESSOURCES_LIABLES = [
  'articles',
  'episodes',
  'projets',
  'destinations',
  'bijoux',
  'archive',
] as const
export type RessourceLiable = (typeof RESSOURCES_LIABLES)[number]

/**
 * Lien interne vers une cible du site (§ 6), sans adresse écrite à la main : un lien ne peut plus
 * pointer vers une page inexistante. Lecture tolérante, écriture stricte (D-22).
 */
export const cibleInterneSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('page'), cle: z.enum(CLES_PAGE) }),
  z.object({ type: z.literal('page-legale'), cle: z.enum(CLES_PAGE_LEGALE) }),
  z.object({ type: z.literal('contenu'), ressource: z.enum(RESSOURCES_LIABLES), id: idSchema }),
  z.object({ type: z.literal('ancre'), cle: z.enum(CLES_PAGE), ancre: z.string().min(1).max(80) }),
])
export type CibleInterne = z.infer<typeof cibleInterneSchema>

export const cibleInterneEcriture = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('page'), cle: z.enum(CLES_PAGE) }),
  z.strictObject({ type: z.literal('page-legale'), cle: z.enum(CLES_PAGE_LEGALE) }),
  z.strictObject({
    type: z.literal('contenu'),
    ressource: z.enum(RESSOURCES_LIABLES),
    id: idSchema,
  }),
  z.strictObject({
    type: z.literal('ancre'),
    cle: z.enum(CLES_PAGE),
    ancre: z.string().trim().min(1).max(80),
  }),
])
