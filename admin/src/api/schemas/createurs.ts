import { z } from 'zod'
import {
  contenuBaseShape,
  idSchema,
  resumeContenuSchema,
  slugSchema,
  statutContenuSchema,
  traductionsEcriture,
  traductionsLecture,
  versionSchema,
} from '@/api/schemas/communs'

/**
 * Créateurs (`docs/CONTRAT-API.md` § 10.2, décision X-05). Deux états distincts : `statut`
 * (la page publique) et `actif` (la capacité de vendre). `estPrincipal` et `nombreBijoux` sont
 * en lecture seule ; la commission reste vide tant que `multiVendeurs` est faux.
 */

/** Ligne de liste (§ 8) : `titre` porte le nom du créateur. */
export const resumeCreateurSchema = resumeContenuSchema.extend({
  actif: z.boolean().optional(),
  estPrincipal: z.boolean().optional(),
  nombreBijoux: z.number().int().min(0).optional(),
})
export type ResumeCreateur = z.infer<typeof resumeCreateurSchema>

/** Ce que les sélecteurs lisent du créateur principal (lecture tolérante, D-22). */
export const createurPrincipalSchema = z.object({
  id: idSchema,
  slug: slugSchema,
  nom: z.string(),
  statut: statutContenuSchema,
  estPrincipal: z.literal(true),
  actif: z.boolean(),
})
export type CreateurPrincipal = z.infer<typeof createurPrincipalSchema>

const traductionCreateurLecture = z.object({ bio: z.string(), accroche: z.string().nullable() })

export const createurSchema = z.object({
  ...contenuBaseShape,
  // Le principal vient des données de départ : il n'a pas d'auteur.
  auteurId: idSchema.nullable(),
  slug: slugSchema,
  nom: z.string(),
  pays: z.string().nullable(),
  ville: z.string().nullable(),
  photoId: idSchema.nullable(),
  estPrincipal: z.boolean(),
  actif: z.boolean(),
  tauxCommission: z.number().min(0).max(100).nullable(),
  nombreBijoux: z.number().int().min(0),
  traductions: traductionsLecture(traductionCreateurLecture),
})
export type Createur = z.infer<typeof createurSchema>

export const traductionCreateurEcriture = z.strictObject({
  bio: z.string().max(4000, 'Au plus 4 000 caractères.').optional(),
  accroche: z.string().trim().max(200, 'Au plus 200 caractères.').nullable().optional(),
})

const texteCourt = z.string().trim().min(1).max(120)

const champsCreateurEcriture = {
  nom: z.string().trim().min(1, 'Nom obligatoire.').max(120),
  slug: slugSchema.optional(),
  pays: texteCourt.nullable().optional(),
  ville: texteCourt.nullable().optional(),
  photoId: idSchema.nullable().optional(),
  actif: z.boolean().optional(),
  tauxCommission: z.number().min(0).max(100).nullable().optional(),
  traductions: traductionsEcriture(traductionCreateurEcriture).optional(),
}

export const entreeCreateurSchema = z.strictObject(champsCreateurEcriture)
export type EntreeCreateur = z.infer<typeof entreeCreateurSchema>

export const modificationCreateurSchema = z.strictObject({
  ...z.strictObject(champsCreateurEcriture).partial().shape,
  version: versionSchema,
})
export type ModificationCreateur = z.infer<typeof modificationCreateurSchema>
