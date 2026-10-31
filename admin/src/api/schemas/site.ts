import { z } from 'zod'
import {
  compteResumeSchema,
  horodatageSchema,
  idSchema,
  statutContenuSchema,
} from '@/api/schemas/communs'

/** Publication du site, journal et tableau de bord (`docs/CONTRAT-API.md` § 14 à 16). */

export const ETATS_PUBLICATION = ['en_attente', 'en_cours', 'reussie', 'echec'] as const
export const etatPublicationSchema = z.enum(ETATS_PUBLICATION)
export type EtatPublication = z.infer<typeof etatPublicationSchema>

export const MOTIFS_PUBLICATION = [
  'publication',
  'depublication',
  'programmee',
  'manuelle',
  'reglage',
  'restauration',
] as const

export const publicationSchema = z.object({
  id: idSchema,
  motif: z.enum(MOTIFS_PUBLICATION),
  etat: etatPublicationSchema,
  demandeePar: compteResumeSchema.nullable(),
  declencheeLe: horodatageSchema,
  termineeLe: horodatageSchema.nullable(),
  messageErreur: z.string().nullable(),
  buildId: z.string().nullable(),
  objet: z.object({ ressource: z.string(), id: idSchema, titre: z.string() }).nullable(),
})
export type Publication = z.infer<typeof publicationSchema>

/** Une publication est finie quand elle a réussi ou échoué (D-23). */
export function publicationTerminee(publication: Publication): boolean {
  return publication.etat === 'reussie' || publication.etat === 'echec'
}

export const entreeJournalSchema = z.object({
  id: idSchema,
  compte: compteResumeSchema.nullable(),
  action: z.string(),
  entite: z.string(),
  entiteId: idSchema.nullable(),
  avant: z.unknown().nullable(),
  apres: z.unknown().nullable(),
  requeteId: z.string().nullable(),
  creeLe: horodatageSchema,
})
export type EntreeJournal = z.infer<typeof entreeJournalSchema>

export const parametresJournalSchema = z.strictObject({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  compte: idSchema.optional(),
  action: z.string().optional(),
  entite: z.string().optional(),
  entiteId: idSchema.optional(),
  du: horodatageSchema.optional(),
  au: horodatageSchema.optional(),
})
export type ParametresJournal = z.infer<typeof parametresJournalSchema>

export const tableauDeBordSchema = z.object({
  aRelire: z.number().int().min(0),
  brouillons: z.number().int().min(0),
  aFournir: z.number().int().min(0),
  messagesNonLus: z.number().int().min(0),
  demandesNouvelles: z.number().int().min(0),
  derniereReconstruction: publicationSchema.nullable(),
  dernieresModifications: z.array(
    z.object({
      ressource: z.string(),
      id: idSchema,
      titre: z.string(),
      modifieLe: horodatageSchema,
      auteur: compteResumeSchema.nullable(),
      statut: statutContenuSchema.nullable(),
    }),
  ),
})
export type TableauDeBord = z.infer<typeof tableauDeBordSchema>
