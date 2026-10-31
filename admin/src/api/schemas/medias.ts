import { z } from 'zod'
import {
  compteResumeSchema,
  horodatageSchema,
  idSchema,
  traductionsEcriture,
  traductionsLecture,
  versionSchema,
} from '@/api/schemas/communs'

/** Médias (`docs/CONTRAT-API.md` § 11). */

/** Types acceptés, contrôlés pour de bon par le serveur sur le contenu du fichier (§ 11.2). */
export const TYPES_MEDIA_ACCEPTES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
] as const
/** Limites par défaut du serveur : une aide à la saisie, le refus du serveur fait foi (D-20). */
export const POIDS_MAX_IMAGE = 10 * 1024 * 1024
export const POIDS_MAX_PDF = 25 * 1024 * 1024

const traductionMediaLecture = z.object({ texteAlt: z.string(), legende: z.string().nullable() })

export const mediaSchema = z.object({
  id: idSchema,
  url: z.string().min(1),
  mime: z.string(),
  largeur: z.number().int().positive().nullable(),
  hauteur: z.number().int().positive().nullable(),
  poids: z.number().int().positive(),
  credit: z.string().nullable(),
  decoratif: z.boolean(),
  createurId: idSchema,
  usages: z.number().int().min(0),
  declinaisons: z.array(z.object({ largeur: z.number().int().positive(), url: z.string() })),
  traductions: traductionsLecture(traductionMediaLecture),
  champsAFournir: z.array(z.string()),
  creeLe: horodatageSchema,
  creePar: compteResumeSchema.nullable(),
  version: versionSchema,
})
export type Media = z.infer<typeof mediaSchema>

export const traductionMediaEcriture = z.strictObject({
  texteAlt: z.string().max(300),
  legende: z.string().max(500).nullable().optional(),
})

export const modificationMediaSchema = z.strictObject({
  traductions: traductionsEcriture(traductionMediaEcriture).optional(),
  credit: z.string().max(200).nullable().optional(),
  decoratif: z.boolean().optional(),
  createurId: idSchema.optional(),
  version: versionSchema,
})
export type ModificationMedia = z.infer<typeof modificationMediaSchema>

/** Champs facultatifs envoyés avec le fichier (§ 11.2). */
export const envoiMediaSchema = z.strictObject({
  texteAltFr: z.string().max(300).optional(),
  texteAltEn: z.string().max(300).optional(),
  credit: z.string().max(200).optional(),
  decoratif: z.boolean().optional(),
  createurId: idSchema.optional(),
})
export type EnvoiMedia = z.infer<typeof envoiMediaSchema>
