import { z } from 'zod'
import { idSchema, langueSchema, horodatageSchema, versionSchema } from '@/api/schemas/communs'

/**
 * Audience — boîtes de réception et newsletter (contrat § 12 et § 18, PB § 12).
 *
 * Les statuts propres à l'audience sont des unions distinctes de celles des contenus (§ 7) :
 * un message n'est ni brouillon ni publiable, une demande ne suit pas le cycle de vie du contenu,
 * un abonné n'est pas un contenu. Ils vivent ici, côté interface, et côté serveur.
 */

export const STATUTS_MESSAGE = ['non_lu', 'lu', 'traite', 'archive'] as const
export const statutMessageSchema = z.enum(STATUTS_MESSAGE)
export type StatutMessage = z.infer<typeof statutMessageSchema>

export const TYPES_MESSAGE = ['contact', 'collaboration'] as const
export const typeMessageSchema = z.enum(TYPES_MESSAGE)
export type TypeMessage = z.infer<typeof typeMessageSchema>

export const STATUTS_DEMANDE = ['nouvelle', 'en_cours', 'conclue', 'annulee'] as const
export const statutDemandeSchema = z.enum(STATUTS_DEMANDE)
export type StatutDemande = z.infer<typeof statutDemandeSchema>

export const STATUTS_ABONNE = ['en_attente', 'actif', 'desabonne'] as const
export const statutAbonneSchema = z.enum(STATUTS_ABONNE)
export type StatutAbonne = z.infer<typeof statutAbonneSchema>

/** Un message reçu : la boîte de réception de l'équipe. La pièce jointe n'existe pas. */
export const messageSchema = z.object({
  id: idSchema,
  type: typeMessageSchema,
  nom: z.string().nullable(),
  email: z.email(),
  motif: z.string().nullable(),
  message: z.string().nullable(),
  langue: langueSchema,
  statut: statutMessageSchema,
  noteInterne: z.string().nullable(),
  creeLe: horodatageSchema,
  purgeLe: horodatageSchema.nullable(),
  version: versionSchema,
  entreprise: z.string().nullable().optional(),
  pays: z.string().nullable().optional(),
  typeCollaboration: z.string().nullable().optional(),
  calendrier: z.string().nullable().optional(),
  budget: z.string().nullable().optional(),
})
export type Message = z.infer<typeof messageSchema>

export const entreeModificationMessageSchema = z.strictObject({
  version: versionSchema,
  statut: statutMessageSchema.optional(),
  noteInterne: z.string().max(4000).nullable().optional(),
})
export type ModificationMessage = z.infer<typeof entreeModificationMessageSchema>

/** Liste des messages (§ 12.1) : filtres du contrat, pagination réelle. */
export const parametresMessagesSchema = z.strictObject({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  statut: statutMessageSchema.optional(),
  type: typeMessageSchema.optional(),
  q: z.string().min(1).max(200).optional(),
  tri: z.enum(['-creeLe']).optional(),
})
export type ParametresMessages = z.infer<typeof parametresMessagesSchema>

/** Une ligne de demande : une variante citée, donc un bijou concerné. */
export const ligneDemandeSchema = z.object({
  varianteId: idSchema,
  bijouId: idSchema,
  libelle: z.string(),
})
export const demandeSchema = z.object({
  id: idSchema,
  lignes: z.array(ligneDemandeSchema),
  nom: z.string(),
  email: z.string().email(),
  message: z.string().nullable(),
  langue: langueSchema,
  statut: statutDemandeSchema,
  noteInterne: z.string().nullable(),
  creeLe: horodatageSchema,
  version: versionSchema,
})
export type Demande = z.infer<typeof demandeSchema>

export const entreeModificationDemandeSchema = z.strictObject({
  version: versionSchema,
  statut: statutDemandeSchema.optional(),
  noteInterne: z.string().max(4000).nullable().optional(),
})
export type ModificationDemande = z.infer<typeof entreeModificationDemandeSchema>

/** Liste des demandes (§ 12.2) : `createur` renvoie celles rattachées à un créateur. */
export const parametresDemandesSchema = z.strictObject({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  statut: statutDemandeSchema.optional(),
  createur: z.string().uuid().optional(),
  q: z.string().min(1).max(200).optional(),
})
export type ParametresDemandes = z.infer<typeof parametresDemandesSchema>

/** Un consentement de newsletter, avec le texte exact accepté (RG-12, RG-13). */
export const consentementSchema = z.object({
  finalite: z.string(),
  texte: z.string(),
  version: z.string().min(1),
  source: z.string(),
  accepteLe: horodatageSchema,
})
export const abonneSchema = z.object({
  id: idSchema,
  email: z.email(),
  prenom: z.string().nullable(),
  pays: z.string().nullable(),
  langue: langueSchema,
  statut: statutAbonneSchema,
  confirmeLe: horodatageSchema.nullable(),
  creeLe: horodatageSchema,
  consentements: z.array(consentementSchema),
})
export type Abonne = z.infer<typeof abonneSchema>

/** Liste des abonnés (§ 12.3). */
export const parametresAbonnesSchema = z.strictObject({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  statut: statutAbonneSchema.optional(),
  q: z.string().min(1).max(200).optional(),
})
export type ParametresAbonnes = z.infer<typeof parametresAbonnesSchema>
