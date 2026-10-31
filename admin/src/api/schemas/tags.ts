import { z } from 'zod'
import {
  idSchema,
  slugSchema,
  traductionsEcriture,
  traductionsLecture,
  versionSchema,
} from '@/api/schemas/communs'

/** Tags (`docs/CONTRAT-API.md` § 9.17). */

export const TYPES_TAG = ['pays', 'ville', 'theme', 'annee', 'format', 'projet'] as const
export const typeTagSchema = z.enum(TYPES_TAG)
export type TypeTag = z.infer<typeof typeTagSchema>

export const tagSchema = z.object({
  id: idSchema,
  type: typeTagSchema,
  code: slugSchema,
  traductions: traductionsLecture(z.object({ libelle: z.string() })),
  usages: z.number().int().min(0),
  version: versionSchema,
})
export type Tag = z.infer<typeof tagSchema>

const traductionTagEcriture = z.strictObject({ libelle: z.string().trim().min(1).max(80) })

export const entreeTagSchema = z.strictObject({
  type: typeTagSchema,
  code: slugSchema,
  traductions: traductionsEcriture(traductionTagEcriture).refine(
    (traductions) => Boolean(traductions.fr),
    { message: 'Libellé français obligatoire.', path: ['fr'] },
  ),
})
export type EntreeTag = z.infer<typeof entreeTagSchema>

/** Le type d'un tag ne se modifie pas (§ 9.17). */
export const modificationTagSchema = z.strictObject({
  code: slugSchema.optional(),
  traductions: traductionsEcriture(traductionTagEcriture).optional(),
  version: versionSchema,
})
export type ModificationTag = z.infer<typeof modificationTagSchema>
