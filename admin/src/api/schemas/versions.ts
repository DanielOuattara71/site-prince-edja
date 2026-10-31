import { z } from 'zod'
import { RESSOURCES_CONTENU } from '@/auth/permissions'
import { compteResumeSchema, horodatageSchema, versionSchema } from '@/api/schemas/communs'

/** Versions et restauration (`docs/CONTRAT-API.md` § 14.2). Lot 5 du contrat. */

export const RESSOURCES_VERSIONNEES = [
  ...RESSOURCES_CONTENU,
  'identite',
  'navigation',
  'textes-interface',
  'parametres',
] as const
export const ressourceVersionneeSchema = z.enum(RESSOURCES_VERSIONNEES)
export type RessourceVersionnee = z.infer<typeof ressourceVersionneeSchema>

export const entreeVersionSchema = z.object({
  version: versionSchema,
  creeLe: horodatageSchema,
  creePar: compteResumeSchema.nullable(),
  action: z.string(),
})
export type EntreeVersion = z.infer<typeof entreeVersionSchema>

export const instantaneSchema = z.object({ version: versionSchema, instantane: z.unknown() })
export type Instantane = z.infer<typeof instantaneSchema>

export const demandeRestaurationSchema = z.strictObject({
  ressource: ressourceVersionneeSchema,
  id: z.string().min(1),
  version: versionSchema,
  versionCourante: versionSchema,
})
export type DemandeRestauration = z.infer<typeof demandeRestaurationSchema>
